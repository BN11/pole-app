import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, formatPrice, SPORT_ICONS } from '@/utils/api'
import type { Field, Tournament, AdminStats, User, UserRole } from '@/types'

export function AdminPanelPage() {
  const [tab, setTab] = useState<'stats' | 'fields' | 'tournaments' | 'users'>('stats')

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data.data
    },
  })

  const { data: pendingFields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['admin-pending-fields'],
    queryFn: async () => {
      const res = await api.get('/admin/pending/fields')
      return res.data.data
    },
    enabled: tab === 'fields',
  })

  const { data: pendingTournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['admin-pending-tournaments'],
    queryFn: async () => {
      const res = await api.get('/admin/pending/tournaments')
      return res.data.data
    },
    enabled: tab === 'tournaments',
  })

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data.data
    },
    enabled: tab === 'users',
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <h1 className="text-xl font-bold text-white">Супер Админ</h1>
        </div>
        <p className="text-white/50 text-sm mt-0.5">Панель управления ПОЛЕ</p>
      </div>

      {/* Stats overview */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Пользователи', value: stats?.totalUsers ?? '—', icon: '👥' },
            { label: 'Поля', value: stats?.totalFields ?? '—', icon: '🏟️' },
            { label: 'Турниры', value: stats?.activeTournaments ?? '—', icon: '🏆' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card p-3 text-center">
              <span className="text-lg">{icon}</span>
              <p className="text-lg font-black text-white mt-0.5">{value}</p>
              <p className="text-white/50 text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Pending badges */}
        {((stats?.pendingFields ?? 0) > 0 || (stats?.pendingTournaments ?? 0) > 0) && (
          <div className="flex gap-2 mt-3">
            {(stats?.pendingFields ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 text-xs font-medium">{stats?.pendingFields} полей на проверке</span>
              </div>
            )}
            {(stats?.pendingTournaments ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 text-xs font-medium">{stats?.pendingTournaments} турниров</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 p-1 bg-surface rounded-2xl mb-4">
        {(['stats', 'fields', 'tournaments', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
              tab === t ? 'bg-primary text-dark' : 'text-white/50'
            }`}
          >
            {t === 'stats' ? 'Обзор' : t === 'fields' ? 'Поля' : t === 'tournaments' ? 'Турниры' : 'Юзеры'}
            {t === 'fields' && (stats?.pendingFields ?? 0) > 0 && tab !== 'fields' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            )}
            {t === 'tournaments' && (stats?.pendingTournaments ?? 0) > 0 && tab !== 'tournaments' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === 'stats' && <AdminOverview stats={stats} />}
        {tab === 'fields' && <PendingFields fields={pendingFields} isLoading={fieldsLoading} />}
        {tab === 'tournaments' && <PendingTournaments tournaments={pendingTournaments} isLoading={tournamentsLoading} />}
        {tab === 'users' && <UsersList users={users} isLoading={usersLoading} />}
      </div>
    </div>
  )
}

function AdminOverview({ stats }: { stats?: AdminStats }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="glass-card p-4">
        <p className="text-white font-semibold mb-3">Активность</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Активные брони', value: stats?.activeBookings ?? 0, color: 'bg-primary' },
            { label: 'Активные турниры', value: stats?.activeTournaments ?? 0, color: 'bg-blue-400' },
            { label: 'Всего полей', value: stats?.totalFields ?? 0, color: 'bg-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-white/70 text-sm flex-1">{label}</span>
              <span className="text-white font-bold text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PendingFields({ fields, isLoading }: { fields?: Field[]; isLoading: boolean }) {
  const qc = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/fields/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-fields'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/fields/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-fields'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-surface animate-pulse" />)}
    </div>
  )

  if (!fields?.length) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-4xl mb-3">✅</span>
      <p className="text-white font-semibold">Нет заявок на проверке</p>
      <p className="text-white/50 text-sm mt-1">Все поля проверены</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div key={field.id} className="glass-card p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0">
              {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{field.name}</p>
              <p className="text-white/50 text-xs truncate">{field.address}</p>
              <p className="text-primary text-xs font-medium mt-0.5">{formatPrice(field.pricePerHour)}/ч</p>
            </div>
          </div>

          {field.description && (
            <p className="text-white/50 text-xs mb-3 line-clamp-2">{field.description}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => rejectMutation.mutate(field.id)}
              disabled={rejectMutation.isPending || approveMutation.isPending}
              className="flex-1 py-2.5 rounded-xl border border-red-400/30 text-red-400 text-sm font-semibold active:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Отклонить
            </button>
            <button
              onClick={() => approveMutation.mutate(field.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-dark text-sm font-bold active:opacity-80 transition-opacity disabled:opacity-50"
            >
              Одобрить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function PendingTournaments({ tournaments, isLoading }: { tournaments?: Tournament[]; isLoading: boolean }) {
  const qc = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/tournaments/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-tournaments'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/tournaments/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-tournaments'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-surface animate-pulse" />)}
    </div>
  )

  if (!tournaments?.length) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-4xl mb-3">✅</span>
      <p className="text-white font-semibold">Нет заявок на турниры</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {tournaments.map((t) => (
        <div key={t.id} className="glass-card p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0">
              {SPORT_ICONS[t.sportType] || '🏆'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{t.name}</p>
              <p className="text-white/50 text-xs">{t.location}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-white/40 text-[10px]">{t.format}</span>
                <span className="text-white/40 text-[10px]">·</span>
                <span className="text-white/40 text-[10px]">{t.maxTeams} команд</span>
                {t.prizePool && (
                  <>
                    <span className="text-white/40 text-[10px]">·</span>
                    <span className="text-primary text-[10px]">{formatPrice(t.prizePool)} приз</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => rejectMutation.mutate(t.id)}
              disabled={rejectMutation.isPending || approveMutation.isPending}
              className="flex-1 py-2.5 rounded-xl border border-red-400/30 text-red-400 text-sm font-semibold active:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Отклонить
            </button>
            <button
              onClick={() => approveMutation.mutate(t.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-dark text-sm font-bold active:opacity-80 transition-opacity disabled:opacity-50"
            >
              Одобрить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Пользователь',
  FIELD_OWNER: 'Владелец поля',
  TOURNAMENT_OPERATOR: 'Оператор турниров',
  SUPER_ADMIN: 'Суперадмин',
}

const ROLE_COLORS: Record<UserRole, string> = {
  USER: 'text-white/60 bg-white/5',
  FIELD_OWNER: 'text-blue-400 bg-blue-400/10',
  TOURNAMENT_OPERATOR: 'text-purple-400 bg-purple-400/10',
  SUPER_ADMIN: 'text-primary bg-primary/10',
}

function UsersList({ users, isLoading }: { users?: User[]; isLoading: boolean }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [openRoleId, setOpenRoleId] = useState<string | null>(null)

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-surface animate-pulse" />)}
    </div>
  )

  const filtered = users?.filter(u =>
    `${u.firstName} ${u.lastName ?? ''} ${u.username ?? ''}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 bg-surface border border-surface-border rounded-2xl px-4 py-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white/40 flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск пользователей..."
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-4xl mb-3">👥</span>
          <p className="text-white font-semibold">Пользователи не найдены</p>
        </div>
      )}

      {filtered.map(user => (
        <div key={user.id} className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold">{user.firstName[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{user.firstName} {user.lastName ?? ''}</p>
              {user.username && <p className="text-white/40 text-xs">@{user.username}</p>}
            </div>
            <button
              onClick={() => setOpenRoleId(openRoleId === user.id ? null : user.id)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${ROLE_COLORS[user.role]}`}
            >
              {ROLE_LABELS[user.role]} ▾
            </button>
          </div>

          {openRoleId === user.id && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-surface-border pt-3">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => { roleMutation.mutate({ id: user.id, role }); setOpenRoleId(null) }}
                  disabled={roleMutation.isPending}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    user.role === role ? `${ROLE_COLORS[role]} font-semibold` : 'text-white/60'
                  }`}
                >
                  <span>{ROLE_LABELS[role]}</span>
                  {user.role === role && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
