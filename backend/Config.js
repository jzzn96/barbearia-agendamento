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

// Expediente por dia da semana (0 = domingo ... 6 = sábado). Dia que não
// aparece aqui é FECHADO: nenhum horário é oferecido e o servidor recusa
// agendamento. "fim" é a hora em que a barbearia fecha (o último horário
// que cabe termina nela). Não tem intervalo de almoço (ver README).
const EXPEDIENTE = {
  2: { inicio: '09:00', fim: '20:00' }, // terça
  3: { inicio: '09:00', fim: '20:00' }, // quarta
  4: { inicio: '09:00', fim: '20:00' }, // quinta
  5: { inicio: '09:00', fim: '20:00' }, // sexta
  6: { inicio: '08:00', fim: '16:00' }, // sábado
}
const DURACAO_SLOT_MIN = 30

// Dia da semana de uma data AAAA-MM-DD (0 = domingo). Usa UTC de propósito:
// não depende do fuso do script nem do horário de verão.
function diaDaSemana(data) {
  const partes = String(data).split('-').map(Number)
  return new Date(Date.UTC(partes[0], partes[1] - 1, partes[2])).getUTCDay()
}

function expedienteDoDia(data) {
  return EXPEDIENTE[diaDaSemana(data)] || null
}

function paraMinutos(hhmm) {
  const partes = hhmm.split(':').map(Number)
  return partes[0] * 60 + partes[1]
}

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
