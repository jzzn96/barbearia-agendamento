import { useState } from 'react'
import { api, ApiError, type Cliente, type Movimento } from '../services/api'
import { formatPhoneDisplay } from '../lib/phone'
import { SaldoCortes } from './SaldoCortes'
import { CampoValorMensal } from './CampoValorMensal'

const ROTULO_MOVIMENTO: Record<Movimento['tipo'], string> = {
  pacote: 'Pacote comprado',
  uso: 'Corte usado',
  estorno: 'Atendimento desfeito',
  ajuste: 'Ajuste',
}

export function ClienteCard({ cliente, pin, onAtualizado }: { cliente: Cliente; pin: string; onAtualizado: () => void }) {
  const [mensal, setMensal] = useState(cliente.mensal)
  const [valorMensal, setValorMensal] = useState(cliente.valorMensal)
  const [vendendo, setVendendo] = useState(false)
  const [creditos, setCreditos] = useState(4)
  const [valorPacote, setValorPacote] = useState(cliente.valorMensal)
  const [historico, setHistorico] = useState<Movimento[] | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [editandoNome, setEditandoNome] = useState(false)
  const [nome, setNome] = useState(cliente.nome)

  async function executar(acao: () => Promise<void>, falha: string) {
    setOcupado(true)
    try {
      await acao()
      onAtualizado()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : falha)
    } finally {
      setOcupado(false)
    }
  }

  function salvarPlano() {
    return executar(() => api.atualizarStatusCliente({ telefone: cliente.telefone, mensal, valorMensal, pin }), 'Falha ao salvar.')
  }

  function salvarNome() {
    return executar(async () => {
      await api.atualizarNomeCliente({ telefone: cliente.telefone, nome: nome.trim(), pin })
      setEditandoNome(false)
    }, 'Falha ao salvar o nome.')
  }

  function confirmarVenda() {
    return executar(async () => {
      await api.venderPacote({ telefone: cliente.telefone, creditos, valor: valorPacote, pin })
      setVendendo(false)
      setHistorico(null)
    }, 'Falha ao registrar o pacote.')
  }

  async function alternarHistorico() {
    if (historico) {
      setHistorico(null)
      return
    }
    try {
      setHistorico(await api.historicoCliente({ telefone: cliente.telefone, pin }))
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao carregar o histórico.')
    }
  }

  return (
    <article className="cliente">
      <div className="cliente-topo">
        <div className="cliente-avatar" aria-hidden="true">
          {cliente.nome.charAt(0).toUpperCase()}
        </div>
        <div className="cliente-dados">
          <strong>{cliente.nome}</strong>
          <span>{formatPhoneDisplay(cliente.telefone)}</span>
        </div>
        <button type="button" className="btn btn-contorno btn-pequeno cliente-editar" onClick={() => setEditandoNome((v) => !v)}>
          {editandoNome ? 'Cancelar' : 'Editar nome'}
        </button>
      </div>

      {editandoNome && (
        <div className="pacote">
          <div className="campo">
            <label htmlFor={`nome-${cliente.telefone}`}>Nome do cliente</label>
            <input id={`nome-${cliente.telefone}`} maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <button type="button" className="btn btn-principal btn-bloco" disabled={ocupado || !nome.trim()} onClick={salvarNome}>
            Salvar nome
          </button>
        </div>
      )}

      <SaldoCortes comprados={cliente.cortesPagosMes} saldo={cliente.saldo} />

      <div className="ag-acoes">
        <button type="button" className="btn btn-principal btn-pequeno" onClick={() => setVendendo((v) => !v)}>
          {vendendo ? 'Fechar venda' : 'Vender pacote'}
        </button>
        <button type="button" className="btn btn-contorno btn-pequeno" onClick={alternarHistorico}>
          {historico ? 'Ocultar histórico' : 'Histórico'}
        </button>
      </div>

      {vendendo && (
        <div className="pacote">
          <div className="pacote-linha">
            <span>Cortes no pacote</span>
            <div className="stepper">
              <button type="button" aria-label="Diminuir cortes" onClick={() => setCreditos((c) => Math.max(1, c - 1))}>
                −
              </button>
              <strong>{creditos}</strong>
              <button type="button" aria-label="Aumentar cortes" onClick={() => setCreditos((c) => Math.min(100, c + 1))}>
                +
              </button>
            </div>
          </div>
          <CampoValorMensal valor={valorPacote} onChange={setValorPacote} rotulo="Valor pago" />
          <button type="button" className="btn btn-principal btn-bloco" disabled={ocupado} onClick={confirmarVenda}>
            Confirmar venda de {creditos} corte{creditos === 1 ? '' : 's'}
          </button>
        </div>
      )}

      {historico && (
        <ul className="historico" aria-label="Histórico de cortes">
          {historico.length === 0 && <li className="aviso">Nenhum movimento ainda.</li>}
          {historico.map((m, i) => (
            <li key={i}>
              <span>
                {ROTULO_MOVIMENTO[m.tipo] ?? m.tipo}
                <small>{m.data}</small>
              </span>
              <strong className={m.creditos < 0 ? 'saiu' : 'entrou'}>{m.creditos > 0 ? `+${m.creditos}` : m.creditos}</strong>
            </li>
          ))}
        </ul>
      )}

      <div className="cliente-plano">
        <label className="toggle">
          <input type="checkbox" checked={mensal} onChange={(e) => setMensal(e.target.checked)} />
          <span className="toggle-trilho">
            <span className="toggle-bola" />
          </span>
          <span className="toggle-texto">Cliente mensal</span>
        </label>

        {mensal && <CampoValorMensal valor={valorMensal} onChange={setValorMensal} rotulo="Valor mensal" />}

        {(mensal !== cliente.mensal || (mensal && valorMensal !== cliente.valorMensal)) && (
          <button type="button" className="btn btn-contorno btn-bloco" disabled={ocupado} onClick={salvarPlano}>
            Salvar plano
          </button>
        )}
      </div>
    </article>
  )
}
