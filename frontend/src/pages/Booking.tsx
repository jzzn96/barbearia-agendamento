import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../services/api'
import { formatPhoneInput, isValidPhone } from '../lib/phone'

function proximosDias(qtd: number): { valor: string; label: string }[] {
  const dias = []
  for (let i = 0; i < qtd; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const valor = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    dias.push({ valor, label })
  }
  return dias
}

type Etapa = 'escolher-horario' | 'form' | 'enviando' | 'sucesso' | 'erro'

export default function Booking() {
  const dias = useMemo(() => proximosDias(14), [])
  const [dataEscolhida, setDataEscolhida] = useState(dias[0].valor)
  const [horarios, setHorarios] = useState<string[]>([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<Etapa>('escolher-horario')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    setCarregandoHorarios(true)
    setHorarioEscolhido(null)
    setErro('')
    api
      .horariosDisponiveis(dataEscolhida)
      .then(setHorarios)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar os horários.'))
      .finally(() => setCarregandoHorarios(false))
  }, [dataEscolhida])

  async function confirmar() {
    if (!horarioEscolhido) return
    if (!nome.trim() || !isValidPhone(telefone)) {
      setErro('Preencha nome e um telefone válido.')
      return
    }

    setEtapa('enviando')
    setErro('')

    try {
      await api.criarAgendamento({
        nome: nome.trim(),
        telefone,
        data: dataEscolhida,
        horario: horarioEscolhido,
        honeypot: '',
      })
      setEtapa('sucesso')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Esse horário acabou de ser preenchido, escolha outro.')
      setEtapa('erro')
      // Reconsulta os horários porque provavelmente foi conflito de agenda
      api.horariosDisponiveis(dataEscolhida).then(setHorarios).catch(() => {})
    }
  }

  if (etapa === 'sucesso') {
    return (
      <div className="tela">
        <div className="marca">
          <div className="marca-avatar">B</div>
          <span className="marca-nome">Barbearia</span>
        </div>
        <div className="sucesso">
          <div className="sucesso-icone">✓</div>
          <h1>Agendado!</h1>
          <p className="card-sub">
            Te esperamos dia {new Date(`${dataEscolhida}T00:00:00`).toLocaleDateString('pt-BR')} às {horarioEscolhido}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="tela">
      <div className="marca">
        <div className="marca-avatar">B</div>
        <span className="marca-nome">Barbearia</span>
      </div>

      <div className="hero">
        <div className="hero-avatar">💈</div>
        <div>
          <p className="hero-titulo">Agende seu horário</p>
          <p className="hero-sub">Escolha o dia e o horário que preferir</p>
        </div>
      </div>

      <h2>Escolha o dia</h2>
      <div className="chips">
        {dias.map((d) => (
          <button
            key={d.valor}
            className={d.valor === dataEscolhida ? 'chip chip-ativo' : 'chip'}
            onClick={() => setDataEscolhida(d.valor)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <h2>Horários disponíveis</h2>
      {carregandoHorarios && <p>Carregando...</p>}
      {!carregandoHorarios && erro && etapa === 'escolher-horario' && <p className="erro">{erro}</p>}
      {!carregandoHorarios && !erro && horarios.length === 0 && <p>Sem horários livres nesse dia.</p>}
      <div className="chips">
        {horarios.map((h) => (
          <button
            key={h}
            className={h === horarioEscolhido ? 'chip chip-ativo' : 'chip'}
            onClick={() => {
              setHorarioEscolhido(h)
              setEtapa('form')
            }}
          >
            {h}
          </button>
        ))}
      </div>

      {(etapa === 'form' || etapa === 'enviando' || etapa === 'erro') && horarioEscolhido && (
        <div className="form">
          <h2 style={{ marginTop: 0 }}>Seus dados</h2>
          <label htmlFor="campo-nome">Nome</label>
          <input id="campo-nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <label htmlFor="campo-telefone">Telefone</label>
          <input
            id="campo-telefone"
            placeholder="(11) 91234-5678"
            value={telefone}
            onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
          />
          {erro && <p className="erro">{erro}</p>}
          <button disabled={etapa === 'enviando'} onClick={confirmar}>
            {etapa === 'enviando' ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </div>
      )}
    </div>
  )
}
