import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

// ─── Sport helpers ────────────────────────────────────────────────────────────

export const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: 'Футбол',
  BASKETBALL: 'Баскетбол',
  TENNIS: 'Теннис',
  VOLLEYBALL: 'Волейбол',
}

export const SPORT_ICONS: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  TENNIS: '🎾',
  VOLLEYBALL: '🏐',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидание',
  CONFIRMED: 'Подтверждено',
  CANCELLED: 'Отменено',
  COMPLETED: 'Завершено',
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-primary bg-primary/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  COMPLETED: 'text-white/50 bg-white/5',
}

export const formatPrice = (amount: number, currency = 'сум') =>
  `${amount.toLocaleString('ru-RU')} ${currency}`
