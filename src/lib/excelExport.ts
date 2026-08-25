import * as XLSX from 'xlsx'

export interface ExcelExportColumn {
  header: string
  key?: string
  width?: number
}

/**
 * Calculates auto column widths based on headers and row data.
 */
function calculateColumnWidths(
  headers: string[],
  dataRows: (string | number | boolean | null | undefined)[][],
): { wch: number }[] {
  return headers.map((header, colIndex) => {
    let maxLength = String(header || '').length

    dataRows.forEach((row) => {
      const cellVal = row[colIndex]
      if (cellVal !== undefined && cellVal !== null) {
        const strVal = String(cellVal)
        if (strVal.length > maxLength) {
          maxLength = strVal.length
        }
      }
    })

    // Min width 10, max width 60, plus padding
    const width = Math.min(Math.max(maxLength + 3, 10), 60)
    return { wch: width }
  })
}

/**
 * Generic Excel export function creating a styled workbook with auto column widths.
 */
export function exportToExcel(options: {
  sheetName: string
  fileName: string
  headers: string[]
  data: (string | number | boolean | null | undefined)[][]
}) {
  const { sheetName, fileName, headers, data } = options

  const aoaData = [headers, ...data]
  const ws = XLSX.utils.aoa_to_sheet(aoaData)

  // Auto column widths
  ws['!cols'] = calculateColumnWidths(headers, data)

  const wb = XLSX.utils.book_new()
  const sanitizedSheetName = (sheetName || 'Relatório').slice(0, 31)
  XLSX.utils.book_append_sheet(wb, ws, sanitizedSheetName)

  const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  XLSX.writeFile(wb, finalFileName)
}

/**
 * Export members list to Excel (.xlsx)
 */
export function exportMembersExcel(members: any[], fileNamePrefix = 'euro-motors-membros') {
  const headers = [
    '#',
    'Nome',
    'CPF/CNPJ',
    'E-mail',
    'Telefone',
    'Cidade',
    'Categoria',
    'Status Cadastro',
    'Status Clube',
    'Score Oficina',
    'Nível Relacionamento',
    'Tags Inteligentes',
    'Marca Moto',
    'Modelo Moto',
    'Ano Moto',
    'Chassi',
    'Qtd. Motos Compradas',
    'Total Vendido (R$)',
    'Passagens Oficina',
    'Total Oficina (R$)',
    'Última Oficina',
    'Próxima Melhor Ação',
    'Tipo (Role)',
  ]

  const rows = members.map((m, idx) => {
    let tagsStr = ''
    try {
      if (Array.isArray(m.tags)) {
        tagsStr = m.tags.join(', ')
      } else if (typeof m.tags === 'string' && m.tags.startsWith('[')) {
        tagsStr = JSON.parse(m.tags).join(', ')
      } else {
        tagsStr = m.tags || ''
      }
    } catch {
      tagsStr = String(m.tags || '')
    }

    return [
      idx + 1,
      m.name || '',
      m.cpf || '',
      m.email || '',
      m.phone || '',
      m.city || '',
      (m.categoria || m.category || 'BRONZE').toUpperCase(),
      (m.status || 'ativo').toUpperCase(),
      (m.status_membro || '').toUpperCase(),
      Number(m.score_oficina || 0),
      m.nivel_relacionamento || '',
      tagsStr,
      m.bike_brand || '',
      m.bike_model || '',
      m.bike_year || '',
      m.bike_chassi || '',
      Number(m.quantidade_motos_compradas || 0),
      Number(m.total_valor_vendido || 0),
      Number(m.numero_passagens_oficina || 0),
      Number(m.total_liquido_oficina || 0),
      m.data_ultima_passagem_oficina ? String(m.data_ultima_passagem_oficina).slice(0, 10) : '',
      m.proxima_melhor_acao || '',
      m.role === 'admin' ? 'Administrador' : 'Membro',
    ]
  })

  const dateStr = new Date().toISOString().slice(0, 10)
  exportToExcel({
    sheetName: 'Membros',
    fileName: `${fileNamePrefix}-${dateStr}.xlsx`,
    headers,
    data: rows,
  })
}

/**
 * Export admin dashboard metrics and active ranking to Excel
 */
