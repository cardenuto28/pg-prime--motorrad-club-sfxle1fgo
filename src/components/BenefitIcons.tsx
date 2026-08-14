import React from 'react'

// Custom thin blue line-art icons that match the reference EXACTLY (image-f7935.png)

// Benefit 1: Envelope/Mailbox icon with paper sticking out (Convênios e parcerias)
export const EnvelopeMailboxIcon: React.FC<{ className?: string }> = ({
  className = 'w-7 h-7',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Envelope / Letter box */}
    <rect x="4" y="10" width="24" height="16" rx="1.5" />
    <path d="M4 11l12 9 12-9" />
    {/* Letter card peeking out top */}
    <path d="M9 10V6a1 1 0 011-1h12a1 1 0 011 1v4" />
    <line x1="12" y1="8" x2="20" y2="8" strokeWidth="1" />
  </svg>
)

// Benefit 2: Winding road/Path icon (Viagens, Condições e descontos)
export const WindingRoadIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Winding road S-curve line 1 */}
    <path d="M4 25c4 0 6-4 9-7s5-8 11-8" />
    {/* Winding road S-curve line 2 */}
    <path d="M8 28c4 0 6-4 9-7s5-8 11-8" />
    {/* Dash markings on road */}
    <line x1="8" y1="24" x2="9.5" y2="22.5" />
    <line x1="13.5" y1="18.5" x2="15" y2="17" />
    <line x1="19.5" y1="13" x2="21" y2="12" />
  </svg>
)

// Benefit 3: Spanner/Wrench diagonal icon (Pós-vendas)
export const SpannerWrenchIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Open ended wrench angled */}
    <path d="M22.5 5.5a5.5 5.5 0 01-3.6 8.3L8.2 24.5a2.5 2.5 0 11-3.5-3.5L15.4 10.3A5.5 5.5 0 0122.5 5.5z" />
    <path d="M22 6l2.5 2.5" />
    <path d="M18.5 9.5l1.5-1.5" />
  </svg>
)

// Benefit 4: Water drop with ripples icon (Lavagem da moto)
export const WaterDropRipplesIcon: React.FC<{ className?: string }> = ({
  className = 'w-7 h-7',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Water drop */}
    <path d="M16 4s-7 8-7 12a7 7 0 0014 0c0-4-7-12-7-12z" />
    {/* Water wave ripple 1 */}
    <path d="M5 25c3-1 5 1 8 0s5-1 8 0 5 1 6 0" />
    {/* Water wave ripple 2 */}
    <path d="M3 28c3.5-1 6 1 9.5 0s6-1 9.5 0 5 1 7 0" />
  </svg>
)

// Benefit 5: Motorcycle helmet icon (Treinamentos com instrutores)
export const MotorcycleHelmetIcon: React.FC<{ className?: string }> = ({
  className = 'w-7 h-7',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Outer Helmet Dome */}
    <path d="M6 18c0-6 4.5-12 11-12s11 6 11 12c0 3-1.5 5-3.5 6.5C22.5 26 19.5 27 16 27c-5.5 0-10-3.5-10-9z" />
    {/* Visor Area */}
    <path d="M10 16h13c1.5 0 2.5 1 2.5 2.5S24.5 21 23 21H10V16z" />
    {/* Air vent / Detail */}
    <path d="M7 21h2" />
  </svg>
)

// Benefit 6: Barber / Bottle / Razor icon (Ações e promoções na bandeira / Barbearia)
export const BarberSpecificIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Barber bottle / Barber pole icon matching reference */}
    <rect x="11" y="10" width="10" height="17" rx="3" />
    <path d="M13 10V6a1 1 0 011-1h4a1 1 0 011 1v4" />
    <circle cx="16" cy="18.5" r="2" />
    <path d="M16 14v1" />
    <path d="M16 22v1" />
  </svg>
)
