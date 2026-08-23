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
      // Safe invoke autoTable (support default import, named import or attached prototype)
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
      // If autoTable did not set finalY or wasn't callable, compute fallback cursorY
      cursorY += (body.length + 1) * 6 + 5
    } catch (tableErr) {
      console.error(
        `[exportAdminManualPdf] Falha ao renderizar autoTable ${tableName || ''}:`,
        tableErr,
      )
      // Fallback: render table data as formatted text rows without breaking the entire PDF
      try {
        ensureSpace(10)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(10, 17, 32)
        if (head && head.length > 0) {
          doc.text(head[0].join(' | '), margin, cursorY)
          cursorY += 4.5
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(51, 65, 85)
        for (const row of body) {
          ensureSpace(5)
          const rowText = row.map((c) => String(c ?? '')).join(' — ')
          const lines = doc.splitTextToSize(rowText, contentWidth)
          for (const line of lines) {
            ensureSpace(4.5)
            doc.text(line, margin + 2, cursorY)
            cursorY += 4
          }
        }
        cursorY += 3
      } catch (fallbackErr) {
        console.error('[exportAdminManualPdf] Falha no fallback de texto da tabela:', fallbackErr)
        cursorY += 10
      }
    }
  }

  // --- SEÇÃO 1: ACESSO AO PAINEL ---
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

  // --- SEÇÃO 2: GESTÃO DE MEMBROS & 14 ETAPAS DE IMPORTAÇÃO ---
  addSectionTitle('2. GESTÃO DE MEMBROS & 14 ETAPAS DE IMPORTAÇÃO')
  addParagraph('Caminho no painel: Admin → Membros')
  addSubSection('2.1 Buscar e filtrar')
  addBullet('Barra de pesquisa', 'Localize por nome completo, CPF ou e-mail.')
  addBullet(
    'Filtros disponíveis',
    'Categoria (Bronze / Prata / Gold / Platinum), Status (Ativo / Pendente / Inativo / Bloqueado / Pré-cadastrado), Nível de Relacionamento e Tags Inteligentes.',
  )

  addSubSection('2.2 Editar membro & Recálculo')
  addBullet('Modal de edição', 'Clique no nome do membro na lista para abrir a tela de edição.')
  addBullet(
    'Campos editáveis',
    'Nome, telefone, e-mail, cidade, marca/modelo/ano da moto, chassi, passagens de oficina e total líquido.',
  )
  addBullet(
    'Ajuste manual de categoria',
    'Exige justificativa obrigatória e fica gravado permanentemente no histórico de auditoria.',
  )
  addBullet(
    'Recalcular categoria e Score',
    'Recalcula imediatamente a categoria, o Score de Oficina (0-100), nível de relacionamento, tags e próxima melhor ação.',
  )

  addSubSection('2.3 Status do membro')
  addTable(
    [['Status', 'Significado']],
    [
      ['Pré-cadastrado', 'Importado via planilha, aguardando cliente validar seus dados no site.'],
      [
        'Pendente',
        'Cadastro realizado pelo formulário público do site, aguardando aprovação do admin.',
      ],
      ['Ativo', 'Membro validado e com acesso liberado a todos os benefícios do Clube.'],
      ['Inativo', 'Bronze com oficina vencida (>6 meses sem visita registrada).'],
      ['Bloqueado', 'Impedido manualmente pelo administrador por descumprimento de regras.'],
    ],
    undefined,
    'Status do Membro',
  )

  addSubSection('2.4 As 14 etapas da importação em massa (Pipeline Automatizado)')
  addParagraph(
    'Ao importar a planilha, o sistema executa um pipeline rigoroso de 14 etapas integradas:',
  )
  addTable(
    [['Etapa', 'Nome da Etapa', 'Descrição Operacional']],
    [
      ['1', 'Leitura Raw', 'Parsing binário da planilha Excel (.xlsx/.xls) ou arquivo CSV.'],
      [
        '2',
        'Normalização de Documento',
        'Limpeza de pontuações e auto-preenchimento com zeros à esquerda.',
      ],
      [
        '3',
        'Validação de CPF/CNPJ',
        'Verificação matemática de validade; linhas inválidas são ignoradas.',
      ],
      [
        '4',
        'UPSERT (Criar vs Atualizar)',
        'Mapeia por CPF: se já existe marca UPDATE; se não, CREATE.',
      ],
      [
        '5',
        'Cálculo de Categoria',
        'Determina Platinum (5+ motos), Gold (3-4), Prata (1-2) ou Bronze.',
      ],
      [
        '6',
        'Cálculo do Score de Oficina',
        'Calcula Score Valor (0-70) + Score Frequência (0-30) = Score Total.',
      ],
      [
        '7',
        'Geração de Tags Inteligentes',
        'Atribui tags automáticas como VIP ATIVO, VIP AFASTADO, ALTO VALOR, etc.',
      ],
      [
        '8',
        'Próxima Melhor Ação',
        'Define a ação prioritária de atendimento para comercial e pós-vendas.',
      ],
      [
        '9',
        'Proteção de Campos',
        'No UPDATE, preserva Nome, Telefone, Email e Cidade se vierem vazios.',
      ],
      [
        '10',
        'Consolidação de Métricas',
        'Valores de vendas e pós-vendas substituem o snapshot anterior.',
      ],
      [
        '11',
        'Gravação no Banco (Users)',
        'Persistência atômica dos membros com delay anti-rate-limit.',
      ],
      [
        '12',
        'Históricos e Auditoria',
        'Grava histórico de categoria, compras de moto, oficina e métricas.',
      ],
      [
        '13',
        'Log da Importação',
        'Registra na collection import_logs total de linhas, sucessos e falhas.',
      ],
      [
        '14',
        'Resumo e Relatório Final',
        'Exibe modal com contagem de criados, atualizados e alteração de scores.',
      ],
    ],
    undefined,
    '14 Etapas Importacao',
  )

  // --- SEÇÃO 3: SCORE DE OFICINA (0 a 100 PONTOS) ---
  addSectionTitle('3. SCORE DE OFICINA (0 A 100 PONTOS) & RELACIONAMENTO')
  addParagraph(
    'Conceito: O Score é INDEPENDENTE da Categoria. Categoria mede histórico de compra; Score mede intensidade de relacionamento com a oficina.',
  )

  addSubSection('3.1 Regra Absoluta')
  addParagraph(
    'SCORE NÃO ALTERA CATEGORIA. Ex: PLATINUM com Score 15 continua PLATINUM. BRONZE com Score 95 continua BRONZE.',
  )

  addSubSection('3.2 Composição do Score (Score Valor + Score Frequência = Máx 100)')
  addParagraph('Score Valor (0 a 70 pontos) — baseado em TOTAL_LIQUIDO_OFICINA:')
  addTable(
    [['Faixa de Total Líquido Oficina (R$)', 'Pontos Atribuídos']],
    [
      ['R$ 0,00', '0 pontos'],
      ['Até R$ 2.500,00', '10 pontos'],
      ['R$ 2.501,00 a R$ 5.000,00', '20 pontos'],
      ['R$ 5.001,00 a R$ 10.000,00', '35 pontos'],
      ['R$ 10.001,00 a R$ 20.000,00', '50 pontos'],
      ['R$ 20.001,00 a R$ 35.000,00', '60 pontos'],
      ['Acima de R$ 35.000,00', '70 pontos (máximo)'],
    ],
    undefined,
    'Score Valor',
  )

  addParagraph('Score Frequência (0 a 30 pontos) — baseado em NUMERO_PASSAGENS:')
  addTable(
    [['Quantidade de Passagens na Oficina', 'Pontos Atribuídos']],
    [
      ['0 passagens', '0 pontos'],
      ['1 a 2 passagens', '5 pontos'],
      ['3 a 5 passagens', '10 pontos'],
      ['6 a 10 passagens', '20 pontos'],
      ['11 ou mais passagens', '30 pontos (máximo)'],
    ],
    undefined,
    'Score Frequencia',
  )

  addSubSection('3.3 Níveis de Relacionamento (baseado no Score Total)')
  addTable(
    [['Faixa de Score', 'Nível de Relacionamento', 'Perfil do Membro']],
    [
      ['0 a 29 pontos', 'BAIXO RELACIONAMENTO', 'Ausente da oficina / risco de inatividade'],
      ['30 a 49 pontos', 'RELACIONAMENTO MODERADO', 'Frequência esporádica ou serviços pontuais'],
      ['50 a 69 pontos', 'RELACIONAMENTO ATIVO', 'Cliente assíduo com revisões periódicas'],
      ['70 a 84 pontos', 'RELACIONAMENTO FORTE', 'Alto engajamento pós-vendas e serviços'],
      ['85 a 100 pontos', 'RELACIONAMENTO EXCEPCIONAL', 'Cliente topo de linha de pós-vendas'],
    ],
    undefined,
    'Niveis Relacionamento',
  )

  addSubSection('3.4 Exemplo Prático')
  addParagraph(
    'Cliente com TOTAL_LIQUIDO_OFICINA = R$ 23.000 e NUMERO_PASSAGENS = 8 → Score Valor: 60 + Score Frequência: 20 = Score Total: 80/100 → Nível: RELACIONAMENTO FORTE.',
  )

  addSubSection('3.5 Três leituras independentes de cada cliente')
  addParagraph('• CATEGORIA: BRONZE / PRATA / GOLD / PLATINUM (histórico de aquisição de motos)')
  addParagraph('• SCORE OFICINA: 0 a 100 pontos (intensidade de relacionamento com o pós-vendas)')
  addParagraph('• STATUS: ATIVO / ATENÇÃO / INATIVO (situação operacional atual)')
  addParagraph('Exemplo consolidado no sistema: GOLD · SCORE 88 · ATIVO')

  addSubSection('3.6 Campos Oficiais do Score')
  addParagraph(
    'Campos persistidos: SCORE_OFICINA, SCORE_VALOR_OFICINA, SCORE_FREQUENCIA, NIVEL_RELACIONAMENTO e DATA_ULTIMO_CALCULO.',
  )

  // --- SEÇÃO 4: TAGS INTELIGENTES & PRÓXIMA MELHOR AÇÃO ---
  addSectionTitle('4. TAGS INTELIGENTES & PRÓXIMA MELHOR AÇÃO')
  addSubSection('4.1 Tags Inteligentes geradas automaticamente')
  addTable(
    [['Tag Inteligente', 'Condição de Acionamento']],
    [
      ['VIP ATIVO', 'GOLD ou PLATINUM + Score >= 70'],
      ['VIP AFASTADO', 'GOLD ou PLATINUM + Score < 30'],
      ['ALTO VALOR PÓS-VENDAS', 'Score >= 85 (qualquer categoria)'],
      ['PRÓXIMO DO GOLD', 'PRATA + 2 veículos elegíveis'],
      ['PRÓXIMO DO PLATINUM', 'GOLD + 4 veículos elegíveis'],
      ['PRIMEIRA PASSAGEM PENDENTE', 'DATA_VENDA preenchida + sem oficina (passagens = 0)'],
    ],
    undefined,
    'Tags Inteligentes',
  )

  addSubSection('4.2 Próxima Melhor Ação (Hierarquia de Prioridade)')
  addTable(
    [['Prioridade', 'Tag Ativa', 'Próxima Melhor Ação']],
    [
      ['1ª Prioridade', 'PRIMEIRA PASSAGEM PENDENTE', 'CONTATAR PARA PRIMEIRA PASSAGEM'],
      ['2ª Prioridade', 'VIP AFASTADO', 'REATIVAR PÓS-VENDAS'],
      ['3ª Prioridade', 'PRÓXIMO DO GOLD', 'CLIENTE PRÓXIMO DO GOLD'],
      ['4ª Prioridade', 'PRÓXIMO DO PLATINUM', 'CLIENTE PRÓXIMO DO PLATINUM'],
      ['5ª Prioridade', 'ALTO VALOR PÓS-VENDAS', 'CLIENTE DE ALTO VALOR'],
      ['6ª Prioridade', 'VIP ATIVO', 'PRIORIDADE DE RELACIONAMENTO'],
      ['—', 'Nenhuma tag', 'SEM AÇÃO'],
    ],
    undefined,
    'Proxima Melhor Acao',
  )

  // --- SEÇÃO 5: GESTÃO DE PASSEIOS ---
  addSectionTitle('3. GESTÃO DE PASSEIOS')
  addParagraph('Caminho no painel: Admin → Passeios')
  addSubSection('3.1 Criar passeio')
  addParagraph('Clique em + CRIAR PASSEIO e preencha a ficha técnica do evento:')
  addTable(
    [['Campo', 'Descrição']],
    [
      ['Nome', 'Nome oficial do passeio ou expedição'],
      ['Foto de capa', 'Upload de imagem em alta resolução'],
      ['Data', 'Data de realização do passeio'],
      ['Horário de encontro / saída', 'Ex: Encontro 07:00 / Saída 07:30'],
      ['Ponto de encontro / Destino', 'Local de partida (ex: Euro Motors) e destino final'],
      ['Percurso / Rota', 'Descrição do trajeto ou link oficial do Google Maps'],
      ['Km / Tempo estimado', 'Quilometragem total aproximada e duração estimada'],
      ['Número máximo de motos', 'Limite de vagas disponíveis para motos'],
      [
        'Permite garupa? / Valor (R$)',
        'Definição de garupa e custo de inscrição (gratuito ou pago)',
      ],
      ['Descrição / Informações', 'Texto detalhado, o que levar e recomendações'],
      [
        'O que está incluso / Regulamento',
        'Itens inclusos (café, apoio, almoço) e regras obrigatórias',
      ],
    ],
    undefined,
    'Ficha Técnica Passeios',
  )

  addSubSection('3.2 Editar / Excluir passeio')
  addParagraph(
    'Clique no card do passeio → edite qualquer campo → Salvar alterações. Ícone de lixeira para exclusão.',
  )

  addSubSection('3.3 Ver inscritos')
  addParagraph(
    'Abra o passeio → aba Inscritos: lista com piloto, garupa, moto, contatos de emergência e check-in. Contadores automáticos de motos inscritas e participantes totais.',
  )

  // --- SEÇÃO 6: INSCRIÇÕES ---
  addSectionTitle('6. INSCRIÇÕES')
  addParagraph('Caminho no painel: Admin → Inscrições')
  addParagraph('• Painel unificado com todas as inscrições registradas em todos os passeios.')
  addParagraph(
    '• Filtros rápidos: por passeio específico, por membro participante ou por status (confirmada/cancelada).',
  )
  addParagraph(
    '• Detalhamento por participante: presença de garupa, telefone de emergência, confirmação e aceite de regulamento.',
  )

  // --- SEÇÃO 7: PROGRAMA DE PONTOS E CATEGORIAS ---
  addSectionTitle('7. PROGRAMA DE PONTOS E CATEGORIAS')
  addSubSection('7.1 Como funciona')
  addParagraph(
    'O sistema classifica automaticamente cada membro em uma categoria com base na pontuação acumulada e regras de aquisição/oficina.',
  )

  addSubSection('7.2 Categorias e Pontuação')
  addTable(
    [['Categoria', 'Pontuação Mínima', 'Identificador Visual']],
    [
      ['PLATINUM', '500+ pontos', 'Azul Premium Especial'],
      ['GOLD', '300 a 499 pontos', 'Dourado Gold'],
      ['PRATA', '100 a 299 pontos', 'Prata Silver'],
      ['BRONZE', '0 a 99 pontos', 'Bronze Standard'],
    ],
    undefined,
    'Categorias e Pontos',
  )

  addSubSection('7.3 Como os membros ganham pontos')
  addTable(
    [['Ação Realizada', 'Pontos Concedidos', 'Frequência Máxima']],
    [
      ['Check-in em Passeio Oficial', '100 pontos', 'Por passeio realizado'],
      ['Visita na Loja (QR Code no balcão)', '10 pontos', '1 vez ao dia (anti-fraude)'],
      ['Compra de Moto na Euro Motors', '200 pontos', 'Por moto adquirida'],
      ['Revisão / Serviço na Oficina', '50 pontos', 'Por serviço concluído'],
      ['Indicação de Amigo que Comprou', '150 pontos', 'Por indicação concluída'],
    ],
    undefined,
    'Regras de Pontuação',
  )

  addSubSection('7.4 Regras importantes')
  addParagraph(
    '• Evolução imediata: ao atingir a pontuação necessária, a categoria sobe na hora no app do membro.',
  )
  addParagraph(
    '• Toda alteração manual ou automática fica gravada no histórico de auditoria do sistema.',
  )
  addParagraph(
    '• O administrador tem autonomia para ajuste manual mediante justificativa registrada.',
  )

  // --- SEÇÃO 8: QR CODE DA LOJA ---
  addSectionTitle('8. QR CODE DA LOJA (CHECK-IN DE VISITA)')
  addParagraph('Caminho no painel: Admin → QR Code Loja')
  addSubSection('8.1 Como funciona')
  addParagraph(
    '• Totem ou placa com QR Code exposto no balcão de atendimento da concessionária Euro Motors.',
  )
  addParagraph(
    '• O cliente escaneia com a câmera do celular → valida a presença física → ganha 10 pontos na hora.',
  )
  addParagraph('• Regra anti-fraude: limite estrito de 1 check-in de loja por dia por membro.')
  addParagraph(
    '• Segurança criptográfica: o token muda todos os dias à meia-noite (o QR Code impresso no dia anterior não funciona hoje).',
  )

  addSubSection('8.2 Rotina diária recomendada')
  addParagraph('1. Acesse: Admin → QR Code Loja no início do expediente.')
  addParagraph('2. Clique no botão 🖨️ IMPRIMIR QR CODE.')
  addParagraph('3. Coloque a folha impressa no balcão de atendimento/recepção.')
  addParagraph('4. No dia seguinte, imprima o novo QR Code do dia.')

  // --- SEÇÃO 9: DASHBOARD ---
  addSectionTitle('9. DASHBOARD EXECUTIVO & INDICADORES')
  addParagraph('Caminho no painel: Admin → Dashboard')
  addParagraph('Indicadores em tempo real:')
  addParagraph(
    '• Total de membros cadastrados, novos membros nos últimos 30 dias e membros ativos.',
  )
  addParagraph(
    '• Indicadores de Score de Oficina: distribuição por Níveis de Relacionamento, VIPs Ativos e VIPs Afastados.',
  )
  addParagraph(
    '• Próximo passeio agendado, total de motos inscritas, total de participantes e vagas restantes.',
  )
  addParagraph('• Cards analíticos por categoria: Platinum, Gold, Prata e Bronze ativos.')
  addParagraph(
    '• Ranking de Presença: Top membros por pontuação geral com medalhas de destaque (🥇 🥈 🥉).',
  )

  // --- SEÇÃO 10: BENEFÍCIOS ---
  addSectionTitle('10. BENEFÍCIOS')
  addParagraph('Caminho no painel: Admin → Benefícios')
  addParagraph(
    '• Gestão completa (Criar, Editar, Excluir) das vantagens exclusivas para os membros.',
  )
  addParagraph(
    '• Segmentação: cada benefício pode ser liberado para uma ou mais categorias (Bronze, Prata, Gold, Platinum).',
  )
  addParagraph(
    '• Matriz de Benefícios: imagem institucional completa gerada e exibida na Home pública e na área logada.',
  )

  // --- SEÇÃO 11: PARCEIROS ---
  addSectionTitle('11. PARCEIROS')
  addParagraph('Caminho no painel: Admin → Parceiros')
  addParagraph(
    '• Cadastro de empresas e estabelecimentos parceiros (hotéis, restaurantes, oficinas, lojas).',
  )
  addParagraph(
    '• Campos: nome da empresa, logo, descrição da parceria/desconto, link oficial e categorias contempladas.',
  )

  // --- SEÇÃO 12: BANNERS E GALERIA ---
  addSectionTitle('12. BANNERS E GALERIA')
  addSubSection('Banners')
  addParagraph(
    'Caminho: Admin → Banners. Controle dos banners rotativos do topo da página principal (upload, ordem e ativação).',
  )
  addSubSection('Galeria de Fotos')
  addParagraph(
    'Caminho: Admin → Galeria. Upload de álbuns e registros fotográficos dos passeios e encontros oficiais.',
  )

  // --- SEÇÃO 13: COMUNICADOS ---
  addSectionTitle('13. COMUNICADOS')
  addParagraph('Caminho no painel: Admin → Comunicados')
  addParagraph(
    '• Publicação de comunicados oficiais, avisos urgentes e novidades para a comunidade.',
  )
  addParagraph('• Campos: título, texto, imagem de capa opcional e marcação de urgência/destaque.')

  // --- SEÇÃO 14: RELATÓRIOS ---
  addSectionTitle('14. RELATÓRIOS E EXPORTAÇÕES')
  addParagraph('Caminho no painel: Admin -> Relatórios')
  addTable(
    [['Relatório', 'Conteúdo Gerado', 'Formatos']],
    [
      ['Membros', 'Lista completa com nome, CPF, categoria, Score de Oficina e motos', 'CSV / PDF'],
      ['Passeios', 'Histórico completo de passeios realizados e agendados', 'CSV / PDF'],
      ['Inscrições', 'Lista detalhada de inscritos e participantes por passeio', 'CSV / PDF'],
      ['Ranking', 'Classificação geral dos membros mais ativos por pontuação', 'CSV / PDF'],
    ],
    undefined,
    'Relatórios do Sistema',
  )
  addParagraph('Filtros: por categoria, por status e por intervalo de datas.')

  // --- SEÇÃO 15: CONFIGURAÇÕES ---
  addSectionTitle('15. CONFIGURAÇÕES DO SISTEMA & FAIXAS DE SCORE')
  addParagraph('Caminho no painel: Admin -> Configurações e Admin -> Score de Oficina')
  addTable(
    [['Configuração', 'Descrição e Aplicação']],
    [
      [
        'Faixas do Score de Oficina',
        'Configuração customizada dos limites e pontos de valor e frequência',
      ],
      ['Instagram URL', 'Link do perfil oficial do Instagram (exibido no rodapé e Home)'],
      ['Facebook URL', 'Link da página oficial do Facebook'],
      ['Telefone de contato', 'WhatsApp/telefone oficial exibido na página de Contato'],
      ['E-mail de contato', 'E-mail para suporte ao associado exibido na página de Contato'],
      ['Endereço físico', 'Endereço da concessionária Euro Motors em São José do Rio Preto'],
    ],
    undefined,
    'Configurações Gerais',
  )

  // --- SEÇÃO 16: FLUXOS PRINCIPAIS ---
  addSectionTitle('16. FLUXOS PRINCIPAIS DO SISTEMA')
  addBullet(
    'Fluxo 1 (Importação em massa)',
    'Admin faz upload da planilha → Sistema executa as 14 etapas automatizadas → Preview com resumo de válidos/erros → Admin confirma → Membros entram como "Pré-cadastrado" ou são atualizados com Score e Categoria calculados.',
  )
  addBullet(
    'Fluxo 2 (Cliente ativa cadastro)',
    'Cliente acessa o site → Clica em "JÁ SOU CLIENTE" → Digita CPF ou 7 dígitos do chassi → Sistema recupera dados pré-cadastrados → Cliente confere, define senha e aceita termos LGPD → Torna-se ATIVO na hora sem aprovação manual.',
  )
  addBullet(
    'Fluxo 3 (Cadastro novo no site)',
    'Visitante preenche o formulário completo no site público → Status: PENDENTE → Admin avalia e aprova no painel Admin → Membros → Torna-se ATIVO.',
  )
  addBullet(
    'Fluxo 4 (Inscrição em passeio)',
    'Membro logado escolhe o passeio → Clica em "QUERO PARTICIPAR" → Dados preenchidos automaticamente → Informa se leva garupa (dados do garupa) → Contato de emergência + aceite de regulamento → Confirmação imediata da vaga.',
  )

  // --- SEÇÃO 17: CARTEIRINHA DIGITAL ---
  addSectionTitle('17. CARTEIRINHA DIGITAL E VALIDAÇÃO QR CODE')
  addParagraph('Caminho do membro: Área do Membro → Carteirinha')
  addParagraph(
    '• Exibe: nome do piloto, categoria com badge oficial colorida, ID exclusivo e QR Code.',
  )
  addParagraph('• Ao ser escaneado por qualquer câmera, abre a página de validação pública:')
  addParagraph('  ✅ MEMBRO ATIVO — confirma autenticidade, nome e categoria.')
  addParagraph('  ❌ MEMBRO INATIVO — alerta caso o cadastro esteja bloqueado ou expirado.')
  addParagraph(
    '• Privacidade: dados sensíveis (CPF, telefone, e-mail) NUNCA são expostos na página de validação pública.',
  )

  // --- SEÇÃO 18: SEGURANÇA E AUDITORIA ---
  addSectionTitle('18. SEGURANÇA E AUDITORIA')
  addBullet(
    'Histórico de Auditoria',
    'Toda alteração de categoria, Score ou status fica registrada com autor, data/hora, valor anterior, novo valor e justificativa.',
  )
  addBullet(
    'Controle de Acesso',
    'Rotas protegidas por autenticação administrativa estrita (AdminRoute).',
  )
  addBullet(
    'Token Diário Criptográfico',
    'Check-in de loja utiliza hash criptográfico SHA-256 com rotação diária.',
  )
  addBullet('Unicidade de CPF', 'O sistema bloqueia cadastros duplicados com o mesmo CPF.')

  // --- SEÇÃO 19: DÚVIDAS FREQUENTES ---
  addSectionTitle('19. DÚVIDAS FREQUENTES (FAQ)')
  addSubSection('P: O Score de Oficina pode rebaixar a categoria de um membro?')
  addParagraph(
    'R: NÃO. O Score de Oficina mede a intensidade do relacionamento pós-vendas e é totalmente independente da Categoria. Um Platinum com Score baixo continua Platinum (recebe tag VIP AFASTADO para ação de pós-vendas).',
  )

  addSubSection('P: Um membro Bronze perdeu o status. Como reativar?')
  addParagraph(
    'R: O status Bronze expira após 6 meses sem passagem pela oficina. Quando o cliente fizer uma nova visita à loja (check-in QR Code) ou tiver uma nova passagem de oficina registrada no sistema, o status é reativado automaticamente como Bronze ativo.',
  )

  addSubSection('P: Posso mudar a categoria de um membro manualmente?')
  addParagraph(
    'R: Sim. Em Admin → Membros, abra o membro e utilize a opção "Ajuste manual de categoria". É obrigatório informar a justificativa, e a alteração será gravada permanentemente na auditoria.',
  )

  addSubSection('P: O QR Code da loja parou de funcionar. O que fazer?')
  addParagraph(
    'R: O token do QR Code de visita expira diariamente à meia-noite por segurança. Acesse Admin → QR Code Loja e imprima o novo QR Code do dia.',
  )

  addSubSection('P: Como adicionar pontos manualmente para um membro?')
  addParagraph(
    'R: O sistema calcula a pontuação automaticamente com base nas ações realizadas. Caso queira conceder pontos por compras anteriores ou serviços, edite o membro e atualize a quantidade de motos ou a data da última passagem na oficina.',
  )

  try {
    drawClubFooter(doc)
  } catch (footerErr) {
    console.error('[exportAdminManualPdf] Erro ao desenhar rodapé:', footerErr)
  }

  try {
    doc.save('Manual_Admin_EuroMotors_Club.pdf')
    console.info('[exportAdminManualPdf] PDF gerado e download disparado com sucesso.')
  } catch (saveErr) {
    console.error('[exportAdminManualPdf] Erro ao salvar/baixar o arquivo PDF:', saveErr)
    throw saveErr
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
  doc.save(`ranking-membros-mais-ativos-${now.toISOString().slice(0, 10)}.pdf`)
}
