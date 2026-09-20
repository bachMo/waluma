
import Link from 'next/link'
import type { Metadata } from 'next'
import MapDakar from '@/components/ui/MapDakar'

export const metadata: Metadata = {
  title: 'Waluma — Des soins à domicile, où vous êtes.',
  description: 'Waluma connecte patients et professionnels de santé à Dakar pour des soins à domicile rapides et fiables. Infirmiers, médecins, sages-femmes disponibles près de chez vous.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }
        @keyframes ping-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes float-card { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .dot-pulse { animation: pulse-dot 2s ease-in-out infinite; }
        .dot-pulse-2 { animation: pulse-dot 2s ease-in-out infinite 0.4s; }
        .dot-pulse-3 { animation: pulse-dot 2s ease-in-out infinite 0.8s; }
        .dot-pulse-4 { animation: pulse-dot 2s ease-in-out infinite 1.2s; }
        .dot-pulse-5 { animation: pulse-dot 2s ease-in-out infinite 1.6s; }
        .ring { animation: ping-ring 2s ease-out infinite; }
        .ring-2 { animation: ping-ring 2s ease-out infinite 0.7s; }
        .ring-3 { animation: ping-ring 2s ease-out infinite 1.4s; }
        .float { animation: float-card 4s ease-in-out infinite; }
        .float-2 { animation: float-card 4s ease-in-out infinite 1s; }

        @media (prefers-reduced-motion: reduce) {
          .dot-pulse, .dot-pulse-2, .dot-pulse-3, .dot-pulse-4, .dot-pulse-5,
          .ring, .ring-2, .ring-3, .float, .float-2 {
            animation: none;
          }
        }

        /* ── RESPONSIVE GLOBAL ── */
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; overflow-x: hidden; }

        @media (max-width: 900px) {
          nav > div {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          nav > div > div:last-child {
            gap: 6px !important;
          }

          nav > div > div:last-child > a {
            padding: 9px 12px !important;
            font-size: 12px !important;
          }

          nav > div > div:last-child > a:last-child {
            display: none !important;
          }

          .hero-grid {
            gap: 32px !important;
          }

          .hero-grid > div:first-child h1 {
            font-size: 46px !important;
          }

          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .soins-grid {
            gap: 40px !important;
          }

          .join-grid {
            padding: 44px 32px !important;
            gap: 32px !important;
          }

          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr !important;
          }
        }

        @media (max-width: 768px) {
          nav {
            position: fixed !important;
          }

          nav > div {
            height: 60px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          nav > div > div:first-child span {
            font-size: 18px !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 34px 20px 50px !important;
            gap: 28px !important;
          }

          .hero-grid > div:first-child h1 {
            font-size: clamp(36px, 10vw, 46px) !important;
            letter-spacing: -1.5px !important;
            line-height: 1.08 !important;
          }

          .hero-grid > div:first-child p {
            font-size: 16px !important;
            line-height: 1.6 !important;
            margin-bottom: 28px !important;
          }

          .hero-grid > div:first-child > div:first-child {
            margin-bottom: 20px !important;
          }

          .hero-grid > div:first-child > div:first-child span:last-child {
            font-size: 11px !important;
          }

          .hero-map {
            display: none !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(2) {
            width: 100% !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(2) > a {
            flex: 1 1 145px !important;
            min-width: 0 !important;
            justify-content: center !important;
            padding: 12px 14px !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(3) {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 14px !important;
            margin-top: 30px !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(3) > div {
            min-width: 0 !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(3) > div > div:first-child {
            font-size: 20px !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(3) > div > div:last-child {
            font-size: 10px !important;
          }

          section {
            scroll-margin-top: 70px;
          }

          #comment,
          #soins,
          #confiance {
            padding: 64px 20px !important;
          }

          #comment > div,
          #soins > div,
          #confiance > div {
            max-width: 100% !important;
          }

          #comment h2,
          #confiance h2 {
            font-size: clamp(30px, 8vw, 38px) !important;
            line-height: 1.12 !important;
          }

          #comment > div > div:first-child {
            margin-bottom: 36px !important;
          }

          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }

          .steps-grid > div {
            padding: 24px 0 !important;
            border-left: none !important;
            border-bottom: 1px solid #f1f5f9;
          }

          .steps-grid > div:last-child {
            border-bottom: none;
          }

          .soins-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }

          .soins-grid > div:first-child {
            position: static !important;
          }

          .soins-grid > div:first-child h2 {
            font-size: clamp(30px, 8vw, 38px) !important;
            line-height: 1.12 !important;
          }

          .soins-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .soins-cards > div {
            padding: 16px 14px !important;
            border-radius: 16px !important;
          }

          #soins > div > p {
            text-align: left !important;
            line-height: 1.5 !important;
          }

          .valeurs-grid {
            grid-template-columns: 1fr !important;
          }

          .valeurs-grid > div {
            padding: 28px 24px !important;
          }

          .join-grid {
            grid-template-columns: 1fr !important;
            padding: 36px 24px !important;
            border-radius: 22px !important;
            gap: 28px !important;
          }

          .join-grid h2 {
            font-size: clamp(30px, 8vw, 36px) !important;
          }

          .join-grid a {
            width: 100% !important;
            justify-content: center !important;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 24px !important;
          }

          footer {
            padding: 44px 20px 28px !important;
          }

          footer > div > div:last-child {
            align-items: flex-start !important;
            flex-direction: column !important;
          }
        }

        @media (max-width: 480px) {
          nav > div > div:first-child svg {
            width: 28px !important;
            height: 28px !important;
          }

          nav > div > div:last-child > a:first-child {
            padding: 8px 10px !important;
            font-size: 11px !important;
          }

          .hero-grid {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .hero-grid > div:first-child h1 {
            font-size: 36px !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(2) {
            flex-direction: column !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(2) > a {
            width: 100% !important;
          }

          .hero-grid > div:first-child > div:nth-of-type(3) {
            gap: 8px !important;
          }

          #comment,
          #soins,
          #confiance {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .soins-cards {
            grid-template-columns: 1fr !important;
          }

          .join-grid {
            padding: 30px 20px !important;
          }

          .footer-grid {
            grid-template-columns: 1fr !important;
          }

          footer > div > div:last-child {
            gap: 12px !important;
          }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(13,80,104,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#0d5068" />
              <path
                d="M16 22s-7-4.5-7-9a4 4 0 017-2.65A4 4 0 0123 13c0 4.5-7 9-7 9z"
                fill="#4ade80"
              />
            </svg>

            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0d5068',
                letterSpacing: '-0.5px',
              }}
            >
              Waluma
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
            className="hidden md:flex"
          >
            <a
              href="#comment"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                textDecoration: 'none',
              }}
            >
              Comment ça marche
            </a>

            <a
              href="#soins"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                textDecoration: 'none',
              }}
            >
              Nos soins
            </a>

            <a
              href="#confiance"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                textDecoration: 'none',
              }}
            >
              Pourquoi nous
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/rejoindre"
              style={{
                backgroundColor: '#dcfce7',
                color: '#0d5068',
                fontSize: 14,
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 12,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Rejoindre Waluma
            </Link>

            <a
              href="#telecharger"
              style={{
                backgroundColor: '#0d5068',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: 12,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v13M8 11l4 4 4-4" />
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              Télécharger l'app
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          paddingTop: 100,
          paddingBottom: 80,
          background: 'linear-gradient(160deg, #061e28 0%, #0d5068 45%, #0a6b4a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '40px 24px 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <style>{`
            .hero-grid {
              grid-template-columns: 1fr 1fr;
            }

            @media(max-width:768px) {
              .hero-grid {
                grid-template-columns: 1fr;
              }

              .hero-map {
                display: none;
              }
            }
          `}</style>

          {/* Texte */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 100,
                padding: '6px 14px',
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#4ade80',
                  display: 'inline-block',
                }}
                className="dot-pulse"
              />

              <span
                style={{
                  color: '#4ade80',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Disponible à Dakar · Lancement imminent
              </span>
            </div>

            <h1
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.08,
                letterSpacing: '-2px',
                marginBottom: 20,
              }}
            >
              Des soins
              <br />
              <span style={{ color: '#4ade80' }}>à domicile,</span>
              <br />
              où vous êtes.
            </h1>

            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.62)',
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 440,
              }}
            >
              Waluma met en relation patients et professionnels de santé
              vérifiés pour des soins rapides et fiables directement chez
              vous à Dakar.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
              id="telecharger"
            >
              {/* Apple Store */}
              <a
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#fff',
                  color: '#0d5068',
                  padding: '14px 20px',
                  borderRadius: 16,
                  textDecoration: 'none',
                  minWidth: 160,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42z" />
                </svg>

                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#64748b',
                    }}
                  >
                    Disponible sur
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    App Store
                  </div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#fff',
                  color: '#0d5068',
                  padding: '14px 20px',
                  borderRadius: 16,
                  textDecoration: 'none',
                  minWidth: 160,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3.18 23.76c.38.2.82.2 1.21 0l10.76-6.17-2.4-2.4-9.57 8.57z" fill="#EA4335" />
                  <path d="M20.82 10.33L18.1 8.78l-2.69 2.7 2.69 2.7 2.74-1.57a1.55 1.55 0 000-2.28z" fill="#FBBC04" />
                  <path d="M3.18.24a1.55 1.55 0 00-.18.75v22.02c0 .27.07.52.18.75l9.75-9.76L3.18.24z" fill="#4285F4" />
                  <path d="M13.15 12L4.39.24l-.01-.01L3.18.24l9.57 11.76L15.41 9.3 13.15 12z" fill="#34A853" />
                  <path d="M4.38 23.77l.01-.01L13.15 12l2.26 2.71-11.03 9.06z" fill="#34A853" />
                </svg>

                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#64748b',
                    }}
                  >
                    Disponible sur
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    Google Play
                  </div>
                </div>
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 32,
                marginTop: 40,
              }}
            >
              {[
                { val: '6', label: 'spécialités médicales' },
                { val: '+30', label: 'praticiens vérifiés' },
                { val: '< 30 min', label: "temps d'intervention" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-1px',
                    }}
                  >
                    {s.val}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.45)',
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carte SVG Dakar */}
          <div
            style={{ position: 'relative' }}
            className="hero-map"
          >
            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: '#0a3f52',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                padding: 4,
              }}
            >
              <div
                style={{
                  padding: '12px 16px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#4ade80',
                    }}
                    className="dot-pulse"
                  />

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    Praticiens disponibles · Dakar
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.35)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}
                >
                  En direct
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  height: 280,
                }}
              >
                <MapDakar />

                {/* Carte praticien flottante */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 12,
                    backgroundColor: 'rgba(255,255,255,0.96)',
                    borderRadius: 14,
                    padding: '10px 14px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    minWidth: 160,
                    zIndex: 1000,
                  }}
                  className="float"
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                      }}
                    >
                      🩺
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        Dr. Amadou D.
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: '#64748b',
                        }}
                      >
                        Médecin généraliste
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        display: 'inline-block',
                      }}
                    />

                    <span
                      style={{
                        fontSize: 10,
                        color: '#22c55e',
                        fontWeight: 600,
                      }}
                    >
                      Disponible · 12 min
                    </span>
                  </div>
                </div>

                {/* Notification flottante */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    backgroundColor: '#0d5068',
                    borderRadius: 12,
                    padding: '8px 14px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    zIndex: 1000,
                  }}
                  className="float-2"
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: 'rgba(74,222,128,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    ✅
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      Praticien en route
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      Arrivée estimée 18 min
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {[
                  { n: '5', l: 'disponibles' },
                  { n: '2', l: 'en mission' },
                  { n: '< 20 min', l: 'temps moyen' },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{ textAlign: 'center' }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#4ade80',
                      }}
                    >
                      {s.n}
                    </div>

                    <div
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: 1,
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT CA MARCHE ── */}
      <section
        id="comment"
        style={{
          padding: '96px 24px',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-1.5px',
                marginBottom: 12,
              }}
            >
              En 4 étapes, un praticien chez vous.
            </h2>

            <p
              style={{
                fontSize: 17,
                color: '#64748b',
                maxWidth: 520,
              }}
            >
              Simple, rapide, fiable. Tout se passe dans l'application.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
            }}
            className="steps-grid"
          >
            <style>{`
              .steps-grid {
                grid-template-columns: repeat(4,1fr);
              }

              @media(max-width:768px) {
                .steps-grid {
                  grid-template-columns: repeat(2,1fr);
                  gap: 16px;
                }
              }
            `}</style>

            {[
              {
                num: 1,
                icon: '📍',
                titre: 'Choisissez votre soin',
                desc: 'Sélectionnez parmi 6 spécialités et décrivez votre besoin.',
              },
              {
                num: 2,
                icon: '⚡',
                titre: 'Praticien assigné',
                desc: 'Notre système trouve le meilleur professionnel disponible près de chez vous.',
              },
              {
                num: 3,
                icon: '🗺️',
                titre: 'Suivi en direct',
                desc: "Suivez l'arrivée de votre praticien sur la carte en temps réel.",
              },
              {
                num: 4,
                icon: '💳',
                titre: 'Paiement sécurisé',
                desc: 'Réglez après le soin via Wave, Orange Money ou Free Money.',
              },
            ].map((e, i) => (
              <div
                key={e.num}
                style={{
                  padding: '32px 28px',
                  borderLeft: i > 0 ? '1px solid #f1f5f9' : 'none',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 16,
                  }}
                >
                  {e.icon}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#22c55e',
                    marginBottom: 8,
                  }}
                >
                  Étape {e.num}
                </div>

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 8,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {e.titre}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}
                >
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS SOINS ── */}
      <section
        id="soins"
        style={{
          padding: '96px 24px',
          backgroundColor: '#f8fafc',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 64,
              alignItems: 'start',
            }}
            className="soins-grid"
          >
            <style>{`
              .soins-grid {
                grid-template-columns: 1fr 2fr;
              }

              @media(max-width:768px) {
                .soins-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>

            <div
              style={{
                position: 'sticky',
                top: 80,
              }}
            >
              <h2
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-1.5px',
                  marginBottom: 16,
                }}
              >
                6 spécialités, un seul appel.
              </h2>

              <p
                style={{
                  fontSize: 16,
                  color: '#64748b',
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Nos praticiens se déplacent directement à votre domicile,
                n'importe où à Dakar.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#22c55e',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Bientôt dans tout le Sénégal
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
              className="soins-cards"
            >
              <style>{`
                .soins-cards {
                  grid-template-columns: repeat(3,1fr);
                }

                @media(max-width:600px) {
                  .soins-cards {
                    grid-template-columns: repeat(2,1fr);
                  }
                }
              `}</style>

              {[
                {
                  icon: '💉',
                  label: 'Soins infirmiers',
                  prix: 'dès 8 000 F',
                  color: '#dbeafe',
                  desc: 'Pansements, injections, perfusions',
                },
                {
                  icon: '🩺',
                  label: 'Médecin généraliste',
                  prix: 'dès 15 000 F',
                  color: '#dcfce7',
                  desc: 'Consultation, diagnostic, prescription',
                },
                {
                  icon: '🧪',
                  label: 'Prélèvement',
                  prix: 'dès 5 000 F',
                  color: '#fef3c7',
                  desc: 'Prise de sang, analyses',
                },
                {
                  icon: '🤲',
                  label: 'Kinésithérapie',
                  prix: 'dès 12 000 F',
                  color: '#ede9fe',
                  desc: 'Rééducation, massages thérapeutiques',
                },
                {
                  icon: '🤱',
                  label: 'Sage-femme',
                  prix: 'dès 12 000 F',
                  color: '#fce7f3',
                  desc: 'Suivi grossesse, post-partum',
                },
                {
                  icon: '👶',
                  label: 'Pédiatre',
                  prix: 'dès 15 000 F',
                  color: '#e0f2fe',
                  desc: 'Consultation enfant, suivi développement',
                },
              ].map((sp) => (
                <div
                  key={sp.label}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: '20px 16px',
                    border: '1px solid #f1f5f9',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: sp.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      marginBottom: 12,
                    }}
                  >
                    {sp.icon}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: 4,
                    }}
                  >
                    {sp.label}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    {sp.desc}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0d5068',
                    }}
                  >
                    {sp.prix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p
            style={{
              fontSize: 12,
              color: '#94a3b8',
              marginTop: 24,
              textAlign: 'right',
            }}
          >
            + frais de déplacement selon la zone · Tarifs indicatifs, peuvent varier
          </p>
        </div>
      </section>

      {/* ── CONFIANCE ── */}
      <section
        id="confiance"
        style={{
          padding: '96px 24px',
          backgroundColor: '#0d5068',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-1.5px',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Conçu pour vous inspirer confiance.
          </h2>

          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              marginBottom: 56,
            }}
          >
            Chaque détail de Waluma est pensé pour votre sécurité et votre confort.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 20,
              overflow: 'hidden',
            }}
            className="valeurs-grid"
          >
            <style>{`
              .valeurs-grid {
                grid-template-columns: repeat(2,1fr);
              }

              @media(max-width:640px) {
                .valeurs-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>

            {[
              {
                icon: '🔍',
                titre: 'Praticiens vérifiés',
                desc: "Chaque professionnel passe par une vérification rigoureuse — diplômes, ordre professionnel, casier judiciaire — avant d'accéder à la plateforme.",
              },
              {
                icon: '⚡',
                titre: 'Réponse en moins de 30 min',
                desc: "Dès votre demande confirmée, un praticien qualifié est en route. 7j/7, pour les urgences comme pour le suivi régulier.",
              },
              {
                icon: '📋',
                titre: 'Dossier médical numérique',
                desc: "Chaque soin génère un compte rendu médical complet, conservé dans votre espace personnel et accessible à tout moment.",
              },
              {
                icon: '🔒',
                titre: 'Paiement après le soin',
                desc: "Vous payez uniquement après avoir reçu le soin. Via Wave, Orange Money ou Free Money — 100% sécurisé, aucune carte bancaire requise.",
              },
            ].map((v, i) => (
              <div
                key={v.titre}
                style={{
                  padding: '40px 36px',
                  backgroundColor:
                    i === 0 || i === 3
                      ? 'rgba(255,255,255,0.05)'
                      : 'transparent',
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 16,
                  }}
                >
                  {v.icon}
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 10,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {v.titre}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.7,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REJOINDRE WALUMA ── */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#f8fafc',
        }}
      >
        <div
          className="join-grid"
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0d5068 0%, #0a6b4a 100%)',
            borderRadius: 28,
            padding: '56px 48px',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 48,
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <style>{`
            .join-grid {
              grid-template-columns: 1.5fr 1fr;
            }

            @media(max-width:768px) {
              .join-grid {
                grid-template-columns: 1fr;
                padding: 40px 28px;
              }
            }
          `}</style>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 100,
                padding: '6px 14px',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#4ade80',
                }}
              />

              <span
                style={{
                  color: '#4ade80',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Professionnels de santé
              </span>
            </div>

            <h2
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1.2px',
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Vous êtes professionnel de santé ?
            </h2>

            <p
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.7,
                maxWidth: 560,
                marginBottom: 28,
              }}
            >
              Rejoignez Waluma et réalisez des missions de soins à domicile
              auprès de patients à Dakar. Remplissez simplement le formulaire
              et notre équipe vous répondra sous 72h maximum.
            </p>

            <Link
              href="/rejoindre"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: '#4ade80',
                color: '#064e3b',
                fontSize: 14,
                fontWeight: 800,
                padding: '14px 22px',
                borderRadius: 14,
                textDecoration: 'none',
              }}
            >
              Remplir le formulaire

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {[
              {
                icon: '📝',
                title: 'Remplissez le formulaire',
                desc: 'Quelques informations sur votre profil professionnel.',
              },
              {
                icon: '🔍',
                title: 'Votre demande est étudiée',
                desc: 'Notre équipe examine votre profil.',
              },
              {
                icon: '⚡',
                title: 'Réponse sous 72h',
                desc: 'Nous vous contactons après étude de votre demande.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: 12,
                    backgroundColor: 'rgba(74,222,128,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#fff',
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: '96px 24px',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 30,
            }}
          >
            💚
          </div>

          <h2
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-1.5px',
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            La santé ne devrait pas attendre.
          </h2>

          <p
            style={{
              fontSize: 17,
              color: '#64748b',
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            Téléchargez Waluma et prenez soin de vous et de vos proches,
            sans vous déplacer.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#0f172a',
                color: '#fff',
                padding: '16px 24px',
                borderRadius: 16,
                textDecoration: 'none',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42z" />
              </svg>

              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  Télécharger sur
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  App Store
                </div>
              </div>
            </a>

            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#0f172a',
                color: '#fff',
                padding: '16px 24px',
                borderRadius: 16,
                textDecoration: 'none',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M3.18 23.76c.38.2.82.2 1.21 0l10.76-6.17-2.4-2.4-9.57 8.57z" fill="#EA4335" />
                <path d="M20.82 10.33L18.1 8.78l-2.69 2.7 2.69 2.7 2.74-1.57a1.55 1.55 0 000-2.28z" fill="#FBBC04" />
                <path d="M3.18.24a1.55 1.55 0 00-.18.75v22.02c0 .27.07.52.18.75l9.75-9.76L3.18.24z" fill="#4285F4" />
                <path d="M13.15 12L4.39.24l-.01-.01L3.18.24l9.57 11.76L15.41 9.3 13.15 12z" fill="#34A853" />
                <path d="M4.38 23.77l.01-.01L13.15 12l2.26 2.71-11.03 9.06z" fill="#34A853" />
              </svg>

              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  Disponible sur
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Google Play
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          backgroundColor: '#040f1a',
          color: 'rgba(255,255,255,0.45)',
          padding: '56px 24px 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 40,
              marginBottom: 48,
            }}
            className="footer-grid"
          >
            <style>{`
              .footer-grid {
                grid-template-columns: 2fr 1fr 1fr 1fr;
              }

              @media(max-width:768px) {
                .footer-grid {
                  grid-template-columns: 1fr 1fr;
                  gap: 32px;
                }
              }
            `}</style>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <rect
                    width="32"
                    height="32"
                    rx="9"
                    fill="#0d5068"
                  />

                  <path
                    d="M16 22s-7-4.5-7-9a4 4 0 017-2.65A4 4 0 0123 13c0 4.5-7 9-7 9z"
                    fill="#4ade80"
                  />
                </svg>

                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  Waluma
                </span>
              </div>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  maxWidth: 260,
                  marginBottom: 20,
                }}
              >
                Des soins à domicile professionnels et rapides à Dakar.
                Bientôt dans tout le Sénégal et en Afrique.
              </p>

              {/* Réseaux sociaux */}
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                }}
              >
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.6)"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#fff"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.28-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98 0-3.259.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  aria-label="LinkedIn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.6)"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.227 0 22.225 0z" />
                  </svg>
                </a>

                {/* X */}
                <a
                  href="#"
                  aria-label="X"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.6)"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="#"
                  aria-label="TikTok"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.6)"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Soins */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Soins
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {[
                  'Soins infirmiers',
                  'Médecin généraliste',
                  'Prélèvement',
                  'Kinésithérapie',
                  'Sage-femme',
                  'Pédiatre',
                ].map((s) => (
                  <li key={s}>
                    <a
                      href="#soins"
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.45)',
                        textDecoration: 'none',
                      }}
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* App */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                App
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <li>
                  <a
                    href="#comment"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Comment ça marche
                  </a>
                </li>

                <li>
                  <a
                    href="#confiance"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Pourquoi Waluma
                  </a>
                </li>

                <li>
                  <Link
                    href="/rejoindre"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Rejoindre Waluma
                  </Link>
                </li>

                <li>
                  <a
                    href="#telecharger"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    App Store
                  </a>
                </li>

                <li>
                  <a
                    href="#telecharger"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Google Play
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Légal
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <li>
                  <a
                    href="mailto:contact@waluma.app"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    contact@waluma.app
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:support@waluma.app"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    support@waluma.app
                  </a>
                </li>

                <li style={{ marginTop: 8 }}>
                  <Link
                    href="/legal/cgu"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    CGU
                  </Link>
                </li>

                <li>
                  <Link
                    href="/legal/confidentialite"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Confidentialité
                  </Link>
                </li>

                <li>
                  <Link
                    href="/legal/mentions-legales"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Mentions légales
                  </Link>
                </li>

                <li>
                  <Link
                    href="/legal/cookies"
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                    }}
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12 }}>
              © {new Date().getFullYear()} Waluma · Dakar, Sénégal · Tous droits réservés
            </span>

            <span style={{ fontSize: 12 }}>
              Bientôt dans tout le Sénégal 🌍
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

