import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const ITENS = [
  { path: '/painel', label: 'Agenda' },
  { path: '/painel/clientes', label: 'Clientes' },
  { path: '/painel/bloqueios', label: 'Bloqueios' },
]

// Menu hamburguer à esquerda (troca de seção) + título da seção ativa à
// direita — usado no topo das 3 telas do painel do barbeiro.
export function PainelNav({ titulo }: { titulo: string }) {
  const [aberto, setAberto] = useState(false)
  const location = useLocation()

  return (
    <div className="topo-painel">
      <div className="painel-menu">
        <button className="painel-hamburguer" onClick={() => setAberto((v) => !v)} aria-label="Abrir menu">
          <span />
          <span />
          <span />
        </button>

        {aberto && (
          <>
            <div className="painel-menu-fundo" onClick={() => setAberto(false)} />
            <nav className="painel-menu-lista">
              {ITENS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={location.pathname === item.path ? 'painel-menu-item ativo' : 'painel-menu-item'}
                  onClick={() => setAberto(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>

      <h1>{titulo}</h1>
    </div>
  )
}
