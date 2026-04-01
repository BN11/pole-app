import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { SportType } from '@/types'

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

interface FieldForm {
  name: string
  description: string
  address: string
  sportTypes: SportType[]
  pricePerHour: string
  amenities: Record<string, boolean>
  photos: File[]
}

export function AddFieldPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FieldForm>({
    name: '',
    description: '',
    address: '',
    sportTypes: [],
    pricePerHour: '',
    amenities: Object.fromEntries(AMENITIES.map(a => [a.key, false])),
    photos: [],
  })
  const [previews, setPreviews] = useState<string[]>([])

  const mutation = useMutation({
    mutationFn: async () => {
      // Upload photos first if any
      let photoUrls: string[] = []
      if (form.photos.length > 0) {
        const uploadRes = await api.post('/upload/photos', (() => {
          const fd = new FormData()
          form.photos.forEach(f => fd.append('photos', f))
          return fd
        })(), { headers: { 'Content-Type': 'multipart/form-data' } })
        photoUrls = uploadRes.data.urls
      }

      return api.post('/fields', {
        name: form.name,
        description: form.description,
        address: form.address,
        sportTypes: form.sportTypes,
        pricePerHour: Number(form.pricePerHour),
        photos: photoUrls,
        ...form.amenities,
      })
    },
    onSuccess: () => {
      navigate('/dashboard')
    },
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
    setForm(f => ({ ...f, amenities: { ...f.amenities, [key]: !f.amenities[key] } }))
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setForm(f => ({ ...f, photos: [...f.photos, ...files].slice(0, 8) }))
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(p => [...p, ...newPreviews].slice(0, 8))
  }

  const removePhoto = (i: number) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const canNext1 = form.name.trim() && form.address.trim() && form.sportTypes.length > 0 && form.pricePerHour
  const canNext2 = true

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(s => (s - 1) as any) : navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Добавить поле</h1>
          <p className="text-white/40 text-xs">Шаг {step} из 3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 px-4 mb-5">
        {[1,2,3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-surface'}`} />
        ))}
      </div>

      <div className="px-4 flex-1">

        {/* Step 1 — Основное */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-white font-semibold">Основная информация</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Название поля *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Например: Арена Центральная"
                className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Адрес *</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="ул. Амира Темура, 15"
                className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Описание</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Расскажите о поле, покрытии, инфраструктуре..."
                rows={3}
                className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Вид спорта *</label>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => toggleSport(key)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all text-sm font-medium ${
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

            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs">Цена за час (сум) *</label>
              <input
                type="number"
                value={form.pricePerHour}
                onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))}
                placeholder="150000"
                className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Удобства и фото */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-white font-semibold">Удобства и фотографии</p>

            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Удобства</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleAmenity(key)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all text-sm ${
                      form.amenities[key]
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface border-surface-border text-white/60'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Фотографии (до 8)</label>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {previews.length < 8 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center cursor-pointer active:bg-surface transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-white/30 mb-1">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span className="text-white/30 text-[10px]">Добавить</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Подтверждение */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-white font-semibold">Проверьте данные</p>

            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Название</span>
                <span className="text-white text-sm font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Адрес</span>
                <span className="text-white text-sm font-medium text-right flex-1 ml-4">{form.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Виды спорта</span>
                <span className="text-white text-sm font-medium">
                  {form.sportTypes.map(s => SPORTS.find(x => x.key === s)?.icon).join(' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Цена за час</span>
                <span className="text-primary font-bold text-sm">{Number(form.pricePerHour).toLocaleString('ru-RU')} сум</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Фото</span>
                <span className="text-white text-sm">{form.photos.length} шт.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Удобства</span>
                <span className="text-white text-sm">
                  {Object.entries(form.amenities).filter(([,v]) => v).length} из {AMENITIES.length}
                </span>
              </div>
            </div>

            <div className="glass-card p-4 flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-white text-sm font-medium">Проверка администратором</p>
                <p className="text-white/50 text-xs mt-0.5">После подачи заявки суперадмин проверит поле и одобрит его. Обычно это занимает до 24 часов.</p>
              </div>
            </div>

            {mutation.isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                <p className="text-red-400 text-sm">Ошибка при отправке. Попробуйте ещё раз.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-4 pt-4 pb-6">
        {step < 3 ? (
          <button
            onClick={() => setStep(s => (s + 1) as any)}
            disabled={step === 1 ? !canNext1 : !canNext2}
            className="neon-btn w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Далее →
          </button>
        ) : (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="neon-btn w-full disabled:opacity-40"
          >
            {mutation.isPending ? 'Отправка...' : '📤 Подать заявку'}
          </button>
        )}
      </div>
    </div>
  )
}
