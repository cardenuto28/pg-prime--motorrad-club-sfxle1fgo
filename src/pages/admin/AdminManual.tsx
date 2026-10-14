import React, { useState } from 'react'
import {
  BookOpen,
  Download,
  Lock,
  Users,
  Calendar,
  ClipboardList,
  Trophy,
  Gauge,
  Tag,
  QrCode,
  LayoutDashboard,
  Gift,
  Handshake,
  Image,
  Megaphone,
  BarChart3,
  Settings,
  Repeat,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Zap,
  Target,
  Layers,
  AlertTriangle,
  Flame,
  Clock,
  Database,
  ArrowRight,
  Filter,
  FileText,
  Mail,
  Smartphone,
  Check,
  X,
  Eye,
  MousePointerClick,
  Palette,
  Shield,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { exportAdminManualPdf } from '@/lib/pdfExport'

interface SectionItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
}

const SECTIONS: SectionItem[] = [
  { id: 'sec-1', title: '1. Acesso ao Painel Administrativo', icon: Lock },
  { id: 'sec-2', title: '2. Gestão de Membros & 14 Etapas de Importação', icon: Users },
  { id: 'sec-3', title: '3. Score de Oficina & Inteligência de Relacionamento', icon: Gauge },
  { id: 'sec-4', title: '4. Tags Inteligentes & Próxima Melhor Ação', icon: Tag },
  { id: 'sec-5', title: '5. Gestão de Passeios & KM Atual da Moto', icon: Calendar },
  { id: 'sec-6', title: '6. Inscrições & Formulário Completo', icon: ClipboardList },
  { id: 'sec-7', title: '7. Programa de Pontos e Categorias', icon: Trophy },
  { id: 'sec-8', title: '8. QR Code da Loja (Check-in Diário)', icon: QrCode },
  { id: 'sec-9', title: '9. Dashboard Executivo & Cards Clicáveis', icon: LayoutDashboard },
  { id: 'sec-10', title: '10. Benefícios', icon: Gift },
  { id: 'sec-11', title: '11. Parceiros Conveniados', icon: Handshake },
  { id: 'sec-12', title: '12. Banners e Galeria de Fotos', icon: Image },
  { id: 'sec-13', title: '13. Comunicados & Pop-up Automático no Acesso', icon: Megaphone },
  { id: 'sec-14', title: '14. Relatórios e Exportações (Excel & PDF)', icon: BarChart3 },
  { id: 'sec-15', title: '15. Configurações do Sistema & Faixas de Score', icon: Settings },
  { id: 'sec-16', title: '16. Fluxos Principais de Operação', icon: Repeat },
  { id: 'sec-17', title: '17. Carteirinha Digital Dinâmica & Validação QR Code', icon: CreditCard },
  { id: 'sec-18', title: '18. Segurança e Auditoria', icon: ShieldCheck },
  { id: 'sec-19', title: '19. Dúvidas Frequentes (FAQ)', icon: HelpCircle },
]

