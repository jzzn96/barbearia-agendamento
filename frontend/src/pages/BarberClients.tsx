import { useEffect, useState } from 'react'
import { api, ApiError, type Cliente } from '../services/api'
import { barberSession } from '../services/barberSession'
import { formatPhoneDisplay } from '../lib/phone'
import { Marca } from '../components/Marca'
import { PainelNav } from '../components/PainelNav'
import { PacoteCortes } from '../components/PacoteCortes'
import { CampoValorMensal } from '../components/CampoValorMensal'

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
      await api.atualizarStatusCliente({
        telefone: c.telefone,
        mensal: c.mensal,
        cortesPagosMes: c.cortesPagosMes,
        cortesUsadosMes: c.cortesUsadosMes,
        valorMensal: c.valorMensal,
        pin,
      })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao salvar.')
    }
  }

  return (
    <div className="tela">
      <Marca />
      <PainelNav titulo="Clientes" />

      <input className="input-busca" placeholder="Buscar por nome ou telefone" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      {clientes.map((c) => (
        <div className="card cliente-card" key={c.telefone}>
          <div className="cliente-topo">
            <div className="cliente-avatar">{c.nome.charAt(0).toUpperCase()}</div>
            <div className="cliente-dados">
              <div className="cliente-linha">
                <span className="cliente-label">Nome</span>
                <strong>{c.nome}</strong>
              </div>
              <div className="cliente-linha">
                <span className="cliente-label">Tel</span>
                <span>{formatPhoneDisplay(c.telefone)}</span>
              </div>
            </div>
          </div>

          <label className="toggle toggle-mensal">
            <input
              type="checkbox"
              checked={c.mensal}
              onChange={(e) => setClientes((prev) => prev.map((x) => (x.telefone === c.telefone ? { ...x, mensal: e.target.checked } : x)))}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">Cliente mensal</span>
          </label>

          {c.mensal && (
            <>
              <CampoValorMensal
                valor={c.valorMensal}
                onChange={(v) => setClientes((prev) => prev.map((x) => (x.telefone === c.telefone ? { ...x, valorMensal: v } : x)))}
              />
              <PacoteCortes
                pagos={c.cortesPagosMes}
                usados={c.cortesUsadosMes}
                onChangePagos={(v) => setClientes((prev) => prev.map((x) => (x.telefone === c.telefone ? { ...x, cortesPagosMes: v } : x)))}
                onChangeUsados={(v) => setClientes((prev) => prev.map((x) => (x.telefone === c.telefone ? { ...x, cortesUsadosMes: v } : x)))}
              />
            </>
          )}

          <button className="btn-salvar-cliente" onClick={() => salvar(c)}>
            Salvar
          </button>
        </div>
      ))}
    </div>
  )
}
