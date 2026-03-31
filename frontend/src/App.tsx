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

function AppContent() {
  const { setUser, setToken, setLoading, token } = useAuthStore()

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
        // no-op — guest mode
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  return (
    <div className="relative">
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/fields"         element={<FieldsPage />} />
        <Route path="/fields/:id"     element={<FieldDetailPage />} />
        <Route path="/tournaments"    element={<TournamentsPage />} />
        <Route path="/bookings"       element={<BookingsPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
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
