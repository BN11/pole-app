import { useAuthStore } from '@/store/useAuthStore'
import { ArrowRightIcon } from '@/components/ui/Icons'

const MENU_ITEMS = [
  { icon: '📋', label: 'Мои брони', path: '/bookings' },
  { icon: '🏆', label: 'Мои турниры', path: '/tournaments' },
  { icon: '⭐', label: 'Мои отзывы', path: '/reviews' },
  { icon: '💳', label: 'Способы оплаты', path: '/payments' },
  { icon: '🔔', label: 'Уведомления', path: '/notifications' },
  { icon: '🛡️', label: 'Конфиденциальность', path: '/privacy' },
  { icon: '❓', label: 'Поддержка', path: '/support' },
]

export function ProfilePage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-4">
      {/* User info */}
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
          <h2 className="text-lg font-bold text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          {user?.username && (
            <p className="text-white/50 text-sm">@{user.username}</p>
          )}
          <span className="inline-block mt-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
            POLE USER
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Броней', value: '12' },
          { label: 'Рейтинг', value: '4.9' },
          { label: 'Турниры', value: '3' },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-3 text-center">
            <p className="text-xl font-black text-white">{value}</p>
            <p className="text-white/50 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="glass-card overflow-hidden mb-4">
        {MENU_ITEMS.map(({ icon, label }, i) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-4 active:bg-surface-hover transition-colors ${
              i < MENU_ITEMS.length - 1 ? 'border-b border-surface-border' : ''
            }`}
          >
            <span className="text-xl w-8">{icon}</span>
            <span className="flex-1 text-left text-white text-sm font-medium">{label}</span>
            <ArrowRightIcon className="w-4 h-4 text-white/30" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-semibold text-sm active:bg-red-500/10 transition-colors"
      >
        Выйти
      </button>
    </div>
  )
}
