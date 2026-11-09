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

    case 'concluirAtendimento':
      exigirPin(body.pin)
      return concluirAtendimento(body.id)

    case 'desfazerAtendimento':
      exigirPin(body.pin)
      return desfazerAtendimento(body.id)

    case 'venderPacote':
      exigirPin(body.pin)
      return venderPacote(body)

    case 'historicoCliente':
      exigirPin(body.pin)
      return historicoCliente(body.telefone)

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

// Trava contra tentativa em sequência: 5 erros bloqueiam o painel por 15
// minutos. O contador é único (o painel tem um só barbeiro), então quem
// erra de propósito também bloqueia o barbeiro por esse tempo — troca
// aceitável pra impedir que alguém descubra o PIN testando todos.
const MAX_ERROS_PIN = 5
const BLOQUEIO_PIN_SEG = 15 * 60
const CHAVE_ERROS_PIN = 'erros_pin'

function exigirPin(pin) {
  const cache = CacheService.getScriptCache()
  const erros = Number(cache.get(CHAVE_ERROS_PIN)) || 0
  if (erros >= MAX_ERROS_PIN) {
    throw new Error('Muitas tentativas. Aguarde 15 minutos e tente de novo.')
  }

  const config = getConfig()
  if (!pin || !comparacaoSegura(String(pin), String(config.pin))) {
    cache.put(CHAVE_ERROS_PIN, String(erros + 1), BLOQUEIO_PIN_SEG)
    throw new Error('PIN incorreto.')
  }

  if (erros > 0) cache.remove(CHAVE_ERROS_PIN)
}

// Compara sem parar no primeiro caractere diferente.
function comparacaoSegura(a, b) {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diferenca === 0
}

function respostaJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
