'use client'
import { useEffect, useRef, useState } from 'react'

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

/** Fenêtre typée comme dictionnaire pour les callbacks dynamiques */
type WindowDict = Record<string, unknown>

function loadGoogleMapsScript(apiKey: string, callbackName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Déjà chargé
    if (window.google?.maps) {
      resolve()
      return
    }
    // Script déjà dans le DOM (en cours de chargement)
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const prev = (window as unknown as WindowDict)[callbackName] as (() => void) | undefined
      ;(window as unknown as WindowDict)[callbackName] = () => {
        prev?.()
        resolve()
      }
      return
    }
    // Injecter le script
    ;(window as unknown as WindowDict)[callbackName] = resolve
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

export default function MapDakar() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [echec, setEchec] = useState(false)
  const indisponible = !API_KEY || echec

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    if (!API_KEY) return

    loadGoogleMapsScript(API_KEY, 'initWalumaMap').then(() => {
      if (!mapRef.current || mapInstanceRef.current) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 14.7155, lng: -17.4731 },
        zoom: 12,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#F3F7F5' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#4A6670' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E3EAE7' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D6E7E2' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#DCE7E2' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F3F7F5' }] },
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
            fillColor: '#15A34A',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:Inter,sans-serif;padding:4px 0;min-width:160px;">
              <div style="font-size:13px;font-weight:700;color:#0B3B4A;margin-bottom:2px;">${p.nom}</div>
              <div style="font-size:11px;color:#4A6670;margin-bottom:6px;">${p.spec}</div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span style="width:6px;height:6px;border-radius:50%;background:#15A34A;display:inline-block;"></span>
                <span style="font-size:11px;color:#15803D;font-weight:600;">Disponible · ${p.dispo}</span>
              </div>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })
    }).catch(() => {
      setEchec(true)
    })

    return () => {
      mapInstanceRef.current = null
    }
  }, [])

  if (indisponible) {
    return (
      <div
        className="grid h-full min-h-[280px] place-items-center bg-[#F3F7F5] px-6 text-center"
        style={{ borderRadius: 16 }}
      >
        <div>
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0D5068]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <p className="text-[14px] font-semibold text-[#0B3B4A]">Dakar et sa banlieue</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-[13px] leading-snug text-[#4A6670]">
            Nos praticiens interviennent dans les douze zones listées.
          </p>
        </div>
      </div>
    )
  }

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
