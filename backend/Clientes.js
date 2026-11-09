// Aba "Clientes": dado do CLIENTE (mensal/combo, valor), não do agendamento.
// Os cortes (saldo) NÃO ficam aqui: moram no livro "Movimentos", uma linha
// por venda/uso/estorno/ajuste. Saldo = soma dos créditos do cliente.

const TIPO_PACOTE = 'pacote' // +N: cliente pagou um pacote
const TIPO_USO = 'uso' // -1: atendimento descontou um corte
const TIPO_ESTORNO = 'estorno' // +1: atendimento foi desfeito
const TIPO_AJUSTE = 'ajuste' // +/-N: correção manual ou migração

function normalizarTelefone(telefone) {
  let digitos = String(telefone).replace(/\D/g, '')
  if (digitos.charAt(0) === '0') digitos = digitos.slice(1)
  if (digitos.slice(0, 2) !== '55') digitos = '55' + digitos
  return digitos
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
  const novaLinha = [telefone, nome, false, 0, mesAtual(), agora, agora, 0, 0]
  aba.appendRow(novaLinha)
  return objetoDaLinha(CABECALHO_CLIENTES, novaLinha)
}

// ---------- Livro de movimentos ----------

function lerMovimentos() {
  const aba = getAba(ABA_MOVIMENTOS, CABECALHO_MOVIMENTOS)
  return linhasComoObjetos(aba, CABECALHO_MOVIMENTOS)
}

function registrarMovimento(telefone, tipo, creditos, valor, agendamentoId) {
  const aba = getAba(ABA_MOVIMENTOS, CABECALHO_MOVIMENTOS)
  aba.appendRow([Utilities.getUuid(), telefone, tipo, creditos, valor || 0, agendamentoId || '', new Date()])
}

// telefone -> { comprados, saldo }. "comprados" é tudo que entrou (pacotes e
// ajustes positivos); "usados" = comprados - saldo.
function resumoPorTelefone(movimentos) {
  const mapa = {}
  movimentos.forEach((m) => {
    const tel = String(m.telefone)
    const n = Number(m.creditos) || 0
    if (!mapa[tel]) mapa[tel] = { comprados: 0, saldo: 0 }
    mapa[tel].saldo += n
    if (m.tipo === TIPO_PACOTE || (m.tipo === TIPO_AJUSTE && n > 0)) mapa[tel].comprados += n
  })
  return mapa
}

function saldoDoCliente(telefone) {
  const resumo = resumoPorTelefone(lerMovimentos())[String(telefone)]
  return resumo ? resumo.saldo : 0
}

// Campos de crédito devolvidos ao app. cortesPagosMes/cortesUsadosMes
// continuam existindo (o nome é antigo) pra não quebrar versões em cache.
function camposDeCredito(resumo) {
  const comprados = resumo ? resumo.comprados : 0
  const saldo = resumo ? Math.max(0, resumo.saldo) : 0
  return {
    saldo: saldo,
    cortesPagosMes: comprados,
    cortesUsadosMes: Math.max(0, comprados - saldo),
  }
}

function dadosDeCredito(telefone) {
  return camposDeCredito(resumoPorTelefone(lerMovimentos())[String(telefone)])
}

// Roda UMA vez no editor do Apps Script: converte o saldo antigo
// (cortesPagosMes - cortesUsadosMes da aba Clientes) em um movimento de
// migração, só pra quem ainda não tem nenhum movimento. Pode rodar de novo
// sem duplicar.
function migrarSaldosAntigos() {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const clientes = linhasComoObjetos(aba, CABECALHO_CLIENTES)
  const comMovimento = {}
  lerMovimentos().forEach((m) => (comMovimento[String(m.telefone)] = true))

  let migrados = 0
  clientes.forEach((c) => {
    const tel = String(c.telefone)
    const saldoAntigo = (Number(c.cortesPagosMes) || 0) - (Number(c.cortesUsadosMes) || 0)
    if (!comMovimento[tel] && saldoAntigo > 0) {
      registrarMovimento(tel, TIPO_AJUSTE, saldoAntigo, 0, '')
      migrados++
    }
  })
  return migrados
}

// ---------- Leitura e edição de clientes ----------

