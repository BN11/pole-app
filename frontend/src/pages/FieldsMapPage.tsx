import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, SPORT_ICONS, formatPrice } from '@/utils/api'
import { FieldsMap } from '@/components/YandexMap'
import type { Field } from '@/types'

export function FieldsMapPage() {
  const navigate = useNavigate()
  const [selectedField, setSelectedField] = useState<Field | null>(null)

  const { data: fields = [], isLoading } = useQuery<Field[]>({
    queryKey: ['fields', 'map'],
    queryFn: async () => {
      const res = await api.get('/fields', { params: { limit: '50' } })
      return res.data.data
    },
  })

  const fieldsWithCoords = fields.filter(f => f.lat && f.lng)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 flex-shrink-0 bg-dark z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Поля на карте</h1>
          <p className="text-white/40 text-xs">{fieldsWithCoords.length} полей в Ташкенте</p>
        </div>
        <button
          onClick={() => navigate('/fields')}
          className="text-xs text-primary font-medium px-3 py-1.5 rounded-xl border border-primary/30"
        >
          Списком
        </button>
      </div>

      {/* Map — fills remaining height */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-dark">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FieldsMap
            fields={fieldsWithCoords}
            onFieldClick={(id) => {
              const f = fields.find(x => x.id === id)
              if (f) setSelectedField(f)
            }}
            className="w-full h-full"
          />
        )}

        {/* Field preview card */}
        {selectedField && (
          <div className="absolute bottom-6 left-4 right-4 z-20">
            <div className="glass-card p-4 flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-surface-hover flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {selectedField.photos?.[0]
                  ? <img src={selectedField.photos[0]} alt="" className="w-full h-full object-cover" />
                  : SPORT_ICONS[selectedField.sportTypes[0]] || '🏟️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{selectedField.name}</p>
                <p className="text-white/50 text-xs truncate mt-0.5">{selectedField.address}</p>
                <p className="text-primary font-bold text-sm mt-1">{formatPrice(selectedField.pricePerHour)}/ч</p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => navigate(`/fields/${selectedField.id}`)}
                  className="neon-btn text-xs px-4 py-2"
                >
                  Открыть
                </button>
                <button
                  onClick={() => setSelectedField(null)}
                  className="text-white/30 text-xs text-center"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
