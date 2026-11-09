// Datas sempre no fuso do aparelho (Joinville = Brasília). Não usar
// toISOString().slice(0, 10) pra isso: ele converte pra UTC e, depois das
// 21h, devolve o dia seguinte.
export function paraYMD(d: Date): string {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function hoje(): string {
  return paraYMD(new Date())
}

export function deYMD(data: string): Date {
  return new Date(`${data}T00:00:00`)
}

export function somaDias(data: string, delta: number): string {
  const d = deYMD(data)
  d.setDate(d.getDate() + delta)
  return paraYMD(d)
}

// Só a primeira letra maiúscula ("Segunda-feira, 9 de novembro"). O CSS
// text-transform: capitalize erra aqui: ele põe maiúscula em "De" e "Feira".
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function diaSemanaLongo(data: string): string {
  return capitalizar(deYMD(data).toLocaleDateString('pt-BR', { weekday: 'long' }))
}

export function diaMesLongo(data: string): string {
  return deYMD(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function dataCurta(data: string): string {
  return deYMD(data).toLocaleDateString('pt-BR')
}
