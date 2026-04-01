import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { SportType } from '@/types'

const SPORTS: { key: SportType; label: string; icon: string }[] = [
  { key: 'FOOTBALL',   label: 'Футбол',    icon: '⚽' },
  { key: 'BASKETBALL', label: 'Баскетбол', icon: '🏀' },
  { key: 'TENNIS',     label: 'Теннис',    icon: '🎾' },
  { key: 'VOLLEYBALL', label: 'Волейбол',  icon: '🏐' },
]

const FORMATS = ['5x5', '7x7', '11x11', '3x3', '6x6']

export function AddTournamentPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    sportType: '' as SportType | '',
    format: '5x5',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeams: '8',
    prizePool: '',
    entryFee: '',
  })

  const mutation = useMutation({
    mutationFn: () => api.post('/tournaments', {
      ...form,
      sportType: form.sportType,
      maxTeams: Number(form.maxTeams),
      prizePool: form.prizePool ? Number(form.prizePool) : null,
      entryFee: form.entryFee ? Number(form.entryFee) : null,
    }),
    onSuccess: () => navigate('/tournaments'),
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const canSubmit = form.name && form.sportType && form.location &&
    form.startDate && form.endDate && form.registrationDeadline && form.maxTeams

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
          <h1 className="text-lg font-bold text-white">Создать турнир</h1>
          <p className="text-white/40 text-xs">Заявка на проведение</p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Название турнира *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Кубок Ташкента 2025"
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50" />
        </div>

        {/* Sport */}
        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs">Вид спорта *</label>
          <div className="grid grid-cols-2 gap-2">
            {SPORTS.map(({ key, label, icon }) => (
              <button key={key} onClick={() => set('sportType', key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                  form.sportType === key ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-surface-border text-white/70'
                }`}>
                <span className="text-lg">{icon}</span><span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-xs">Формат</label>
          <div className="flex gap-2 flex-wrap">
            {FORMATS.map(f => (
              <button key={f} onClick={() => set('format', f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  form.format === f ? 'bg-primary text-dark border-primary' : 'bg-surface border-surface-border text-white/70'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Место проведения *</label>
          <input value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="Стадион Пахтакор, Ташкент"
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs">Дата начала *</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className="bg-surface border border-surface-border rounded-2xl px-3 py-3 text-white text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs">Дата конца *</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
              className="bg-surface border border-surface-border rounded-2xl px-3 py-3 text-white text-sm outline-none focus:border-primary/50" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Дедлайн регистрации *</label>
          <input type="datetime-local" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50" />
        </div>

        {/* Teams & Fees */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs">Команд *</label>
            <input type="number" value={form.maxTeams} onChange={e => set('maxTeams', e.target.value)}
              className="bg-surface border border-surface-border rounded-2xl px-3 py-3 text-white text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs">Приз (сум)</label>
            <input type="number" value={form.prizePool} onChange={e => set('prizePool', e.target.value)}
              placeholder="0"
              className="bg-surface border border-surface-border rounded-2xl px-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs">Взнос (сум)</label>
            <input type="number" value={form.entryFee} onChange={e => set('entryFee', e.target.value)}
              placeholder="0"
              className="bg-surface border border-surface-border rounded-2xl px-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50" />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/50 text-xs">Описание</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Расскажите о турнире, правилах, призах..."
            rows={3}
            className="bg-surface border border-surface-border rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 resize-none" />
        </div>

        {/* Notice */}
        <div className="glass-card p-4 flex items-start gap-3">
          <span className="text-xl">⏳</span>
          <p className="text-white/60 text-xs">После подачи заявки суперадмин проверит турнир. Обычно до 24 часов.</p>
        </div>

        {mutation.isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">Ошибка. Проверьте данные и попробуйте снова.</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-8 pt-4 bg-dark/90 backdrop-blur-md border-t border-surface-border">
        <button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="neon-btn w-full disabled:opacity-40"
        >
          {mutation.isPending ? 'Отправка...' : '📤 Подать заявку на турнир'}
        </button>
      </div>
    </div>
  )
}