export function exportDashboardExcel(stats: any, activeRanking: any[] = []) {
  const dateStr = new Date().toISOString().slice(0, 10)
  const wb = XLSX.utils.book_new()

  // Sheet 1: Resumo do Dashboard
  const summaryHeaders = ['Indicador', 'Valor', 'Descrição']
  const summaryRows = [
    ['Total de Membros Cadastrados', stats.totalMembers ?? 0, 'Todos os membros no sistema'],
    ['Novos Membros (últimos 30 dias)', stats.newMembers ?? 0, 'Cadastros recentes'],
    ['Membros Ativos', stats.activeMembers ?? 0, 'Cadastros com status ativo'],
    ['Passeios Realizados', stats.ridesDone ?? 0, 'Eventos concluídos'],
    ['Categoria - Platinum (5+)', stats.platinumCount ?? 0, '5 ou mais motos compradas'],
    ['Categoria - Gold (3-4)', stats.goldCount ?? 0, '3 a 4 motos compradas'],
    ['Categoria - Prata (1-2)', stats.silverCount ?? 0, '1 a 2 motos compradas'],
    ['Categoria - Bronze Ativos', stats.bronzeActiveCount ?? 0, 'Oficina em dia (<6 meses)'],
    [
      'Categoria - Bronze Atenção',
      stats.bronzeExpiringCount ?? 0,
      'Oficina vencendo em breve (5-6 meses)',
    ],
    ['Categoria - Bronze Inativos', stats.bronzeInactiveCount ?? 0, 'Sem oficina há >6 meses'],
    [
      'Score Médio de Oficina',
      stats.scoreMembersCount > 0 ? Number(stats.scoreMedio.toFixed(1)) : '—',
      'Média de clientes com histórico',
    ],
    ['Clientes Score 85+ (Alto Valor)', stats.scoreHigh85Count ?? 0, 'Pós-vendas excepcional'],
    [
      'VIP Ativos (Gold/Plat + Score >=70)',
      stats.vipAtivoCount ?? 0,
      'Prioridade de relacionamento',
    ],
    ['VIP Afastados (Gold/Plat + Score <30)', stats.vipAfastadoCount ?? 0, 'Reativação urgente'],
    ['Próximos do Gold (Prata c/ 2 motos)', stats.proximoGoldCount ?? 0, 'Falta 1 moto para Gold'],
    [
      'Próximos do Platinum (Gold c/ 4 motos)',
      stats.proximoPlatinumCount ?? 0,
      'Falta 1 moto para Platinum',
    ],
    [
      'Primeira Passagem Pendente',
      stats.primeiraPassagemPendenteCount ?? 0,
      'Comprou moto, sem oficina',
    ],
  ]

  const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows])
  wsSummary['!cols'] = calculateColumnWidths(summaryHeaders, summaryRows)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Dashboard')

  // Sheet 2: Ranking de Presença e Pontos
  if (activeRanking && activeRanking.length > 0) {
    const rankingHeaders = [
      'Posição',
      'Nome',
      'Categoria',
      'Passeios (Check-ins)',
      'Visitas Loja',
      'Pontos Totais',
    ]
    const rankingRows = activeRanking.map((item, idx) => [
      `${idx + 1}º`,
      item.user?.name || item.name || '—',
      (item.category || item.user?.categoria || 'SILVER').toUpperCase(),
      item.totalAttended ?? item.attendedCount ?? 0,
      item.storeVisitsCount ?? 0,
      item.totalPoints ?? 0,
    ])
    const wsRanking = XLSX.utils.aoa_to_sheet([rankingHeaders, ...rankingRows])
    wsRanking['!cols'] = calculateColumnWidths(rankingHeaders, rankingRows)
    XLSX.utils.book_append_sheet(wb, wsRanking, 'Top Membros Pontos')
  }

  XLSX.writeFile(wb, `euro-motors-dashboard-${dateStr}.xlsx`)
}

/**
 * Export import logs history to Excel
 */
