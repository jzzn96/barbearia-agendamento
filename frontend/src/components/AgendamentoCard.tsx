import { useState } from 'react'
import type { Agendamento } from '../services/api'
import { buildReminderLink } from '../lib/whatsapp'
import { formatPhoneDisplay } from '../lib/phone'
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
    <div className="card agendamento-card">
      <div className="agendamento-topo">
        <span className="agendamento-hora">{agendamento.horario}</span>
        <div className="agendamento-cliente">
          <strong>{agendamento.nomeCliente}</strong>
          <span className="card-sub">
            {formatPhoneDisplay(agendamento.telefoneCliente)} · {agendamento.servico} ({agendamento.duracaoMin} min)
          </span>
        </div>
        <a className="btn-lembrete" href={linkLembrete} target="_blank" rel="noreferrer">
          Lembrar 💬
        </a>
      </div>

      {!editando && (
        <div className="agendamento-rodape">
          <span className={agendamento.clienteMensal ? 'status-badge status-mensal' : 'status-badge'}>
            {agendamento.clienteMensal ? `Mensal · restam ${restam}` : 'Avulso'}
          </span>
          <div className="agendamento-acoes">
            <button className="btn-acao" onClick={() => setEditando(true)}>
              Editar
            </button>
            <button className="btn-acao btn-acao-perigo" onClick={() => onCancelar(agendamento.id)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editando && (
        <div className="agendamento-editar">
          <label className="toggle">
            <input type="checkbox" checked={mensal} onChange={(e) => setMensal(e.target.checked)} />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">Cliente mensal</span>
          </label>
          {mensal && <PacoteCortes pagos={pagos} usados={usados} onChangePagos={setPagos} onChangeUsados={setUsados} />}
          <button
            className="btn-salvar-cliente"
            onClick={() => {
              onAtualizarStatus(agendamento.telefoneCliente, mensal, pagos, usados)
              setEditando(false)
            }}
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  )
}
