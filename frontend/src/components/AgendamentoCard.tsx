import { useState } from 'react'
import type { Agendamento } from '../services/api'
import { buildReminderLink } from '../lib/whatsapp'
import { PacoteCortes } from './PacoteCortes'

export function AgendamentoCard({
  agendamento,
  onCancelar,
  onAtualizarStatus,
}: {
  agendamento: Agendamento
  onCancelar: (id: string) => void
  onAtualizarStatus: (telefone: string, mensal: boolean, cortesPagosMes: number, cortesUsadosMes: number) => void
}) {
  const [editando, setEditando] = useState(false)
  const [mensal, setMensal] = useState(agendamento.clienteMensal)
  const [pagos, setPagos] = useState(agendamento.cortesPagosMes)
  const [usados, setUsados] = useState(agendamento.cortesUsadosMes)

  const linkLembrete = buildReminderLink({
    telefone: agendamento.telefoneCliente,
    nomeCliente: agendamento.nomeCliente,
    data: agendamento.data,
    horario: agendamento.horario,
  })

  const restam = Math.max(0, agendamento.cortesPagosMes - agendamento.cortesUsadosMes)

  return (
    <div className="card">
      <div className="card-topo">
        <strong>{agendamento.horario}</strong> {agendamento.nomeCliente}
        <a className="btn-lembrete" href={linkLembrete} target="_blank" rel="noreferrer">
          Lembrar 💬
        </a>
      </div>
      <div className="card-sub">
        {agendamento.telefoneCliente} · {agendamento.servico} ({agendamento.duracaoMin} min)
      </div>

      {!editando && (
        <div className="card-status">
          {agendamento.clienteMensal ? <span>🔵 Mensal — restam {restam} cortes</span> : <span>Avulso</span>}
          <button className="link" onClick={() => setEditando(true)}>
            editar
          </button>
          <button className="link" onClick={() => onCancelar(agendamento.id)}>
            cancelar
          </button>
        </div>
      )}

      {editando && (
        <div className="card-status">
          <label>
            <input type="checkbox" checked={mensal} onChange={(e) => setMensal(e.target.checked)} />
            Mensal
          </label>
          {mensal && <PacoteCortes pagos={pagos} usados={usados} onChangePagos={setPagos} onChangeUsados={setUsados} />}
          <button
            className="link"
            onClick={() => {
              onAtualizarStatus(agendamento.telefoneCliente, mensal, pagos, usados)
              setEditando(false)
            }}
          >
            salvar
          </button>
        </div>
      )}
    </div>
  )
}