export function exportImportLogsExcel(logs: any[]) {
  const headers = [
    '#',
    'Nome do Arquivo',
    'Data da Importação',
    'Hora',
    'Linhas Processadas',
    'Clientes Criados',
    'Clientes Atualizados',
    'Quantidade de Erros',
    'Status',
  ]

  const rows = logs.map((l, idx) => {
    let errCount = 0
    try {
      if (l.erros) {
        const parsed = JSON.parse(l.erros)
        errCount = Array.isArray(parsed) ? parsed.length : 0
      }
    } catch {
      errCount = 0
    }

    const dataFormatada = l.data
      ? new Date(l.data).toLocaleDateString('pt-BR')
      : l.created
        ? new Date(l.created).toLocaleDateString('pt-BR')
        : '—'

    return [
      idx + 1,
      l.nome_arquivo || '—',
      dataFormatada,
      l.hora || (l.created ? new Date(l.created).toLocaleTimeString('pt-BR') : '—'),
      Number(l.linhas_processadas || 0),
      Number(l.clientes_criados || 0),
      Number(l.clientes_atualizados || 0),
      errCount,
      (l.status || 'CONCLUIDO').toUpperCase(),
    ]
  })

  const dateStr = new Date().toISOString().slice(0, 10)
  exportToExcel({
    sheetName: 'Histórico Importações',
    fileName: `historico-importacoes-${dateStr}.xlsx`,
    headers,
    data: rows,
  })
}

/**
 * Export individual 360 member profile to Excel
 */
export function exportMemberProfileExcel(user: any, metricas: any[] = [], rides: any[] = []) {
  const dateStr = new Date().toISOString().slice(0, 10)
  const wb = XLSX.utils.book_new()

  // Sheet 1: Perfil do Membro
  const profileHeaders = ['Campo', 'Valor']
  const profileRows = [
    ['Nome Completo', user.name || '—'],
    ['CPF / CNPJ', user.cpf || '—'],
    ['E-mail', user.email || '—'],
    ['Telefone', user.phone || '—'],
    ['Cidade', user.city || '—'],
    ['Categoria Atual', (user.categoria || user.category || 'BRONZE').toUpperCase()],
    ['Status Cadastro', (user.status || 'ativo').toUpperCase()],
    ['Status Clube', (user.status_membro || '').toUpperCase()],
    ['Score de Oficina (0-100)', Number(user.score_oficina || 0)],
    ['Score Valor (0-70)', Number(user.score_valor_oficina || 0)],
    ['Score Frequência (0-30)', Number(user.score_frequencia || 0)],
    ['Nível de Relacionamento', user.nivel_relacionamento || '—'],
    [
      'Tags Inteligentes',
      typeof user.tags === 'string' ? user.tags : JSON.stringify(user.tags || []),
    ],
    ['Próxima Melhor Ação', user.proxima_melhor_acao || 'SEM AÇÃO'],
    ['Marca da Moto', user.bike_brand || '—'],
    ['Modelo da Moto', user.bike_model || '—'],
    ['Ano da Moto', user.bike_year || '—'],
    ['Chassi', user.bike_chassi || '—'],
    ['Nome do Garupa', user.pillion_name || '—'],
    ['Telefone do Garupa', user.pillion_phone || '—'],
    ['Total Veículos Elegíveis', Number(user.total_veiculos_elegiveis || 0)],
    ['Qtd. Motos Compradas', Number(user.quantidade_motos_compradas || 0)],
    ['Total Valor Vendido (R$)', Number(user.total_valor_vendido || 0)],
    ['Nº Passagens na Oficina', Number(user.numero_passagens_oficina || 0)],
    ['Total Líquido Oficina (R$)', Number(user.total_liquido_oficina || 0)],
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
    ['Meses Desde Última Oficina', Number(user.meses_desde_ultima_passagem || 0)],
    ['Dias Desde Venda', Number(user.dias_desde_venda || 0)],
    ['Meses Desde Venda', Number(user.meses_desde_venda || 0)],
  ]

  const wsProfile = XLSX.utils.aoa_to_sheet([profileHeaders, ...profileRows])
  wsProfile['!cols'] = calculateColumnWidths(profileHeaders, profileRows)
  XLSX.utils.book_append_sheet(wb, wsProfile, 'Dados 360 do Membro')

  // Sheet 2: Histórico de Passeios e Inscrições (com KM Atual)
  if (rides && rides.length > 0) {
    const ridesHeaders = [
      '#',
      'Passeio',
      'Data Passeio',
      'KM Atual da Moto',
      'Garupa',
      'Nome Garupa',
      'Presença (Check-in)',
      'Pagamento',
      'Status Inscrição',
      'Data Inscrição',
    ]

    const ridesRows = rides.map((reg, idx) => [
      idx + 1,
      reg.expand?.ride?.name || 'Passeio do Clube',
      reg.expand?.ride?.date ? String(reg.expand.ride.date).slice(0, 10) : '—',
      reg.km_atual != null ? Number(reg.km_atual) : '—',
      reg.has_pillion ? 'SIM' : 'NÃO',
      reg.pillion_name || '—',
      reg.checked_in ? 'PRESENTE' : 'AGUARDANDO',
      (reg.payment_status || 'pendente').toUpperCase(),
      (reg.status || 'confirmada').toUpperCase(),
      reg.created ? new Date(reg.created).toLocaleString('pt-BR') : '—',
    ])

    const wsRides = XLSX.utils.aoa_to_sheet([ridesHeaders, ...ridesRows])
    wsRides['!cols'] = calculateColumnWidths(ridesHeaders, ridesRows)
    XLSX.utils.book_append_sheet(wb, wsRides, 'Histórico de Passeios')
  }

  // Sheet 3: Histórico de Métricas (Snapshots)
  if (metricas && metricas.length > 0) {
    const metricasHeaders = [
      '#',
      'Data Importação',
      'Categoria',
      'Score Oficina',
      'Total Compras',
      'Total Vendido (R$)',
      'Passagens',
      'Total Oficina (R$)',
      'Status',
      'Nível Relacionamento',
      'Registrado em',
    ]

    const metricasRows = metricas.map((m, idx) => [
      idx + 1,
      m.data_importacao ? String(m.data_importacao).slice(0, 10) : '—',
      (m.categoria || '—').toUpperCase(),
      Number(m.score_oficina || 0),
      Number(m.total_compras || 0),
      Number(m.total_valor_vendido || 0),
      Number(m.numero_passagens || 0),
      Number(m.total_liquido_oficina || 0),
      (m.status || '—').toUpperCase(),
      m.nivel_relacionamento || '—',
      m.created ? new Date(m.created).toLocaleString('pt-BR') : '—',
    ])

    const wsMetricas = XLSX.utils.aoa_to_sheet([metricasHeaders, ...metricasRows])
    wsMetricas['!cols'] = calculateColumnWidths(metricasHeaders, metricasRows)
    XLSX.utils.book_append_sheet(wb, wsMetricas, 'Histórico Métricas')
  }

  const safeName = (user.name || 'membro')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  XLSX.writeFile(wb, `perfil_360_${safeName}_${dateStr}.xlsx`)
}

