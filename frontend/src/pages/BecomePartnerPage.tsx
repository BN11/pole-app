import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/utils/api'
import { useAuthStore } from '@/store/useAuthStore'

const BENEFITS = [
  { icon: '💰', title: 'Зарабатывайте больше', desc: 'Получайте брони круглосуточно, даже когда спите' },
  { icon: '📊', title: 'Аналитика в реальном времени', desc: 'Статистика загрузки, выручки и отзывов в одном месте' },
  { icon: '🔔', title: 'Моментальные уведомления', desc: 'Получайте уведомления в Telegram о каждой брони' },
  { icon: '🌟', title: 'Рейтинг и отзывы', desc: 'Стройте репутацию и привлекайте новых клиентов' },
  { icon: '📅', title: 'Удобное расписание', desc: 'Управляйте слотами и ценами в пару кликов' },
  { icon: '🚀', title: 'Быстрый старт', desc: 'Разместите поле за 5 минут, без бюрократии' },
]

export function BecomePartnerPage() {
  const navigate = useNavigate()
  const { user, setUser, setToken } = useAuthStore()
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ city: 'Ташкент', fieldCount: '1', message: '' })

  if (user?.role === 'FIELD_OWNER' || user?.role === 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-4xl">🏟️</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2 text-center">Вы уже партнёр!</h1>
        <p className="text-white/50 text-sm text-center mb-8">Перейдите в кабинет владельца чтобы управлять полями</p>
        <button onClick={() => navigate('/dashboard')} className="neon-btn w-full max-w-sm">
          Кабинет владельца
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!user) { navigate('/profile'); return }
    setLoading(true)
    try {
      const res = await api.post('/partner/apply', {
        name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
        phone: user.phone,
        city: form.city,
        fieldCount: Number(form.fieldCount),
        message: form.message,
      })
      if (res.data.token) setToken(res.data.token)
      setUser(res.data.data)
      setStep('success')
    } catch {
      // show error
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-8">
          <span className="text-5xl">🎉</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3 text-center">Добро пожаловать в команду!</h1>
        <p className="text-white/50 text-sm text-center mb-8 leading-relaxed">
          Ваша заявка принята. Теперь вы можете разместить своё поле на платформе ПОЛЕ.
        </p>
        <button onClick={() => navigate('/fields/add')} className="neon-btn w-full mb-3">
          🏟️ Разместить поле
        </button>
        <button onClick={() => navigate('/dashboard')} className="w-full py-4 rounded-2xl border border-surface-border text-white/60 text-sm font-medium">
          Перейти в кабинет
        </button>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className="flex flex-col min-h-screen pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep('info')} className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
            <span className="text-white text-lg">←</span>
          </button>
          <h1 className="text-lg font-bold text-white">Заявка партнёра</h1>
        </div>

        <div className="space-y-4 mb-8">
          <div className="glass-card p-4">
            <label className="text-white/50 text-xs mb-2 block">Город</label>
            <input
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full bg-transparent text-white text-sm outline-none"
              placeholder="Ташкент"
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-white/50 text-xs mb-2 block">Количество полей</label>
            <input
              type="number"
              min="1"
              value={form.fieldCount}
              onChange={e => setForm(f => ({ ...f, fieldCount: e.target.value }))}
              className="w-full bg-transparent text-white text-sm outline-none"
              placeholder="1"
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-white/50 text-xs mb-2 block">Комментарий (необязательно)</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-transparent text-white text-sm outline-none resize-none"
              rows={3}
              placeholder="Расскажите о вашем объекте..."
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="neon-btn w-full disabled:opacity-40"
        >
          {loading ? 'Отправка...' : '✅ Подать заявку'}
        </button>
      </div>
    )
  }

  // Info screen
  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-4">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center mb-4">
        <span className="text-white text-lg">←</span>
      </button>

      {/* Hero */}
      <div className="glass-card p-6 mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🤝</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Станьте партнёром ПОЛЕ</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Разместите своё спортивное поле и получайте брони от тысяч игроков в Узбекистане
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFITS.map(({ icon, title, desc }) => (
          <div key={title} className="glass-card p-4">
            <span className="text-2xl block mb-2">{icon}</span>
            <p className="text-white text-xs font-semibold mb-1">{title}</p>
            <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '500+', label: 'Игроков' },
            { value: '50+', label: 'Партнёров' },
            { value: '0%', label: 'Комиссия' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-primary text-xl font-black">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => user ? setStep('form') : navigate('/profile')}
        className="neon-btn w-full"
      >
        Стать партнёром →
      </button>
    </div>
  )
}
