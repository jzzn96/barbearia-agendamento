import { useEffect, useState } from 'react'
import { api, ApiError, type Cliente } from '../services/api'
import { barberSession } from '../services/barberSession'
import { formatPhoneDisplay } from '../lib/phone'
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
    setErro('')
    api
      .listarClientes(pin, busca)
      .then(setClientes)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar clientes.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [busca]) // eslint-disable-line react-hooks/exhaustive-deps

  function alterar(telefone: string, mudanca: Partial<Cliente>) {
    setClientes((prev) => prev.map((x) => (x.telefone === telefone ? { ...x, ...mudanca } : x)))
  }

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
          <article className="cliente" key={c.telefone}>
            <div className="cliente-topo">
              <div className="cliente-avatar" aria-hidden="true">
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="cliente-dados">
                <strong>{c.nome}</strong>
                <span>{formatPhoneDisplay(c.telefone)}</span>
              </div>
            </div>

            <label className="toggle">
              <input type="checkbox" checked={c.mensal} onChange={(e) => alterar(c.telefone, { mensal: e.target.checked })} />
              <span className="toggle-trilho">
                <span className="toggle-bola" />
              </span>
              <span className="toggle-texto">Cliente mensal</span>
            </label>

            {c.mensal && (
              <>
                <CampoValorMensal valor={c.valorMensal} onChange={(v) => alterar(c.telefone, { valorMensal: v })} />
                <PacoteCortes
                  pagos={c.cortesPagosMes}
                  usados={c.cortesUsadosMes}
                  onChangePagos={(v) => alterar(c.telefone, { cortesPagosMes: v })}
                  onChangeUsados={(v) => alterar(c.telefone, { cortesUsadosMes: v })}
                />
              </>
            )}

            <button type="button" className="btn btn-principal btn-bloco" onClick={() => salvar(c)}>
              Salvar
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
