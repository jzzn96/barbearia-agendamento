import { useEffect, useState } from 'react'
import { api, ApiError, type Cliente } from '../services/api'
import { barberSession } from '../services/barberSession'
import { PainelNav } from '../components/PainelNav'
import { ClienteCard } from '../components/ClienteCard'

export default function BarberClients() {
  const [busca, setBusca] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const pin = barberSession.get() ?? ''

  function carregar() {
    setCarregando(true)
    setErro('')
    api
      .listarClientes(pin, busca)
      .then(setClientes)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar clientes.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [busca]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app app-painel">
      <PainelNav titulo="Clientes" />

      <div className="campo busca">
        <label htmlFor="campo-busca">Buscar</label>
        <input id="campo-busca" type="search" placeholder="Nome ou telefone" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {erro && <p className="erro" style={{ marginTop: 16 }}>{erro}</p>}
      <p className="resumo">
        {carregando ? 'Carregando...' : clientes.length === 0 ? 'Nenhum cliente encontrado' : `${clientes.length} cliente${clientes.length === 1 ? '' : 's'}`}
      </p>

      <div className="lista">
        {clientes.map((c) => (
          <ClienteCard key={c.telefone} cliente={c} pin={pin} onAtualizado={carregar} />
        ))}
      </div>
    </div>
  )
}
