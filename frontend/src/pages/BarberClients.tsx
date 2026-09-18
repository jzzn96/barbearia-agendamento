import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, type Cliente } from '../services/api'
import { barberSession } from '../services/barberSession'
import { Marca } from '../components/Marca'

export default function BarberClients() {
  const [busca, setBusca] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const pin = barberSession.get() ?? ''

  function carregar() {
    setCarregando(true)
    api
      .listarClientes(pin, busca)
      .then(setClientes)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar clientes.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [busca]) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvar(c: Cliente) {
    try {
      await api.atualizarStatusCliente({ telefone: c.telefone, mensal: c.mensal, cortesPagosMes: c.cortesPagosMes, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao salvar.')
    }
  }

  return (
    <div className="tela">
      <Marca />
      <div className="topo-painel">
        <h1>Clientes</h1>
        <div className="topo-painel-links">
          <Link to="/painel/bloqueios">Bloqueios</Link>
          <Link to="/painel">Agenda</Link>
        </div>
      </div>

      <input placeholder="Buscar por nome ou telefone" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      {clientes.map((c) => (
        <div className="card" key={c.telefone}>
          <strong>{c.nome}</strong>
          <div className="card-sub">{c.telefone}</div>
          <div className="card-status">
            <label>
              <input
                type="checkbox"
                checked={c.mensal}
                onChange={(e) => setClientes((prev) => prev.map((x) => (x.telefone === c.telefone ? { ...x, mensal: e.target.checked } : x)))}
              />
              Mensal
            </label>
            {c.mensal && (
              <input
                type="number"
                min={0}
                value={c.cortesPagosMes}
                onChange={(e) =>
                  setClientes((prev) =>
                    prev.map((x) => (x.telefone === c.telefone ? { ...x, cortesPagosMes: Number(e.target.value) } : x)),
                  )
                }
                style={{ width: 48 }}
              />
            )}
            <button className="link" onClick={() => salvar(c)}>
              salvar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
