// Tudo que fala com o Google Agenda do barbeiro. A Agenda é a fonte de
// verdade pro HORÁRIO em si — inclusive eventos criados manualmente pelo
// barbeiro fora do sistema contam como ocupados aqui.

// "servicoId" decide a duração (ver SERVICOS em Config.js), que por sua vez
// decide quantos slots de 30min consecutivos precisam estar livres.
function horariosDisponiveis(data, servicoId) {
  if (!data) throw new Error('Parâmetro "data" obrigatório (AAAA-MM-DD).')
  const duracaoMin = resolverServico(servicoId).duracaoMin

  // Dia fechado (ex: domingo e segunda): nada a oferecer, nem precisa
  // consultar a Agenda.
  const slots = gerarSlots(data)
  if (slots.length === 0) return []

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

  const passosNecessarios = Math.ceil(duracaoMin / DURACAO_SLOT_MIN)

  // Hoje, horário que já passou não pode ser marcado.
  const hojeSP = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd')
  const agoraSP = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'HH:mm')

  return slots.filter((slotInicial, i) => {
    if (data === hojeSP && slotInicial <= agoraSP) return false
    for (let p = 0; p < passosNecessarios; p++) {
      const slot = slots[i + p]
      if (slot === undefined || ocupados.has(slot)) return false
    }
    return true
  })
}

// Horários do dia, de 30 em 30 min, dentro do expediente. Dia fechado = [].
function gerarSlots(data) {
  const expediente = expedienteDoDia(data)
  if (!expediente) return []

  const slots = []
  for (let min = paraMinutos(expediente.inicio); min < paraMinutos(expediente.fim); min += DURACAO_SLOT_MIN) {
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

// Bloqueios são eventos comuns na mesma Agenda (por isso já contam como
// ocupados em horariosDisponiveis, sem precisar de lógica extra) — só o
// prefixo do título ("Bloqueado") que os diferencia de um agendamento real
// na hora de listar/remover.
const PREFIXO_BLOQUEIO = 'Bloqueado'

function criarBloqueio(data, horarioInicio, horarioFim, motivo, diaTodo) {
  if (!data) throw new Error('Parâmetro "data" obrigatório (AAAA-MM-DD).')
  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  const titulo = motivo ? `${PREFIXO_BLOQUEIO} - ${motivo}` : PREFIXO_BLOQUEIO

  let evento
  if (diaTodo) {
    evento = calendar.createAllDayEvent(titulo, new Date(`${data}T00:00:00`))
  } else {
    if (!horarioInicio || !horarioFim) throw new Error('Informe o horário de início e fim do bloqueio.')
    const inicio = new Date(`${data}T${horarioInicio}:00`)
    const fim = new Date(`${data}T${horarioFim}:00`)
    if (fim <= inicio) throw new Error('O horário final precisa ser depois do inicial.')
    evento = calendar.createEvent(titulo, inicio, fim)
  }

  return { id: evento.getId(), titulo }
}

function listarBloqueios(data) {
  if (!data) throw new Error('Parâmetro "data" obrigatório (AAAA-MM-DD).')
  const config = getConfig()
  const calendar = CalendarApp.getCalendarById(config.calendarId)
  const inicioDia = new Date(`${data}T00:00:00`)
  const fimDia = new Date(`${data}T23:59:59`)

  return calendar
    .getEvents(inicioDia, fimDia)
    .filter((e) => e.getTitle().indexOf(PREFIXO_BLOQUEIO) === 0)
    .map((e) => ({
      id: e.getId(),
      titulo: e.getTitle(),
      diaTodo: e.isAllDayEvent(),
      horarioInicio: e.isAllDayEvent() ? null : formatarHora(e.getStartTime()),
      horarioFim: e.isAllDayEvent() ? null : formatarHora(e.getEndTime()),
    }))
}

function removerBloqueio(eventoId) {
  excluirEventoCalendar(eventoId)
}
