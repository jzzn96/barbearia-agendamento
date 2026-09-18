// Tudo que fala com o Google Agenda do barbeiro. A Agenda é a fonte de
// verdade pro HORÁRIO em si — inclusive eventos criados manualmente pelo
// barbeiro fora do sistema contam como ocupados aqui.

// "servicoId" decide a duração (ver SERVICOS em Config.js), que por sua vez
// decide quantos slots de 30min consecutivos precisam estar livres.
function horariosDisponiveis(data, servicoId) {
  if (!data) throw new Error('Parâmetro "data" obrigatório (AAAA-MM-DD).')
  const duracaoMin = resolverServico(servicoId).duracaoMin

  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  if (!calendar) throw new Error('Agenda não encontrada — confira CALENDAR_ID nas Propriedades do Script.')

  const inicioDia = new Date(`${data}T00:00:00`)
  const fimDia = new Date(`${data}T23:59:59`)
  const eventos = calendar.getEvents(inicioDia, fimDia)

  // Marca TODO slot de 30min coberto por cada evento como ocupado — um
  // evento de 60min (ou um bloqueio manual do barbeiro) não pode deixar
  // o segundo slot aparecendo como livre.
  const ocupados = new Set()
  eventos.forEach((ev) => {
    let cursor = new Date(ev.getStartTime())
    const fimEvento = ev.getEndTime()
    while (cursor < fimEvento) {
      ocupados.add(formatarHora(cursor))
      cursor = new Date(cursor.getTime() + DURACAO_SLOT_MIN * 60000)
    }
  })

  const slots = gerarSlots()
  const passosNecessarios = Math.ceil(duracaoMin / DURACAO_SLOT_MIN)

  return slots.filter((_, i) => {
    for (let p = 0; p < passosNecessarios; p++) {
      const slot = slots[i + p]
      if (slot === undefined || ocupados.has(slot)) return false
    }
    return true
  })
}

function gerarSlots() {
  const slots = []
  for (let min = HORARIO_INICIO_H * 60; min < HORARIO_FIM_H * 60; min += DURACAO_SLOT_MIN) {
    slots.push(`${pad(Math.floor(min / 60))}:${pad(min % 60)}`)
  }
  return slots
}

function formatarHora(date) {
  return Utilities.formatDate(date, 'America/Sao_Paulo', 'HH:mm')
}

function criarEventoCalendar(data, horario, nome, telefone, tituloServico, duracaoMin) {
  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  const inicio = new Date(`${data}T${horario}:00`)
  const fim = new Date(inicio.getTime() + duracaoMin * 60000)

  const evento = calendar.createEvent(`${nome} - ${tituloServico}`, inicio, fim, {
    description: `Agendado pelo sistema. Telefone: ${telefone}`,
  })

  return evento.getId()
}

function excluirEventoCalendar(eventoId) {
  if (!eventoId) return
  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  const evento = calendar.getEventById(eventoId)
  if (evento) evento.deleteEvent()
}
