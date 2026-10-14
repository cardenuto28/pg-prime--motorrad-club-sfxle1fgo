import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calcularEstatisticasMotosPorCategoria, CategoryBikeStats } from '@/lib/membership'

interface PdfHeaderOptions {
  title: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Creates and formats a standard PG PRIME Club PDF with brand colors,
 * header, generated date and footer.
 */
export function createEuroMotorsPdf(options: PdfHeaderOptions): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
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
  doc.text('PG PRIME CLUB', 14, 12)

  // Subtitle / Brand slogan
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('OFICIAL MOTORRAD COMMUNITY · PG PRIME', 14, 18)

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
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(title.toUpperCase(), 14, 38)

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text(subtitle, 14, 43)
  }
}

export function drawClubFooter(doc: jsPDF) {
  try {
    const pageCount =
      typeof (doc as any).getNumberOfPages === 'function'
        ? (doc as any).getNumberOfPages()
        : (doc as any).internal?.getNumberOfPages?.() || 1
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
      doc.text('PG PRIME Club — Documento Oficial', 14, pageHeight - 9)

      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 9, {
        align: 'right',
      })
    }
  } catch (err) {
    console.error('[drawClubFooter] Erro ao desenhar rodapé nas páginas:', err)
  }
}

/**
 * Export Complete Administrator Manual to PDF
 */
