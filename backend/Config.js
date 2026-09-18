// Nada de credencial fica hardcoded aqui — tudo vem de "Propriedades do
// Script" (Configurações do projeto no editor do Apps Script), pra não
// vazar segredo nenhum se esse código for parar num repositório público.
function getConfig() {
  const props = PropertiesService.getScriptProperties()
  const config = {
    calendarId: props.getProperty('CALENDAR_ID'),
    sheetId: props.getProperty('SHEET_ID'),
    pin: props.getProperty('BARBER_PIN'),
  }

  if (!config.calendarId || !config.sheetId || !config.pin) {
    throw new Error(
      'Configuração incompleta: defina CALENDAR_ID, SHEET_ID e BARBER_PIN em Configurações do projeto > Propriedades do Script.',
    )
  }

  return config
}

// Expediente e duração de cada horário — ajustar aqui conforme a rotina
// real da barbearia (não tem intervalo de almoço ainda, ver TODO no README).
const HORARIO_INICIO_H = 9 // 09:00
const HORARIO_FIM_H = 19 // 19:00
const DURACAO_SLOT_MIN = 30

const BARBEIRO_ID = 'barbeiro-1'

// Catálogo de serviços — a duração é o que decide quantos slots de 30min
// o agendamento ocupa na Agenda (ver horariosDisponiveis() e
// criarEventoCalendar() em CalendarService.js). O cliente manda só o id
// ("servico"); a duração nunca vem do cliente, pra não dar pra forjar.
const SERVICOS = {
  corte: { nome: 'Corte de Cabelo', duracaoMin: 30 },
  barba: { nome: 'Barba', duracaoMin: 30 },
  combo: { nome: 'Cabelo e Barba', duracaoMin: 60 },
}

function resolverServico(servicoId) {
  const servico = SERVICOS[servicoId]
  if (!servico) throw new Error('Serviço inválido: ' + servicoId)
  return servico
}

function mesAtual() {
  return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM')
}

function pad(n) {
  return String(n).padStart(2, '0')
}
