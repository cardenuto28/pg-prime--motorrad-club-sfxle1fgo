import React from 'react'

// Custom thin blue line-art icons that match the reference image EXACTLY (image-ce481.png)

// Benefit 1: Envelope/Mailbox icon with letter sticking out (Convênios e parcerias)
export const EnvelopeMailboxIcon: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Paper card coming out of top */}
    <rect x="8" y="3" width="16" height="12" rx="1.5" stroke="#0066FF" />
    <line x1="11" y1="6.5" x2="21" y2="6.5" strokeWidth="1.1" />
    <line x1="11" y1="9" x2="18" y2="9" strokeWidth="1.1" />

    {/* Envelope Body */}
    <rect x="3" y="11" width="26" height="17" rx="1.5" fill="#070e1b" stroke="#0066FF" />
    {/* Envelope Flap Lines */}
    <path d="M3 12l13 9 13-9" />
    <path d="M3 28l9-7" />
    <path d="M29 28l-9-7" />
  </svg>
)

// Benefit 2: Winding S-curve road icon (Viagens, Condições e descontos)
export const WindingRoadIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Outer right edge of road */}
    <path d="M28 4 C18 4, 10 9, 10 13 C10 17, 26 17, 26 21 C26 25, 16 28, 10 28" />
    {/* Outer left edge of road */}
    <path d="M22 4 C12 4, 4 9, 4 13 C4 17, 20 17, 20 21 C20 25, 10 28, 4 28" />
    {/* Dashed center lane markings */}
    <path
      d="M25 4 C15 4, 7 9, 7 13 C7 17, 23 17, 23 21 C23 25, 13 28, 7 28"
      strokeDasharray="2.5 2.5"
      strokeWidth="1.1"
    />
  </svg>
)

// Benefit 3: Spanner/Wrench diagonal icon (Pós-vendas)
export const SpannerWrenchIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Wrench body outline */}
    <path d="M20 4 C18 4, 16.5 5.5, 17 8 L7.5 17.5 C6.5 17, 5 17, 4 18 C2.5 19.5 2.5 22 4 23.5 C5.5 25 8 25 9.5 23.5 C10.5 22.5 10.5 21 10 20 L19.5 10.5 C22 11, 23.5 9.5, 23.5 7.5 Z" />
    {/* Open U jaw notch */}
    <path d="M23.5 7.5 L20 5.5 L18.5 8.5" />
    {/* Hole in handle tip */}
    <circle cx="6.5" cy="21.5" r="1.2" fill="#0066FF" stroke="none" />
  </svg>
)

// Benefit 4: Water drop with ripple waves icon (Lavagem da moto)
export const WaterDropRipplesIcon: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Teardrop shape */}
    <path d="M16 3 C16 3, 9 10, 9 14.5 C9 18.4, 12.1 21.5, 16 21.5 C19.9 21.5, 23 18.4, 23 14.5 C23 10, 16 3, 16 3 Z" />
    {/* Ripple wave 1 */}
    <path d="M4 24.5 C7 23, 10 26, 13 24.5 C16 23, 19 26, 22 24.5 C25 23, 28 26, 29 24.5" />
    {/* Ripple wave 2 */}
    <path d="M4 28 C7 26.5, 10 29.5, 13 28 C16 26.5, 19 29.5, 22 28 C25 26.5, 28 29.5, 29 28" />
  </svg>
)

// Benefit 5: Motorcycle helmet icon (Treinamentos com instrutores)
export const MotorcycleHelmetIcon: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Helmet outer shell profile facing left */}
    <path d="M25 21 C27 18.5, 27.5 15, 27.5 12 C27.5 5.5, 22 3.5, 15.5 3.5 C9 3.5, 3.5 7, 3.5 13.5 C3.5 18, 5.5 21.5, 9.5 24 C12.5 25.5, 17.5 26.5, 22.5 25.5 C25.5 25, 26.5 23, 25 21 Z" />
    {/* Visor shield cutout */}
    <path d="M4.5 13 H20.5 C22 13, 23 14.2, 23 16 C23 17.8, 22 19, 20.5 19 H9.5" />
    {/* Inner visor line */}
    <line x1="7.5" y1="16" x2="18.5" y2="16" strokeWidth="1.1" />
    {/* Chin vent */}
    <line x1="7.5" y1="22" x2="11.5" y2="22" />
  </svg>
)

// Benefit 6: Barber / Bottle / Shampoo / Dispenser icon (Ações e promoções na barbearia)
export const BarberSpecificIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="#0066FF"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Tall rectangular bottle body */}
    <rect x="10" y="10" width="12" height="17" rx="2" fill="#070e1b" />
    {/* Top pump nozzle */}
    <path d="M13 10 V6 C13 5.2, 13.8 4.5, 14.5 4.5 H17.5 C18.2 4.5, 19 5.2, 19 6 V10" />
    <path d="M14.5 4.5 H11.5 V7" />
    {/* Circle on body */}
    <circle cx="16" cy="18.5" r="2.5" />
    <circle cx="16" cy="18.5" r="1" fill="#0066FF" stroke="none" />
  </svg>
)
