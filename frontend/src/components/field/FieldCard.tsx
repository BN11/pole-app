import { Link } from 'react-router-dom'
import { StarIcon, LocationIcon } from '@/components/ui/Icons'
import { formatPrice, SPORT_LABELS, SPORT_ICONS } from '@/utils/api'
import type { Field } from '@/types'
import clsx from 'clsx'

interface FieldCardProps {
  field: Field
  variant?: 'large' | 'compact'
}

export function FieldCard({ field, variant = 'large' }: FieldCardProps) {
  if (variant === 'compact') {
    return (
      <Link to={`/fields/${field.id}`} className="glass-card-hover flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-hover">
          {field.photos?.[0] ? (
            <img src={field.photos?.[0]} alt={field.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-white truncate">{field.name}</p>
            <span className="text-[10px] bg-surface px-2 py-0.5 rounded-full text-white/60 flex-shrink-0">
              {SPORT_LABELS[field.sportTypes[0]]}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <StarIcon className="w-3 h-3 text-primary" />
            <span className="text-xs text-white/70">{field.rating.toFixed(1)}</span>
            <span className="text-white/30 text-xs">·</span>
            <LocationIcon className="w-3 h-3 text-white/30" />
            <span className="text-xs text-white/50 truncate">{field.address}</span>
          </div>
          <p className="text-primary font-bold text-sm mt-1">
            {formatPrice(field.pricePerHour)} / ч
          </p>
        </div>
        <div className="flex items-center self-center">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm font-bold">→</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/fields/${field.id}`}
      className={clsx(
        'relative flex-shrink-0 rounded-2xl overflow-hidden',
        'w-[260px] h-[200px]',
        'active:scale-95 transition-transform duration-200',
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-surface-hover">
        {field.photos?.[0] ? (
          <img
            src={field.photos?.[0]}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {SPORT_ICONS[field.sportTypes[0]] || '🏟️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
      </div>

      {/* Sport badge top-left */}
      <div className="absolute top-3 left-3">
        <span className="bg-dark/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/10">
          {SPORT_ICONS[field.sportTypes[0]]} {SPORT_LABELS[field.sportTypes[0]]}
        </span>
      </div>

      {/* Price badge top-right */}
      <div className="absolute top-3 right-3">
        <span className="bg-primary text-dark text-xs font-bold px-2.5 py-1 rounded-full">
          {formatPrice(field.pricePerHour)}/ч
        </span>
      </div>

      {/* Info bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-bold text-white text-sm leading-tight">{field.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-white/80">{field.rating.toFixed(1)}</span>
          </div>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/60 truncate">{field.address}</span>
        </div>
        <button className="mt-2 w-full bg-primary/90 text-dark text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform">
          Забронировать
        </button>
      </div>
    </Link>
  )
}
