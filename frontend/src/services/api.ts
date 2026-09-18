const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined

export type Agendamento = {
  id: string
  telefoneCliente: string
  nomeCliente: string
  data: string // AAAA-MM-DD
  horario: string // HH:mm
  servico: string
  duracaoMin: number
  status: 'agendado' | 'concluido' | 'cancelado'
  clienteMensal: boolean
  cortesPagosMes: number
}

export type NovoAgendamento = {
  nome: string
  telefone: string
  data: string
  horario: string
  servico: string // id do serviço (ver lib/servicos.ts)
  honeypot: string // deixar sempre vazio; se vier preenchido é bot
}

export type Cliente = {
  telefone: string
  nome: string
  mensal: boolean
  cortesPagosMes: number
}

export type Bloqueio = {
  id: string
  titulo: string
  diaTodo: boolean
  horarioInicio: string | null
  horarioFim: string | null
}

export type NovoBloqueio = {
  data: string
  diaTodo: boolean
  horarioInicio?: string
  horarioFim?: string
  motivo?: string
  pin: string
}

class ApiError extends Error {}

// O Apps Script tem uma peculiaridade de CORS com POST em JSON (dispara
// preflight que ele não trata bem) — por isso GET usa querystring e POST
// manda o corpo como text/plain, decodificado manualmente no doPost().
async function call<T>(action: string, options?: { method?: 'GET' | 'POST'; params?: Record<string, string>; body?: unknown }): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError('VITE_APPS_SCRIPT_URL não configurada — copie .env.example para .env e preencha após publicar o Apps Script.')
  }

  const method = options?.method ?? 'GET'
  const url = new URL(BASE_URL)
  url.searchParams.set('action', action)

  if (method === 'GET') {
    for (const [key, value] of Object.entries(options?.params ?? {})) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    method,
    body: method === 'POST' ? JSON.stringify(options?.body ?? {}) : undefined,
    headers: method === 'POST' ? { 'Content-Type': 'text/plain' } : undefined,
  })

  const payload = await response.json()

  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.error ?? 'Falha na comunicação com o servidor.')
  }

  return payload.data as T
}

export const api = {
  horariosDisponiveis: (data: string, servico: string) =>
    call<string[]>('horariosDisponiveis', { params: { data, servico } }),

  criarAgendamento: (novo: NovoAgendamento) => call<Agendamento>('criarAgendamento', { method: 'POST', body: novo }),

  listarAgendamentos: (data: string, pin: string) =>
    call<Agendamento[]>('listarAgendamentos', { params: { data, pin } }),

  listarClientes: (pin: string, busca = '') =>
    call<Cliente[]>('listarClientes', { params: { pin, busca } }),

  atualizarStatusCliente: (params: { telefone: string; mensal: boolean; cortesPagosMes: number; pin: string }) =>
    call<void>('atualizarStatusCliente', { method: 'POST', body: params }),

  cancelarAgendamento: (params: { id: string; pin: string }) =>
    call<void>('cancelarAgendamento', { method: 'POST', body: params }),

  listarBloqueios: (data: string, pin: string) =>
    call<Bloqueio[]>('listarBloqueios', { params: { data, pin } }),

  criarBloqueio: (novo: NovoBloqueio) => call<{ id: string; titulo: string }>('criarBloqueio', { method: 'POST', body: novo }),

  removerBloqueio: (params: { id: string; pin: string }) =>
    call<void>('removerBloqueio', { method: 'POST', body: params }),
}

export { ApiError }
