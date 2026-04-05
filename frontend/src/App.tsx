import { useEffect, useState, Component } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white font-semibold mb-2">Что-то пошло не так</p>
          <p className="text-white/50 text-sm mb-6">{(this.state.error as Error).message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            className="neon-btn"
          >На главную</button>
        </div>
      )
    }
    return this.props.children
  }
}
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/utils/api'
import { BottomNav } from '@/components/layout/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { FieldsPage } from '@/pages/FieldsPage'
import { FieldDetailPage } from '@/pages/FieldDetailPage'
import { TournamentsPage } from '@/pages/TournamentsPage'
import { TournamentDetailPage } from '@/pages/TournamentDetailPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { BookingConfirmPage } from '@/pages/BookingConfirmPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage'
import { AdminPanelPage } from '@/pages/AdminPanelPage'
import { AddFieldPage } from '@/pages/AddFieldPage'
import { AddTournamentPage } from '@/pages/AddTournamentPage'
import { PhoneRequestPage } from '@/pages/PhoneRequestPage'
import { BecomePartnerPage } from '@/pages/BecomePartnerPage'
import { EditFieldPage } from '@/pages/EditFieldPage'
import { FieldsMapPage } from '@/pages/FieldsMapPage'

function AppContent() {
  const { user, setUser, setToken, setLoading, token } = useAuthStore()
  const [showPhoneRequest, setShowPhoneRequest] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const twa = window.Telegram?.WebApp
        const initData = twa?.initData
        const startParam = twa?.initDataUnsafe?.start_param
        if (initData) {
          const res = await api.post('/auth/telegram', { initData, startParam })
          setToken(res.data.token)
          setUser(res.data.user)
          if (!res.data.user.phone) setShowPhoneRequest(true)
        } else if (token) {
          const res = await api.get('/auth/me')
          setUser(res.data.data)
          if (!res.data.data.phone) setShowPhoneRequest(true)
        }
      } catch {
        // guest mode
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const isOwner = user?.role === 'FIELD_OWNER'
  const isAdmin = user?.role === 'SUPER_ADMIN'
  const isOperator = user?.role === 'TOURNAMENT_OPERATOR'

  if (showPhoneRequest && user) {
    return <PhoneRequestPage onDone={() => setShowPhoneRequest(false)} />
  }

  return (
    <div className="relative">
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<HomePage />} />
        <Route path="/fields"            element={<FieldsPage />} />
        <Route path="/fields/:id"        element={<FieldDetailPage />} />
        <Route path="/tournaments"       element={<TournamentsPage />} />
        <Route path="/tournaments/:id"   element={<TournamentDetailPage />} />
        <Route path="/bookings"          element={<BookingsPage />} />
        <Route path="/booking/confirm"   element={<BookingConfirmPage />} />
        <Route path="/profile"           element={<ProfilePage />} />
        <Route path="/become-partner"    element={<BecomePartnerPage />} />
        <Route path="/map"               element={<FieldsMapPage />} />

        {/* Owner / Admin */}
        <Route
          path="/dashboard"
          element={isOwner || isAdmin ? <OwnerDashboardPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/fields/add"
          element={isOwner || isAdmin ? <AddFieldPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/fields/:id/edit"
          element={isOwner || isAdmin ? <EditFieldPage /> : <Navigate to="/" replace />}
        />

        {/* Any logged-in user can apply for a tournament */}
        <Route
          path="/tournaments/add"
          element={user ? <AddTournamentPage /> : <Navigate to="/" replace />}
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminPanelPage /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
