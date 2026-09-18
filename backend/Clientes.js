// Aba "Clientes": dado do CLIENTE (mensal/combo), não do agendamento —
// por isso mora separada, senão "mensal" seria perdido a cada nova marcação.

function normalizarTelefone(telefone) {
  let digitos = String(telefone).replace(/\D/g, '')
  if (digitos.charAt(0) === '0') digitos = digitos.slice(1)
  if (digitos.slice(0, 2) !== '55') digitos = '55' + digitos
  return digitos
}

// Zera cortesPagosMes sozinho quando o mês vira, sem precisar de trigger
// agendado (que consumiria cota à toa) — a checagem acontece na leitura.
function aplicarResetMensal(cliente) {
  if (cliente.mesReferencia !== mesAtual()) {
    return Object.assign({}, cliente, { cortesPagosMes: 0 })
  }
  return cliente
}

function buscarOuCriarCliente(telefone, nome) {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const valores = aba.getDataRange().getValues()

  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === telefone) {
      return objetoDaLinha(CABECALHO_CLIENTES, valores[i])
    }
  }

  const agora = new Date()
  const novaLinha = [telefone, nome, false, 0, mesAtual(), agora, agora]
  aba.appendRow(novaLinha)
  return objetoDaLinha(CABECALHO_CLIENTES, novaLinha)
}

function mapaClientesPorTelefone() {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const linhas = linhasComoObjetos(aba, CABECALHO_CLIENTES)
  const mapa = {}
  linhas.forEach((c) => (mapa[c.telefone] = aplicarResetMensal(c)))
  return mapa
}

function listarClientes(busca) {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const linhas = linhasComoObjetos(aba, CABECALHO_CLIENTES)
  const termo = (busca || '').toLowerCase()

  return linhas
    .filter((c) => !termo || String(c.nome).toLowerCase().indexOf(termo) !== -1 || String(c.telefone).indexOf(termo) !== -1)
    .map((c) => {
      const ajustado = aplicarResetMensal(c)
      return {
        telefone: ajustado.telefone,
        nome: ajustado.nome,
        mensal: !!ajustado.mensal,
        cortesPagosMes: Number(ajustado.cortesPagosMes) || 0,
      }
    })
}

function atualizarStatusCliente(body) {
  const telefone = body && body.telefone
  const mensal = body && body.mensal
  const cortesPagosMes = body && body.cortesPagosMes

  if (!telefone) throw new Error('Telefone obrigatório.')

  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const valores = aba.getDataRange().getValues()

  const idxMensal = CABECALHO_CLIENTES.indexOf('mensal')
  const idxCortes = CABECALHO_CLIENTES.indexOf('cortesPagosMes')
  const idxMesRef = CABECALHO_CLIENTES.indexOf('mesReferencia')
  const idxAtualizado = CABECALHO_CLIENTES.indexOf('atualizadoEm')

  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === telefone) {
      const linha = i + 1
      aba.getRange(linha, idxMensal + 1).setValue(!!mensal)
      aba.getRange(linha, idxCortes + 1).setValue(Number(cortesPagosMes) || 0)
      aba.getRange(linha, idxMesRef + 1).setValue(mesAtual())
      aba.getRange(linha, idxAtualizado + 1).setValue(new Date())
      return
    }
  }

  throw new Error('Cliente não encontrado.')
}
