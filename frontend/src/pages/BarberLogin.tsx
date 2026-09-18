import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../services/api'
import { barberSession } from '../services/barberSession'

export default function BarberLogin() {
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function entrar() {
    setCarregando(true)
    setErro('')
    try {
      const hoje = new Date().toISOString().slice(0, 10)
      await api.listarAgendamentos(hoje, pin) // valida o PIN contra o backend
      barberSession.set(pin)
      navigate('/painel')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'PIN incorreto.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="tela">
      <h1>Área do barbeiro</h1>
      <div className="form">
        <input
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
        />
        {erro && <p className="erro">{erro}</p>}
        <button disabled={carregando || !pin} onClick={entrar}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}
