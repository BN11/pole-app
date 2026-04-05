import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api, formatPrice, SPORT_ICONS } from '@/utils/api'
import type { Field, Booking, OwnerStats } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'

export function OwnerDashboardPage() {
  useAuthStore()
  const [tab, setTab] = useState<'stats' | 'fields' | 'bookings'>('stats')

  const { data: stats } = useQuery<OwnerStats>({
    queryKey: ['owner-stats'],
    queryFn: async () => {
      const res = await api.get('/owner/stats')
      return res.data.data
    },
  })

  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['owner-fields'],
    queryFn: async () => {
      const res = await api.get('/owner/fields')
      return res.data.data
    },
    enabled: tab === 'fields',
  })

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['owner-bookings'],
    queryFn: async () => {
      const res = await api.get('/owner/bookings')
      return res.data.data
    },
    enabled: tab === 'bookings',
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-white">Мой кабинет</h1>
        <p className="text-white/50 text-sm mt-0.5">Управление полями</p>
      </div>

      {/* Quick stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Доход сегодня</p>
            <p className="text-2xl font-black text-primary mt-1">
              {stats ? formatPrice(stats.todayRevenue) : '—'}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Броней сегодня</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.todayBookings ?? '—'}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Рейтинг</p>
            <p className="text-2xl font-black text-white mt-1">
              ⭐ {stats?.rating?.toFixed(1) ?? '—'}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs">Загрузка</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats ? `${stats.occupancyPercent}%` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 p-1 bg-surface rounded-2xl mb-4">
        {(['stats', 'fields', 'bookings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
              tab === t ? 'bg-primary text-dark' : 'text-white/50'
            }`}
          >
            {t === 'stats' ? 'График' : t === 'fields' ? 'Поля' : 'Брони'}
            {t === 'bookings' && (bookings?.filter(b => b.status === 'PENDING').length ?? 0) > 0 && tab !== 'bookings' && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === 'stats' && <WeeklyChart data={stats?.weeklyRevenue} />}
        {tab === 'fields' && <OwnerFieldsList fields={fields} isLoading={fieldsLoading} />}
        {tab === 'bookings' && <OwnerBookingsList bookings={bookings} isLoading={bookingsLoading} />}
      </div>
    </div>
  )
}

function WeeklyChart({ data }: { data?: { day: string; amount: number }[] }) {
  if (!data) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/50 text-sm">Нет данных за эту неделю</p>
      </div>
    )
  }
  const max = Math.max(...data.map((d) => d.amount), 1)
  return (
    <div className="glass-card p-4">
      <p className="text-white font-semibold mb-4">Выручка за 7 дней</p>
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map(({ day, amount }) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary/30 rounded-t-md relative overflow-hidden"
              style={{ height: `${(amount / max) * 100}%`, minHeight: 4 }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md"
                style={{ height: `${(amount / max) * 100}%` }}
              />
            </div>
            <span className="text-white/40 text-[10px]">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OwnerFieldsList({ fields, isLoading }: { fields?: Field[]; isLoading: boolean }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/owner/fields/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-fields'] }),
  })

  if (isLoading) return <div className="h-32 rounded-2xl bg-surface animate-pulse" />

  return (
    <div className="flex flex-col gap-3">
      {fields?.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-4xl mb-3">🏟️</span>
          <p className="text-white font-semibold">Нет полей</p>
          <p className="text-white/50 text-sm mt-1">Добавьте своё первое поле</p>
        </div>
      )}
      {fields?.map((field) => (
        <div key={field.id} className="glass-card p-4">
          <div className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
              {field.photos?.[0]
                ? <img src={field.photos[0]} alt="" className="w-full h-full object-cover" />
                : SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{field.name}</p>
              <p className="text-white/50 text-xs truncate">{field.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  field.status === 'APPROVED'
                    ? 'text-primary bg-primary/10'
                    : field.status === 'PENDING'
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {field.status === 'APPROVED' ? 'Одобрено' : field.status === 'PENDING' ? 'На проверке' : 'Отклонено'}
                </span>
                <span className="text-primary text-xs font-bold">{formatPrice(field.pricePerHour)}/ч</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate(`/fields/${field.id}/edit`)}
              className="flex-1 py-2 rounded-xl border border-surface-border text-white/60 text-xs font-medium active:bg-surface-hover transition-colors"
            >
              ✏️ Редактировать
            </button>
            <button
              onClick={() => {
                const twa = window.Telegram?.WebApp
                if (twa?.showConfirm) {
                  twa.showConfirm('Удалить поле?', (ok) => { if (ok) deleteMutation.mutate(field.id) })
                } else {
                  deleteMutation.mutate(field.id)
                }
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 rounded-xl border border-red-400/20 text-red-400 text-xs font-medium active:bg-red-400/10 transition-colors disabled:opacity-40"
            >
              {deleteMutation.isPending ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      ))}

      <button onClick={() => navigate('/fields/add')} className="neon-btn w-full text-sm">+ Добавить поле</button>
    </div>
  )
}

function OwnerBookingsList({ bookings, isLoading }: { bookings?: Booking[]; isLoading: boolean }) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['owner-bookings'] })
    qc.invalidateQueries({ queryKey: ['owner-stats'] })
  }
  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/confirm`),
    onSuccess: invalidate,
  })
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: invalidate,
  })

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-surface animate-pulse" />)}
    </div>
  )

  if (!bookings?.length) return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-4xl mb-3">📅</span>
      <p className="text-white font-semibold">Нет бронирований</p>
    </div>
  )

  const pending = bookings.filter(b => b.status === 'PENDING')
  const rest = bookings.filter(b => b.status !== 'PENDING')

  return (
    <div className="flex flex-col gap-3">
      {pending.length > 0 && (
        <p className="text-yellow-400 text-xs font-semibold">Ожидают подтверждения — {pending.length}</p>
      )}
      {[...pending, ...rest].map((booking) => (
        <div key={booking.id} className={`glass-card p-4 ${booking.status === 'PENDING' ? 'border border-yellow-400/20' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 mr-2">
              <p className="font-semibold text-white text-sm truncate">{booking.field.name}</p>
              <p className="text-white/50 text-xs">{booking.date} · {booking.startTime}–{booking.endTime}</p>
              <p className="text-white/40 text-xs mt-0.5">
                👤 {booking.user.firstName} {booking.user.lastName ?? ''}
                {booking.user.phone && ` · ${booking.user.phone}`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-primary font-bold text-sm">{formatPrice(booking.totalPrice)}</span>
              <p className="text-white/30 text-[10px] mt-0.5">{booking.paymentMethod}</p>
            </div>
          </div>
          {booking.status === 'PENDING' && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => cancelMutation.mutate(booking.id)}
                disabled={cancelMutation.isPending || confirmMutation.isPending}
                className="flex-1 py-2 rounded-xl border border-red-400/20 text-red-400 text-xs font-medium active:bg-red-400/10 transition-colors disabled:opacity-40"
              >
                Отклонить
              </button>
              <button
                onClick={() => confirmMutation.mutate(booking.id)}
                disabled={confirmMutation.isPending || cancelMutation.isPending}
                className="flex-1 py-2 rounded-xl bg-primary text-dark text-xs font-bold disabled:opacity-40"
              >
                {confirmMutation.isPending ? '...' : 'Подтвердить'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
