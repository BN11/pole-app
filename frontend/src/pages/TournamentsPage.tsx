import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, SPORT_LABELS, SPORT_ICONS, formatPrice } from '@/utils/api'
import { LocationIcon, CalendarIcon, TrophyIcon } from '@/components/ui/Icons'
import type { Tournament } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const SPORT_FILTERS = [
  { key: 'ALL', label: 'Все' },
  { key: 'FOOTBALL', label: SPORT_LABELS.FOOTBALL, icon: SPORT_ICONS.FOOTBALL },
  { key: 'BASKETBALL', label: SPORT_LABELS.BASKETBALL, icon: SPORT_ICONS.BASKETBALL },
  { key: 'TENNIS', label: SPORT_LABELS.TENNIS, icon: SPORT_ICONS.TENNIS },
  { key: 'VOLLEYBALL', label: SPORT_LABELS.VOLLEYBALL, icon: SPORT_ICONS.VOLLEYBALL },
]

export function TournamentsPage() {
  const [activeSport, setActiveSport] = useState('ALL')

  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ['tournaments', activeSport],
    queryFn: async () => {
      const res = await api.get('/tournaments', {
        params: { sport: activeSport !== 'ALL' ? activeSport : undefined, status: 'APPROVED' },
      })
      return res.data.data
    },
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Hero banner */}
      <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden h-36 bg-gradient-to-br from-primary/20 to-dark">
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <p className="text-white/60 text-sm">Участвуй и побеждай</p>
            <h1 className="text-2xl font-black text-white mt-0.5">Турниры</h1>
            <p className="text-primary text-sm font-medium mt-1">
              {tournaments?.length ?? '...'} активных
            </p>
          </div>
          <TrophyIcon className="w-20 h-20 text-primary/20" />
        </div>
      </div>

      {/* Sport chips */}
      <div className="flex gap-2 mt-4 px-4 overflow-x-auto pb-1 no-scrollbar">
        {SPORT_FILTERS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveSport(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSport === key
                ? 'bg-primary text-dark'
                : 'bg-surface border border-surface-border text-white/70'
            }`}
          >
            {icon && <span>{icon}</span>}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tournament list */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-surface animate-pulse" />
            ))
          : tournaments?.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
      </div>

      {/* Operator CTA */}
      <div className="mx-4 mt-6 glass-card p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white text-sm">Хотите провести турнир?</p>
          <p className="text-white/50 text-xs mt-0.5">Подайте заявку — мы поможем</p>
        </div>
        <Link
          to="/tournaments/add"
          className="bg-primary text-dark text-sm font-bold px-4 py-2.5 rounded-xl flex-shrink-0"
        >
          Подать заявку
        </Link>
      </div>
    </div>
  )
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const slotsPercent = (tournament.registeredTeams / tournament.maxTeams) * 100

  return (
    <Link to={`/tournaments/${tournament.id}`} className="glass-card-hover overflow-hidden block">
      {/* Cover */}
      <div className="relative h-32 bg-surface-hover">
        {tournament.coverPhoto ? (
          <img src={tournament.coverPhoto} alt={tournament.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {SPORT_ICONS[tournament.sportType]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-dark text-xs font-bold px-2.5 py-1 rounded-full">
            {SPORT_ICONS[tournament.sportType]} {SPORT_LABELS[tournament.sportType]}
          </span>
        </div>
        {tournament.prizePool && (
          <div className="absolute top-3 right-3">
            <span className="bg-dark/70 text-white text-xs px-2.5 py-1 rounded-full border border-white/10">
              🏆 {formatPrice(tournament.prizePool)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white">{tournament.name}</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(new Date(tournament.startDate), 'd MMM', { locale: ru })}
          </span>
          <span className="flex items-center gap-1">
            <LocationIcon className="w-3.5 h-3.5" />
            {tournament.location}
          </span>
          <span className="flex items-center gap-1">
            🎮 {tournament.format}
          </span>
        </div>

        {/* Slots progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/50">Команды</span>
            <span className="text-white font-medium">
              {tournament.registeredTeams}/{tournament.maxTeams}
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${slotsPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
