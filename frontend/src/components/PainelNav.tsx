import { Link, useLocation, useNavigate } from 'react-router-dom'
import { barberSession } from '../services/barberSession'
import { Marca } from './Marca'
import { IconeAgenda, IconeBloqueio, IconeClientes } from './Icones'

const ITENS = [
  { path: '/painel', label: 'Agenda', icone: <IconeAgenda /> },
  { path: '/painel/clientes', label: 'Clientes', icone: <IconeClientes /> },
  { path: '/painel/bloqueios', label: 'Bloqueios', icone: <IconeBloqueio /> },
]

// Cabeçalho do painel (marca, sair e título da seção) e barra de abas fixa
// embaixo, no alcance do polegar. Usado nas 3 telas do barbeiro.
export function PainelNav({ titulo }: { titulo: string }) {
  const location = useLocation()
  const navigate = useNavigate()

  function sair() {
    barberSession.clear()
    navigate('/painel/entrar')
  }

  return (
    <>
      <header className="topo">
        <Marca />
        <button type="button" className="sair" onClick={sair}>
          Sair
        </button>
      </header>

      <h1 className="painel-titulo">{titulo}</h1>

      <nav className="abas" aria-label="Seções do painel">
        <div className="abas-lista">
          {ITENS.map((item) => {
            const ativo = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className={ativo ? 'aba ativo' : 'aba'} aria-current={ativo ? 'page' : undefined}>
                {item.icone}
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
