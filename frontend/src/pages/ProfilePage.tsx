import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/utils/api'
import { ArrowRightIcon } from '@/components/ui/Icons'

export function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const { data: stats } = useQuery<{ bookingCount: number; upcomingBookings: number }>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await api.get('/auth/stats')
      return res.data.data
    },
    enabled: !!user,
  })

  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'pole_app_bot'
  const referralLink = user?.referralCode
    ? `https://t.me/${botUsername}?startapp=${user.referralCode}`
    : null

  const handleCopyReferral = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShareReferral = () => {
    if (!referralLink) return
    const twa = window.Telegram?.WebApp
    if (twa?.openTelegramLink) {
      twa.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Бронируй спортивные поля в ПОЛЕ! 🏟️')}`
      )
    } else {
      handleCopyReferral()
    }
  }

  const roleLabel =
    user?.role === 'SUPER_ADMIN' ? 'Супер Админ' :
    user?.role === 'FIELD_OWNER' ? 'Владелец поля' :
    user?.role === 'TOURNAMENT_OPERATOR' ? 'Оператор турниров' :
    'POLE USER'

  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-4">
      {/* User info card */}
      <div className="glass-card p-5 flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">
            {user?.firstName} {user?.lastName}
          </h2>
          {user?.username && (
            <p className="text-white/50 text-sm">@{user.username}</p>
          )}
          {user?.phone && (
            <p className="text-white/40 text-xs mt-0.5">📱 {user.phone}</p>
          )}
          <span className="inline-block mt-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-black text-white">{stats?.bookingCount ?? '—'}</p>
          <p className="text-white/50 text-xs mt-0.5">Всего броней</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-black text-primary">{stats?.upcomingBookings ?? '—'}</p>
          <p className="text-white/50 text-xs mt-0.5">Предстоящих</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-black text-white">0</p>
          <p className="text-white/50 text-xs mt-0.5">Турниры</p>
        </div>
      </div>

      {/* Referral */}
      {referralLink && (
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎁</span>
            <div>
              <p className="text-white font-semibold text-sm">Реферальная ссылка</p>
              <p className="text-white/40 text-xs">Приглашайте друзей в ПОЛЕ</p>
            </div>
          </div>
          <div className="bg-dark rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3 border border-surface-border">
            <p className="text-white/50 text-xs flex-1 truncate font-mono">{referralLink}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyReferral}
              className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/60 text-sm font-medium transition-all active:bg-surface-hover"
            >
              {copied ? '✅ Скопировано' : '📋 Копировать'}
            </button>
            <button
              onClick={handleShareReferral}
              className="flex-1 neon-btn text-sm"
            >
              📤 Поделиться
            </button>
          </div>
        </div>
      )}

      {/* Quick menu */}
      <div className="glass-card overflow-hidden mb-4">
        {[
          { icon: '📋', label: 'Мои брони', path: '/bookings' },
          { icon: '🏆', label: 'Турниры', path: '/tournaments' },
        ].map(({ icon, label, path }, i, arr) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-4 active:bg-surface-hover transition-colors ${
              i < arr.length - 1 ? 'border-b border-surface-border' : ''
            }`}
          >
            <span className="text-xl w-8">{icon}</span>
            <span className="flex-1 text-left text-white text-sm font-medium">{label}</span>
            <ArrowRightIcon className="w-4 h-4 text-white/30" />
          </button>
        ))}
      </div>

      {/* Become partner CTA for regular users */}
      {user?.role === 'USER' && (
        <div className="glass-card p-4 mb-4 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🤝</span>
            <div>
              <p className="text-white font-semibold text-sm">Стать партнёром ПОЛЕ</p>
              <p className="text-white/40 text-xs">Разместите своё поле и начните зарабатывать</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/become-partner')}
            className="neon-btn w-full text-sm"
          >
            Подробнее →
          </button>
        </div>
      )}

      {/* Owner / Admin panel links */}
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'FIELD_OWNER' || user?.role === 'TOURNAMENT_OPERATOR') && (
        <div className="glass-card overflow-hidden mb-4">
          {user.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-surface-hover transition-colors border-b border-surface-border"
            >
              <span className="text-xl w-8">🛡️</span>
              <span className="flex-1 text-left text-primary text-sm font-semibold">Панель администратора</span>
              <ArrowRightIcon className="w-4 h-4 text-primary/50" />
            </button>
          )}
          {(user.role === 'FIELD_OWNER' || user.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-4 active:bg-surface-hover transition-colors ${
                user.role === 'SUPER_ADMIN' ? '' : ''
              }`}
            >
              <span className="text-xl w-8">🏟️</span>
              <span className="flex-1 text-left text-white text-sm font-medium">Кабинет владельца</span>
              <ArrowRightIcon className="w-4 h-4 text-white/30" />
            </button>
          )}
          {user.role === 'TOURNAMENT_OPERATOR' && (
            <button
              onClick={() => navigate('/tournaments/add')}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-surface-hover transition-colors border-t border-surface-border"
            >
              <span className="text-xl w-8">🏆</span>
              <span className="flex-1 text-left text-white text-sm font-medium">Создать турнир</span>
              <ArrowRightIcon className="w-4 h-4 text-white/30" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
