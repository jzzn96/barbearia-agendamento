import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../services/api'
import { barberSession } from '../services/barberSession'
import { Marca } from '../components/Marca'

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
      <Marca />
      <div className="hero">
        <div className="hero-avatar">🔒</div>
        <div>
          <p className="hero-titulo">Área do barbeiro</p>
          <p className="hero-sub">Digite seu PIN pra ver a agenda</p>
        </div>
      </div>
      <div className="form">
        <label htmlFor="campo-pin">PIN</label>
        <input
          id="campo-pin"
          type="password"
          inputMode="numeric"
          placeholder="••••"
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
