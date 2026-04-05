import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api, formatPrice, SPORT_ICONS } from '@/utils/api'
import type { Field, PaymentMethod } from '@/types'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface BookingState {
  field: Field
  date: string
  startTime: string
  endTime: string
  durationHours: number
  totalPrice: number
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'CASH',  label: 'Наличные',  icon: '💵' },
  { key: 'CARD',  label: 'Карта',     icon: '💳' },
  { key: 'PAYME', label: 'Payme',     icon: '🔵' },
  { key: 'CLICK', label: 'Click',     icon: '🟢' },
]

export function BookingConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as BookingState | null

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!state) navigate('/fields')
  }, [])

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/bookings', {
        fieldId: state!.field.id,
        date: state!.date,
        startTime: state!.startTime,
        endTime: state!.endTime,
        durationHours: state!.durationHours,
        paymentMethod,
      }),
    onSuccess: async (res) => {
      const bookingId = res.data.data.id
      if (paymentMethod === 'PAYME' || paymentMethod === 'CLICK') {
        try {
          const endpoint = paymentMethod === 'PAYME' ? '/payment/payme/init' : '/payment/click/init'
          const payRes = await api.post(endpoint, { bookingId })
          window.location.href = payRes.data.url
          return
        } catch {
          // fallback to success screen
        }
      }
      setSuccess(true)
    },
  })

  if (!state) return null

  const { field, date, startTime, endTime, durationHours, totalPrice } = state

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-dark">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-6 animate-[scale-in_0.3s_ease-out]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-primary">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Бронь создана!</h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Заявка отправлена владельцу поля.<br/>Ожидайте подтверждения в Telegram.
        </p>

        {/* Booking summary */}
        <div className="glass-card p-4 w-full text-left mb-6">
          <div className="flex gap-3 items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0">
              {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{field.name}</p>
              <p className="text-white/50 text-xs">{field.address}</p>
            </div>
          </div>
          <div className="border-t border-surface-border pt-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Дата</span>
              <span className="text-white text-sm font-medium capitalize">
                {format(new Date(date), 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Время</span>
              <span className="text-white text-sm font-medium">{startTime} — {endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Сумма</span>
              <span className="text-primary font-bold">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/bookings')} className="neon-btn w-full mb-3">
          Мои брони
        </button>
        <button onClick={() => navigate('/')} className="w-full py-3 text-white/50 text-sm">
          На главную
        </button>
      </div>
    )
  }

  // ── Confirmation form ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Подтверждение брони</h1>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Field info */}
        <div className="glass-card p-4 flex gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-hover">
            {field.photos?.[0] ? (
              <img src={field.photos[0]} alt={field.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white">{field.name}</p>
            <p className="text-white/50 text-xs truncate mt-0.5">{field.address}</p>
            <div className="flex gap-1 mt-1">
              {field.sportTypes.map(s => (
                <span key={s} className="text-sm">{SPORT_ICONS[s]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <p className="text-white font-semibold text-sm">Детали бронирования</p>

          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Дата</span>
            <span className="text-white text-sm font-medium capitalize">
              {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: ru })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Время</span>
            <span className="text-white text-sm font-medium">{startTime} — {endTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Длительность</span>
            <span className="text-white text-sm font-medium">{durationHours} ч.</span>
          </div>
          <div className="border-t border-surface-border pt-3 flex justify-between items-center">
            <span className="text-white font-semibold">Итого</span>
            <span className="text-primary font-black text-xl">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-2">
          <p className="text-white/50 text-xs">Способ оплаты</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all text-sm font-medium ${
                  paymentMethod === key
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-surface-border text-white/70'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {(paymentMethod === 'PAYME' || paymentMethod === 'CLICK') && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3">
            <p className="text-blue-400 text-sm">
              После подтверждения вы будете перенаправлены на страницу оплаты {paymentMethod}.
            </p>
          </div>
        )}

        {/* Policy */}
        <div className="glass-card p-4 flex items-start gap-3">
          <span className="text-xl">📋</span>
          <div>
            <p className="text-white text-sm font-medium">Политика отмены</p>
            <p className="text-white/50 text-xs mt-0.5">
              Бесплатная отмена за 2 часа до начала. После — возврат не предусмотрен.
            </p>
          </div>
        </div>

        {mutation.isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">
              Ошибка бронирования. Возможно, этот слот уже занят — вернитесь и выберите другое время.
            </p>
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div className="px-4 pt-4 pb-6 mt-auto">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="neon-btn w-full disabled:opacity-40"
        >
          {mutation.isPending ? 'Бронирование...' : `✅ Забронировать за ${formatPrice(totalPrice)}`}
        </button>
      </div>
    </div>
  )
}
