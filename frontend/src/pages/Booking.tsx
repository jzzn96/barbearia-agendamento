import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../services/api'
import { formatPhoneInput, isValidPhone } from '../lib/phone'
import { SERVICOS, type ServicoId } from '../lib/servicos'
import { BARBEARIA } from '../lib/barbearia'
import { capitalizar, dataCurta, deYMD, paraYMD } from '../lib/datas'
import { Marca } from '../components/Marca'
import { IconeCheck, IconePino, IconeRelogio, IconeWhats } from '../components/Icones'

function proximosDias(qtd: number): { valor: string; semana: string; numero: string; mes: string }[] {
  const dias = []
  for (let i = 0; i < qtd; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dias.push({
      valor: paraYMD(d),
      semana: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      numero: String(d.getDate()),
      mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    })
  }
  return dias
}

type Etapa = 'escolher-horario' | 'form' | 'enviando' | 'sucesso' | 'erro'

export default function Booking() {
  const dias = useMemo(() => proximosDias(14), [])
  const [servicoEscolhido, setServicoEscolhido] = useState<ServicoId>(SERVICOS[0].id)
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
      .horariosDisponiveis(dataEscolhida, servicoEscolhido)
      .then(setHorarios)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar os horários.'))
      .finally(() => setCarregandoHorarios(false))
  }, [dataEscolhida, servicoEscolhido])

  async function confirmar() {
    if (!horarioEscolhido) return
    if (!nome.trim() || !isValidPhone(telefone)) {
      setErro('Preencha o nome e um telefone válido, com DDD.')
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
        servico: servicoEscolhido,
        honeypot: '',
      })
      setEtapa('sucesso')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Esse horário acabou de ser preenchido, escolha outro.')
      setEtapa('erro')
      // Reconsulta os horários porque provavelmente foi conflito de agenda
      api.horariosDisponiveis(dataEscolhida, servicoEscolhido).then(setHorarios).catch(() => {})
    }
  }

  function novoAgendamento() {
    setHorarioEscolhido(null)
    setEtapa('escolher-horario')
    setErro('')
    api.horariosDisponiveis(dataEscolhida, servicoEscolhido).then(setHorarios).catch(() => {})
  }

  const servico = SERVICOS.find((s) => s.id === servicoEscolhido)!
  const diaEscolhido = capitalizar(deYMD(dataEscolhida).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))

  if (etapa === 'sucesso' && horarioEscolhido) {
    const mensagemWhats = encodeURIComponent(
      `Olá! Acabei de agendar ${servico.nome} para ${dataCurta(dataEscolhida)} às ${horarioEscolhido}. Meu nome é ${nome.trim()}.`,
    )

    return (
      <div className="app">
        <header className="topo">
          <Marca />
        </header>

        <section className="sucesso" aria-live="polite">
          <div className="sucesso-selo">
            <IconeCheck tamanho={30} />
          </div>
          <p className="eyebrow">Horário confirmado</p>
          <h1 className="titulo-hero">
            Te esperamos, <em>{nome.trim().split(' ')[0]}</em>
          </h1>

          <div className="sucesso-resumo">
            <dl>
              <dt>Serviço</dt>
              <dd>{servico.nome}</dd>
              <dt>Dia</dt>
              <dd>{diaEscolhido}</dd>
              <dt>Horário</dt>
              <dd>{horarioEscolhido}</dd>
              <dt>Local</dt>
              <dd>{BARBEARIA.endereco}</dd>
            </dl>
          </div>

          <div className="sucesso-acoes">
            <a className="btn btn-whats btn-bloco" href={`https://wa.me/${BARBEARIA.whatsapp}?text=${mensagemWhats}`} target="_blank" rel="noreferrer">
              <IconeWhats /> Avisar no WhatsApp
            </a>
            <button type="button" className="btn btn-contorno btn-bloco" onClick={novoAgendamento}>
              Fazer outro agendamento
            </button>
          </div>
        </section>
      </div>
    )
  }

  const mostrandoForm = (etapa === 'form' || etapa === 'enviando' || etapa === 'erro') && horarioEscolhido

  return (
    <div className="app">
      <header className="topo">
        <Marca />
      </header>

      <section className="abertura">
        <p className="eyebrow">{BARBEARIA.cidade}</p>
        <h1 className="titulo-hero">
          Agende seu <em>horário</em>
        </h1>
        <p className="lead">Escolha o serviço, o dia e o horário. A confirmação é imediata.</p>
      </section>

      <section className="passo" aria-labelledby="passo-servico">
        <h2 className="passo-titulo" id="passo-servico">
          <span className="passo-num">1</span> Serviço
        </h2>
        <div className="servicos">
          {SERVICOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === servicoEscolhido ? 'servico ativo' : 'servico'}
              aria-pressed={s.id === servicoEscolhido}
              onClick={() => setServicoEscolhido(s.id)}
            >
              <span className="servico-nome">{s.nome}</span>
              <span className="servico-dur">{s.duracaoMin} min</span>
            </button>
          ))}
        </div>
      </section>

      <section className="passo" aria-labelledby="passo-dia">
        <h2 className="passo-titulo" id="passo-dia">
          <span className="passo-num">2</span> Dia
        </h2>
        <div className="dias">
          {dias.map((d) => (
            <button
              key={d.valor}
              type="button"
              className={d.valor === dataEscolhida ? 'dia ativo' : 'dia'}
              aria-pressed={d.valor === dataEscolhida}
              onClick={() => setDataEscolhida(d.valor)}
            >
              <span className="dia-sem">{d.semana}</span>
              <span className="dia-num">{d.numero}</span>
              <span className="dia-mes">{d.mes}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="passo" aria-labelledby="passo-horario">
        <h2 className="passo-titulo" id="passo-horario">
          <span className="passo-num">3</span> Horário
        </h2>
        {carregandoHorarios && <p className="aviso">Buscando horários livres...</p>}
        {!carregandoHorarios && erro && etapa === 'escolher-horario' && <p className="erro">{erro}</p>}
        {!carregandoHorarios && !erro && horarios.length === 0 && <p className="aviso">Sem horários livres nesse dia. Escolha outro dia.</p>}
        <div className="horarios">
          {horarios.map((h) => (
            <button
              key={h}
              type="button"
              className={h === horarioEscolhido ? 'horario ativo' : 'horario'}
              aria-pressed={h === horarioEscolhido}
              onClick={() => {
                setHorarioEscolhido(h)
                setEtapa('form')
              }}
            >
              {h}
            </button>
          ))}
        </div>
      </section>

      {mostrandoForm && (
        <section className="dados" aria-labelledby="passo-dados">
          <h2 className="passo-titulo" id="passo-dados" style={{ marginBottom: 0 }}>
            <span className="passo-num">4</span> Seus dados
          </h2>
          <p className="resumo-escolha">
            <IconeRelogio tamanho={18} />
            <span>
              {servico.nome} · {diaEscolhido} às {horarioEscolhido}
            </span>
          </p>

          <div className="campo">
            <label htmlFor="campo-nome">Nome</label>
            <input id="campo-nome" autoComplete="name" placeholder="Como podemos te chamar?" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="campo-telefone">WhatsApp</label>
            <input
              id="campo-telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(47) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
            />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="button" className="btn btn-principal btn-bloco" disabled={etapa === 'enviando'} onClick={confirmar}>
            {etapa === 'enviando' ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </section>
      )}

      <footer className="rodape">
        <IconePino tamanho={18} />
        <span>{BARBEARIA.endereco}</span>
      </footer>
    </div>
  )
}
