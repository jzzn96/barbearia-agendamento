import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../services/api'
import { barberSession } from '../services/barberSession'
import { hoje } from '../lib/datas'
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
      await api.listarAgendamentos(hoje(), pin) // valida o PIN contra o backend
      barberSession.set(pin)
      navigate('/painel')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'PIN incorreto.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="app">
      <header className="topo">
        <Marca />
      </header>

      <section className="login">
        <p className="eyebrow">Área do barbeiro</p>
        <h1 className="titulo-hero">
          Sua <em>agenda</em>
        </h1>
        <p className="lead">Digite o PIN para ver os horários e os clientes.</p>

        <div className="form">
          <div className="campo">
            <label htmlFor="campo-pin">PIN</label>
            <input
              id="campo-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && pin && entrar()}
            />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="button" className="btn btn-principal btn-bloco" disabled={carregando || !pin} onClick={entrar}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </section>
    </div>
  )
}