export const AdminManual: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPdf = () => {
    setDownloading(true)
    setTimeout(() => {
      try {
        exportAdminManualPdf()
        toast({
          title: 'Manual Baixado com Sucesso',
          description: 'O arquivo Manual_Admin_PGPRIME_Club.pdf foi gerado e salvo.',
        })
      } catch (e: any) {
        console.error('Erro ao gerar PDF do manual:', e)
        toast({
          title: 'Erro ao gerar PDF',
          description: e?.message || 'Houve uma falha na criação do documento em PDF.',
          variant: 'destructive',
        })
      } finally {
        setDownloading(false)
      }
    }, 50)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const filteredSections = SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0f1422] via-[#0b0e17] to-[#07090e] border border-[#1d2638] rounded-xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#0066FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0066FF]/10 border border-[#0066FF]/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest font-montserrat">
              <BookOpen className="w-3.5 h-3.5" />
              Documentação Oficial &amp; Manual Operacional
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-montserrat tracking-tight">
              Manual do Administrador
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Guia operacional completo com todas as regras de negócio, motor de cálculo do{' '}
              <strong className="text-blue-400 font-semibold">Score de Oficina</strong>,
              inteligência pós-vendas, 14 etapas da importação em massa (com fallback por CPF e
              anti-rate-limit), pop-ups automáticos de comunicados, carteirinha digital dinâmica e
              exportações em tempo real do{' '}
              <strong className="text-slate-200 font-semibold">PG PRIME Club</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="bg-[#0066FF] hover:bg-blue-500 text-white font-montserrat text-xs font-bold uppercase tracking-wider px-5 py-5 shadow-lg shadow-[#0066FF]/25 border border-blue-400/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Gerando PDF...' : '📥 Baixar Manual em PDF'}
            </Button>
          </div>
        </div>
      </section>

      {/* Index & Search bar */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-montserrat">
            <Sparkles className="w-4 h-4 text-[#0066FF]" />
            Índice Rápido de Navegação ({SECTIONS.length} seções)
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar seção ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs pl-9 h-9 placeholder:text-slate-500 focus:border-[#0066FF]"
            />
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#121824] hover:bg-[#192233] border border-[#1f2a3f] hover:border-[#0066FF]/50 text-left transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-[#0066FF]/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                <sec.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">
                {sec.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 ml-auto shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Manual Content */}
      <div className="space-y-6 text-slate-200">
        {/* SEÇÃO 1 */}
        <section
          id="sec-1"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 1
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                1. Acesso ao Painel Administrativo
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>
                Acesse o endereço seguro:{' '}
                <a
                  href="https://pgprime.club"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 font-mono text-xs"
                >
                  https://pgprime.club <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Faça login com seu e-mail e senha de administrador autorizado.</li>
              <li>
                No menu superior ou lateral, clique em <strong className="text-white">Admin</strong>{' '}
                → <strong className="text-white">Dashboard</strong>.
              </li>
            </ol>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-montserrat">
                Perfis de Administrador Cadastrados:
              </h4>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Ricardo PG PRIME</td>
                      <td className="p-3 font-mono text-slate-300">ricardo@pgprime.club</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">ADAUTO SAMPAIO</td>
                      <td className="p-3 font-mono text-slate-300">eventos@pgprime.club</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2 */}
        <section
          id="sec-2"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 2
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                2. Gestão de Membros &amp; 14 Etapas de Importação
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Membros
            </p>

            {/* 2.1 Buscar e Filtrar */}
            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.1 Buscar e Filtrar
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-xs pl-2">
                <li>
                  <strong className="text-white">
                    Busca em tempo real com debounce (300ms de delay):
                  </strong>{' '}
                  filtra instantaneamente enquanto você digita por{' '}
                  <strong className="text-blue-400">
                    Nome, CPF/CNPJ, E-mail, Telefone, Cidade, Modelo da moto e Chassi
                  </strong>
                  .
                </li>
                <li>
                  <strong className="text-white">Botões de Exportação Dedicados:</strong> a tela de
                  membros disponibiliza os botões{' '}
                  <strong className="text-emerald-400">"Exportar Excel"</strong> e{' '}
                  <strong className="text-rose-400">"Exportar PDF"</strong>, que exportam
                  dinamicamente a lista completa ou exatamente os registros filtrados pela pesquisa
                  e filtros ativos.
                </li>
                <li>
                  <strong className="text-white">Filtros combinados disponíveis:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 pt-1">
                    <div className="p-2 rounded bg-[#0b0e17] border border-[#1d2638] text-[11px]">
                      <strong className="text-blue-400">Categoria:</strong> Bronze, Prata, Gold e
                      Platinum
                    </div>
                    <div className="p-2 rounded bg-[#0b0e17] border border-[#1d2638] text-[11px]">
                      <strong className="text-blue-400">Status:</strong> Ativo, Pendente, Inativo,
                      Bloqueado e Pré-cadastrado
                    </div>
                    <div className="p-2 rounded bg-[#0b0e17] border border-[#1d2638] text-[11px]">
                      <strong className="text-blue-400">Nível de Relacionamento:</strong> Baixo,
                      Moderado, Ativo, Forte e Excepcional
                    </div>
                    <div className="p-2 rounded bg-[#0b0e17] border border-[#1d2638] text-[11px]">
                      <strong className="text-blue-400">Tags Inteligentes:</strong> VIP Ativo, VIP
                      Afastado, Alto Valor Pós-Vendas, Próximo do Gold, Próximo do Platinum,
                      Primeira Passagem Pendente
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* 2.2 Editar Membro & Recálculo */}
            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.2 Editar Membro &amp; Recálculo
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>
                  Clique no nome do membro → abre modal com todos os dados cadastrais e métricas.
                </li>
                <li>
                  Campos editáveis: nome, telefone, e-mail, cidade, marca/modelo/ano da moto,
                  chassi, número de passagens e total líquido de oficina.
                </li>
                <li>
                  <strong className="text-blue-400 font-semibold">
                    Ajuste manual de categoria:
                  </strong>{' '}
                  exige justificativa obrigatória e fica registrado permanentemente no histórico de
                  auditoria.
                </li>
                <li>
                  Botão <strong className="text-white">"Recalcular categoria e Score"</strong>:
                  atualiza imediatamente Categoria, Score de Oficina, Nível de Relacionamento, Tags
                  e Ação.
                </li>
              </ul>
            </div>

            {/* 2.3 Status do Membro */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.3 Status do Membro
              </h3>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3 w-40">Status</th>
                      <th className="p-3">Significado e Regra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-amber-400">Pré-cadastrado</td>
                      <td className="p-3">
                        Importado via planilha, aguardando o cliente validar e criar senha no site
                        em <code className="text-blue-300">/validar-cadastro</code>.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-yellow-400">Pendente</td>
                      <td className="p-3">
                        Cadastro realizado no site pelo formulário público, aguarda aprovação do
                        admin.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-emerald-400">Ativo</td>
                      <td className="p-3">
                        Validado e participando regularmente do Clube com acesso liberado.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-slate-400">Inativo</td>
                      <td className="p-3">
                        Bronze com oficina vencida (&gt; 6 meses sem visita registrada).
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-red-400">Bloqueado</td>
                      <td className="p-3">
                        Impedido manualmente pelo administrador por motivos disciplinares.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AS 14 ETAPAS DA IMPORTAÇÃO */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-montserrat">
                  2.4 As 14 Etapas do Processo de Importação em Massa (Pipeline Robusto)
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ao importar uma planilha Excel (.xlsx) ou CSV, o sistema executa rigorosamente um
                pipeline composto por 14 etapas automatizadas, garantindo integridade de dados,
                fallback inteligente de e-mail e proteção contra rate limits:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  {
                    num: '1',
                    title: 'Leitura Raw do Arquivo',
                    desc: 'Parsing binário da planilha com suporte nativo a XLSX e CSV com barra de progresso em tempo real durante o processamento de registros.',
                  },
                  {
                    num: '2',
                    title: 'Normalização de CPF / CNPJ',
                    desc: 'Limpeza de pontuações e autopreenchimento com zeros à esquerda: CPFs com menos de 11 dígitos recebem zeros automaticamente (ex: 155260278 → 00155260278); CNPJ completa até 14 dígitos.',
                  },
                  {
                    num: '3',
                    title: 'Validação de Documento',
                    desc: 'Verificação do algoritmo oficial de dígitos verificadores; documentos com tamanho incorreto ou inválidos são sinalizados com erro descritivo.',
                  },
                  {
                    num: '4',
                    title: 'UPSERT por Documento Normalizado',
                    desc: 'O cruzamento é feito pelo documento (CPF/CNPJ) normalizado: se já existe marca UPDATE; se não, marca CREATE.',
                  },
                  {
                    num: '5',
                    title: 'Cálculo de Categoria',
                    desc: 'Determina Platinum (5+ motos), Gold (3-4 motos), Prata (1-2 motos) ou Bronze (oficina <6 meses).',
                  },
                  {
                    num: '6',
                    title: 'Cálculo do Score de Oficina',
                    desc: 'Executa Score Valor (0 a 70 pts) + Score Frequência (0 a 30 pts) = Score Total (máx 100).',
                  },
                  {
                    num: '7',
                    title: 'Geração de Tags Inteligentes',
                    desc: 'Aplica regras para gerar tags automáticas (VIP ATIVO, VIP AFASTADO, ALTO VALOR PÓS-VENDAS, etc.).',
                  },
                  {
                    num: '8',
                    title: 'Próxima Melhor Ação',
                    desc: 'Define a ação prioritária de atendimento para a equipe comercial e de pós-vendas.',
                  },
                  {
                    num: '9',
                    title: 'Proteção de Campos Cadastrais',
                    desc: 'No UPDATE, se Nome, Telefone, Email ou Cidade vierem em branco, preserva o valor cadastrado atual no banco.',
                  },
                  {
                    num: '10',
                    title: 'Consolidação de Métricas',
                    desc: 'Valores financeiros e de passagens substituem o snapshot anterior mantendo consistência.',
                  },
                  {
                    num: '11',
                    title: 'Gravação no Banco (Users)',
                    desc: 'Persistência na collection users aplicando proteção anti-rate-limit com fallback de e-mail no CREATE.',
                  },
                  {
                    num: '12',
                    title: 'Históricos e Snapshots',
                    desc: 'Grava historico_metricas_membro e historico_compras_motos. O historico_categoria NÃO é gerado na importação em massa (apenas em edições manuais e CRON diário) para máxima performance.',
                  },
                  {
                    num: '13',
                    title: 'Geração de Log da Importação',
                    desc: 'Cria registro em import_logs com data, hora, linhas processadas, total de criados, atualizados e erros detalhados.',
                  },
                  {
                    num: '14',
                    title: 'Resumo e Relatório Final',
                    desc: 'Exibe modal com balanço completo: criados, atualizados, ignorados, detalhamento dos erros reais e botão para fechar ou novo upload.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="bg-[#121824] p-3 rounded-lg border border-[#1c2538] flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#0066FF]/20 text-[#0066FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {step.num}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white font-montserrat">{step.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subseções Novas da Importação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                {/* 2.4.1 Fallback de Email */}
                <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-montserrat uppercase">
                    <Mail className="w-4 h-4" /> 2.4.1 Fallback Inteligente de E-mail
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    No momento do <strong className="text-white">CREATE</strong>, o sistema{' '}
                    <strong className="text-blue-300">
                      ignora intencionalmente o e-mail da planilha
                    </strong>{' '}
                    e gera automaticamente um e-mail único baseado no documento normalizado (ex:{' '}
                    <code className="bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      02336018802@pgprime.club
                    </code>
                    ).
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Isso garante{' '}
                    <strong className="text-white">zero colisões de e-mail duplicado</strong> na
                    importação em massa. Quando o cliente acessa{' '}
                    <code className="text-blue-400">/validar-cadastro</code>, ele mesmo define seu
                    e-mail pessoal e cria sua senha definitiva.
                  </p>
                </div>

                {/* 2.4.2 Barra de Progresso */}
                <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-montserrat uppercase">
                    <BarChart3 className="w-4 h-4" /> 2.4.2 Barra de Progresso em Tempo Real
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Durante o processamento da planilha, uma barra de progresso visual informa
                    percentual e contagem em tempo real (ex:{' '}
                    <span className="text-cyan-300 font-mono font-semibold">
                      "Processando 45% — 562 de 1.248 registros"
                    </span>
                    ).
                  </p>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>
                        <strong>Barra Azul:</strong> Processamento em andamento
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>
                        <strong>Barra Verde:</strong> Concluído com 100% de sucesso (sem erros)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>
                        <strong>Barra Âmbar:</strong> Concluído com registros em falha para revisão
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2.4.3 Proteção Anti-Rate-Limit */}
                <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-montserrat uppercase">
                    <ShieldCheck className="w-4 h-4" /> 2.4.3 Proteção Anti-Rate-Limit
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Para evitar sobrecarga no servidor e bloqueio de requisições durante planilhas
                    volumosas (milhares de linhas), o motor de importação aplica um{' '}
                    <strong className="text-white">delay cadenciado de 250ms entre linhas</strong>{' '}
                    somado a uma pausa estratégica de{' '}
                    <strong className="text-amber-300">500ms a cada 50 registros</strong>{' '}
                    processados.
                  </p>
                </div>

                {/* 2.4.4 Tratamento de Erros Real */}
                <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-montserrat uppercase">
                    <AlertTriangle className="w-4 h-4" /> 2.4.4 Tratamento de Erros com Motivo Real
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Em caso de falha em qualquer linha da planilha, o sistema não apresenta
                    mensagens genéricas: ele extrai e exibe o{' '}
                    <strong className="text-rose-300">MOTIVO REAL retornado pelo backend</strong>{' '}
                    (ex: <em>"Email já está em uso"</em>, <em>"CPF já cadastrado"</em>,{' '}
                    <em>"Too Many Requests"</em>, <em>"Documento com formato inválido"</em>),
                    permitindo correção cirúrgica pelo administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: SCORE DE OFICINA (0 a 100 pontos) */}
        <section
          id="sec-3"
          className="bg-gradient-to-br from-[#0e131d] via-[#101726] to-[#0e131d] border-2 border-[#0066FF]/40 rounded-xl p-5 sm:p-7 space-y-6 scroll-mt-24 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538] relative z-10">
            <div className="w-9 h-9 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-lg shadow-[#0066FF]/30">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Inteligência Pós-Vendas PG PRIME
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-montserrat tracking-tight">
                3. Score de Oficina (0 a 100 pontos) &amp; Inteligência de Relacionamento
              </h2>
            </div>
          </div>

          {/* Conceito Central */}
          <div className="bg-[#121824] p-4 sm:p-5 rounded-xl border border-blue-500/30 space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-montserrat">
              <Zap className="w-4 h-4" />
              Conceito Fundamental
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              O <strong className="text-white">Score de Oficina</strong> é{' '}
              <span className="text-blue-400 font-bold underline decoration-blue-500/50">
                TOTALMENTE INDEPENDENTE
              </span>{' '}
              da Categoria do Clube:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0b0e17] p-3 rounded-lg border border-[#1f2a3f]">
                <div className="text-xs font-bold text-amber-400 uppercase font-montserrat flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> CATEGORIA (Bronze, Prata, Gold, Platinum)
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Mede o <strong>histórico de aquisição de veículos</strong> e concessão de
                  prestígio.
                </p>
              </div>
              <div className="bg-[#0b0e17] p-3 rounded-lg border border-[#1f2a3f]">
                <div className="text-xs font-bold text-blue-400 uppercase font-montserrat flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> SCORE DE OFICINA (0 a 100 pontos)
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Mede a{' '}
                  <strong>intensidade, frequência e valor do relacionamento com a oficina</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Regra Absoluta */}
          <div className="bg-red-950/30 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-red-300 uppercase tracking-wide font-montserrat">
                Regra Absoluta do Sistema: SCORE NÃO ALTERA CATEGORIA
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Um cliente <strong className="text-white">PLATINUM</strong> com Score de Oficina{' '}
                <strong className="text-red-400">15</strong> continua sendo{' '}
                <strong className="text-blue-400">PLATINUM</strong> (ganha tag VIP AFASTADO para
                reativação). Da mesma forma, um cliente{' '}
                <strong className="text-white">BRONZE</strong> com Score{' '}
                <strong className="text-emerald-400">95</strong> continua sendo{' '}
                <strong className="text-amber-500">BRONZE</strong> (ganha tag ALTO VALOR
                PÓS-VENDAS).
              </p>
            </div>
          </div>

          {/* Composição do Score */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" /> 3.1 Composição do Score (Fórmula
              Matemática)
            </h3>
            <div className="bg-[#121824] p-3 rounded-lg border border-[#1c2538] text-xs font-mono text-center text-blue-300">
              Score Total (0 a 100) = Score Valor (0 a 70 pts) + Score Frequência (0 a 30 pts)
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Score Valor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Score Valor (0 a 70 pontos)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    TOTAL_LIQUIDO_OFICINA
                  </span>
                </div>
                <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5">Faixa de Gasto na Oficina</th>
                        <th className="p-2.5 text-right">Pontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c2538] text-xs">
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">R$ 0,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-400">
                          0 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">Até R$ 2.500,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                          10 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">R$ 2.501,00 a R$ 5.000,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                          20 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">R$ 5.001,00 a R$ 10.000,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                          35 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">R$ 10.001,00 a R$ 20.000,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                          50 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">R$ 20.001,00 a R$ 35.000,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-400">
                          60 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60 bg-blue-950/20">
                        <td className="p-2.5 text-white font-semibold">Acima de R$ 35.000,00</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                          70 pts (máx)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Score Frequência */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-montserrat flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Score Frequência (0 a 30 pontos)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">NUMERO_PASSAGENS</span>
                </div>
                <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5">Passagens Registradas</th>
                        <th className="p-2.5 text-right">Pontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c2538] text-xs">
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">0 passagens</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-400">
                          0 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">1 a 2 passagens</td>
                        <td className="p-2.5 text-right font-mono font-bold text-cyan-400">
                          5 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">3 a 5 passagens</td>
                        <td className="p-2.5 text-right font-mono font-bold text-cyan-400">
                          10 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60">
                        <td className="p-2.5 text-slate-300">6 a 10 passagens</td>
                        <td className="p-2.5 text-right font-mono font-bold text-cyan-400">
                          20 pts
                        </td>
                      </tr>
                      <tr className="hover:bg-[#141b27]/60 bg-cyan-950/20">
                        <td className="p-2.5 text-white font-semibold">11 ou mais passagens</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                          30 pts (máx)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Níveis de Relacionamento */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" /> 3.2 Níveis de Relacionamento por
              Score
            </h3>
            <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                  <tr>
                    <th className="p-3">Faixa de Score</th>
                    <th className="p-3">Nível de Relacionamento</th>
                    <th className="p-3">Badge &amp; Cor no Sistema</th>
                    <th className="p-3">Perfil do Membro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2538]">
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-mono font-bold text-slate-400">0 a 29</td>
                    <td className="p-3 font-semibold text-slate-300">BAIXO RELACIONAMENTO</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-slate-900/60 text-slate-400 border-slate-700/50">
                        BAIXO
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      Ausente da oficina, risco de perda ou sem histórico
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-mono font-bold text-amber-400">30 a 49</td>
                    <td className="p-3 font-semibold text-amber-300">RELACIONAMENTO MODERADO</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-amber-950/60 text-amber-300 border-amber-700/50">
                        MODERADO
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      Frequência esporádica ou revisões básicas
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-mono font-bold text-cyan-400">50 a 69</td>
                    <td className="p-3 font-semibold text-cyan-300">RELACIONAMENTO ATIVO</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/60 text-cyan-300 border-cyan-700/50">
                        ATIVO
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      Cliente fiel com revisões periódicas regulares
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-mono font-bold text-blue-400">70 a 84</td>
                    <td className="p-3 font-semibold text-blue-300">RELACIONAMENTO FORTE</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-blue-950/60 text-blue-300 border-blue-700/50">
                        FORTE
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      Alto engajamento pós-vendas, revisões completas e serviços
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60 bg-emerald-950/20">
                    <td className="p-3 font-mono font-bold text-emerald-400">85 a 100</td>
                    <td className="p-3 font-semibold text-emerald-300">
                      RELACIONAMENTO EXCEPCIONAL
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border-emerald-700/50">
                        EXCEPCIONAL
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">
                      Cliente topo de linha de pós-vendas (volume + frequência alta)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Exemplo Prático */}
          <div className="bg-[#121824] p-4 rounded-xl border border-[#1c2538] space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Exemplo Prático de Cálculo
            </h4>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p>
                Cliente possui{' '}
                <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                  TOTAL_LIQUIDO_OFICINA = R$ 23.000,00
                </code>{' '}
                e{' '}
                <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                  NUMERO_PASSAGENS = 8
                </code>
                :
              </p>
              <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-300">
                <li>
                  <strong className="text-white">Score Valor:</strong> R$ 23.000 cai na faixa de R$
                  20.001 a R$ 35.000 → <span className="text-blue-400 font-bold">60 pontos</span>
                </li>
                <li>
                  <strong className="text-white">Score Frequência:</strong> 8 passagens caem na
                  faixa de 6 a 10 → <span className="text-cyan-400 font-bold">20 pontos</span>
                </li>
                <li>
                  <strong className="text-white">Score Total:</strong> 60 + 20 ={' '}
                  <span className="text-emerald-400 font-bold font-mono">80 / 100</span>
                </li>
                <li>
                  <strong className="text-white">Nível Atribuído:</strong>{' '}
                  <span className="text-blue-300 font-bold">RELACIONAMENTO FORTE</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Três Leituras Independentes */}
          <div className="bg-[#0b0e17] p-4 sm:p-5 rounded-xl border border-[#1f2a3f] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-montserrat flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              As Três Leituras Independentes de Cada Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#121824] rounded-lg border border-[#1c2538] space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">1. CATEGORIA</span>
                <p className="font-semibold text-white">BRONZE / PRATA / GOLD / PLATINUM</p>
                <p className="text-[11px] text-slate-400">
                  Histórico de aquisição e frota de motos compradas.
                </p>
              </div>
              <div className="p-3 bg-[#121824] rounded-lg border border-[#1c2538] space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">
                  2. SCORE OFICINA
                </span>
                <p className="font-semibold text-white">0 a 100 Pontos (5 Níveis)</p>
                <p className="text-[11px] text-slate-400">
                  Intensidade, valor e frequência do pós-vendas.
                </p>
              </div>
              <div className="p-3 bg-[#121824] rounded-lg border border-[#1c2538] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">3. STATUS</span>
                <p className="font-semibold text-white">ATIVO / ATENÇÃO / INATIVO</p>
                <p className="text-[11px] text-slate-400">
                  Situação operacional e validade do cadastro.
                </p>
              </div>
            </div>
            <div className="p-2.5 bg-blue-950/30 rounded border border-blue-500/30 text-center text-xs text-blue-300 font-mono">
              Exemplo consolidado: <strong>GOLD · SCORE 88 (EXCEPCIONAL) · ATIVO</strong>
            </div>
          </div>

          {/* Campos do Score no Banco de Dados */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-montserrat">
              Campos Oficiais do Score no Schema de Dados:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#121824] rounded border border-[#1c2538] text-blue-300">
                SCORE_OFICINA
              </div>
              <div className="p-2 bg-[#121824] rounded border border-[#1c2538] text-blue-300">
                SCORE_VALOR_OFICINA
              </div>
              <div className="p-2 bg-[#121824] rounded border border-[#1c2538] text-blue-300">
                SCORE_FREQUENCIA
              </div>
              <div className="p-2 bg-[#121824] rounded border border-[#1c2538] text-blue-300">
                NIVEL_RELACIONAMENTO
              </div>
              <div className="p-2 bg-[#121824] rounded border border-[#1c2538] text-blue-300">
                DATA_ULTIMO_CALCULO
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: TAGS INTELIGENTES & PRÓXIMA MELHOR AÇÃO */}
        <section
          id="sec-4"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 4
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                4. Tags Inteligentes &amp; Próxima Melhor Ação
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400 leading-relaxed">
              O motor de inteligência do PG PRIME Club analisa continuamente as métricas de compra,
              oficina e comportamento para gerar <strong>Tags Inteligentes automáticas</strong> e
              direcionar a <strong>Próxima Melhor Ação</strong> de relacionamento para o time.
            </p>

            {/* Tabela de Tags Inteligentes */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 4.1 Tags Inteligentes Geradas
                Automaticamente
              </h3>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3 w-48">Tag Inteligente</th>
                      <th className="p-3">Regra de Acionamento / Condição</th>
                      <th className="p-3">Aparência da Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-emerald-400">VIP ATIVO</td>
                      <td className="p-3 text-slate-300">
                        Categoria <strong className="text-white">GOLD</strong> ou{' '}
                        <strong className="text-white">PLATINUM</strong> + Score de Oficina{' '}
                        <strong className="text-emerald-400">≥ 70</strong>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border-emerald-700/50">
                          VIP ATIVO
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-red-400">VIP AFASTADO</td>
                      <td className="p-3 text-slate-300">
                        Categoria <strong className="text-white">GOLD</strong> ou{' '}
                        <strong className="text-white">PLATINUM</strong> + Score de Oficina{' '}
                        <strong className="text-red-400">&lt; 30</strong>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-red-950/70 text-red-300 border-red-700/50">
                          VIP AFASTADO
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-amber-400">ALTO VALOR PÓS-VENDAS</td>
                      <td className="p-3 text-slate-300">
                        Score de Oficina <strong className="text-amber-400">≥ 85</strong>{' '}
                        (independente da categoria de aquisição)
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-amber-950/70 text-amber-300 border-amber-700/50">
                          ALTO VALOR PÓS-VENDAS
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-blue-400">PRÓXIMO DO GOLD</td>
                      <td className="p-3 text-slate-300">
                        Categoria <strong className="text-white">PRATA</strong> + exatamente{' '}
                        <strong className="text-blue-400">2 veículos elegíveis</strong> (falta 1
                        para Gold)
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-blue-950/70 text-blue-300 border-blue-700/50">
                          PRÓXIMO DO GOLD
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-purple-400">PRÓXIMO DO PLATINUM</td>
                      <td className="p-3 text-slate-300">
                        Categoria <strong className="text-white">GOLD</strong> + exatamente{' '}
                        <strong className="text-purple-400">4 veículos elegíveis</strong> (falta 1
                        para Platinum)
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-purple-950/70 text-purple-300 border-purple-700/50">
                          PRÓXIMO DO PLATINUM
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-orange-400">PRIMEIRA PASSAGEM PENDENTE</td>
                      <td className="p-3 text-slate-300">
                        Possui <strong className="text-white">DATA_VENDA</strong> preenchida e{' '}
                        <strong className="text-orange-400">nenhuma passagem de oficina</strong>{' '}
                        (número passagens = 0)
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold bg-orange-950/70 text-orange-300 border-orange-700/50">
                          PRIMEIRA PASSAGEM PENDENTE
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Próxima Melhor Ação */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> 4.2 Próxima Melhor Ação (Hierarquia de
                Prioridade)
              </h3>
              <p className="text-xs text-slate-400">
                Quando um membro possui múltiplas tags ativas, o sistema seleciona automaticamente a
                ação de <strong>maior prioridade operacional</strong>:
              </p>

              <div className="space-y-2">
                {[
                  {
                    pos: '1ª',
                    tag: 'PRIMEIRA PASSAGEM PENDENTE',
                    acao: 'CONTATAR PARA PRIMEIRA PASSAGEM',
                    desc: 'Oportunidade crítica de encantamento inicial: convidar o comprador recente para a 1ª revisão/inspeção preventiva.',
                    color: 'text-orange-400',
                    border: 'border-orange-500/30',
                    bg: 'bg-orange-950/20',
                  },
                  {
                    pos: '2ª',
                    tag: 'VIP AFASTADO',
                    acao: 'REATIVAR PÓS-VENDAS',
                    desc: 'Alerta urgente: cliente Gold/Platinum que parou de frequentar a oficina. Contato dedicado para resgate.',
                    color: 'text-red-400',
                    border: 'border-red-500/30',
                    bg: 'bg-red-950/20',
                  },
                  {
                    pos: '3ª',
                    tag: 'PRÓXIMO DO GOLD',
                    acao: 'CLIENTE PRÓXIMO DO GOLD',
                    desc: 'Ação comercial: cliente com 2 motos elegíveis, a 1 compra de atingir a prestigiosa categoria Gold.',
                    color: 'text-blue-400',
                    border: 'border-blue-500/30',
                    bg: 'bg-blue-950/20',
                  },
                  {
                    pos: '4ª',
                    tag: 'PRÓXIMO DO PLATINUM',
                    acao: 'CLIENTE PRÓXIMO DO PLATINUM',
                    desc: 'Ação comercial de alto valor: membro com 4 motos, a 1 compra de ingressar no seleto grupo Platinum.',
                    color: 'text-purple-400',
                    border: 'border-purple-500/30',
                    bg: 'bg-purple-950/20',
                  },
                  {
                    pos: '5ª',
                    tag: 'ALTO VALOR PÓS-VENDAS',
                    acao: 'CLIENTE DE ALTO VALOR',
                    desc: 'Reconhecimento e relacionamento: membro altamente engajado em serviços com Score ≥ 85.',
                    color: 'text-amber-400',
                    border: 'border-amber-500/30',
                    bg: 'bg-amber-950/20',
                  },
                  {
                    pos: '6ª',
                    tag: 'VIP ATIVO',
                    acao: 'PRIORIDADE DE RELACIONAMENTO',
                    desc: 'Manutenção da excelência: tratamento VIP contínuo em passeios, eventos e recepção na concessionária.',
                    color: 'text-emerald-400',
                    border: 'border-emerald-500/30',
                    bg: 'bg-emerald-950/20',
                  },
                ].map((item) => (
                  <div
                    key={item.pos}
                    className={`p-3 rounded-lg border ${item.border} ${item.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-xs text-white bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        {item.pos}
                      </span>
                      <span className={`text-xs font-bold ${item.color} font-montserrat`}>
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {item.acao}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 sm:text-right max-w-md">
                      {item.desc}
                    </span>
                  </div>
                ))}

                <div className="p-3 rounded-lg border border-slate-800 bg-[#121824] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">
                      —
                    </span>
                    <span>Nenhuma tag específica se aplica</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-bold text-slate-300">SEM AÇÃO</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Membro em situação regular padrão
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 5 */}
        <section
          id="sec-5"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 5
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                5. Gestão de Passeios &amp; KM Atual da Moto
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Passeios
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 5.1 Criar Passeio
              </h3>
              <p className="text-xs text-slate-300">
                Clique em <strong className="text-white">+ CRIAR PASSEIO</strong> e preencha os
                campos abaixo:
              </p>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3 w-48">Campo</th>
                      <th className="p-3">Descrição e Instruções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Nome</td>
                      <td className="p-3">Nome do passeio ou destino temático</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Foto de capa</td>
                      <td className="p-3">Upload de imagem em alta qualidade para destaque</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Data</td>
                      <td className="p-3">Data oficial de realização do passeio</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Horário de encontro / saída</td>
                      <td className="p-3">Ex: Encontro às 07:00 / Saída pontual às 07:30</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Ponto de encontro / Destino</td>
                      <td className="p-3">Local de partida (ex: PG PRIME) e ponto final</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Percurso / Rota</td>
                      <td className="p-3">
                        Descrição do roteiro ou link interativo do Google Maps
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">
                        Quilometragem / Tempo estimado
                      </td>
                      <td className="p-3">Ex: 180 km / 3h30 de pilotagem</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Número máximo de motos</td>
                      <td className="p-3">Limite de vagas para garantir segurança e conforto</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Permite garupa? / Valor (R$)</td>
                      <td className="p-3">
                        Opção Sim/Não e definição de custo (grátis ou valor em R$)
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">Descrição / Informações</td>
                      <td className="p-3">
                        Texto descritivo, briefing, o que levar e dicas de segurança
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">
                        O que está incluso / Regulamento
                      </td>
                      <td className="p-3">
                        Café da manhã, almoço, carro de apoio e regras do passeio
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
                <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400" /> 5.2 Editar / Excluir Passeio
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique no card do passeio → edite qualquer informação → Salvar. Ícone de lixeira
                  para exclusão com confirmação.
                </p>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
                <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400" /> 5.3 Ver Inscritos &amp;
                  Check-in
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aba <strong className="text-white">Inscritos</strong>: lista com piloto, garupa,
                  moto, contatos de emergência e contadores em tempo real (motos e participantes).
                </p>
              </div>
            </div>

            {/* NOVAS SUBSEÇÕES 5.4 e 5.5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-montserrat uppercase">
                  <Gauge className="w-4 h-4" /> 5.4 KM Atual da Moto na Inscrição (Obrigatório)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ao se inscrever em qualquer passeio do Clube, o membro é{' '}
                  <strong className="text-white">
                    OBRIGADO a informar a quilometragem atual do hodômetro da sua moto
                  </strong>
                  .
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
                  <li>
                    O campo possui formatação inteligente no padrão brasileiro com separador de
                    milhar (ex: <code className="text-cyan-300 font-mono">15.000</code> ou{' '}
                    <code className="text-cyan-300 font-mono">42.580</code>).
                  </li>
                  <li>
                    O botão <strong className="text-blue-400">"CONFIRMAR PARTICIPAÇÃO"</strong>{' '}
                    permanece bloqueado e só libera quando o campo de KM for preenchido com valor
                    maior que zero (<strong className="text-white">KM &gt; 0</strong>).
                  </li>
                </ul>
              </div>

              <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-montserrat uppercase">
                  <Eye className="w-4 h-4" /> 5.5 Visualização do KM nos Relatórios e Telas
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A quilometragem informada pelo membro é sincronizada e fica imediatamente visível
                  em:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
                  <li>
                    <strong className="text-white">Lista de inscritos do passeio:</strong> coluna
                    dedicada <em>"KM Atual"</em>.
                  </li>
                  <li>
                    <strong className="text-white">Tabela geral de inscrições:</strong> coluna{' '}
                    <em>"KM Atual da Moto"</em>.
                  </li>
                  <li>
                    <strong className="text-white">Página 360º do membro:</strong> histórico de
                    passeios com odômetro de cada evento.
                  </li>
                  <li>
                    <strong className="text-white">Exportação PDF:</strong> coluna oficial{' '}
                    <em>"KM Atual"</em> formatada.
                  </li>
                  <li>
                    <strong className="text-white">Exportação Excel:</strong> coluna{' '}
                    <em>"KM Atual da Moto"</em> pronta para filtros de pós-vendas.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 6 */}
        <section
          id="sec-6"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 6
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                6. Inscrições &amp; Formulário Completo
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Inscrições
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs pl-1 leading-relaxed">
              <li>
                Centraliza todas as inscrições realizadas em todos os passeios oficiais do Clube.
              </li>
              <li>
                <strong className="text-white">Filtros rápidos:</strong> localize inscrições por
                passeio específico, por membro participante ou por status da vaga.
              </li>
              <li>
                <strong className="text-white">
                  Formulário Pré-Preenchido com Validações Obrigatórias:
                </strong>{' '}
                no momento em que o membro clica em participar, o formulário já traz automaticamente
                pré-preenchidos os dados de cadastro (
                <strong className="text-blue-300">
                  Nome, Telefone, E-mail, Marca, Modelo e Ano da Moto
                </strong>
                ), solicitando obrigatoriamente as confirmações operacionais:
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                  <div className="p-2.5 rounded bg-[#121824] border border-[#1c2538]">
                    <span className="text-blue-400 font-bold block text-[11px]">1. GARUPA</span>
                    <span className="text-slate-400 text-[10px]">
                      Opção Sim/Não + Nome e WhatsApp do acompanhante
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#121824] border border-[#1c2538]">
                    <span className="text-emerald-400 font-bold block text-[11px]">
                      2. KM ATUAL DA MOTO
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Hodômetro obrigatório formatado (ex: 18.500 km)
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#121824] border border-[#1c2538]">
                    <span className="text-amber-400 font-bold block text-[11px]">
                      3. CONTATO EMERGÊNCIA
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Nome e telefone de terceiro para segurança
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#121824] border border-[#1c2538]">
                    <span className="text-purple-400 font-bold block text-[11px]">
                      4. TERMOS &amp; REGRAS
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Aceite legal do regulamento e termo de responsabilidade
                    </span>
                  </div>
                </div>
              </li>
              <li>
                Cada registro na tabela e nas exportações inclui o campo{' '}
                <strong className="text-white">"KM Atual da Moto"</strong>, permitindo rastrear o
                uso real das motocicletas da frota de clientes PG PRIME.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 7 */}
        <section
          id="sec-7"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 7
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                7. Programa de Pontos e Categorias
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 7.1 Como Funciona
              </h3>
              <p className="text-xs text-slate-300">
                O sistema classifica e reconhece os membros em categorias de prestígio com base nas
                aquisições históricas de veículos e atividade na oficina.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 7.2 Categorias e Pontuação
              </h3>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Regra de Aquisição / Pontos</th>
                      <th className="p-3">Badge Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-blue-400">PLATINUM</td>
                      <td className="p-3 font-semibold">5+ motos compradas / 500+ pts</td>
                      <td className="p-3 text-slate-300">💎 Azul premium especial (#60a5fa)</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-amber-400">GOLD</td>
                      <td className="p-3 font-semibold">3 ou 4 motos compradas / 300–499 pts</td>
                      <td className="p-3 text-slate-300">👑 Dourado (#f59e0b)</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-slate-300">PRATA</td>
                      <td className="p-3 font-semibold">1 ou 2 motos compradas / 100–299 pts</td>
                      <td className="p-3 text-slate-300">⭐ Prata (#94a3b8)</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-orange-400">BRONZE</td>
                      <td className="p-3 font-semibold">
                        Oficina recente (&lt; 6 meses) / 0–99 pts
                      </td>
                      <td className="p-3 text-slate-300">🛡️ Bronze (#ea580c)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 7.3 Como os Membros Ganham Pontos
              </h3>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3">Ação Realizada</th>
                      <th className="p-3">Pontos Concedidos</th>
                      <th className="p-3">Frequência Máxima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-medium text-white">Check-in em passeio oficial</td>
                      <td className="p-3 font-bold text-emerald-400">100 pontos</td>
                      <td className="p-3 text-slate-300">Por passeio realizado</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-medium text-white">
                        Visita na loja (QR Code balcão)
                      </td>
                      <td className="p-3 font-bold text-emerald-400">10 pontos</td>
                      <td className="p-3 text-slate-300">1x por dia (anti-fraude)</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-medium text-white">Compra de moto na PG PRIME</td>
                      <td className="p-3 font-bold text-emerald-400">200 pontos</td>
                      <td className="p-3 text-slate-300">Por moto adquirida</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-medium text-white">Revisão na oficina</td>
                      <td className="p-3 font-bold text-emerald-400">50 pontos</td>
                      <td className="p-3 text-slate-300">Por serviço concluído</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-medium text-white">Indicar amigo que comprou moto</td>
                      <td className="p-3 font-bold text-emerald-400">150 pontos</td>
                      <td className="p-3 text-slate-300">Por indicação confirmada</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 8 */}
        <section
          id="sec-8"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 8
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                8. QR Code da Loja (Check-in Diário de Visita)
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → QR Code Loja
            </p>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 8.1 Como Funciona
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>Um QR Code oficial fica exposto no balcão de atendimento da PG PRIME.</li>
                <li>
                  O cliente escaneia com a câmera do celular → faz check-in de visita →{' '}
                  <strong className="text-emerald-400">ganha 10 pontos</strong>.
                </li>
                <li>
                  <strong className="text-white">Regra anti-fraude:</strong> apenas 1 check-in por
                  dia por membro.
                </li>
                <li>
                  O token criptográfico do QR Code{' '}
                  <strong className="text-white">muda todo dia às 00:00</strong> — o QR de ontem não
                  funciona hoje.
                </li>
              </ul>
            </div>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" /> 8.2 Rotina Diária Recomendada
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>
                  Acesse o menu <strong className="text-white">Admin → QR Code Loja</strong>.
                </li>
                <li>
                  Clique no botão <strong className="text-white">🖨️ IMPRIMIR</strong>.
                </li>
                <li>Coloque o QR Code impresso no balcão ou totem da concessionária.</li>
                <li>
                  No dia seguinte, repita o processo (o token expira automaticamente às 00:00).
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* SEÇÃO 9 */}
        <section
          id="sec-9"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 9
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                9. Dashboard Executivo &amp; Indicadores
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Dashboard
            </p>

            {/* 9.1 Visão Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Indicadores Gerais
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Total de membros cadastrados</li>
                  <li>Novos membros no mês</li>
                  <li>Membros com status ativo</li>
                  <li>Próximo passeio agendado e data</li>
                  <li>Motos e participantes confirmados</li>
                  <li>Vagas disponíveis em tempo real</li>
                </ul>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Score &amp; Relacionamento
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Distribuição dos Níveis de Relacionamento</li>
                  <li>VIPs Ativos vs VIPs Afastados</li>
                  <li>Clientes de Alto Valor Pós-Vendas (85+)</li>
                  <li>Primeira Passagem Pendente</li>
                  <li>Próximos do Gold e Platinum</li>
                </ul>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Categorias &amp; Ranking
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cards com contagem por Platinum, Gold, Prata e Bronze + Ranking TOP MEMBROS em
                  abas separadas por <strong>Maior Score</strong> e{' '}
                  <strong>Maior Valor em Compras</strong> com medalhas oficiais (🥇🥈🥉).
                </p>
              </div>
            </div>

            {/* NOVA SUBSEÇÃO 9.2 */}
            <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-montserrat uppercase">
                <MousePointerClick className="w-4 h-4 text-blue-400" />
                9.2 Cards Clicáveis com Filtro Automático para Lista de Membros
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">
                  TODOS os cards de métricas do Dashboard são interativos e clicáveis.
                </strong>{' '}
                Ao clicar em qualquer indicador, o sistema redireciona imediatamente para{' '}
                <strong className="text-blue-400">Admin → Membros</strong> com o filtro exato
                pré-aplicado:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-400">Card PLATINUM</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra categoria <strong className="text-white">Platinum</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400">Card GOLD</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra categoria <strong className="text-white">Gold</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">Card Score 85+</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra Score <strong className="text-white">85 a 100</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-300">Card VIP Ativos</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra tag <strong className="text-white">VIP ATIVO</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-400">Card VIP Afastados</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra tag <strong className="text-white">VIP AFASTADO</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-300">Próximos do Gold</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra tag <strong className="text-white">PRÓXIMO DO GOLD</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-400">Próximos do Platinum</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra tag <strong className="text-white">PRÓXIMO DO PLATINUM</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-orange-400">1ª Passagem Pendente</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra tag <strong className="text-white">PRIMEIRA PASSAGEM PENDENTE</strong>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c101b] border border-[#1b263b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-500">Bronze Vencimento</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    Filtra <strong className="text-white">Bronze + Status Atenção</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1d2d4a] text-xs text-slate-300 space-y-1">
                <p>
                  • <strong>Rankings TOP Membros (Score e Valor):</strong> os nomes dos membros nos
                  rankings também são clicáveis e abrem diretamente a{' '}
                  <strong className="text-white">Página 360º de Detalhes do Membro</strong>.
                </p>
                <p>
                  • <strong>Design e Feedback Visual:</strong> os cards possuem cursor pointer, leve
                  ampliação de escala ao passar o mouse (hover) e brilho com borda glow em azul{' '}
                  <code className="text-blue-300 font-mono">#0066FF</code>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 10 */}
        <section
          id="sec-10"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 10
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                10. Benefícios
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Benefícios
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>Permite criar, editar e excluir vantagens concedidas aos membros.</li>
              <li>
                Cada benefício é vinculado a uma ou mais categorias (Bronze, Prata, Gold, Platinum).
              </li>
              <li>
                A <strong className="text-white">Matriz de Benefícios</strong> institucional é
                atualizada em tempo real no site e na área do membro.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 11 */}
        <section
          id="sec-11"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 11
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                11. Parceiros Conveniados
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Parceiros
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>
                Cadastro de estabelecimentos conveniados (hotéis, restaurantes, oficinas, lojas).
              </li>
              <li>
                Campos: nome da empresa, logotipo, descrição do desconto/vantagem, link e categorias
                atendidas.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 12 */}
        <section
          id="sec-12"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 12
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                12. Banners e Galeria de Fotos
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
              <h4 className="text-sm font-bold text-white font-montserrat">Banners da Home</h4>
              <p className="text-xs text-slate-400">
                <strong className="text-blue-400">Caminho:</strong> Admin → Banners
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>
                  Imagens do carrossel principal da Home com controle de ativação e ordenação.
                </li>
              </ul>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
              <h4 className="text-sm font-bold text-white font-montserrat">Galeria de Fotos</h4>
              <p className="text-xs text-slate-400">
                <strong className="text-blue-400">Caminho:</strong> Admin → Galeria
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>Upload de fotos dos passeios e eventos com visualizador lightbox integrado.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEÇÃO 13: COMUNICADOS (EXPANDIDO) */}
        <section
          id="sec-13"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 13
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                13. Central de Comunicados &amp; Pop-up Automático
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho do Admin:</strong> Admin → Comunicados
              &nbsp;|&nbsp; <strong className="text-blue-400">Caminho do Membro:</strong>{' '}
              /member/comunicados
            </p>

            {/* 13.1 Criação de Comunicados */}
            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 13.1 Gestão de Comunicados
                (Painel Admin)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Permite à concessionária publicar informativos, avisos de passeios, campanhas de
                recall e promoções de pós-vendas com controle de ciclo de vida:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-[#0b0e17] rounded-lg border border-[#1f2a3f] space-y-1">
                  <span className="font-bold text-white block">
                    Campos do Modal de Criação / Edição:
                  </span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    <li>
                      <strong className="text-slate-200">Título:</strong> obrigatório e com destaque
                      tipográfico
                    </li>
                    <li>
                      <strong className="text-slate-200">Conteúdo:</strong> texto explicativo
                      completo
                    </li>
                    <li>
                      <strong className="text-slate-200">Prioridade:</strong> Normal, Importante ou
                      Urgente
                    </li>
                    <li>
                      <strong className="text-slate-200">Data de publicação:</strong> data de
                      entrada em vigor
                    </li>
                    <li>
                      <strong className="text-slate-200">Data de expiração:</strong> opcional (sai
                      do ar após o prazo)
                    </li>
                    <li>
                      <strong className="text-slate-200">Status Ativo / Inativo:</strong> toggle de
                      liberação imediata
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-[#0b0e17] rounded-lg border border-[#1f2a3f] space-y-1">
                  <span className="font-bold text-white block">Ações do Administrador:</span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    <li>
                      <strong className="text-slate-200">Criar novo:</strong> botão "+ Novo
                      Comunicado"
                    </li>
                    <li>
                      <strong className="text-slate-200">Editar:</strong> alteração em tempo real
                    </li>
                    <li>
                      <strong className="text-slate-200">Ativar / Desativar:</strong> chave toggle
                      no card
                    </li>
                    <li>
                      <strong className="text-slate-200">Excluir:</strong> com confirmação de
                      segurança
                    </li>
                    <li>
                      <strong className="text-slate-200">Busca rápida:</strong> filtra por título ou
                      conteúdo
                    </li>
                    <li>
                      <strong className="text-slate-200">Paginação:</strong> organizada de 10 em 10
                      itens
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 13.2 Visualização pelo Membro */}
            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 13.2 Visualização na Área do
                Membro (/member/comunicados)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Na página de comunicados, os avisos são agrupados dinamicamente em 3 seções
                temáticas de alto impacto visual:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg space-y-1">
                  <span className="font-bold text-red-400 flex items-center gap-1.5 uppercase font-montserrat">
                    <AlertTriangle className="w-3.5 h-3.5" /> URGENTES
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Fundo vermelho com destaque total. Avisos de segurança, alterações de trajeto de
                    passeios e recalls.
                  </p>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase font-montserrat">
                    <Clock className="w-3.5 h-3.5" /> IMPORTANTES
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Fundo âmbar. Lançamentos de passeios, novidades do Clube e campanhas sazonais de
                    oficina.
                  </p>
                </div>
                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg space-y-1">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase font-montserrat">
                    <Megaphone className="w-3.5 h-3.5" /> COMUNICADOS
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Fundo azul escuro. Dicas de pilotagem, novos parceiros e informações
                    institucionais.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Todos os cards são interativos: com um clique eles expandem ou recolhem para
                visualização confortável de textos longos.
              </p>
            </div>

            {/* 13.3 Pop-up Automático */}
            <div className="bg-gradient-to-br from-[#0c1322] to-[#090d16] border-2 border-[#0066FF]/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase font-montserrat relative z-10">
                <Sparkles className="w-4 h-4 text-blue-400" />
                13.3 Pop-up Automático Inteligente ao Acessar a Área do Membro
              </div>
              <p className="text-xs text-slate-200 leading-relaxed relative z-10">
                Sempre que o membro faz login ou navega por qualquer rota protegida (
                <code className="text-blue-300 font-mono">/member/*</code>), o sistema verifica se
                há comunicados ativos publicados que ainda{' '}
                <strong className="text-white">NÃO FORAM LIDOS</strong> pelo usuário:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs relative z-10">
                <div className="bg-[#101726]/80 p-3.5 rounded-lg border border-[#1e2c47] space-y-1.5">
                  <h4 className="font-bold text-white font-montserrat flex items-center gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> Comportamento do Modal Premium
                  </h4>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1 pl-1">
                    <li>
                      Abre automaticamente em design Dark Premium (fundo{' '}
                      <code className="text-slate-300 font-mono">#090d16</code> com borda glow{' '}
                      <code className="text-blue-300 font-mono">#0066FF</code>).
                    </li>
                    <li>
                      <strong className="text-red-400">Urgente:</strong> borda vermelha pulsante +
                      ícone de alerta + aviso destacado.
                    </li>
                    <li>
                      <strong className="text-amber-400">Importante:</strong> badge âmbar com ícone
                      de atenção.
                    </li>
                    <li>
                      <strong className="text-blue-400">Normal:</strong> badge azul royal com ícone
                      de megafone.
                    </li>
                    <li>
                      Navegação <strong>"Anterior" / "Próximo"</strong> quando há mais de 1
                      comunicado pendente.
                    </li>
                  </ul>
                </div>
                <div className="bg-[#101726]/80 p-3.5 rounded-lg border border-[#1e2c47] space-y-1.5">
                  <h4 className="font-bold text-white font-montserrat flex items-center gap-1.5 text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Controle de Leitura
                    Persistente
                  </h4>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1 pl-1">
                    <li>
                      Ao clicar em{' '}
                      <strong className="text-emerald-400 font-semibold">"OK, ENTENDI"</strong>, o
                      ID do comunicado é gravado como lido e{' '}
                      <strong className="text-white">NUNCA MAIS reaparece</strong> para aquele
                      membro.
                    </li>
                    <li>
                      O membro também pode fechar no botão "X" ou clicando fora para ler mais tarde.
                    </li>
                    <li>
                      Novos comunicados lançados pelo admin entram automaticamente na fila de
                      leitura da próxima visita.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 14 */}
        <section
          id="sec-14"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 14
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                14. Relatórios e Exportações (Excel &amp; PDF)
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Relatórios (e botões de
              exportação em todas as telas administrativas)
            </p>

            <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                  <tr>
                    <th className="p-3 w-44">Relatório</th>
                    <th className="p-3">Conteúdo Gerado e Campos Incluídos</th>
                    <th className="p-3 w-36">Formatos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2538]">
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Membros Cadastrados</td>
                    <td className="p-3 text-slate-300">
                      Nome, CPF/CNPJ, E-mail, Telefone, Cidade, Categoria, Score de Oficina, Nível
                      de Relacionamento, Tags Inteligentes, Modelo de Moto e Status.
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">CSV (Excel), PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Passeios Oficiais</td>
                    <td className="p-3 text-slate-300">
                      Passeios realizados e agendados, ocupação de vagas, quilometragem prevista,
                      data, ponto de encontro e KM Atual médio dos inscritos.
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">CSV (Excel), PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Inscrições em Passeios</td>
                    <td className="p-3 text-slate-300">
                      Piloto, garupa, telefone, moto,{' '}
                      <strong className="text-white">KM Atual da Moto</strong>, status de check-in e
                      confirmação de termos.
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">CSV (Excel), PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Rankings de Membros</td>
                    <td className="p-3 text-slate-300">
                      Top membros por pontuação acumulada, Maior Score de Oficina e Maior Valor em
                      Compras acumulado.
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">CSV (Excel), PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Dashboard Executivo</td>
                    <td className="p-3 text-slate-300">
                      Resumo executivo com indicadores gerais, contagem por categorias, distribuição
                      de score e ranking integrado.
                    </td>
                    <td className="p-3 font-mono text-blue-400 font-bold">PDF Oficial</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Histórico de Importações</td>
                    <td className="p-3 text-slate-300">
                      Auditoria de planilhas processadas com arquivo, data/hora, linhas totais,
                      criados, atualizados, erros e status.
                    </td>
                    <td className="p-3 font-mono text-blue-400 font-bold">PDF Oficial</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Página 360º do Membro</td>
                    <td className="p-3 text-slate-300">
                      Ficha cadastral completa individual, snapshot de métricas de oficina,
                      histórico de compras de motos e histórico de passeios com KM.
                    </td>
                    <td className="p-3 font-mono text-blue-400 font-bold">PDF Individual</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538] space-y-1">
                <span className="text-xs font-bold text-rose-400 font-montserrat flex items-center gap-1.5 uppercase">
                  <FileText className="w-3.5 h-3.5" /> Padrão Visual dos Arquivos PDF
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Cabeçalho oficial PG PRIME Club em azul #0066FF com fundo dark #0A1120, carimbo de
                  data/hora de geração, numeração automática de páginas, tabelas zebradas autoTable
                  com colunas destacadas e rodapé institucional.
                </p>
              </div>

              <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538] space-y-1">
                <span className="text-xs font-bold text-emerald-400 font-montserrat flex items-center gap-1.5 uppercase">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Padrão dos Arquivos Excel (CSV / XLSX)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Colunas auto-ajustáveis, codificação UTF-8 compatível com Microsoft Excel,
                  cabeçalhos padronizados e abas nomeadas pelo tipo de relatório para rápida
                  consolidação em BI e CRM.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 15 */}
        <section
          id="sec-15"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 15
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                15. Configurações do Sistema &amp; Faixas de Score
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminhos:</strong> Admin → Configurações e Admin →
              Score de Oficina
            </p>

            <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                  <tr>
                    <th className="p-3 w-56">Configuração</th>
                    <th className="p-3">Descrição e Aplicação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2538]">
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">
                      Configuração do Score de Oficina
                    </td>
                    <td className="p-3">
                      Ajuste das faixas de valor (0-70) e frequência (0-30) com persistência no
                      banco
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Instagram / Facebook URLs</td>
                    <td className="p-3">
                      Links das redes sociais oficiais exibidos no rodapé e páginas institucionais
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Telefone e E-mail de contato</td>
                    <td className="p-3">Canais de suporte oficiais da PG PRIME</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Endereço da Concessionária</td>
                    <td className="p-3">
                      Endereços oficiais das concessionárias BMW (João Pessoa / Natal)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SEÇÃO 16 */}
        <section
          id="sec-16"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 16
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                16. Fluxos Principais de Operação
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 1: Importação de Membros em Massa (UPSERT)
              </h4>
              <p className="leading-relaxed">
                Admin faz upload da planilha (XLSX/CSV) → Sistema processa as 14 etapas com barra de
                progresso em tempo real e proteção anti-rate-limit → Novos cadastros recebem
                fallback de e-mail por CPF (
                <code className="text-cyan-300 font-mono">CPF@pgprime.club</code>) e entram como{' '}
                <strong className="text-amber-400">"Pré-cadastrado"</strong> → Registros existentes
                são atualizados preservando campos protegidos e gerando snapshots em{' '}
                <code className="text-slate-300 font-mono">historico_metricas_membro</code> (sem
                gerar historico_categoria em massa).
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 2: Cliente Ativa o Cadastro (/validar-cadastro)
              </h4>
              <p className="leading-relaxed">
                Cliente acessa o site → clica em{' '}
                <strong className="text-white">"JÁ SOU CLIENTE"</strong> → Digita CPF ou 7 últimos
                dígitos do chassi → Sistema recupera dados pré-cadastrados → Cliente define seu
                e-mail real, cria senha, aceita termos LGPD →{' '}
                <strong className="text-emerald-400">Status ATIVO automaticamente</strong>.
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 3: Cadastro Novo (Visitante do Site)
              </h4>
              <p className="leading-relaxed">
                Visitante preenche formulário no site → Status:{' '}
                <strong className="text-yellow-400">PENDENTE</strong> → Admin aprova em Admin →
                Membros → Status torna-se <strong className="text-emerald-400">ATIVO</strong>.
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 4: Inscrição em Passeio (com KM Obrigatório)
              </h4>
              <p className="leading-relaxed">
                Cliente escolhe o passeio → clica em{' '}
                <strong className="text-white">"QUERO PARTICIPAR"</strong> → Formulário abre com
                dados do membro pré-preenchidos → Escolhe garupa (sim/não) →{' '}
                <strong className="text-blue-300 font-semibold">
                  Informa KM ATUAL DA MOTO (obrigatório &gt; 0)
                </strong>{' '}
                → Informa contato de emergência → Aceita regulamento do passeio → Aceita termo de
                responsabilidade → Clica em{' '}
                <strong className="text-emerald-400">"CONFIRMAR PARTICIPAÇÃO"</strong> → Inscrição
                confirmada na hora.
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 17 */}
        <section
          id="sec-17"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 17
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                17. Carteirinha Digital Dinâmica &amp; Validação QR Code
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho do membro:</strong> Área do Membro →
              Carteirinha (/member/carteirinha)
            </p>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 17.1 Funcionalidades da
                Carteirinha
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-2">
                <li>
                  Exibe: Nome completo do membro, categoria com badge oficial, ID exclusivo PG PRIME
                  Club, modelo da moto cadastrada e QR Code dinâmico de autenticação.
                </li>
                <li>
                  Ao ser escaneado por parceiros ou staff, abre a página de validação pública com
                  status verificado{' '}
                  <span className="text-emerald-400 font-semibold">(MEMBRO ATIVO)</span> ou alerta{' '}
                  <span className="text-red-400 font-semibold">(MEMBRO INATIVO)</span>.
                </li>
                <li>
                  Dados sensíveis (como CPF, e-mail e telefone) nunca são expostos na validação
                  pública para conformidade com a LGPD.
                </li>
              </ul>
            </div>

            {/* NOVA SUBSEÇÃO 17.2 */}
            <div className="bg-[#101726] border border-[#1d2d4a] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase font-montserrat">
                <Palette className="w-4 h-4 text-blue-400" />
                17.2 Cores Dinâmicas por Categoria
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A carteirinha digital{' '}
                <strong className="text-white">
                  REFLETE EM TEMPO REAL a cor temática da categoria
                </strong>{' '}
                do cliente, proporcionando uma experiência ultra premium e visualmente
                personalizada:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/40 text-center space-y-1">
                  <span className="font-bold text-blue-400 text-xs block font-montserrat">
                    PLATINUM
                  </span>
                  <span className="text-[11px] font-mono text-blue-300">#60a5fa</span>
                  <span className="text-[10px] text-slate-400 block">Azul Royal Premium</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-center space-y-1">
                  <span className="font-bold text-amber-400 text-xs block font-montserrat">
                    GOLD
                  </span>
                  <span className="text-[11px] font-mono text-amber-300">#f59e0b</span>
                  <span className="text-[10px] text-slate-400 block">Dourado Premium</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-600/40 text-center space-y-1">
                  <span className="font-bold text-slate-300 text-xs block font-montserrat">
                    PRATA
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">#94a3b8</span>
                  <span className="text-[10px] text-slate-400 block">Prata Metálico</span>
                </div>
                <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-500/40 text-center space-y-1">
                  <span className="font-bold text-orange-400 text-xs block font-montserrat">
                    BRONZE
                  </span>
                  <span className="text-[11px] font-mono text-orange-300">#ea580c</span>
                  <span className="text-[10px] text-slate-400 block">Bronze Oficial</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-center space-y-1">
                  <span className="font-bold text-slate-400 text-xs block font-montserrat">
                    INATIVO
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">#64748b</span>
                  <span className="text-[10px] text-slate-500 block">Cinza Neutro</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">
                  Elementos que se adaptam dinamicamente à cor da categoria:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                  <li>Brilho radial de fundo (ambient background glow)</li>
                  <li>Borda externa com efeito de profundidade neon</li>
                  <li>Linha divisória decorativa superior e inferior</li>
                  <li>Moldura com efeito glow do QR Code de validação</li>
                  <li>Barras estilizadas M-Performance no rodapé da carteirinha</li>
                  <li>
                    Ícone de autenticidade <em>"ACESSO EXCLUSIVO"</em>
                  </li>
                  <li>Grafismo com estrada pontilhada em curva SVG integrado</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 18 */}
        <section
          id="sec-18"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 18
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                18. Segurança e Auditoria
              </h2>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <strong className="text-white">Auditoria Completa:</strong> toda alteração manual ou
                automática de categoria registra autor, data, valores anterior/novo e justificativa.
              </li>
              <li>
                <strong className="text-white">Token Diário SHA-256:</strong> o check-in no balcão
                da loja é protegido por criptografia e renovado automaticamente todo dia às 00:00.
              </li>
              <li>
                <strong className="text-white">Unicidade de CPF / CNPJ:</strong> previne duplicidade
                de registros tanto na importação em massa quanto no formulário do site.
              </li>
              <li>
                <strong className="text-white">Fallback por CPF na Importação:</strong> assegura que
                nenhum registro importe com e-mail duplicado de terceiros.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 19: FAQ EXPANDIDO */}
        <section
          id="sec-19"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 19
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                19. Dúvidas Frequentes (FAQ)
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: O Score de Oficina pode rebaixar a categoria de um membro?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong>{' '}
                <strong className="text-white">NÃO</strong>. O Score de Oficina mede a intensidade
                do relacionamento pós-vendas e é totalmente independente da Categoria. Um Platinum
                com Score baixo continua Platinum (recebe tag VIP AFASTADO para ação de pós-vendas).
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Como funciona o pop-up de comunicados ao entrar na área do membro?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> Ao acessar qualquer rota{' '}
                <code className="text-blue-300 font-mono">/member/*</code>, o sistema busca
                comunicados ativos que o membro ainda não marcou como lidos. Se houver, abre um
                modal elegante dark exibindo o aviso com badge de prioridade (Urgente com borda
                pulsante vermelha, Importante em âmbar, Normal em azul). Quando o membro clica em{' '}
                <strong className="text-emerald-400">"OK, ENTENDI"</strong>, o comunicado é marcado
                como lido e nunca mais aparece para ele.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Por que o sistema pede o KM atual da moto na inscrição do passeio?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> Para fins de segurança, planejamento
                de revisões e acompanhamento de pós-vendas da concessionária PG PRIME. O campo é
                obrigatório (valor &gt; 0) com máscara numérica e alimenta a ficha 360º do membro,
                relatórios em PDF e planilhas em Excel.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Posso clicar nos cards do dashboard para ver os membros filtrados?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong>{' '}
                <strong className="text-white">
                  Sim, todos os cards do Dashboard são clicáveis!
                </strong>{' '}
                Ao clicar em Platinum, Gold, Score 85+, VIP Ativos, VIP Afastados, Próximos do
                Gold/Platinum ou 1ª Passagem Pendente, você é levado imediatamente à tela de membros
                com a lista filtrada correspondente.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: A carteirinha digital muda de cor conforme a categoria do cliente?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> Sim! A carteirinha digital adapta seus
                elementos visuais (brilho, bordas, linhas, QR Code glow e barras M-style) para a cor
                temática da categoria do membro: Azul (#60a5fa) para Platinum, Dourado (#f59e0b)
                para Gold, Prata (#94a3b8) para Prata, Laranja Bronze (#ea580c) para Bronze e Cinza
                (#64748b) para Inativo.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Um membro Bronze perdeu o status. Como reativar?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> O status Bronze expira após 6 meses
                sem passagem pela oficina. Ao registrar uma nova visita à loja (check-in) ou nova
                passagem na oficina, o sistema reativa o cadastro automaticamente.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Posso mudar a categoria ou Score de um membro manualmente?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> Sim. Em Admin → Membros, edite o
                membro e realize o ajuste de categoria informando a justificativa obrigatória, ou
                altere os valores de oficina para recalcular o Score.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Onde configuro as faixas de pontuação do Score de Oficina?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> No menu lateral{' '}
                <strong className="text-white">Admin → Score de Oficina</strong>. As faixas de valor
                em R$ e número de passagens podem ser customizadas e salvas pelo administrador.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Floating / Action Bar */}
      <section className="bg-gradient-to-r from-[#0f1422] to-[#121824] border border-[#1d2638] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300">
            Você está visualizando a versão completa e atualizada do Manual do Administrador (com
            todas as funcionalidades de Score de Oficina, 14 Etapas, KM Atual, Pop-up de Comunicados
            e Carteirinha Dinâmica).
          </span>
        </div>
        <Button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="bg-[#0066FF] hover:bg-blue-500 text-white font-montserrat text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-lg shadow-[#0066FF]/25 border border-blue-400/30 flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Gerando PDF...' : '📥 Baixar Manual em PDF'}
        </Button>
      </section>
    </div>
  )
}

export default AdminManual
