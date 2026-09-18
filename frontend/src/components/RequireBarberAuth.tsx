import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { barberSession } from '../services/barberSession'

export function RequireBarberAuth({ children }: { children: ReactNode }) {
  const pin = barberSession.get()
  if (!pin) return <Navigate to="/painel/entrar" replace />
  return <>{children}</>
}
