import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/utils/api'
import { BottomNav } from '@/components/layout/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { FieldsPage } from '@/pages/FieldsPage'
import { FieldDetailPage } from '@/pages/FieldDetailPage'
import { TournamentsPage } from '@/pages/TournamentsPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage'
import { AdminPanelPage } from '@/pages/AdminPanelPage'

function AppContent() {
  const { user, setUser, setToken, setLoading, token } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const initData = window.Telegram?.WebApp?.initData
        if (initData) {
          const res = await api.post('/auth/telegram', { initData })
          setToken(res.data.token)
          setUser(res.data.user)
        } else if (token) {
          const res = await api.get('/auth/me')
          setUser(res.data.data)
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

  return (
    <div className="relative">
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/fields"      element={<FieldsPage />} />
        <Route path="/fields/:id"  element={<FieldDetailPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/bookings"    element={<BookingsPage />} />
        <Route path="/profile"     element={<ProfilePage />} />

        {/* Owner routes */}
        <Route
          path="/dashboard"
          element={isOwner || isAdmin ? <OwnerDashboardPage /> : <Navigate to="/" replace />}
        />

        {/* Admin routes */}
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
