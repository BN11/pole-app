import { useEffect, useRef } from 'react'
import type { Field } from '@/types'


const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_KEY || ''

function loadYmaps(): Promise<void> {
  if (window.ymapsReady) return Promise.resolve()
  return new Promise((resolve) => {
    if (document.getElementById('ymaps-script')) {
      const check = setInterval(() => {
        if (window.ymapsReady) { clearInterval(check); resolve() }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'ymaps-script'
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`
    script.onload = () => {
      window.ymaps.ready(() => {
        window.ymapsReady = true
        resolve()
      })
    }
    document.head.appendChild(script)
  })
}

// ─── Single field map ─────────────────────────────────────────────────────────

interface FieldMapProps {
  field: Field
  className?: string
}

export function FieldMap({ field, className }: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  const lat = field.lat ?? 41.2995  // Ташкент default
  const lng = field.lng ?? 69.2401

  useEffect(() => {
    let cancelled = false

    loadYmaps().then(() => {
      if (cancelled || !mapRef.current) return
      if (mapInstance.current) { mapInstance.current.destroy(); mapInstance.current = null }

      const map = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        controls: ['zoomControl'],
      })

      const placemark = new window.ymaps.Placemark(
        [lat, lng],
        { balloonContent: `<b>${field.name}</b><br>${field.address}` },
        {
          preset: 'islands#greenDotIconWithCaption',
          iconCaption: field.name,
        },
      )
      map.geoObjects.add(placemark)
      mapInstance.current = map
    })

    return () => {
      cancelled = true
      mapInstance.current?.destroy()
      mapInstance.current = null
    }
  }, [lat, lng, field.name])

  return <div ref={mapRef} className={className ?? 'w-full h-48 rounded-2xl overflow-hidden'} />
}

// ─── Fields list map ──────────────────────────────────────────────────────────

interface FieldsMapProps {
  fields: Field[]
  onFieldClick?: (id: string) => void
  className?: string
}

export function FieldsMap({ fields, onFieldClick, className }: FieldsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    loadYmaps().then(() => {
      if (cancelled || !mapRef.current) return
      if (mapInstance.current) { mapInstance.current.destroy(); mapInstance.current = null }

      const center = fields.find(f => f.lat && f.lng)
      const map = new window.ymaps.Map(mapRef.current, {
        center: center ? [center.lat!, center.lng!] : [41.2995, 69.2401],
        zoom: 12,
        controls: ['zoomControl', 'geolocationControl'],
      })

      fields.forEach(field => {
        if (!field.lat || !field.lng) return
        const placemark = new window.ymaps.Placemark(
          [field.lat, field.lng],
          {
            balloonContent: `
              <div style="padding:8px">
                <b>${field.name}</b>
                <br><span style="color:#666">${field.address}</span>
                <br><b style="color:#00FF87">${field.pricePerHour.toLocaleString('ru-RU')} сум/ч</b>
              </div>
            `,
          },
          { preset: 'islands#greenDotIconWithCaption', iconCaption: field.name },
        )

        if (onFieldClick) {
          placemark.events.add('click', () => onFieldClick(field.id))
        }

        map.geoObjects.add(placemark)
      })

      // Fit to all markers
      if (fields.some(f => f.lat && f.lng)) {
        map.geoObjects.getBounds().then((bounds: any) => {
          if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 })
        }).catch(() => {})
      }

      mapInstance.current = map
    })

    return () => {
      cancelled = true
      mapInstance.current?.destroy()
      mapInstance.current = null
    }
  }, [fields])

  return <div ref={mapRef} className={className ?? 'w-full h-[60vh] rounded-2xl overflow-hidden'} />
}
