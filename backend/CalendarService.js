// Tudo que fala com o Google Agenda do barbeiro. A Agenda é a fonte de
// verdade pro HORÁRIO em si — inclusive eventos criados manualmente pelo
// barbeiro fora do sistema contam como ocupados aqui.

function horariosDisponiveis(data) {
  if (!data) throw new Error('Parâmetro "data" obrigatório (AAAA-MM-DD).')

  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  if (!calendar) throw new Error('Agenda não encontrada — confira CALENDAR_ID nas Propriedades do Script.')

  const inicioDia = new Date(`${data}T00:00:00`)
  const fimDia = new Date(`${data}T23:59:59`)
  const eventos = calendar.getEvents(inicioDia, fimDia)
  const ocupados = new Set(eventos.map((ev) => formatarHora(ev.getStartTime())))

  return gerarSlots().filter((h) => !ocupados.has(h))
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

function criarEventoCalendar(data, horario, nome, telefone) {
  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  const inicio = new Date(`${data}T${horario}:00`)
  const fim = new Date(inicio.getTime() + DURACAO_SLOT_MIN * 60000)

  const evento = calendar.createEvent(`${nome} - corte`, inicio, fim, {
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
