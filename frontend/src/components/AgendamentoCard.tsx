import { useState } from 'react'
import type { Agendamento } from '../services/api'
import { buildReminderLink } from '../lib/whatsapp'
import { formatPhoneDisplay } from '../lib/phone'
import { PacoteCortes } from './PacoteCortes'
import { CampoValorMensal } from './CampoValorMensal'
import { IconeWhats } from './Icones'

export function AgendamentoCard({
  agendamento,
  onCancelar,
  onAtualizarStatus,
}: {
  agendamento: Agendamento
  onCancelar: (id: string) => void
  onAtualizarStatus: (telefone: string, mensal: boolean, cortesPagosMes: number, cortesUsadosMes: number, valorMensal: number) => void
}) {
  const [editando, setEditando] = useState(false)
  const [mensal, setMensal] = useState(agendamento.clienteMensal)
  const [pagos, setPagos] = useState(agendamento.cortesPagosMes)
  const [usados, setUsados] = useState(agendamento.cortesUsadosMes)
  const [valorMensal, setValorMensal] = useState(agendamento.valorMensal)

  const linkLembrete = buildReminderLink({
    telefone: agendamento.telefoneCliente,
    nomeCliente: agendamento.nomeCliente,
    data: agendamento.data,
    horario: agendamento.horario,
  })

  const restam = Math.max(0, agendamento.cortesPagosMes - agendamento.cortesUsadosMes)

  return (
    <article className="ag">
      <div className="ag-hora">
        <strong>{agendamento.horario}</strong>
        <span>{agendamento.duracaoMin} min</span>
      </div>

      <div className="ag-corpo">
        <div className="ag-linha1">
          <h3>{agendamento.nomeCliente}</h3>
          <span className={agendamento.clienteMensal ? 'selo selo-mensal' : 'selo'}>
            {agendamento.clienteMensal ? `Mensal · restam ${restam}` : 'Avulso'}
          </span>
        </div>
        <p className="ag-sub">
          {agendamento.servico} · <span className="sem-quebra">{formatPhoneDisplay(agendamento.telefoneCliente)}</span>
        </p>

        {!editando && (
          <div className="ag-acoes">
            <a className="btn btn-whats btn-pequeno" href={linkLembrete} target="_blank" rel="noreferrer">
              <IconeWhats tamanho={16} /> Lembrar
            </a>
            <button type="button" className="btn btn-contorno btn-pequeno" onClick={() => setEditando(true)}>
              Editar
            </button>
            <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => onCancelar(agendamento.id)}>
              Cancelar
            </button>
          </div>
        )}

        {editando && (
          <div className="ag-editar">
            <label className="toggle">
              <input type="checkbox" checked={mensal} onChange={(e) => setMensal(e.target.checked)} />
              <span className="toggle-trilho">
                <span className="toggle-bola" />
              </span>
              <span className="toggle-texto">Cliente mensal</span>
            </label>
            {mensal && (
              <>
                <CampoValorMensal valor={valorMensal} onChange={setValorMensal} />
                <PacoteCortes pagos={pagos} usados={usados} onChangePagos={setPagos} onChangeUsados={setUsados} />
              </>
            )}
            <div className="ag-acoes">
              <button
                type="button"
                className="btn btn-principal btn-pequeno"
                onClick={() => {
                  onAtualizarStatus(agendamento.telefoneCliente, mensal, pagos, usados, valorMensal)
                  setEditando(false)
                }}
              >
                Salvar
              </button>
              <button type="button" className="btn btn-contorno btn-pequeno" onClick={() => setEditando(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
