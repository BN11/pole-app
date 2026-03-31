import { NavLink } from 'react-router-dom'
import { HomeIcon, SearchIcon, TrophyIcon, CalendarIcon, UserIcon } from '@/components/ui/Icons'

const navItems = [
  { to: '/',            icon: HomeIcon,     label: 'Главная'  },
  { to: '/fields',      icon: SearchIcon,   label: 'Поля'     },
  { to: '/tournaments', icon: TrophyIcon,   label: 'Турниры'  },
  { to: '/bookings',    icon: CalendarIcon, label: 'Брони'    },
  { to: '/profile',     icon: UserIcon,     label: 'Профиль'  },
]

export function BottomNav() {
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
