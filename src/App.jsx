import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import LoginPage from './modules/auth/pages/LoginPage'
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import ClientsPage from './modules/clients/pages/ClientsPage'
import ClientDetailPage from './modules/clients/pages/ClientDetailPage'
import JobsPage from './modules/jobs/pages/JobsPage'
import JobFormPage from './modules/jobs/pages/JobFormPage'
import JobDetailPage from './modules/jobs/pages/JobDetailPage'
import ReceiptPage from './modules/receipt/pages/ReceiptPage'
import IncomesPage from './modules/incomes/pages/IncomesPage'
import ExpensesPage from './modules/expenses/pages/ExpensesPage'
import ReportsPage from './modules/reports/pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="clientes/:id" element={<ClientDetailPage />} />
              <Route path="trabajos" element={<JobsPage />} />
              <Route path="trabajos/nuevo" element={<JobFormPage />} />
              <Route path="trabajos/:id" element={<JobDetailPage />} />
              <Route path="ingresos" element={<IncomesPage />} />
              <Route path="egresos" element={<ExpensesPage />} />
              <Route path="reportes" element={<ReportsPage />} />
            </Route>
            {/* El recibo se muestra a pantalla completa, sin el layout de navegación */}
            <Route path="trabajos/:id/recibo" element={<ReceiptPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
