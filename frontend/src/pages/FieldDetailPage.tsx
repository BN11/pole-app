import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, SPORT_LABELS, SPORT_ICONS, formatPrice } from '@/utils/api'
import { StarIcon, LocationIcon, ClockIcon, ParkingIcon, ShowerIcon, LightbulbIcon } from '@/components/ui/Icons'
import { FieldMap } from '@/components/YandexMap'
import type { Field, TimeSlot } from '@/types'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useAuthStore } from '@/store/useAuthStore'

const AMENITY_ICONS = [
  { key: 'hasLockerRoom', label: 'Раздевалка', icon: ShowerIcon },
  { key: 'hasParking', label: 'Парковка', icon: ParkingIcon },
  { key: 'hasLighting', label: 'Освещение', icon: LightbulbIcon },
]

export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const { data: field, isLoading } = useQuery<Field>({
    queryKey: ['field', id],
    queryFn: async () => {
      const res = await api.get(`/fields/${id}`)
      return res.data.data
    },
  })

  const { data: slots } = useQuery<TimeSlot[]>({
    queryKey: ['slots', id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await api.get(`/fields/${id}/slots`, {
        params: { date: format(selectedDate, 'yyyy-MM-dd') },
      })
      return res.data.data
    },
    enabled: !!id,
  })

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!field) return null

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Photo gallery */}
      <div className="relative h-64 bg-surface-hover">
        {field.photos.length > 0 ? (
          <img
            src={field.photos[photoIndex]}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-dark/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10"
        >
          <span className="text-white text-lg">←</span>
        </button>

        {/* Photo dots */}
        {field.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {field.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === photoIndex ? 'bg-primary w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-white leading-tight">{field.name}</h1>
            <span className="flex-shrink-0 bg-surface px-2.5 py-1 rounded-full text-xs text-white/60 border border-surface-border">
              {SPORT_ICONS[field.sportTypes[0]]} {SPORT_LABELS[field.sportTypes[0]]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white">{field.rating.toFixed(1)}</span>
              <span className="text-white/40 text-sm">({field.reviewCount})</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <LocationIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/60 truncate">{field.address}</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex gap-3">
          {AMENITY_ICONS.map(({ key, label, icon: Icon }) => {
            const active = field.amenities[key as keyof typeof field.amenities]
            return (
              <div
                key={key}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border ${
                  active
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-surface-border text-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium text-center">{label}</span>
              </div>
            )
          })}
        </div>

        {/* Date picker */}
        <div>
          <h3 className="section-title mb-3">Выберите дату</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {days.map((day) => {
              const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setSelectedSlot(null) }}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-dark'
                      : 'bg-surface border-surface-border text-white/70'
                  }`}
                >
                  <span className="text-xs font-medium capitalize">
                    {format(day, 'EEE', { locale: ru })}
                  </span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">
              <ClockIcon className="inline w-4 h-4 mr-1" />
              Выберите время
            </h3>
            {!selectedSlot && (
              <span className="text-white/30 text-xs">↓ нажмите на слот</span>
            )}
          </div>
          {!slots ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-surface animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.available ? slot : null)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-surface text-white/20 cursor-not-allowed line-through'
                      : selectedSlot?.time === slot.time
                      ? 'bg-primary text-dark ring-2 ring-primary ring-offset-1 ring-offset-dark'
                      : 'bg-surface border border-surface-border text-white active:bg-primary/20'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {field.description && (
          <div>
            <h3 className="section-title mb-2">О поле</h3>
            <p className="text-white/60 text-sm leading-relaxed">{field.description}</p>
          </div>
        )}

        {/* Map */}
        {(field.lat && field.lng) && (
          <div>
            <h3 className="section-title mb-3">На карте</h3>
            <FieldMap field={field} />
            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
              <LocationIcon className="w-3 h-3" />{field.address}
            </p>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection fieldId={id!} userId={user?.id} />
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-safe pt-3 bg-dark/90 backdrop-blur-md border-t border-surface-border z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs">Стоимость</p>
            <p className="text-white font-bold text-lg">
              {formatPrice(field.pricePerHour)} <span className="text-white/50 text-sm font-normal">/ час</span>
            </p>
          </div>
          {selectedSlot && (
            <div className="text-right">
              <p className="text-white/50 text-xs">Выбрано</p>
              <p className="text-primary font-semibold">{selectedSlot.time}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (!selectedSlot || !field) return
            const endH = parseInt(selectedSlot.time) + 1
            const endTime = `${String(endH).padStart(2, '0')}:00`
            navigate('/booking/confirm', {
              state: {
                field,
                date: format(selectedDate, 'yyyy-MM-dd'),
                startTime: selectedSlot.time,
                endTime,
                durationHours: 1,
                totalPrice: selectedSlot.price,
              },
            })
          }}
          disabled={!selectedSlot}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            selectedSlot ? 'neon-btn' : 'bg-surface text-white/30 cursor-not-allowed'
          }`}
        >
          {selectedSlot ? 'Забронировать' : 'Выберите время'}
        </button>
      </div>
    </div>
  )
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

interface Review { id: string; rating: number; comment?: string; user: { firstName: string; lastName?: string; avatar?: string } }

function ReviewSection({ fieldId, userId }: { fieldId: string; userId?: string }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', fieldId],
    queryFn: async () => {
      const res = await api.get(`/fields/${fieldId}/reviews`)
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: () => api.post(`/fields/${fieldId}/reviews`, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', fieldId] })
      qc.invalidateQueries({ queryKey: ['field', fieldId] })
      setShowForm(false)
      setComment('')
      setRating(5)
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Отзывы {reviews?.length ? `(${reviews.length})` : ''}</h3>
        {userId && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-primary text-sm font-medium">
            + Оставить
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card p-4 mb-3 flex flex-col gap-3">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <StarIcon className={`w-8 h-8 ${s <= rating ? 'text-yellow-400' : 'text-white/20'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Расскажите о вашем опыте..."
            rows={3}
            className="bg-dark border border-surface-border rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 outline-none resize-none"
          />
          {mutation.isError && <p className="text-red-400 text-xs">Вы должны завершить бронь, чтобы оставить отзыв.</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/50 text-sm">Отмена</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex-1 neon-btn text-sm disabled:opacity-40">
              {mutation.isPending ? '...' : 'Отправить'}
            </button>
          </div>
        </div>
      )}

      {reviews?.length === 0 && !showForm && (
        <p className="text-white/40 text-sm">Ещё нет отзывов. Будьте первым!</p>
      )}

      <div className="flex flex-col gap-3">
        {reviews?.map(r => (
          <div key={r.id} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 overflow-hidden">
                {r.user.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover" /> : r.user.firstName[0]}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{r.user.firstName} {r.user.lastName ?? ''}</p>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-yellow-400' : 'text-white/20'}`} />)}</div>
              </div>
            </div>
            {r.comment && <p className="text-white/60 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
