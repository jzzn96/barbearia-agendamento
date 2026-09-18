// Ponto de entrada do Web App. doGet/doPost são os únicos nomes que o
// Apps Script reconhece automaticamente — tudo mais é roteado por ?action=.

function doGet(e) {
  return rotear(e, 'GET')
}

function doPost(e) {
  return rotear(e, 'POST')
}

function rotear(e, method) {
  try {
    const params = e.parameter || {}
    const action = params.action

    // POST manda o corpo como text/plain (não application/json) de propósito:
    // isso evita o preflight OPTIONS, que o Apps Script Web App não trata bem.
    const body = method === 'POST' && e.postData ? JSON.parse(e.postData.contents) : {}

    const data = executarAcao(action, method, params, body)
    return respostaJson({ ok: true, data: data === undefined ? null : data })
  } catch (err) {
    return respostaJson({ ok: false, error: err.message })
  }
}

function executarAcao(action, method, params, body) {
  switch (action) {
    case 'horariosDisponiveis':
      return horariosDisponiveis(params.data, params.servico)

    case 'criarAgendamento':
      return criarAgendamento(body)

    case 'listarAgendamentos':
      exigirPin(params.pin)
      return listarAgendamentosPorData(params.data)

    case 'listarClientes':
      exigirPin(params.pin)
      return listarClientes(params.busca || '')

    case 'atualizarStatusCliente':
      exigirPin(body.pin)
      return atualizarStatusCliente(body)

    case 'cancelarAgendamento':
      exigirPin(body.pin)
      return cancelarAgendamento(body.id)

    case 'criarBloqueio':
      exigirPin(body.pin)
      return criarBloqueio(body.data, body.horarioInicio, body.horarioFim, body.motivo, body.diaTodo)

    case 'listarBloqueios':
      exigirPin(params.pin)
      return listarBloqueios(params.data)

    case 'removerBloqueio':
      exigirPin(body.pin)
      return removerBloqueio(body.id)

    default:
      throw new Error('Ação desconhecida: ' + action)
  }
}

function exigirPin(pin) {
  const config = getConfig()
  if (!pin || pin !== config.pin) throw new Error('PIN incorreto.')
}

function respostaJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
