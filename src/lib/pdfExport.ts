import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PdfHeaderOptions {
  title: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Creates and formats a standard Euro Motors Motorrad Club PDF with brand colors,
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
      doc.text('Euro Motors Motorrad Club — Documento Oficial', 14, pageHeight - 9)

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
      targetDoc.text('EUROMOTORS MOTORRAD CLUB', 14, 11)

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
    doc.text('EUROMOTORS MOTORRAD CLUB', 14, 12)

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
  addParagraph('1. Acesse: https://euromotorsclub.goskip.app')
  addParagraph('2. Faça login com seu e-mail e senha de administrador.')
  addParagraph('3. No menu superior ou lateral, clique em Admin -> Dashboard.')
  addParagraph('Perfis de administrador cadastrados no sistema:')
  addTable(
    [['Nome', 'E-mail']],
    [
      ['Ricardo Euro Motors', 'ricardo@grupoeuromotors.com.br'],
      ['ADAUTO SAMPAIO', 'eventos@grupoeuromotors.com.br'],
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
    doc.save('Manual_Admin_EuroMotors_Club.pdf')
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

  drawClubHeader(
    doc,
    `Relatório Geral de Membros Cadastrados (${members.length} registros)`,
    'Listagem oficial com contatos, categoria, status e dados de relacionamento',
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
      'Score',
      'Moto',
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
    },
    margin: { left: 14, right: 14, bottom: 18 },
  })

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`euro-motors-membros-${now.toISOString().slice(0, 10)}.pdf`)
}

/**
 * 2. Export Admin Dashboard Metrics to PDF
 */
export function exportDashboardPdf(stats: any, activeRanking: any[] = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawClubHeader(
    doc,
    'Relatório Executivo do Painel (Dashboard)',
    'Indicadores gerais, distribuição de categorias, score de oficina e top membros',
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

  if (activeRanking && activeRanking.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text('TOP MEMBROS (RANKING DE PRESENÇA E PONTOS)', 14, finalY + 10)

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
      startY: finalY + 14,
      head: rankHead,
      body: rankBody,
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
      columnStyles: {
        5: { fontStyle: 'bold', textColor: [0, 102, 255] },
      },
      margin: { left: 14, right: 14, bottom: 18 },
    })
  }

  drawClubFooter(doc)
  const now = new Date()
  doc.save(`euro-motors-dashboard-${now.toISOString().slice(0, 10)}.pdf`)
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
export function exportMemberProfilePdf(user: any, metricas: any[] = []) {
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

  // Table with metric history snapshots
  if (metricas && metricas.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180

    if (finalY > 220) {
      doc.addPage()
      drawClubHeader(
        doc,
        `Histórico de Métricas: ${(user.name || 'Membro').toUpperCase()}`,
        'Snapshots gerados em importações anteriores',
      )
    }

    const startHistY = finalY > 220 ? 47 : finalY + 8

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
