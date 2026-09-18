// Normaliza qualquer entrada de telefone BR pro formato usado como chave
// na planilha e no link do WhatsApp: 55DDNNNNNNNNN (só dígitos, com DDI).
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')

  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('55')) digits = `55${digits}`

  return digits
}

// Aplica máscara visual (11) 91234-5678 enquanto o usuário digita.
// Recebe o valor bruto do input (pode já ter máscara parcial) e devolve
// o texto formatado; usar em conjunto com normalizePhone() só no envio.
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}
