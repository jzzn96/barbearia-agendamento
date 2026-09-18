import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, type Bloqueio } from '../services/api'
import { barberSession } from '../services/barberSession'
import { Marca } from '../components/Marca'

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function somaDias(data: string, delta: number): string {
  const d = new Date(`${data}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export default function BarberBlocks() {
  const [data, setData] = useState(hoje())
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [diaTodo, setDiaTodo] = useState(false)
  const [horarioInicio, setHorarioInicio] = useState('09:00')
  const [horarioFim, setHorarioFim] = useState('19:00')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const pin = barberSession.get() ?? ''

  function carregar() {
    setCarregando(true)
    setErro('')
    api
      .listarBloqueios(data, pin)
      .then(setBloqueios)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar bloqueios.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  async function bloquear() {
    setSalvando(true)
    setErro('')
    try {
      await api.criarBloqueio({ data, diaTodo, horarioInicio, horarioFim, motivo: motivo.trim(), pin })
      setMotivo('')
      carregar()
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Falha ao bloquear o horário.')
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover esse bloqueio? O horário volta a ficar disponível.')) return
    try {
      await api.removerBloqueio({ id, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao remover.')
    }
  }

  return (
    <div className="tela">
      <Marca />
      <div className="topo-painel">
        <h1>Bloqueios</h1>
        <div className="topo-painel-links">
          <Link to="/painel/clientes">Clientes</Link>
          <Link to="/painel">Agenda</Link>
        </div>
      </div>

      <div className="nav-data">
        <button onClick={() => setData(somaDias(data, -1))}>◂</button>
        <strong>{new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</strong>
        <button onClick={() => setData(somaDias(data, 1))}>▸</button>
        <button onClick={() => setData(hoje())}>Hoje</button>
      </div>

      <div className="form">
        <label>
          <input type="checkbox" checked={diaTodo} onChange={(e) => setDiaTodo(e.target.checked)} />
          Bloquear o dia inteiro
        </label>

        {!diaTodo && (
          <>
            <label htmlFor="bloqueio-inicio">Início</label>
            <input id="bloqueio-inicio" type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} />
            <label htmlFor="bloqueio-fim">Fim</label>
            <input id="bloqueio-fim" type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
          </>
        )}

        <label htmlFor="bloqueio-motivo">Motivo (opcional)</label>
        <input
          id="bloqueio-motivo"
          placeholder="Ex: Almoço, compromisso pessoal..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        {erro && <p className="erro">{erro}</p>}

        <button disabled={salvando} onClick={bloquear}>
          {salvando ? 'Bloqueando...' : 'Bloquear'}
        </button>
      </div>

      <h2>Bloqueios do dia</h2>
      {carregando && <p>Carregando...</p>}
      {!carregando && bloqueios.length === 0 && !erro && <p>Nenhum bloqueio nesse dia.</p>}

      {bloqueios.map((b) => (
        <div className="card" key={b.id}>
          <div className="card-topo">
            <strong>{b.diaTodo ? 'Dia inteiro' : `${b.horarioInicio} – ${b.horarioFim}`}</strong>
          </div>
          <div className="card-sub">{b.titulo}</div>
          <div className="card-status">
            <button className="link" onClick={() => remover(b.id)}>
              remover
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
