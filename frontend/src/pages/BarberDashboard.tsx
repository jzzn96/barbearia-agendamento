import { useEffect, useState } from 'react'
import { api, ApiError, type Agendamento } from '../services/api'
import { barberSession } from '../services/barberSession'
import { diaMesLongo, diaSemanaLongo, hoje, somaDias } from '../lib/datas'
import { AgendamentoCard } from '../components/AgendamentoCard'
import { PainelNav } from '../components/PainelNav'
import { IconeSetaDir, IconeSetaEsq } from '../components/Icones'

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

  async function concluir(a: Agendamento) {
    try {
      const resultado = await api.concluirAtendimento({ id: a.id, pin })
      carregar()
      if (!resultado.usouCredito && a.clienteMensal) {
        alert(`${a.nomeCliente} está sem cortes no saldo. Atendimento marcado como feito, sem descontar nada.`)
      }
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao marcar como atendido.')
    }
  }

  async function desfazer(a: Agendamento) {
    try {
      await api.desfazerAtendimento({ id: a.id, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao desfazer.')
    }
  }

  return (
    <div className="app app-painel">
      <PainelNav titulo="Agenda" />

      <div className="seletor-data">
        <button type="button" className="seta" aria-label="Dia anterior" onClick={() => setData(somaDias(data, -1))}>
          <IconeSetaEsq />
        </button>
        <div className="seletor-label">
          <strong>{diaSemanaLongo(data)}</strong>
          <span>{diaMesLongo(data)}</span>
        </div>
        <button type="button" className="seta" aria-label="Próximo dia" onClick={() => setData(somaDias(data, 1))}>
          <IconeSetaDir />
        </button>
        <button type="button" className="chip-hoje" disabled={data === hoje()} onClick={() => setData(hoje())}>
          Hoje
        </button>
      </div>

      {erro && <p className="erro" style={{ marginTop: 16 }}>{erro}</p>}

      {!erro && (
        <p className="resumo">
          {carregando
            ? 'Carregando...'
            : agendamentos.length === 0
              ? 'Nenhum atendimento neste dia'
              : `${agendamentos.length} atendimento${agendamentos.length === 1 ? '' : 's'}`}
        </p>
      )}

      <div className="lista">
        {agendamentos.map((a) => (
          <AgendamentoCard key={a.id} agendamento={a} onCancelar={cancelar} onConcluir={concluir} onDesfazer={desfazer} />
        ))}
      </div>
    </div>
  )
}
