import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PdfHeaderOptions {
  title: string
  subtitle?: string
  generatedAt?: string
}

/**
 * Creates and formats a standard Euro Motors Motorrad Club PDF with brand colors,
 * header, generated date and footer.
 */
export function createEuroMotorsPdf(options: PdfHeaderOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  return doc
}

export function drawClubHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Top header bar (dark premium blue #0a1120 with #0066FF accent)
  doc.setFillColor(10, 17, 32)
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setFillColor(0, 102, 255)
  doc.rect(0, 28, pageWidth, 1.5, 'F')

  // Logo / Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('EURO MOTORS MOTORRAD CLUB', 14, 12)

  // Subtitle / Brand slogan
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('OFICIAL MOTORRAD COMMUNITY · SÃO JOSÉ DO RIO PRETO', 14, 18)

  // Date on top right
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeFormatted = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text(`Gerado em: ${dateFormatted} às ${timeFormatted}`, pageWidth - 14, 15, {
    align: 'right',
  })

  // Document Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text(title.toUpperCase(), 14, 38)

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(subtitle, 14, 43)
  }
}

export function drawClubFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Thin separator line
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('Euro Motors Motorrad Club — Documento Oficial', 14, pageHeight - 9)

    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 9, {
      align: 'right',
    })
  }
}

/**
 * 1. Export Members List to PDF
 */
export function exportMembersPdf(members: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Top header
  doc.setFillColor(10, 17, 32)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(0, 102, 255)
  doc.rect(0, 28, pageWidth, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('EURO MOTORS MOTORRAD CLUB', 14, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('RELATÓRIO GERAL DE MEMBROS CADASTRADOS', 14, 18)

  const now = new Date()
  doc.text(
    `Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`,
    pageWidth - 14,
    15,
    { align: 'right' },
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(`LISTA DE MEMBROS (${members.length} REGISTROS)`, 14, 37)

  const tableHead = [
    ['#', 'Nome', 'E-mail', 'Telefone', 'Cidade', 'Motocicleta', 'Chassi', 'Status'],
  ]

  const tableBody = members.map((m, idx) => [
    idx + 1,
    m.name || '—',
    m.email || '—',
    m.phone || '—',
    m.city || '—',
    [m.bike_brand, m.bike_model, m.bike_year].filter(Boolean).join(' ') || '—',
    m.bike_chassi || '—',
    (m.status || 'ativo').toUpperCase(),
  ])

  autoTable(doc, {
    startY: 42,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  doc.save(`euro-motors-membros-${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 2. Export Ride Registrations & Check-ins to PDF
 */
export function exportRideRegistrationsPdf(ride: any, regs: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Top header
  doc.setFillColor(10, 17, 32)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(0, 102, 255)
  doc.rect(0, 28, pageWidth, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('EURO MOTORS MOTORRAD CLUB', 14, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('LISTA OFICIAL DE INSCRIÇÕES E CHECK-IN DO PASSEIO', 14, 18)

  const now = new Date()
  doc.text(
    `Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`,
    pageWidth - 14,
    15,
    { align: 'right' },
  )

  const confirmed = regs.filter((r) => r.status === 'confirmada')
  const checkedIn = confirmed.filter((r) => r.checked_in)
  const totalBikes = confirmed.length
  const totalPeople = confirmed.reduce((acc, r) => acc + (r.has_pillion ? 2 : 1), 0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(ride.name.toUpperCase(), 14, 37)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(
    `Data: ${ride.date || '—'} · Destino: ${ride.destination || '—'} · Confirmados: ${checkedIn.length}/${totalBikes} motos (${totalPeople} participantes)`,
    14,
    42,
  )

  const tableHead = [
    [
      '#',
      'Participante',
      'Tipo',
      'Telefone',
      'Moto',
      'Garupa',
      'Presença (Check-in)',
      'Pagamento',
      'Status',
    ],
  ]

  const tableBody = regs.map((reg, idx) => {
    const isGuest = reg.is_guest || !reg.user
    const u = reg.expand?.user
    const name = isGuest ? reg.guest_name || 'Não-Membro' : u?.name || '—'
    const phone = isGuest ? reg.guest_phone || '—' : u?.phone || '—'
    const bike = isGuest
      ? [reg.guest_bike_brand, reg.guest_bike_model].filter(Boolean).join(' ') || '—'
      : [u?.bike_brand, u?.bike_model].filter(Boolean).join(' ') || '—'

    const checkInStatus = reg.checked_in
      ? `PRESENTE (${reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sim'})`
      : 'AGUARDANDO'

    const payment = reg.payment_status === 'pago' ? 'PAGO' : 'PENDENTE'

    return [
      idx + 1,
      name,
      isGuest ? 'NÃO-MEMBRO' : 'MEMBRO',
      phone,
      bike,
      reg.has_pillion ? `Sim (${reg.pillion_name || '—'})` : 'Não',
      checkInStatus,
      payment,
      (reg.status || '').toUpperCase(),
    ]
  })

  autoTable(doc, {
    startY: 47,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      6: { fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  doc.save(
    `inscritos-${(ride.name || 'passeio')
      .toLowerCase()
      .replace(/\s+/g, '-')}-${now.toISOString().slice(0, 10)}.pdf`,
  )
}

/**
 * 3. Export Active Members Ranking to PDF
 */
export function exportActiveRankingPdf(ranking: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Top header
  doc.setFillColor(10, 17, 32)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(0, 102, 255)
  doc.rect(0, 28, pageWidth, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('EURO MOTORS MOTORRAD CLUB', 14, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('RANKING OFICIAL DE MEMBROS MAIS ATIVOS', 14, 18)

  const now = new Date()
  doc.text(
    `Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`,
    pageWidth - 14,
    15,
    { align: 'right' },
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text('TROFÉU PILOTO FREQUENTE · RANKING DE PRESENÇA', 14, 37)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('Classificação baseada em check-ins confirmados nos passeios oficiais', 14, 42)

  const tableHead = [
    ['Pos', 'Membro', 'Motocicleta', 'Compareceu', 'Inscrito', 'Taxa', 'Último Passeio'],
  ]

  const tableBody = ranking.map((item, idx) => [
    `${idx + 1}º`,
    item.user.name || '—',
    item.bikeLabel || '—',
    `${item.totalAttended} passeios`,
    `${item.totalRegistered}`,
    `${item.rate}%`,
    item.lastRideName || '—',
  ])

  autoTable(doc, {
    startY: 47,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      3: { fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  doc.save(`ranking-membros-mais-ativos-${now.toISOString().slice(0, 10)}.pdf`)
}
