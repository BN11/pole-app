import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatPrice, SPORT_ICONS } from '@/utils/api'
import type { Booking } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function BookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings', tab],
    queryFn: async () => {
      const res = await api.get('/bookings', { params: { type: tab } })
      return res.data.data
    },
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-white">Мои брони</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 p-1 bg-surface rounded-2xl mb-4">
        {(['upcoming', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-primary text-dark' : 'text-white/50'
            }`}
          >
            {t === 'upcoming' ? 'Предстоящие' : 'История'}
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="px-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
          ))
        ) : bookings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">📅</span>
            <p className="text-white font-semibold">Нет бронирований</p>
            <p className="text-white/50 text-sm mt-1">
              {tab === 'upcoming' ? 'Забронируйте поле прямо сейчас' : 'История пуста'}
            </p>
          </div>
        ) : (
          bookings?.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="glass-card p-4 flex gap-3">
      {/* Field photo */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-hover">
        {booking.field.photos?.[0] ? (
          <img src={booking.field.photos?.[0]} alt={booking.field.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {SPORT_ICONS[booking.field.sportTypes[0]] || '🏟️'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-white text-sm truncate">{booking.field.name}</p>
          <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
        <p className="text-white/50 text-xs mt-1 capitalize">
          {format(new Date(booking.date), 'EEEE, d MMMM', { locale: ru })}
        </p>
        <p className="text-white/70 text-xs">
          {booking.startTime} — {booking.endTime}
        </p>
        <p className="text-primary font-bold text-sm mt-1">
          {formatPrice(booking.totalPrice)}
        </p>
      </div>
    </div>
  )
}
