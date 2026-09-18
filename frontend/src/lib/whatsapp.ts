import { normalizePhone } from './phone'

// Monta o link wa.me com a mensagem pré-escrita. O barbeiro só clica
// em "Enviar" no WhatsApp dele — nada disso passa por API paga.
export function buildReminderLink(params: {
  telefone: string
  nomeCliente: string
  data: string // AAAA-MM-DD
  horario: string // HH:mm
}): string {
  const { telefone, nomeCliente, data, horario } = params

  const dataFormatada = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')

  const mensagem =
    `Olá, ${nomeCliente}! Passando pra lembrar do seu horário na barbearia ` +
    `dia ${dataFormatada} às ${horario}. Até lá! 💈`

  const numero = normalizePhone(telefone)
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
