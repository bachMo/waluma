'use client'
import { useEffect, useRef } from 'react'

const PRATICIENS = [
  { lat: 14.6937, lng: -17.4441, nom: 'Dr. Amadou D.', spec: 'Médecin généraliste', dispo: '12 min', zone: 'Plateau' },
  { lat: 14.7455, lng: -17.5131, nom: 'Fatou N.', spec: 'Infirmière IDE', dispo: '8 min', zone: 'Almadies' },
  { lat: 14.7155, lng: -17.4731, nom: 'Ibrahima S.', spec: 'Kinésithérapeute', dispo: '20 min', zone: 'Mermoz' },
  { lat: 14.7255, lng: -17.4941, nom: 'Aïssatou B.', spec: 'Sage-femme', dispo: '15 min', zone: 'Ouakam' },
  { lat: 14.6855, lng: -17.4541, nom: 'Omar T.', spec: 'Préleveur', dispo: '6 min', zone: 'Médina' },
]

export default function MapDakar() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return

    // Charger Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    // Charger Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      const L = (window as unknown as { L: typeof import('leaflet') }).L
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [14.7155, -17.4731],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
      })

      mapInstanceRef.current = map

      // Tuiles style sombre custom via CartoDB
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map)

      // Marqueur SVG custom pour chaque praticien
      PRATICIENS.forEach((p, i) => {
        const pulseClass = i === 0 ? 'ring' : i === 1 ? 'ring-2' : i === 2 ? 'ring-3' : ''
        const dotClass = ['dot-pulse', 'dot-pulse-2', 'dot-pulse-3', 'dot-pulse-4', 'dot-pulse-5'][i]
        const size = i < 3 ? 22 : 16

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:${size}px;height:${size}px;">
              ${pulseClass ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(34,197,94,0.12);" class="${pulseClass}"></div>` : ''}
              <div style="width:${size}px;height:${size}px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 2px 8px rgba(34,197,94,0.5);" class="${dotClass}">
              </div>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map)

        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px;padding:4px 0;">
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;">${p.nom}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${p.spec}</div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
              <span style="font-size:11px;color:#22c55e;font-weight:600;">Disponible · ${p.dispo}</span>
            </div>
          </div>
        `, {
          closeButton: false,
          className: 'waluma-popup',
        })
      })

      // Injecter le style des popups
      const popupStyle = document.createElement('style')
      popupStyle.textContent = `
        .waluma-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border: none;
          padding: 0;
        }
        .waluma-popup .leaflet-popup-content {
          margin: 10px 14px;
        }
        .waluma-popup .leaflet-popup-tip-container { display: none; }
      `
      document.head.appendChild(popupStyle)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 280,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    />
  )
}