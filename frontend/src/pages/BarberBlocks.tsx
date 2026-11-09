import { useEffect, useState } from 'react'
import { api, ApiError, type Bloqueio } from '../services/api'
import { barberSession } from '../services/barberSession'
import { diaMesLongo, diaSemanaLongo, hoje, somaDias } from '../lib/datas'
import { PainelNav } from '../components/PainelNav'
import { IconeBloqueio, IconeSetaDir, IconeSetaEsq } from '../components/Icones'

export default function BarberBlocks() {
  const [data, setData] = useState(hoje())
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [diaTodo, setDiaTodo] = useState(false)
  const [horarioInicio, setHorarioInicio] = useState('09:00')
  const [horarioFim, setHorarioFim] = useState('19:00')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const pin = barberSession.get() ?? ''

  function carregar() {
    setCarregando(true)
    setErro('')
    api
      .listarBloqueios(data, pin)
      .then(setBloqueios)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Falha ao carregar bloqueios.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  async function bloquear() {
    setSalvando(true)
    setErro('')
    try {
      await api.criarBloqueio({ data, diaTodo, horarioInicio, horarioFim, motivo: motivo.trim(), pin })
      setMotivo('')
      carregar()
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Falha ao bloquear o horário.')
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover esse bloqueio? O horário volta a ficar disponível.')) return
    try {
      await api.removerBloqueio({ id, pin })
      carregar()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Falha ao remover.')
    }
  }

  return (
    <div className="app app-painel">
      <PainelNav titulo="Bloqueios" />

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

      <h2 className="secao">Novo bloqueio</h2>
      <div className="form">
        <label className="toggle">
          <input type="checkbox" checked={diaTodo} onChange={(e) => setDiaTodo(e.target.checked)} />
          <span className="toggle-trilho">
            <span className="toggle-bola" />
          </span>
          <span className="toggle-texto">Bloquear o dia inteiro</span>
        </label>

        {!diaTodo && (
          <div className="horas-par">
            <div className="campo">
              <label htmlFor="bloqueio-inicio">Início</label>
              <input id="bloqueio-inicio" type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="bloqueio-fim">Fim</label>
              <input id="bloqueio-fim" type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
            </div>
          </div>
        )}

        <div className="campo">
          <label htmlFor="bloqueio-motivo">Motivo (opcional)</label>
          <input id="bloqueio-motivo" placeholder="Ex: almoço, compromisso pessoal" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </div>

        {erro && <p className="erro">{erro}</p>}

        <button type="button" className="btn btn-principal btn-bloco" disabled={salvando} onClick={bloquear}>
          {salvando ? 'Bloqueando...' : 'Bloquear'}
        </button>
      </div>

      <h2 className="secao">Bloqueios do dia</h2>
      {carregando && <p className="aviso">Carregando...</p>}
      {!carregando && bloqueios.length === 0 && !erro && <p className="aviso">Nenhum bloqueio neste dia.</p>}

      <div className="lista">
        {bloqueios.map((b) => (
          <div className="bloqueio" key={b.id}>
            <div className="bloqueio-info">
              <IconeBloqueio />
              <div>
                <strong>{b.diaTodo ? 'Dia inteiro' : `${b.horarioInicio} – ${b.horarioFim}`}</strong>
                {b.titulo && <span>{b.titulo}</span>}
              </div>
            </div>
            <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => remover(b.id)}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
