'use client'
import { useEffect, useRef } from 'react'

const PRATICIENS = [
  { lat: 14.6937, lng: -17.4441, nom: 'Dr. Amadou D.', spec: 'Médecin généraliste', dispo: '12 min', zone: 'Plateau' },
  { lat: 14.7455, lng: -17.5131, nom: 'Fatou N.', spec: 'Infirmière IDE', dispo: '8 min', zone: 'Almadies' },
  { lat: 14.7155, lng: -17.4731, nom: 'Ibrahima S.', spec: 'Kinésithérapeute', dispo: '20 min', zone: 'Mermoz' },
  { lat: 14.7255, lng: -17.4941, nom: 'Aïssatou B.', spec: 'Sage-femme', dispo: '15 min', zone: 'Ouakam' },
  { lat: 14.6855, lng: -17.4541, nom: 'Omar T.', spec: 'Préleveur', dispo: '6 min', zone: 'Médina' },
]

declare global {
  interface Window {
    google: typeof google
    initWalumaMap: () => void
  }
}

function loadGoogleMapsScript(apiKey: string, callbackName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Déjà chargé
    if (window.google?.maps) {
      resolve()
      return
    }
    // Script déjà dans le DOM (en cours de chargement)
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Attendre que le callback soit appelé
      const prev = window[callbackName as keyof Window] as (() => void) | undefined
      ;(window as Window)[callbackName] = () => {
        prev?.()
        resolve()
      }
      return
    }
    // Injecter le script
    ;(window as Window)[callbackName] = resolve
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function MapDakar() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

    loadGoogleMapsScript(apiKey, 'initWalumaMap').then(() => {
      if (!mapRef.current || mapInstanceRef.current) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 14.7155, lng: -17.4731 },
        zoom: 12,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0c3347' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0c3347' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a4a5e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d5068' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061e28' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a4a5e' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d3d52' }] },
        ],
      })

      mapInstanceRef.current = map

      PRATICIENS.forEach(p => {
        const marker = new window.google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#22c55e',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:Inter,sans-serif;padding:4px 0;min-width:160px;">
              <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;">${p.nom}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${p.spec}</div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
                <span style="font-size:11px;color:#22c55e;font-weight:600;">Disponible · ${p.dispo}</span>
              </div>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })
    })

    return () => {
      mapInstanceRef.current = null
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