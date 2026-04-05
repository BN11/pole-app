import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { Field, SportType } from '@/types'

const SPORTS: { key: SportType; label: string; icon: string }[] = [
  { key: 'FOOTBALL',   label: 'Футбол',     icon: '⚽' },
  { key: 'BASKETBALL', label: 'Баскетбол',  icon: '🏀' },
  { key: 'TENNIS',     label: 'Теннис',     icon: '🎾' },
  { key: 'VOLLEYBALL', label: 'Волейбол',   icon: '🏐' },
]

const AMENITIES = [
  { key: 'hasLockerRoom', label: '🚪 Раздевалка' },
  { key: 'hasParking',    label: '🅿️ Парковка' },
  { key: 'hasLighting',   label: '💡 Освещение' },
  { key: 'hasCafeteria',  label: '☕ Кафетерий' },
  { key: 'hasShower',     label: '🚿 Душ' },
  { key: 'hasBallRent',   label: '⚽ Аренда мяча' },
]

export function EditFieldPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    sportTypes: [] as SportType[],
    pricePerHour: '',
    hasLockerRoom: false,
    hasParking: false,
    hasLighting: false,
    hasCafeteria: false,
    hasShower: false,
    hasBallRent: false,
  })
  const [ready, setReady] = useState(false)

  const { data: field, isLoading } = useQuery<Field>({
    queryKey: ['field', id],
    queryFn: async () => {
      const res = await api.get(`/fields/${id}`)
      return res.data.data
    },
  })

  // Pre-fill form once field data arrives
  useEffect(() => {
    if (field && !ready) {
      setForm({
        name: field.name,
        description: field.description ?? '',
        address: field.address,
        sportTypes: field.sportTypes,
        pricePerHour: String(field.pricePerHour),
        hasLockerRoom: field.amenities?.hasLockerRoom ?? (field as any).hasLockerRoom ?? false,
        hasParking:    field.amenities?.hasParking    ?? (field as any).hasParking    ?? false,
        hasLighting:   field.amenities?.hasLighting   ?? (field as any).hasLighting   ?? false,
        hasCafeteria:  field.amenities?.hasCafeteria  ?? (field as any).hasCafeteria  ?? false,
        hasShower:     field.amenities?.hasShower     ?? (field as any).hasShower     ?? false,
        hasBallRent:   field.amenities?.hasBallRent   ?? (field as any).hasBallRent   ?? false,
      })
      setReady(true)
    }
  }, [field, ready])

  const mutation = useMutation({
    mutationFn: () => api.patch(`/fields/${id}`, {
      name: form.name,
      description: form.description,
      address: form.address,
      sportTypes: form.sportTypes,
      pricePerHour: Number(form.pricePerHour),
      hasLockerRoom: form.hasLockerRoom,
      hasParking: form.hasParking,
      hasLighting: form.hasLighting,
      hasCafeteria: form.hasCafeteria,
      hasShower: form.hasShower,
      hasBallRent: form.hasBallRent,
    }),
    onSuccess: () => navigate('/dashboard'),
  })

  const toggleSport = (sport: SportType) => {
    setForm(f => ({
      ...f,
      sportTypes: f.sportTypes.includes(sport)
        ? f.sportTypes.filter(s => s !== sport)
        : [...f.sportTypes, sport],
    }))
  }

  const toggleAmenity = (key: string) => {
    setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))
  }

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const canSave = form.name.trim() && form.address.trim() && form.sportTypes.length > 0 && form.pricePerHour

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Редактировать поле</h1>
          <p className="text-white/40 text-xs">После сохранения поле уйдёт на проверку</p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Название *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Адрес *</label>
          <input
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Описание</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Цена за час (сум) *</label>
          <input
            type="number"
            value={form.pricePerHour}
            onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50"
          />
        </div>

        {/* Sport types */}
        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs">Вид спорта *</label>
          <div className="grid grid-cols-2 gap-2">
            {SPORTS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleSport(key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                  form.sportTypes.includes(key)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-surface-border text-white/70'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs">Удобства</label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleAmenity(key)}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl border text-sm transition-all ${
                  form[key as keyof typeof form]
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-surface-border text-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mutation.isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">Ошибка при сохранении. Попробуйте ещё раз.</p>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-8 pt-4 bg-dark/90 backdrop-blur-md border-t border-surface-border">
        <button
          onClick={() => mutation.mutate()}
          disabled={!canSave || mutation.isPending}
          className="neon-btn w-full disabled:opacity-40"
        >
          {mutation.isPending ? 'Сохранение...' : '💾 Сохранить изменения'}
        </button>
      </div>
    </div>
  )
}
