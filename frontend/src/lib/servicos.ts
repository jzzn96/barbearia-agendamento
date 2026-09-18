// Espelha o catálogo definido em backend/Config.js (SERVICOS) — os "id"
// precisam bater com as chaves de lá. A duração é só informativa aqui pro
// front (ex: mostrar "60 min"); quem decide de verdade é o backend.
export type ServicoId = 'corte' | 'barba' | 'combo'

export type Servico = {
  id: ServicoId
  nome: string
  duracaoMin: number
}

export const SERVICOS: Servico[] = [
  { id: 'corte', nome: 'Corte de Cabelo', duracaoMin: 30 },
  { id: 'barba', nome: 'Barba', duracaoMin: 30 },
  { id: 'combo', nome: 'Cabelo e Barba', duracaoMin: 60 },
]
