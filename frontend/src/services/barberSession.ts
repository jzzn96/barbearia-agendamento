const STORAGE_KEY = 'barbearia:pin'

// PIN é proteção leve pra piloto (evita visitante casual ver dados de
// cliente), não é autenticação de verdade — ver ressalva no README.
export const barberSession = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set(pin: string) {
    try {
      localStorage.setItem(STORAGE_KEY, pin)
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem persistir
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignora
    }
  },
}