function mapaClientesPorTelefone() {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const linhas = linhasComoObjetos(aba, CABECALHO_CLIENTES)
  const resumos = resumoPorTelefone(lerMovimentos())
  const mapa = {}
  linhas.forEach((c) => {
    const tel = String(c.telefone)
    mapa[tel] = Object.assign({}, c, camposDeCredito(resumos[tel]))
  })
  return mapa
}

function listarClientes(busca) {
  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const linhas = linhasComoObjetos(aba, CABECALHO_CLIENTES)
  const resumos = resumoPorTelefone(lerMovimentos())
  const termo = (busca || '').toLowerCase()

  return linhas
    .filter((c) => !termo || String(c.nome).toLowerCase().indexOf(termo) !== -1 || String(c.telefone).indexOf(termo) !== -1)
    .map((c) => {
      const credito = camposDeCredito(resumos[String(c.telefone)])
      return {
        telefone: String(c.telefone),
        nome: c.nome,
        mensal: !!c.mensal,
        saldo: credito.saldo,
        cortesPagosMes: credito.cortesPagosMes,
        cortesUsadosMes: credito.cortesUsadosMes,
        valorMensal: Number(c.valorMensal) || 0,
      }
    })
}

// Edita "mensal" e "valorMensal". Os cortes (pagos/usados) só são aceitos
// por compatibilidade com o app antigo: viram um AJUSTE no livro, pra que o
// saldo continue batendo com o que o app antigo mostra.
function atualizarStatusCliente(body) {
  const telefone = body && body.telefone
  if (!telefone) throw new Error('Telefone obrigatório.')

  const mensal = body.mensal
  const valor = Math.max(0, Number(body.valorMensal) || 0)

  const aba = getAba(ABA_CLIENTES, CABECALHO_CLIENTES)
  const valores = aba.getDataRange().getValues()

  const idxMensal = CABECALHO_CLIENTES.indexOf('mensal')
  const idxValor = CABECALHO_CLIENTES.indexOf('valorMensal')
  const idxAtualizado = CABECALHO_CLIENTES.indexOf('atualizadoEm')

  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === telefone) {
      const linha = i + 1
      aba.getRange(linha, idxMensal + 1).setValue(!!mensal)
      aba.getRange(linha, idxValor + 1).setValue(valor)
      aba.getRange(linha, idxAtualizado + 1).setValue(new Date())

      if (body.cortesPagosMes !== undefined && body.cortesUsadosMes !== undefined) {
        const pagos = Math.max(0, Number(body.cortesPagosMes) || 0)
        const usados = Math.min(pagos, Math.max(0, Number(body.cortesUsadosMes) || 0))
        const delta = pagos - usados - saldoDoCliente(telefone)
        if (delta !== 0) registrarMovimento(telefone, TIPO_AJUSTE, delta, 0, '')
      }
      return
    }
  }

  throw new Error('Cliente não encontrado.')
}

// Soma créditos ao saldo: o barbeiro vendeu um pacote.
function venderPacote(body) {
  const telefone = body && body.telefone
  const creditos = Math.floor(Number(body && body.creditos) || 0)
  const valor = Math.max(0, Number(body && body.valor) || 0)

  if (!telefone) throw new Error('Telefone obrigatório.')
  if (creditos < 1 || creditos > 100) throw new Error('Informe de 1 a 100 cortes.')

  const lock = LockService.getScriptLock()
  if (!lock.tryLock(10000)) throw new Error('Sistema ocupado, tente novamente em instantes.')
  try {
    registrarMovimento(telefone, TIPO_PACOTE, creditos, valor, '')
    return { saldo: saldoDoCliente(telefone) }
  } finally {
    lock.releaseLock()
  }
}

// Últimos movimentos do cliente, do mais novo pro mais antigo.
function historicoCliente(telefone) {
  if (!telefone) throw new Error('Telefone obrigatório.')
  return lerMovimentos()
    .filter((m) => String(m.telefone) === String(telefone))
    .reverse()
    .slice(0, 30)
    .map((m) => ({
      data: Utilities.formatDate(new Date(m.criadoEm), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
      tipo: m.tipo,
      creditos: Number(m.creditos) || 0,
      valor: Number(m.valor) || 0,
    }))
}
