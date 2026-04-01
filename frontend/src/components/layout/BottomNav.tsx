import { NavLink } from 'react-router-dom'
import { HomeIcon, SearchIcon, TrophyIcon, CalendarIcon, UserIcon } from '@/components/ui/Icons'
import { useAuthStore } from '@/store/useAuthStore'

export function BottomNav() {
  const { user } = useAuthStore()
  const isOwner = user?.role === 'FIELD_OWNER'
  const isAdmin = user?.role === 'SUPER_ADMIN'

  const navItems = [
    { to: '/',            icon: HomeIcon,     label: 'Главная'  },
    { to: '/fields',      icon: SearchIcon,   label: 'Поля'     },
    { to: '/tournaments', icon: TrophyIcon,   label: 'Турниры'  },
    isOwner || isAdmin
      ? { to: '/dashboard', icon: DashboardIcon, label: 'Кабинет' }
      : { to: '/bookings',  icon: CalendarIcon,  label: 'Брони'   },
    isAdmin
      ? { to: '/admin',   icon: ShieldIcon,   label: 'Админ'    }
      : { to: '/profile', icon: UserIcon,     label: 'Профиль'  },
  ]

  return (
    <nav className="bottom-nav z-50">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-white/40 active:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
