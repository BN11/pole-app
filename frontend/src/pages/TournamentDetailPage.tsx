import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api, formatPrice, SPORT_ICONS } from '@/utils/api'
import { useAuthStore } from '@/store/useAuthStore'
import type { Tournament } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showRegister, setShowRegister] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [captain, setCaptain] = useState('')

  const { data: tournament, isLoading } = useQuery<Tournament>({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await api.get(`/tournaments/${id}`)
      return res.data.data
    },
  })

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/tournaments/${id}/register`, { teamName, captainName: captain }),
    onSuccess: () => {
      setShowRegister(false)
      setTeamName('')
      setCaptain('')
    },
  })

  if (isLoading) return (
    <div className="flex flex-col min-h-screen">
      <div className="h-56 bg-surface animate-pulse" />
      <div className="px-4 pt-4 flex flex-col gap-3">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-surface animate-pulse" />)}
      </div>
    </div>
  )

  if (!tournament) return null

  const slotsLeft = tournament.maxTeams - tournament.registeredTeams
  const fillPercent = Math.round((tournament.registeredTeams / tournament.maxTeams) * 100)
  const isOpen = tournament.status === 'APPROVED' && slotsLeft > 0
  const deadlinePassed = new Date(tournament.registrationDeadline) < new Date()

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
      </div>

      {/* Cover */}
      <div className="relative h-56 bg-surface flex-shrink-0">
        {tournament.coverPhoto ? (
          <img src={tournament.coverPhoto} alt={tournament.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl">{SPORT_ICONS[tournament.sportType] || '🏆'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />

        {/* Status badge */}
        <div className="absolute bottom-4 left-4">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            tournament.status === 'APPROVED' ? 'bg-primary text-dark' :
            tournament.status === 'ACTIVE' ? 'bg-blue-500 text-white' :
            'bg-white/20 text-white'
          }`}>
            {tournament.status === 'APPROVED' ? '🟢 Регистрация открыта' :
             tournament.status === 'ACTIVE' ? '🔵 Идёт турнир' :
             tournament.status === 'COMPLETED' ? '✅ Завершён' : '⏳ Ожидание'}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
          <p className="text-white/50 text-sm mt-1">
            {SPORT_ICONS[tournament.sportType]} {tournament.format} · {tournament.location}
          </p>
        </div>

        {/* Registration progress */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-semibold">Участники</span>
            <span className="text-primary font-bold text-sm">{tournament.registeredTeams}/{tournament.maxTeams} команд</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-white/40 text-xs mt-1.5">{slotsLeft > 0 ? `Осталось ${slotsLeft} мест` : 'Мест нет'}</p>
        </div>

        {/* Key info */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <p className="text-white font-semibold text-sm">Детали турнира</p>
          {[
            { label: '📅 Начало', value: format(new Date(tournament.startDate), 'd MMMM yyyy', { locale: ru }) },
            { label: '🏁 Конец', value: format(new Date(tournament.endDate), 'd MMMM yyyy', { locale: ru }) },
            { label: '⏰ Регистрация до', value: format(new Date(tournament.registrationDeadline), 'd MMMM HH:mm', { locale: ru }) },
            ...(tournament.prizePool ? [{ label: '🏆 Призовой фонд', value: formatPrice(tournament.prizePool) }] : []),
            ...(tournament.entryFee ? [{ label: '💰 Взнос', value: formatPrice(tournament.entryFee) }] : [{ label: '💰 Взнос', value: 'Бесплатно' }]),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-white/50 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {tournament.description && (
          <div className="glass-card p-4">
            <p className="text-white font-semibold text-sm mb-2">О турнире</p>
            <p className="text-white/60 text-sm leading-relaxed">{tournament.description}</p>
          </div>
        )}

        {/* Organizer */}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">{tournament.operator.firstName[0]}</span>
          </div>
          <div>
            <p className="text-white/50 text-xs">Организатор</p>
            <p className="text-white text-sm font-semibold">{tournament.operator.firstName} {tournament.operator.lastName ?? ''}</p>
          </div>
        </div>

        {/* Registration form */}
        {showRegister && (
          <div className="glass-card p-4 flex flex-col gap-3">
            <p className="text-white font-semibold text-sm">Регистрация команды</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Название команды *</label>
              <input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="FC Ташкент"
                className="bg-dark border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Имя капитана *</label>
              <input
                value={captain}
                onChange={e => setCaptain(e.target.value)}
                placeholder="Алишер Навоий"
                className="bg-dark border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50"
              />
            </div>
            {registerMutation.isError && (
              <p className="text-red-400 text-xs">Ошибка. Попробуйте ещё раз.</p>
            )}
            {registerMutation.isSuccess && (
              <p className="text-primary text-xs font-medium">✅ Команда зарегистрирована!</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 py-3 rounded-2xl border border-surface-border text-white/60 text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => registerMutation.mutate()}
                disabled={!teamName.trim() || !captain.trim() || registerMutation.isPending}
                className="flex-1 neon-btn disabled:opacity-40"
              >
                {registerMutation.isPending ? 'Отправка...' : 'Записаться'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!showRegister && isOpen && !deadlinePassed && user && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-8 pt-4 bg-dark/90 backdrop-blur-md border-t border-surface-border">
          <button
            onClick={() => setShowRegister(true)}
            className="neon-btn w-full"
          >
            🏆 Зарегистрировать команду
          </button>
        </div>
      )}

      {!isOpen && tournament.status === 'APPROVED' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-8 pt-4 bg-dark/90 backdrop-blur-md border-t border-surface-border">
          <button disabled className="w-full py-4 rounded-2xl bg-surface text-white/40 font-bold text-sm cursor-not-allowed">
            Мест нет
          </button>
        </div>
      )}
    </div>
  )
}
