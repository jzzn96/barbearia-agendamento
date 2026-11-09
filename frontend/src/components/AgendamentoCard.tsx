import type { Agendamento } from '../services/api'
import { buildReminderLink } from '../lib/whatsapp'
import { formatPhoneDisplay } from '../lib/phone'
import { IconeCheck, IconeWhats } from './Icones'

export function AgendamentoCard({
  agendamento,
  onCancelar,
  onConcluir,
  onDesfazer,
}: {
  agendamento: Agendamento
  onCancelar: (id: string) => void
  onConcluir: (agendamento: Agendamento) => void
  onDesfazer: (agendamento: Agendamento) => void
}) {
  const concluido = agendamento.status === 'concluido'
  const temPacote = agendamento.clienteMensal || agendamento.saldo > 0

  const linkLembrete = buildReminderLink({
    telefone: agendamento.telefoneCliente,
    nomeCliente: agendamento.nomeCliente,
    data: agendamento.data,
    horario: agendamento.horario,
  })

  return (
    <article className={concluido ? 'ag concluido' : 'ag'}>
      <div className="ag-hora">
        <strong>{agendamento.horario}</strong>
        <span>{agendamento.duracaoMin} min</span>
      </div>

      <div className="ag-corpo">
        <div className="ag-linha1">
          <h3>{agendamento.nomeCliente}</h3>
          {concluido ? (
            <span className="selo selo-ok">Atendido</span>
          ) : (
            <span className={temPacote ? 'selo selo-mensal' : 'selo'}>
              {temPacote ? `${agendamento.clienteMensal ? 'Mensal' : 'Pacote'} · saldo ${agendamento.saldo}` : 'Avulso'}
            </span>
          )}
        </div>
        <p className="ag-sub">
          {agendamento.servico} · <span className="sem-quebra">{formatPhoneDisplay(agendamento.telefoneCliente)}</span>
        </p>

        <div className="ag-acoes">
          {!concluido && (
            <>
              <button type="button" className="btn btn-principal btn-pequeno" onClick={() => onConcluir(agendamento)}>
                <IconeCheck tamanho={16} /> Atendido
              </button>
              <a className="btn btn-whats btn-pequeno" href={linkLembrete} target="_blank" rel="noreferrer">
                <IconeWhats tamanho={16} /> Lembrar
              </a>
              <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => onCancelar(agendamento.id)}>
                Cancelar
              </button>
            </>
          )}
          {concluido && (
            <button type="button" className="btn btn-contorno btn-pequeno" onClick={() => onDesfazer(agendamento)}>
              Desfazer
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