/**
 * Export ride registrations list to Excel
 */
export function exportRideRegistrationsExcel(ride: any, regs: any[]) {
  const headers = [
    '#',
    'Participante',
    'Tipo',
    'E-mail',
    'Telefone',
    'Cidade',
    'Moto',
    'KM Atual da Moto',
    'Garupa',
    'Nome Garupa',
    'Presença (Check-in)',
    'Data/Hora Check-in',
    'Pagamento',
    'Status Inscrição',
  ]

  const rows = regs.map((reg, idx) => {
    const isGuest = reg.is_guest || !reg.user
    const u = reg.expand?.user
    const name = isGuest ? reg.guest_name || 'Não-Membro' : u?.name || '—'
    const email = isGuest ? reg.guest_email || '—' : u?.email || '—'
    const phone = isGuest ? reg.guest_phone || '—' : u?.phone || '—'
    const city = isGuest ? reg.guest_city || '—' : u?.city || '—'
    const bike = isGuest
      ? [reg.guest_bike_brand, reg.guest_bike_model, reg.guest_bike_year]
          .filter(Boolean)
          .join(' ') || '—'
      : [u?.bike_brand, u?.bike_model, u?.bike_year].filter(Boolean).join(' ') || '—'

    return [
      idx + 1,
      name,
      isGuest ? 'NÃO-MEMBRO' : 'MEMBRO',
      email,
      phone,
      city,
      bike,
      reg.km_atual != null ? Number(reg.km_atual) : '—',
      reg.has_pillion ? 'SIM' : 'NÃO',
      reg.pillion_name || '—',
      reg.checked_in ? 'PRESENTE' : 'AGUARDANDO',
      reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString('pt-BR') : '—',
      (reg.payment_status || 'pendente').toUpperCase(),
      (reg.status || 'confirmada').toUpperCase(),
    ]
  })

  const dateStr = new Date().toISOString().slice(0, 10)
  const safeRideName = (ride?.name || 'passeio')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  exportToExcel({
    sheetName: 'Inscrições Passeio',
    fileName: `inscricoes_${safeRideName}_${dateStr}.xlsx`,
    headers,
    data: rows,
  })
}
