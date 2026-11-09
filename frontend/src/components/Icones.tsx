import type { ReactNode } from 'react'

// Ícones em SVG inline (sem biblioteca e sem emoji), todos herdam a cor do texto.
type Props = { tamanho?: number }

function Base({ tamanho = 20, children }: Props & { children: ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const IconeAgenda = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
)

export const IconeClientes = (p: Props) => (
  <Base {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
    <path d="M16 5.2a3.3 3.3 0 0 1 0 6.1M18 14.8c2 .6 3.2 2.3 3.5 5.2" />
  </Base>
)

export const IconeBloqueio = (p: Props) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Base>
)

export const IconeSetaEsq = (p: Props) => (
  <Base {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Base>
)

export const IconeSetaDir = (p: Props) => (
  <Base {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Base>
)

export const IconeCheck = (p: Props) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
)

export const IconeWhats = (p: Props) => (
  <Base {...p}>
    <path d="M4 20l1.2-4.1A8 8 0 1 1 8.2 19L4 20Z" />
    <path d="M9.2 8.8c.3 2.6 2.4 4.9 5.2 5.9l1.2-1.3-1.9-1-.9.6c-.8-.4-1.6-1.2-2-2l.6-.9-1-1.9-1.2 1.6Z" />
  </Base>
)

export const IconeRelogio = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
)

export const IconePino = (p: Props) => (
  <Base {...p}>
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
)
