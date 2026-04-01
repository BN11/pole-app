import { useState } from 'react'
import { api } from '@/utils/api'
import { useAuthStore } from '@/store/useAuthStore'

interface Props {
  onDone: () => void
}

export function PhoneRequestPage({ onDone }: Props) {
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleShare = () => {
    const twa = window.Telegram?.WebApp
    if (!twa) {
      setError('Откройте приложение через Telegram')
      return
    }

    // requestContact available since WebApp 6.9
    if (typeof twa.requestContact !== 'function') {
      setError('Обновите Telegram до последней версии')
      return
    }

    setLoading(true)
    twa.requestContact(async (ok: boolean, data?: { contact?: { phone_number: string } }) => {
      if (!ok || !data?.contact?.phone_number) {
        setLoading(false)
        setError('Не удалось получить номер. Попробуйте ещё раз.')
        return
      }

      try {
        const res = await api.post('/auth/phone', { phone: data.contact.phone_number })
        setUser(res.data.data)
        onDone()
      } catch {
        setError('Ошибка сохранения. Попробуйте ещё раз.')
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-dark">
      {/* Logo */}
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-8">
        <span className="text-4xl">⚽</span>
      </div>

      <h1 className="text-2xl font-black text-white mb-2 text-center">Добро пожаловать!</h1>
      <p className="text-white/50 text-sm text-center mb-10 leading-relaxed">
        Для бронирования полей нам нужен ваш номер телефона. Он будет использован только для связи.
      </p>

      {/* Phone icon visual */}
      <div className="glass-card p-6 w-full mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📱</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Ваш номер телефона</p>
          <p className="text-white/40 text-xs mt-0.5">Будет передан безопасно через Telegram</p>
        </div>
      </div>

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <button
        onClick={handleShare}
        disabled={loading}
        className="neon-btn w-full disabled:opacity-40 mb-3"
      >
        {loading ? 'Загрузка...' : '📲 Поделиться номером'}
      </button>

      <button
        onClick={onDone}
        className="text-white/30 text-sm py-2"
      >
        Пропустить
      </button>
    </div>
  )
}