export function exportAdminManualPdf() {
  console.info('[exportAdminManualPdf] Iniciando geração do Manual do Administrador...')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2
  let cursorY = 40

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - 20) {
      doc.addPage()
      drawManualPageHeader(doc)
      cursorY = 36
    }
  }

  function drawManualPageHeader(targetDoc: jsPDF) {
    try {
      const pWidth = targetDoc.internal.pageSize.getWidth()
      targetDoc.setFillColor(10, 17, 32)
      targetDoc.rect(0, 0, pWidth, 22, 'F')
      targetDoc.setFillColor(0, 102, 255)
      targetDoc.rect(0, 22, pWidth, 1.2, 'F')

      targetDoc.setFont('helvetica', 'bold')
      targetDoc.setFontSize(11)
      targetDoc.setTextColor(255, 255, 255)
      targetDoc.text('PG PRIME CLUB', 14, 11)

      targetDoc.setFont('helvetica', 'normal')
      targetDoc.setFontSize(8)
      targetDoc.setTextColor(148, 163, 184)
      targetDoc.text('MANUAL DO ADMINISTRADOR', 14, 17)

      const now = new Date()
      const dateFormatted = now.toLocaleDateString('pt-BR')
      targetDoc.text(`Atualizado em: ${dateFormatted}`, pWidth - 14, 14, { align: 'right' })
    } catch (headerErr) {
      console.error('[exportAdminManualPdf] Erro em drawManualPageHeader:', headerErr)
    }
  }

  // First page main header
  try {
    doc.setFillColor(10, 17, 32)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setFillColor(0, 102, 255)
    doc.rect(0, 30, pageWidth, 1.8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('PG PRIME CLUB', 14, 12)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 102, 255)
    doc.text('MANUAL DO ADMINISTRADOR', 14, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text('Guia Completo de Operação, Gestão de Membros, Pontuação e Painel', 14, 24)

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
    doc.setFontSize(7.5)
    doc.setTextColor(203, 213, 225)
    doc.text(`Gerado em: ${dateFormatted} às ${timeFormatted}`, pageWidth - 14, 16, {
      align: 'right',
    })
    doc.text('Versão Oficial do Sistema', pageWidth - 14, 22, { align: 'right' })
  } catch (firstHeaderErr) {
    console.error('[exportAdminManualPdf] Erro no cabeçalho inicial:', firstHeaderErr)
  }

  cursorY = 40

  const addSectionTitle = (title: string) => {
    try {
      ensureSpace(14)
      doc.setFillColor(15, 23, 42)
      doc.rect(margin, cursorY - 4, contentWidth, 8, 'F')
      doc.setFillColor(0, 102, 255)
      doc.rect(margin, cursorY - 4, 2.5, 8, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text(title, margin + 6, cursorY + 1.5)
      cursorY += 9
    } catch (err) {
      console.error(`[exportAdminManualPdf] Erro em addSectionTitle (${title}):`, err)
      cursorY += 10
    }
  }

  const addSubSection = (title: string) => {
    try {
      ensureSpace(10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(0, 102, 255)
      doc.text(title, margin, cursorY)
      cursorY += 5
    } catch (err) {
      console.error(`[exportAdminManualPdf] Erro em addSubSection (${title}):`, err)
      cursorY += 6
    }
  }

  const addParagraph = (text: string) => {
    try {
      ensureSpace(8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(51, 65, 85)
      const lines = doc.splitTextToSize(text, contentWidth)
      lines.forEach((line: string) => {
        ensureSpace(5)
        doc.text(line, margin, cursorY)
        cursorY += 4.2
      })
      cursorY += 1.5
    } catch (err) {
      console.error('[exportAdminManualPdf] Erro em addParagraph:', err)
      cursorY += 5
    }
  }

  const addBullet = (boldPrefix: string, text: string) => {
    try {
      ensureSpace(6)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(30, 41, 59)
      doc.text(`• ${boldPrefix}:`, margin + 2, cursorY)
      const prefixWidth = doc.getTextWidth(`• ${boldPrefix}: `)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      const remainingWidth = contentWidth - prefixWidth - 2
      const lines = doc.splitTextToSize(text, remainingWidth)
      if (lines.length > 0) {
        doc.text(lines[0], margin + 2 + prefixWidth, cursorY)
        cursorY += 4.2
        for (let k = 1; k < lines.length; k++) {
          ensureSpace(5)
          doc.text(lines[k], margin + 6, cursorY)
          cursorY += 4.2
        }
      } else {
        cursorY += 4.2
      }
    } catch (err) {
      console.error(`[exportAdminManualPdf] Erro em addBullet (${boldPrefix}):`, err)
      cursorY += 5
    }
  }

  const addTable = (
    head: string[][],
    body: (string | number)[][],
    colWidths?: { [key: number]: number },
    tableName?: string,
  ) => {
    ensureSpace(20)
    try {
      const autoTableFn: any =
        typeof autoTable === 'function'
          ? autoTable
          : (doc as any).autoTable
            ? (doc as any).autoTable.bind(doc)
            : null

      if (autoTableFn) {
        autoTableFn(doc, {
          startY: cursorY,
          head,
          body,
          theme: 'grid',
          headStyles: {
            fillColor: [10, 17, 32],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
            cellPadding: 2,
          },
          bodyStyles: {
            fontSize: 7,
            textColor: [30, 41, 59],
            cellPadding: 2,
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          columnStyles: colWidths
            ? Object.fromEntries(Object.entries(colWidths).map(([k, v]) => [k, { cellWidth: v }]))
            : {},
          margin: { left: margin, right: margin, bottom: 20 },
          didDrawPage: (data: any) => {
            if (data && data.pageNumber > 1) {
              drawManualPageHeader(doc)
            }
          },
        })

        const lastTable = (doc as any).lastAutoTable
        if (lastTable && typeof lastTable.finalY === 'number') {
          cursorY = lastTable.finalY + 5
          return
        }
      }
      cursorY += (body.length + 1) * 6 + 5
    } catch (tableErr) {
      console.error(
        `[exportAdminManualPdf] Falha ao renderizar autoTable ${tableName || ''}:`,
        tableErr,
      )
    }
  }

  // Manual sections
  addSectionTitle('1. ACESSO AO PAINEL ADMINISTRATIVO')
  addParagraph('1. Acesse: https://pgprime.club')
  addParagraph('2. Faça login com seu e-mail e senha de administrador.')
  addParagraph('3. No menu superior ou lateral, clique em Admin -> Dashboard.')
  addParagraph('Perfis de administrador cadastrados no sistema:')
  addTable(
    [['Nome', 'E-mail']],
    [
      ['Ricardo PG PRIME', 'ricardo@pgprime.club'],
      ['ADAUTO SAMPAIO', 'eventos@pgprime.club'],
    ],
    undefined,
    'Perfis de Admin',
  )

  addSectionTitle('2. GESTÃO DE MEMBROS & 14 ETAPAS DE IMPORTAÇÃO')
  addParagraph('Caminho no painel: Admin → Membros')
  addSubSection('2.1 Buscar e filtrar')
  addBullet(
    'Barra de pesquisa',
    'Localize por nome completo, CPF/CNPJ, e-mail, telefone ou cidade.',
  )
  addBullet(
    'Filtros disponíveis',
    'Categoria (Bronze / Prata / Gold / Platinum), Status (Ativo / Pendente / Inativo / Bloqueado / Pré-cadastrado), Nível de Relacionamento e Tags Inteligentes.',
  )

  addSectionTitle('3. SCORE DE OFICINA (0 A 100 PONTOS) & RELACIONAMENTO')
  addParagraph(
    'Conceito: O Score é INDEPENDENTE da Categoria. Categoria mede histórico de compra; Score mede intensidade de relacionamento com a oficina.',
  )

  try {
    drawClubFooter(doc)
    doc.save('Manual_Admin_PGPRIME_Club.pdf')
  } catch (saveErr) {
    console.error('[exportAdminManualPdf] Erro ao salvar:', saveErr)
  }
}

/**
 * 1. Export Members List to PDF (Formatted table with Category, Score, Contact info)
 */
export function exportMembersPdf(members: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // 1. Título e cabeçalho do relatório
  drawClubHeader(
    doc,
    `Relatório Geral de Membros e Distribuição de Motos (${members.length} registros)`,
    'Métricas por categoria, distribuição e ranking de motos compradas por cliente',
  )

  // 2. Seção de Distribuição de Motos e Ranking de Compradores por Categoria
  const catStats = calcularEstatisticasMotosPorCategoria(members)
  const categoriesToReport: ('PLATINUM' | 'GOLD' | 'PRATA' | 'BRONZE')[] = [
    'PLATINUM',
    'GOLD',
    'PRATA',
    'BRONZE',
  ]

  let currentY = 47

  // Tabela Resumo da Distribuição de Motos por Categoria
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('1. RESUMO DA DISTRIBUIÇÃO E SOMATÓRIA DE MOTOS POR CATEGORIA', 14, currentY)

  const distSummaryHead = [
    [
      'Categoria',
      'Total Membros',
      'Total Motos Compradas',
      'Distribuição de Clientes por Qtd. de Motos',
    ],
  ]

  const distSummaryBody = categoriesToReport.map((catKey) => {
    const s = catStats[catKey]
    const distText =
      s.bikeDistribution.length > 0
        ? s.bikeDistribution.map((d) => `${d.count} cliente(s) com ${d.bikes} moto(s)`).join(' | ')
        : 'Nenhum membro'

    return [s.label, s.totalMembers, s.totalBikes, distText]
  })

  autoTable(doc, {
    startY: currentY + 3,
    head: distSummaryHead,
    body: distSummaryBody,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { fontStyle: 'bold', textColor: [0, 102, 255] },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  currentY = (doc as any).lastAutoTable?.finalY || 80

  // 3. Ranking dos Maiores Compradores por Categoria (Top Compradores)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('2. RANKING DOS MAIORES COMPRADORES POR CATEGORIA (TOP MOTOS)', 14, currentY + 8)

  const buyerRankingHead = [
    [
      '#',
      'Categoria',
      'Cliente / Razão Social',
      'CPF/CNPJ',
      'Cidade',
      'Motos Compradas',
      'Total Vendido (R$)',
      'Modelo Principal',
    ],
  ]

  const buyerRankingRows: (string | number)[][] = []
  categoriesToReport.forEach((catKey) => {
    const s = catStats[catKey]
    s.topBuyers.forEach((b, idx) => {
      buyerRankingRows.push([
        idx + 1,
        catKey,
        b.name,
        b.cpf || '—',
        b.city || '—',
        b.motos,
        b.totalValor > 0
          ? b.totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : '—',
        b.bikeModel || '—',
      ])
    })
  })

  autoTable(doc, {
    startY: currentY + 11,
    head: buyerRankingHead,
    body:
      buyerRankingRows.length > 0
        ? buyerRankingRows
        : [['—', '—', 'Nenhum comprador registrado', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      1: { fontStyle: 'bold' },
      5: { fontStyle: 'bold', textColor: [0, 102, 255] },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  // 4. Nova Página: Listagem Completa de Membros
  doc.addPage()
  drawClubHeader(
    doc,
    `3. Listagem Geral Completa de Membros (${members.length} registros)`,
    'Contatos, categoria, score de oficina, motos e status do cadastro',
  )

  const tableHead = [
    [
      '#',
      'Nome',
      'CPF/CNPJ',
      'E-mail',
      'Telefone',
      'Cidade',
      'Categoria',
      'Qtd. Motos',
      'Score',
      'Moto Cadastrada',
      'Status',
    ],
  ]

  const tableBody = members.map((m, idx) => [
    idx + 1,
    m.name || '—',
    m.cpf || '—',
    m.email || '—',
    m.phone || '—',
    m.city || '—',
    (m.categoria || m.category || 'BRONZE').toUpperCase(),
    Number(m.quantidade_motos_compradas || 0),
    m.score_oficina !== undefined && m.score_oficina !== null ? `${m.score_oficina}/100` : '—',
    [m.bike_brand, m.bike_model].filter(Boolean).join(' ') || '—',
    (m.status || 'ativo').toUpperCase(),
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
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      6: { fontStyle: 'bold' },
      7: { fontStyle: 'bold', textColor: [0, 102, 255] },
      8: { fontStyle: 'bold', textColor: [16, 185, 129] },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`pgprime-membros-distribuicao-${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 2. Export Admin Dashboard Metrics to PDF
 */
export function exportDashboardPdf(
  stats: any,
  activeRanking: any[] = [],
  bikeCategoryStats?: Record<'PLATINUM' | 'GOLD' | 'PRATA' | 'BRONZE', CategoryBikeStats>,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    'Relatório Executivo do Painel (Dashboard)',
    'Indicadores gerais, distribuição de motos por categoria e top compradores',
  )

  const summaryHead = [['Indicador Principal', 'Valor Registrado']]
  const summaryBody = [
    ['Total de Membros Cadastrados', String(stats.totalMembers ?? 0)],
    ['Novos Membros (últimos 30 dias)', String(stats.newMembers ?? 0)],
    ['Membros com Status Ativo', String(stats.activeMembers ?? 0)],
    ['Total de Passeios Realizados', String(stats.ridesDone ?? 0)],
    ['Categoria: Platinum (5+ motos)', String(stats.platinumCount ?? 0)],
    ['Categoria: Gold (3-4 motos)', String(stats.goldCount ?? 0)],
    ['Categoria: Prata (1-2 motos)', String(stats.silverCount ?? 0)],
    ['Categoria: Bronze Ativos', String(stats.bronzeActiveCount ?? 0)],
    ['Categoria: Bronze Atenção', String(stats.bronzeExpiringCount ?? 0)],
    ['Categoria: Bronze Inativos', String(stats.bronzeInactiveCount ?? 0)],
    [
      'Score Médio de Oficina',
      stats.scoreMembersCount > 0 ? `${stats.scoreMedio.toFixed(1)} / 100` : '—',
    ],
    ['Clientes com Score 85+ (Alto Valor)', String(stats.scoreHigh85Count ?? 0)],
    ['VIP Ativos (Gold/Plat + Score >=70)', String(stats.vipAtivoCount ?? 0)],
    ['VIP Afastados (Gold/Plat + Score <30)', String(stats.vipAfastadoCount ?? 0)],
    ['Próximos do Gold (Prata c/ 2 motos)', String(stats.proximoGoldCount ?? 0)],
    ['Próximos do Platinum (Gold c/ 4 motos)', String(stats.proximoPlatinumCount ?? 0)],
    ['Primeira Passagem Pendente', String(stats.primeiraPassagemPendenteCount ?? 0)],
  ]

  autoTable(doc, {
    startY: 47,
    head: summaryHead,
    body: summaryBody,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  // Seção de Distribuição de Motos por Categoria
  const bStats = bikeCategoryStats || stats.bikeCategoryStats
  if (bStats) {
    const finalY1 = (doc as any).lastAutoTable?.finalY || 160
    let startCatY = finalY1 + 8

    if (startCatY > 220) {
      doc.addPage()
      drawClubHeader(
        doc,
        'Distribuição de Motos por Categoria',
        'Detalhamento de clientes por quantidade de motos',
      )
      startCatY = 47
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('DISTRIBUIÇÃO DE MOTOS POR CATEGORIA (SOMATÓRIA)', 14, startCatY)

    const catDistHead = [
      ['Categoria', 'Clientes', 'Motos Totais', 'Distribuição de Clientes por Qtd. de Motos'],
    ]
    const catDistBody = (['PLATINUM', 'GOLD', 'PRATA', 'BRONZE'] as const).map((key) => {
      const s = bStats[key]
      const distFormatted =
        s.bikeDistribution.length > 0
          ? s.bikeDistribution.map((d) => `${d.count} cliente(s) c/ ${d.bikes} moto(s)`).join(' | ')
          : '—'
      return [s.label, s.totalMembers, s.totalBikes, distFormatted]
    })

    autoTable(doc, {
      startY: startCatY + 3,
      head: catDistHead,
      body: catDistBody,
      theme: 'grid',
      headStyles: {
        fillColor: [10, 17, 32],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { fontStyle: 'bold', textColor: [0, 102, 255] },
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })

    // Ranking dos Maiores Compradores por Categoria
    const finalY2 = (doc as any).lastAutoTable?.finalY || 200
    let startRankingY = finalY2 + 8

    if (startRankingY > 220) {
      doc.addPage()
      drawClubHeader(
        doc,
        'Ranking dos Maiores Compradores por Categoria',
        'Clientes que mais compraram motos em cada categoria',
      )
      startRankingY = 47
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('RANKING DOS MAIORES COMPRADORES POR CATEGORIA', 14, startRankingY)

    const catRankHead = [
      ['#', 'Categoria', 'Cliente', 'Cidade', 'Motos Compradas', 'Total Vendido'],
    ]
    const catRankBody: (string | number)[][] = []

    ;(['PLATINUM', 'GOLD', 'PRATA', 'BRONZE'] as const).forEach((k) => {
      const s = bStats[k]
      s.topBuyers.slice(0, 5).forEach((buyer, idx) => {
        catRankBody.push([
          idx + 1,
          k,
          buyer.name,
          buyer.city || '—',
          buyer.motos,
          buyer.totalValor > 0
            ? buyer.totalValor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              })
            : '—',
        ])
      })
    })

    autoTable(doc, {
      startY: startRankingY + 3,
      head: catRankHead,
      body: catRankBody.length > 0 ? catRankBody : [['—', '—', 'Nenhum comprador', '—', '—', '—']],
      theme: 'striped',
      headStyles: {
        fillColor: [10, 17, 32],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        1: { fontStyle: 'bold' },
        4: { fontStyle: 'bold', textColor: [0, 102, 255] },
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })
  }

  if (activeRanking && activeRanking.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180
    let startActiveY = finalY + 8
    if (startActiveY > 220) {
      doc.addPage()
      drawClubHeader(
        doc,
        'Ranking de Presença e Pontos',
        'Membros mais ativos em passeios e visitas',
      )
      startActiveY = 47
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('TOP MEMBROS (RANKING DE PRESENÇA E PONTOS)', 14, startActiveY)

    const rankHead = [['Pos', 'Nome', 'Categoria', 'Passeios', 'Visitas', 'Pontos Totais']]
    const rankBody = activeRanking.map((item, idx) => [
      `${idx + 1}º`,
      item.user?.name || item.name || '—',
      (item.category || item.user?.categoria || 'SILVER').toUpperCase(),
      item.totalAttended ?? item.attendedCount ?? 0,
      item.storeVisitsCount ?? 0,
      `${item.totalPoints ?? 0} PTS`,
    ])

    autoTable(doc, {
      startY: startActiveY + 3,
      head: rankHead,
      body: rankBody,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 17, 32],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        5: { fontStyle: 'bold', textColor: [0, 102, 255] },
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })
  }

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`pgprime-dashboard-${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 3. Export Import Logs History to PDF
 */
export function exportImportLogsPdf(logs: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    `Histórico de Importações de Membros (${logs.length} registros)`,
    'Auditoria de planilhas processadas com registros criados, atualizados e falhas',
  )

  const tableHead = [
    ['#', 'Arquivo', 'Data / Hora', 'Linhas', 'Criados', 'Atualizados', 'Erros', 'Status'],
  ]

  const tableBody = logs.map((l, idx) => {
    let errCount = 0
    try {
      if (l.erros) {
        const parsed = JSON.parse(l.erros)
        errCount = Array.isArray(parsed) ? parsed.length : 0
      }
    } catch {
      errCount = 0
    }

    const dataFormatted = l.data
      ? new Date(l.data).toLocaleDateString('pt-BR')
      : l.created
        ? new Date(l.created).toLocaleDateString('pt-BR')
        : '—'

    return [
      idx + 1,
      l.nome_arquivo || '—',
      `${dataFormatted} ${l.hora || ''}`,
      l.linhas_processadas ?? 0,
      l.clientes_criados ?? 0,
      l.clientes_atualizados ?? 0,
      errCount,
      (l.status || 'CONCLUIDO').toUpperCase(),
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
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      4: { textColor: [16, 185, 129], fontStyle: 'bold' },
      5: { textColor: [0, 102, 255], fontStyle: 'bold' },
      6: { textColor: [239, 68, 68] },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`historico-importacoes-${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 4. Export Individual 360 Member Profile to PDF
 */
export function exportMemberProfilePdf(user: any, metricas: any[] = [], rides: any[] = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    `Ficha 360º: ${(user.name || 'Membro').toUpperCase()}`,
    `CPF: ${user.cpf || '—'} · Categoria: ${(user.categoria || user.category || 'BRONZE').toUpperCase()} · Score: ${user.score_oficina ?? 0}/100`,
  )

  const formatBRL = (v: number) =>
    (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const profileHead = [['Campo / Indicador', 'Informação Registrada']]
  const profileBody = [
    ['Nome Completo', user.name || '—'],
    ['CPF / CNPJ', user.cpf || '—'],
    ['E-mail', user.email || '—'],
    ['Telefone / WhatsApp', user.phone || '—'],
    ['Cidade / UF', user.city || '—'],
    ['Categoria no Clube', (user.categoria || user.category || 'BRONZE').toUpperCase()],
    ['Status de Cadastro', (user.status || 'ativo').toUpperCase()],
    [
      'Score de Oficina',
      `${user.score_oficina ?? 0}/100 (Valor: ${user.score_valor_oficina ?? 0}/70, Freq: ${user.score_frequencia ?? 0}/30)`,
    ],
    ['Nível de Relacionamento', user.nivel_relacionamento || '—'],
    ['Próxima Melhor Ação', user.proxima_melhor_acao || 'SEM AÇÃO'],
    [
      'Moto Cadastrada',
      [user.bike_brand, user.bike_model, user.bike_year].filter(Boolean).join(' ') || '—',
    ],
    ['Chassi da Moto', user.bike_chassi || '—'],
    ['Nome do Garupa', user.pillion_name || '—'],
    ['Telefone do Garupa', user.pillion_phone || '—'],
    ['Veículos Elegíveis', String(user.total_veiculos_elegiveis ?? 0)],
    ['Qtd. Motos Compradas', String(user.quantidade_motos_compradas ?? 0)],
    ['Total Valor Vendido', formatBRL(user.total_valor_vendido ?? 0)],
    ['Nº Passagens Oficina', String(user.numero_passagens_oficina ?? 0)],
    ['Total Líquido Oficina', formatBRL(user.total_liquido_oficina ?? 0)],
    [
      'Data Última Compra',
      user.data_primeira_compra ? String(user.data_primeira_compra).slice(0, 10) : '—',
    ],
    [
      'Data Última Oficina',
      user.data_ultima_passagem_oficina
        ? String(user.data_ultima_passagem_oficina).slice(0, 10)
        : '—',
    ],
    ['Meses Desde Última Oficina', String(user.meses_desde_ultima_passagem ?? 0)],
    ['Dias Desde Venda', String(user.dias_desde_venda ?? 0)],
  ]

  autoTable(doc, {
    startY: 47,
    head: profileHead,
    body: profileBody,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 17, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
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

  // Table with rides history & KM Atual
  if (rides && rides.length > 0) {
    const finalY1 = (doc as any).lastAutoTable?.finalY || 180
    if (finalY1 > 210) {
      doc.addPage()
      drawClubHeader(
        doc,
        `Histórico de Passeios: ${(user.name || 'Membro').toUpperCase()}`,
        'Participações e KM Atual registrado nas inscrições',
      )
    }

    const startRidesY = finalY1 > 210 ? 47 : finalY1 + 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('HISTÓRICO DE PASSEIOS E QUILOMETRAGEM (KM ATUAL)', 14, startRidesY)

    const ridesHead = [['#', 'Passeio', 'Data', 'KM Atual', 'Garupa', 'Check-in', 'Status']]

    const ridesBody = rides.map((r, idx) => [
      idx + 1,
      (r.expand?.ride?.name || 'Passeio').toUpperCase(),
      r.expand?.ride?.date ? String(r.expand.ride.date).slice(0, 10) : '—',
      r.km_atual != null ? `${Number(r.km_atual).toLocaleString('pt-BR')} km` : '—',
      r.has_pillion ? `Sim (${r.pillion_name || '—'})` : 'Não',
      r.checked_in ? 'PRESENTE' : 'AGUARDANDO',
      (r.status || 'confirmada').toUpperCase(),
    ])

    autoTable(doc, {
      startY: startRidesY + 4,
      head: ridesHead,
      body: ridesBody,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 17, 32],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })
  }

  // Table with metric history snapshots
  if (metricas && metricas.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180

    if (finalY > 210) {
      doc.addPage()
      drawClubHeader(
        doc,
        `Histórico de Métricas: ${(user.name || 'Membro').toUpperCase()}`,
        'Snapshots gerados em importações anteriores',
      )
    }

    const startHistY = finalY > 210 ? 47 : finalY + 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('HISTÓRICO DE MÉTRICAS (SNAPSHOTS DE IMPORTAÇÕES)', 14, startHistY)

    const histHead = [
      [
        '#',
        'Data Import.',
        'Categoria',
        'Score',
        'Compras',
        'Total Vendido',
        'Passagens',
        'Total Oficina',
      ],
    ]

    const histBody = metricas.map((m, idx) => [
      idx + 1,
      m.data_importacao ? String(m.data_importacao).slice(0, 10) : '—',
      (m.categoria || '—').toUpperCase(),
      `${m.score_oficina ?? 0}/100`,
      m.total_compras ?? 0,
      formatBRL(m.total_valor_vendido ?? 0),
      m.numero_passagens ?? 0,
      formatBRL(m.total_liquido_oficina ?? 0),
    ])

    autoTable(doc, {
      startY: startHistY + 4,
      head: histHead,
      body: histBody,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 17, 32],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })
  }

  drawClubFooter(doc)
  const now = new Date()
  const safeName = (user.name || 'membro')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  doc.save(`perfil_360_${safeName}_${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 5. Export Ride Registrations & Check-ins to PDF
 */
export function exportRideRegistrationsPdf(ride: any, regs: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    `Inscrições e Check-in: ${(ride.name || 'Passeio').toUpperCase()}`,
    `Data: ${ride.date || '—'} · Destino: ${ride.destination || '—'} · Total de Inscrições: ${regs.length}`,
  )

  const tableHead = [
    [
      '#',
      'Participante',
      'Tipo',
      'Telefone',
      'Moto',
      'KM Atual',
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
    const kmFormatted =
      reg.km_atual != null ? `${Number(reg.km_atual).toLocaleString('pt-BR')} km` : '—'

    return [
      idx + 1,
      name,
      isGuest ? 'NÃO-MEMBRO' : 'MEMBRO',
      phone,
      bike,
      kmFormatted,
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
  const now = new Date()
  doc.save(
    `inscritos-${(ride.name || 'passeio')
      .toLowerCase()
      .replace(/\s+/g, '-')}-${now.toISOString().slice(0, 10)}.pdf`,
  )
}

/**
 * 6. Export Active Members Ranking to PDF
 */
export function exportActiveRankingPdf(ranking: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    'Ranking Oficial de Membros Mais Ativos',
    'Troféu Piloto Frequente · Classificação por check-ins em passeios e visitas à loja',
  )

  const tableHead = [
    ['Pos', 'Nome', 'Categoria', 'Passeios (Check-ins)', 'Visitas Loja', 'Pontos Totais'],
  ]

  const tableBody = ranking.map((item, idx) => [
    `${idx + 1}º`,
    item.user?.name || item.name || '—',
    (item.category || item.user?.categoria || 'SILVER').toUpperCase(),
    `${item.totalAttended ?? item.rideCheckins ?? 0} (${(item.totalAttended ?? item.rideCheckins ?? 0) * 100} pts)`,
    `${item.storeVisitsCount ?? item.storeVisits ?? 0} (${(item.storeVisitsCount ?? item.storeVisits ?? 0) * 10} pts)`,
    `${item.totalPoints ?? 0} PTS`,
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
      5: { fontStyle: 'bold', textColor: [0, 102, 255] },
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`ranking-membros-mais-ativos-${now.toISOString().slice(0, 10)}.pdf`)
}
