import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Booking from './pages/Booking'
import BarberLogin from './pages/BarberLogin'
import BarberDashboard from './pages/BarberDashboard'
import BarberClients from './pages/BarberClients'
import { RequireBarberAuth } from './components/RequireBarberAuth'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/painel/entrar" element={<BarberLogin />} />
        <Route
          path="/painel"
          element={
            <RequireBarberAuth>
              <BarberDashboard />
            </RequireBarberAuth>
          }
        />
        <Route
          path="/painel/clientes"
          element={
            <RequireBarberAuth>
              <BarberClients />
            </RequireBarberAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
