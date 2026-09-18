import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, type Agendamento } from '../services/api'
import { barberSession } from '../services/barberSession'
import { AgendamentoCard } from '../components/AgendamentoCard'
import { Marca } from '../components/Marca'

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function somaDias(data: string, delta: number): string {
  const d = new Date(`${data}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export default function BarberDashboard() {
  const [data, setData] = useState(hoje())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const pin = barberSession.get() ?? ''

  function carregar() {
    setCarregando(true)
    setErro('')
    api
      .listarAgendamentos(data, pin)
      .then(setAgendamentos)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar agenda.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelar(id: string) {
    if (!confirm('Cancelar esse agendamento?')) return
    try {
      await api.cancelarAgendamento({ id, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao cancelar.')
    }
  }

  async function atualizarStatus(telefone: string, mensal: boolean, cortesPagosMes: number, cortesUsadosMes: number) {
    try {
      await api.atualizarStatusCliente({ telefone, mensal, cortesPagosMes, cortesUsadosMes, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao salvar.')
    }
  }

  return (
    <div className="tela">
      <Marca />
      <div className="topo-painel">
        <h1>Agenda</h1>
        <div className="topo-painel-links">
          <Link to="/painel/bloqueios">Bloqueios</Link>
          <Link to="/painel/clientes">Clientes</Link>
        </div>
      </div>

      <div className="nav-data">
        <button onClick={() => setData(somaDias(data, -1))}>◂</button>
        <strong>{new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</strong>
        <button onClick={() => setData(somaDias(data, 1))}>▸</button>
        <button onClick={() => setData(hoje())}>Hoje</button>
      </div>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}
      {!carregando && agendamentos.length === 0 && !erro && <p>Nenhum agendamento nesse dia.</p>}

      {agendamentos.map((a) => (
        <AgendamentoCard key={a.id} agendamento={a} onCancelar={cancelar} onAtualizarStatus={atualizarStatus} />
      ))}
    </div>
  )
}
