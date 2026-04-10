import { useEffect, useRef } from 'react'
import type { Field } from '@/types'

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAPS_KEY || ''
const HAS_YANDEX = Boolean(YANDEX_API_KEY)

// ─── OpenStreetMap / Leaflet fallback ─────────────────────────────────────────

function loadLeaflet(): Promise<void> {
  if ((window as any).L) return Promise.resolve()
  return new Promise((resolve) => {
    if (document.getElementById('leaflet-css')) { resolve(); return }
    const css = document.createElement('link')
    css.id = 'leaflet-css'
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

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

  const lat = field.lat ?? 41.2995
  const lng = field.lng ?? 69.2401
  const cls = className ?? 'w-full h-48 rounded-2xl overflow-hidden'

  useEffect(() => {
    let cancelled = false
    const loader = HAS_YANDEX ? loadYmaps() : loadLeaflet()

    loader.then(() => {
      if (cancelled || !mapRef.current) return
      mapInstance.current?.remove?.()
      mapInstance.current?.destroy?.()
      mapInstance.current = null

      if (HAS_YANDEX) {
        const map = new window.ymaps.Map(mapRef.current, { center: [lat, lng], zoom: 15, controls: ['zoomControl'] })
        map.geoObjects.add(new window.ymaps.Placemark([lat, lng], { balloonContent: `<b>${field.name}</b><br>${field.address}` }, { preset: 'islands#greenDotIconWithCaption' }))
        mapInstance.current = map
      } else {
        const L = (window as any).L
        const map = L.map(mapRef.current).setView([lat, lng], 15)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
        L.marker([lat, lng]).addTo(map).bindPopup(`<b>${field.name}</b><br>${field.address}`).openPopup()
        mapInstance.current = map
      }
    })

    return () => {
      cancelled = true
      mapInstance.current?.remove?.()
      mapInstance.current?.destroy?.()
      mapInstance.current = null
    }
  }, [lat, lng, field.name])

  return <div ref={mapRef} className={cls} />
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
  const cls = className ?? 'w-full h-[60vh] rounded-2xl overflow-hidden'
  const defaultCenter: [number, number] = [41.2995, 69.2401]

  useEffect(() => {
    if (!fields.length) return
    let cancelled = false
    const loader = HAS_YANDEX ? loadYmaps() : loadLeaflet()

    loader.then(() => {
      if (cancelled || !mapRef.current) return
      mapInstance.current?.remove?.()
      mapInstance.current?.destroy?.()
      mapInstance.current = null

      const center = fields.find(f => f.lat && f.lng)
      const centerCoords: [number, number] = center ? [center.lat!, center.lng!] : defaultCenter

      if (HAS_YANDEX) {
        const map = new window.ymaps.Map(mapRef.current, { center: centerCoords, zoom: 12, controls: ['zoomControl', 'geolocationControl'] })
        fields.forEach(field => {
          if (!field.lat || !field.lng) return
          const pm = new window.ymaps.Placemark([field.lat, field.lng], {
            balloonContent: `<div style="padding:8px"><b>${field.name}</b><br><span style="color:#666">${field.address}</span><br><b style="color:#00FF87">${field.pricePerHour.toLocaleString('ru-RU')} сум/ч</b></div>`,
          }, { preset: 'islands#greenDotIconWithCaption', iconCaption: field.name })
          if (onFieldClick) pm.events.add('click', () => onFieldClick(field.id))
          map.geoObjects.add(pm)
        })
        if (fields.some(f => f.lat && f.lng)) {
          map.geoObjects.getBounds().then((b: any) => { if (b) map.setBounds(b, { checkZoomRange: true, zoomMargin: 40 }) }).catch(() => {})
        }
        mapInstance.current = map
      } else {
        const L = (window as any).L
        const map = L.map(mapRef.current).setView(centerCoords, 12)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
        const markers: any[] = []
        fields.forEach(field => {
          if (!field.lat || !field.lng) return
          const m = L.marker([field.lat, field.lng])
            .addTo(map)
            .bindPopup(`<b>${field.name}</b><br>${field.address}<br><b style="color:#16a34a">${field.pricePerHour.toLocaleString('ru-RU')} сум/ч</b>`)
          if (onFieldClick) m.on('click', () => onFieldClick(field.id))
          markers.push(m)
        })
        if (markers.length > 1) {
          const group = L.featureGroup(markers)
          map.fitBounds(group.getBounds(), { padding: [40, 40] })
        }
        mapInstance.current = map
      }
    })

    return () => {
      cancelled = true
      mapInstance.current?.remove?.()
      mapInstance.current?.destroy?.()
      mapInstance.current = null
    }
  }, [fields])

  return <div ref={mapRef} className={cls} />
}
