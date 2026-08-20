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
 * Export Complete Administrator Manual to PDF
 */
export function exportAdminManualPdf() {
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
  }

  // First page main header
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

  cursorY = 40

  const addSectionTitle = (title: string) => {
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
  }

  const addSubSection = (title: string) => {
    ensureSpace(10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0, 102, 255)
    doc.text(title, margin, cursorY)
    cursorY += 5
  }

  const addParagraph = (text: string) => {
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
  }

  const addBullet = (boldPrefix: string, text: string) => {
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
  }

  const addTable = (
    head: string[][],
    body: (string | number)[][],
    colWidths?: { [key: number]: number },
  ) => {
    ensureSpace(20)
    autoTable(doc, {
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
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawManualPageHeader(doc)
        }
      },
    })
    cursorY = (doc as any).lastAutoTable.finalY + 5
  }

  // --- SEÇÃO 1: ACESSO AO PAINEL ---
  addSectionTitle('1. ACESSO AO PAINEL ADMINISTRATIVO')
  addParagraph('1. Acesse: https://euromotorsclub.goskip.app')
  addParagraph('2. Faça login com seu e-mail e senha de administrador.')
  addParagraph('3. No menu superior ou lateral, clique em Admin → Dashboard.')
  addParagraph('Perfis de administrador cadastrados no sistema:')
  addTable(
    [['Nome', 'E-mail']],
    [
      ['Ricardo Euro Motors', 'ricardo@grupoeuromotors.com.br'],
      ['ADAUTO SAMPAIO', 'eventos@grupoeuromotors.com.br'],
    ],
  )

  // --- SEÇÃO 2: GESTÃO DE MEMBROS ---
  addSectionTitle('2. GESTÃO DE MEMBROS')
  addParagraph('Caminho no painel: Admin → Membros')
  addSubSection('2.1 Buscar e filtrar')
  addBullet('Barra de pesquisa', 'Localize por nome completo, CPF ou e-mail.')
  addBullet(
    'Filtros disponíveis',
    'Categoria (Bronze / Prata / Gold / Platinum) e Status (Ativo / Pendente / Inativo / Bloqueado / Pré-cadastrado).',
  )

  addSubSection('2.2 Editar membro')
  addBullet('Modal de edição', 'Clique no nome do membro na lista para abrir a tela de edição.')
  addBullet(
    'Campos editáveis',
    'Nome, telefone, e-mail, cidade, marca/modelo/ano da moto e chassi.',
  )
  addBullet(
    'Ajuste manual de categoria',
    'Exige justificativa obrigatória e fica gravado permanentemente no histórico de auditoria.',
  )
  addBullet(
    'Recalcular categoria',
    'Recalcula automaticamente a categoria com base nos pontos e regras de compra/oficina.',
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
  )

  addSubSection('2.4 Deletar membro')
  addParagraph(
    'Ícone de lixeira (🗑️) na coluna Ações → modal de confirmação → exclusão definitiva do cadastro.',
  )

  addSubSection('2.5 Importar membros em massa')
  addParagraph(
    'Clique em 📥 IMPORTAR MEMBROS e selecione arquivo Excel (.xlsx) ou CSV. Colunas aceitas:',
  )
  addTable(
    [['Coluna', 'Descrição', 'Obrigatório']],
    [
      ['nome', 'Nome completo do membro', 'Sim (Obrigatório)'],
      ['cpf', 'CPF (apenas números ou formatado)', 'Sim (Obrigatório)'],
      ['telefone', 'WhatsApp com DDD', 'Sim (Obrigatório)'],
      ['email', 'E-mail válido de contato', 'Sim (Obrigatório)'],
      ['cidade', 'Cidade de residência', 'Sim (Obrigatório)'],
      ['bike_brand', 'Marca da moto (ex: BMW)', 'Sim (Obrigatório)'],
      ['bike_model', 'Modelo da moto (ex: R 1250 GS)', 'Sim (Obrigatório)'],
      ['bike_year', 'Ano de fabricação', 'Sim (Obrigatório)'],
      ['bike_chassi', 'Chassi completo da motocicleta', 'Não'],
      ['quantidade_motos_compradas', 'Total histórico de motos compradas', 'Não'],
      ['data_ultima_passagem_oficina', 'Data da última revisão (DD/MM/AAAA)', 'Não'],
      ['data_primeira_compra', 'Data da primeira compra', 'Não'],
      ['data_ultima_compra', 'Data da última compra', 'Não'],
    ],
  )
  addParagraph(
    '• Preview automático: o sistema valida e exibe registros válidos e com inconsistências antes da gravação.',
  )
  addParagraph(
    '• Todos os registros importados entram com status "Pré-cadastrado" e categoria calculada.',
  )
  addParagraph(
    '• Baixe o modelo oficial clicando em "Baixar modelo" dentro do modal de importação.',
  )

  // --- SEÇÃO 3: GESTÃO DE PASSEIOS ---
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
  )

  addSubSection('3.2 Editar / Excluir passeio')
  addParagraph(
    'Clique no card do passeio → edite qualquer campo → Salvar alterações. Ícone de lixeira para exclusão.',
  )

  addSubSection('3.3 Ver inscritos')
  addParagraph(
    'Abra o passeio → aba Inscritos: lista com piloto, garupa, moto, contatos de emergência e check-in. Contadores automáticos de motos inscritas e participantes totais.',
  )

  // --- SEÇÃO 4: INSCRIÇÕES ---
  addSectionTitle('4. INSCRIÇÕES')
  addParagraph('Caminho no painel: Admin → Inscrições')
  addParagraph('• Painel unificado com todas as inscrições registradas em todos os passeios.')
  addParagraph(
    '• Filtros rápidos: por passeio específico, por membro participante ou por status (confirmada/cancelada).',
  )
  addParagraph(
    '• Detalhamento por participante: presença de garupa, telefone de emergência, confirmação e aceite de regulamento.',
  )

  // --- SEÇÃO 5: PROGRAMA DE PONTOS E CATEGORIAS ---
  addSectionTitle('5. PROGRAMA DE PONTOS E CATEGORIAS')
  addSubSection('5.1 Como funciona')
  addParagraph(
    'O sistema classifica automaticamente cada membro em uma categoria com base na pontuação acumulada e regras de aquisição/oficina.',
  )

  addSubSection('5.2 Categorias e Pontuação')
  addTable(
    [['Categoria', 'Pontuação Mínima', 'Identificador Visual']],
    [
      ['PLATINUM', '500+ pontos', '💎 Azul Premium Especial'],
      ['GOLD', '300 a 499 pontos', '👑 Dourado Gold'],
      ['PRATA', '100 a 299 pontos', '⭐ Prata Silver'],
      ['BRONZE', '0 a 99 pontos', '🛡️ Bronze Standard'],
    ],
  )

  addSubSection('5.3 Como os membros ganham pontos')
  addTable(
    [['Ação Realizada', 'Pontos Concedidos', 'Frequência Máxima']],
    [
      ['Check-in em Passeio Oficial', '100 pontos', 'Por passeio realizado'],
      ['Visita na Loja (QR Code no balcão)', '10 pontos', '1 vez ao dia (anti-fraude)'],
      ['Compra de Moto na Euro Motors', '200 pontos', 'Por moto adquirida'],
      ['Revisão / Serviço na Oficina', '50 pontos', 'Por serviço concluído'],
      ['Indicação de Amigo que Comprou', '150 pontos', 'Por indicação concluída'],
    ],
  )

  addSubSection('5.4 Regras importantes')
  addParagraph(
    '• Evolução imediata: ao atingir a pontuação necessária, a categoria sobe na hora no app do membro.',
  )
  addParagraph(
    '• Toda alteração manual ou automática fica gravada no histórico de auditoria do sistema.',
  )
  addParagraph(
    '• O administrador tem autonomia para ajuste manual mediante justificativa registrada.',
  )

  // --- SEÇÃO 6: QR CODE DA LOJA ---
  addSectionTitle('6. QR CODE DA LOJA (CHECK-IN DE VISITA)')
  addParagraph('Caminho no painel: Admin → QR Code Loja')
  addSubSection('6.1 Como funciona')
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

  addSubSection('6.2 Rotina diária recomendada')
  addParagraph('1. Acesse: Admin → QR Code Loja no início do expediente.')
  addParagraph('2. Clique no botão 🖨️ IMPRIMIR QR CODE.')
  addParagraph('3. Coloque a folha impressa no balcão de atendimento/recepção.')
  addParagraph('4. No dia seguinte, imprima o novo QR Code do dia.')

  // --- SEÇÃO 7: DASHBOARD ---
  addSectionTitle('7. DASHBOARD')
  addParagraph('Caminho no painel: Admin → Dashboard')
  addParagraph('Indicadores em tempo real:')
  addParagraph(
    '• Total de membros cadastrados, novos membros nos últimos 30 dias e membros ativos.',
  )
  addParagraph(
    '• Próximo passeio agendado, total de motos inscritas, total de participantes e vagas restantes.',
  )
  addParagraph('• Total consolidado de passeios oficiais já realizados pelo Clube.')
  addParagraph('Cards analíticos por categoria:')
  addParagraph('• Platinum ativos | Gold ativos | Prata ativos | Bronze ativos.')
  addParagraph(
    '• Alertas de Bronze próximos do vencimento e Bronze inativos (oficina vencida >6 meses).',
  )
  addParagraph(
    'Ranking de Presença: Top membros por pontuação geral com medalhas de destaque (🥇 🥈 🥉).',
  )

  // --- SEÇÃO 8: BENEFÍCIOS ---
  addSectionTitle('8. BENEFÍCIOS')
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

  // --- SEÇÃO 9: PARCEIROS ---
  addSectionTitle('9. PARCEIROS')
  addParagraph('Caminho no painel: Admin → Parceiros')
  addParagraph(
    '• Cadastro de empresas e estabelecimentos parceiros (hotéis, restaurantes, oficinas, lojas).',
  )
  addParagraph(
    '• Campos: nome da empresa, logo, descrição da parceria/desconto, link oficial e categorias contempladas.',
  )

  // --- SEÇÃO 10: BANNERS E GALERIA ---
  addSectionTitle('10. BANNERS E GALERIA')
  addSubSection('Banners')
  addParagraph(
    'Caminho: Admin → Banners. Controle dos banners rotativos do topo da página principal (upload, ordem e ativação).',
  )
  addSubSection('Galeria de Fotos')
  addParagraph(
    'Caminho: Admin → Galeria. Upload de álbuns e registros fotográficos dos passeios e encontros oficiais.',
  )

  // --- SEÇÃO 11: COMUNICADOS ---
  addSectionTitle('11. COMUNICADOS')
  addParagraph('Caminho no painel: Admin → Comunicados')
  addParagraph(
    '• Publicação de comunicados oficiais, avisos urgentes e novidades para a comunidade.',
  )
  addParagraph('• Campos: título, texto, imagem de capa opcional e marcação de urgência/destaque.')

  // --- SEÇÃO 12: RELATÓRIOS ---
  addSectionTitle('12. RELATÓRIOS')
  addParagraph('Caminho no painel: Admin → Relatórios')
  addTable(
    [['Relatório', 'Conteúdo Gerado', 'Formatos']],
    [
      ['Membros', 'Lista completa com nome, CPF, categoria, motos e pontuação', 'CSV / PDF'],
      ['Passeios', 'Histórico completo de passeios realizados e agendados', 'CSV / PDF'],
      ['Inscrições', 'Lista detalhada de inscritos e participantes por passeio', 'CSV / PDF'],
      ['Ranking', 'Classificação geral dos membros mais ativos por pontuação', 'CSV / PDF'],
    ],
  )
  addParagraph('Filtros: por categoria, por status e por intervalo de datas.')

  // --- SEÇÃO 13: CONFIGURAÇÕES ---
  addSectionTitle('13. CONFIGURAÇÕES')
  addParagraph('Caminho no painel: Admin → Configurações')
  addTable(
    [['Configuração', 'Descrição e Aplicação']],
    [
      ['Instagram URL', 'Link do perfil oficial do Instagram (exibido no rodapé e Home)'],
      ['Facebook URL', 'Link da página oficial do Facebook'],
      ['Telefone de contato', 'WhatsApp/telefone oficial exibido na página de Contato'],
      ['E-mail de contato', 'E-mail para suporte ao associado exibido na página de Contato'],
      ['Endereço físico', 'Endereço da concessionária Euro Motors em São José do Rio Preto'],
    ],
  )

  // --- SEÇÃO 14: FLUXOS PRINCIPAIS ---
  addSectionTitle('14. FLUXOS PRINCIPAIS DO SISTEMA')
  addBullet(
    'Fluxo 1 (Importação em massa)',
    'Admin faz upload da planilha → Sistema valida registros → Preview com resumo de válidos/erros → Admin confirma → Membros entram como "Pré-cadastrado" → Categoria calculada automaticamente.',
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

  // --- SEÇÃO 15: CARTEIRINHA DIGITAL ---
  addSectionTitle('15. CARTEIRINHA DIGITAL E VALIDAÇÃO QR CODE')
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

  // --- SEÇÃO 16: SEGURANÇA E AUDITORIA ---
  addSectionTitle('16. SEGURANÇA E AUDITORIA')
  addBullet(
    'Histórico de Auditoria',
    'Toda alteração de categoria ou status fica registrada com autor, data/hora, valor anterior, novo valor e justificativa.',
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

  // --- SEÇÃO 17: DÚVIDAS FREQUENTES ---
  addSectionTitle('17. DÚVIDAS FREQUENTES (FAQ)')
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

  drawClubFooter(doc)
  doc.save('Manual_Admin_EuroMotors_Club.pdf')
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
