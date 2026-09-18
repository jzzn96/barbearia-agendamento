// Regra de negócio do agendamento em si. criarAgendamento() é o único
// ponto que usa LockService — evita dois clientes confirmando o mesmo
// horário ao mesmo tempo (a checagem de disponibilidade + criação do
// evento precisa ser atômica).

function criarAgendamento(body) {
  const nome = body && body.nome
  const telefoneBruto = body && body.telefone
  const data = body && body.data
  const horario = body && body.horario
  const servicoId = body && body.servico
  const honeypot = body && body.honeypot

  if (honeypot) {
    // Campo invisível preenchido = quase certeza de bot. Finge sucesso
    // sem criar nada, pra não dar pista de que foi bloqueado.
    return { id: 'ignorado', telefoneCliente: telefoneBruto, nomeCliente: nome, data, horario, servico: servicoId, status: 'agendado', clienteMensal: false, cortesPagosMes: 0 }
  }

  if (!nome || !telefoneBruto || !data || !horario || !servicoId) {
    throw new Error('Preencha nome, telefone, serviço, data e horário.')
  }

  const servico = resolverServico(servicoId)
  const telefone = normalizarTelefone(telefoneBruto)

  const lock = LockService.getScriptLock()
  if (!lock.tryLock(10000)) {
    throw new Error('Sistema ocupado, tente novamente em instantes.')
  }

  try {
    rejeitarSpam(telefone)

    const livres = horariosDisponiveis(data, servicoId)
    if (livres.indexOf(horario) === -1) {
      throw new Error('Esse horário acabou de ser preenchido, escolha outro.')
    }

    const eventoId = criarEventoCalendar(data, horario, nome, telefone, servico.nome, servico.duracaoMin)
    const cliente = buscarOuCriarCliente(telefone, nome)

    const id = Utilities.getUuid()
    const aba = getAba(ABA_AGENDAMENTOS, CABECALHO_AGENDAMENTOS)
    aba.appendRow([id, eventoId, telefone, nome, data, horario, servico.nome, servico.duracaoMin, 'agendado', BARBEIRO_ID, new Date()])

    return {
      id,
      telefoneCliente: telefone,
      nomeCliente: nome,
      data,
      horario,
      servico: servico.nome,
      duracaoMin: servico.duracaoMin,
      status: 'agendado',
      clienteMensal: !!cliente.mensal,
      cortesPagosMes: Number(cliente.cortesPagosMes) || 0,
    }
  } finally {
    lock.releaseLock()
  }
}

// Anti-abuso simples: mesmo telefone não marca de novo em menos de 5min.
// Não substitui um CAPTCHA de verdade, mas resolve o caso comum de bot
// martelando o endpoint público sem precisar de serviço pago nenhum.
function rejeitarSpam(telefone) {
  const aba = getAba(ABA_AGENDAMENTOS, CABECALHO_AGENDAMENTOS)
  const linhas = linhasComoObjetos(aba, CABECALHO_AGENDAMENTOS)
  const limite = new Date(Date.now() - 5 * 60 * 1000)

  const recente = linhas.some((l) => String(l.telefoneCliente) === telefone && new Date(l.criadoEm) > limite)
  if (recente) throw new Error('Você já agendou recentemente. Aguarde alguns minutos e tente de novo.')
}

function listarAgendamentosPorData(data) {
  const aba = getAba(ABA_AGENDAMENTOS, CABECALHO_AGENDAMENTOS)
  const linhas = linhasComoObjetos(aba, CABECALHO_AGENDAMENTOS)
  const clientes = mapaClientesPorTelefone()

  return linhas
    .filter((l) => l.data === data && l.status !== 'cancelado')
    .sort((a, b) => (a.horario > b.horario ? 1 : -1))
    .map((l) => {
      const cliente = clientes[l.telefoneCliente] || {}
      return {
        id: l.id,
        telefoneCliente: l.telefoneCliente,
        nomeCliente: l.nomeCliente,
        data: l.data,
        horario: l.horario,
        servico: l.servico,
        duracaoMin: Number(l.duracaoMin) || 30,
        status: l.status,
        clienteMensal: !!cliente.mensal,
        cortesPagosMes: Number(cliente.cortesPagosMes) || 0,
      }
    })
}

// Cancela dos dois lados: apaga o evento real da Agenda e marca a linha
// na planilha como "cancelado" (não apaga a linha — fica de histórico).
function cancelarAgendamento(id) {
  const aba = getAba(ABA_AGENDAMENTOS, CABECALHO_AGENDAMENTOS)
  const valores = aba.getDataRange().getValues()
  const idxId = CABECALHO_AGENDAMENTOS.indexOf('id')
  const idxEvento = CABECALHO_AGENDAMENTOS.indexOf('eventoCalendarId')
  const idxStatus = CABECALHO_AGENDAMENTOS.indexOf('status')

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][idxId] === id) {
      excluirEventoCalendar(valores[i][idxEvento])
      aba.getRange(i + 1, idxStatus + 1).setValue('cancelado')
      return
    }
  }

  throw new Error('Agendamento não encontrado.')
}
