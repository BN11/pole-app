import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

        {/* Owner / Admin */}
        <Route
          path="/dashboard"
          element={isOwner || isAdmin ? <OwnerDashboardPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/fields/add"
          element={isOwner || isAdmin ? <AddFieldPage /> : <Navigate to="/" replace />}
        />

        {/* Operator / Admin */}
        <Route
          path="/tournaments/add"
          element={isOperator || isAdmin ? <AddTournamentPage /> : <Navigate to="/" replace />}
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
