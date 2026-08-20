import React, { useState } from 'react'
import {
  BookOpen,
  Download,
  Lock,
  Users,
  Calendar,
  ClipboardList,
  Trophy,
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
  { id: 'sec-2', title: '2. Gestão de Membros', icon: Users },
  { id: 'sec-3', title: '3. Gestão de Passeios', icon: Calendar },
  { id: 'sec-4', title: '4. Inscrições', icon: ClipboardList },
  { id: 'sec-5', title: '5. Programa de Pontos e Categorias', icon: Trophy },
  { id: 'sec-6', title: '6. QR Code da Loja (Check-in)', icon: QrCode },
  { id: 'sec-7', title: '7. Dashboard', icon: LayoutDashboard },
  { id: 'sec-8', title: '8. Benefícios', icon: Gift },
  { id: 'sec-9', title: '9. Parceiros', icon: Handshake },
  { id: 'sec-10', title: '10. Banners e Galeria', icon: Image },
  { id: 'sec-11', title: '11. Comunicados', icon: Megaphone },
  { id: 'sec-12', title: '12. Relatórios', icon: BarChart3 },
  { id: 'sec-13', title: '13. Configurações', icon: Settings },
  { id: 'sec-14', title: '14. Fluxos Principais', icon: Repeat },
  { id: 'sec-15', title: '15. Carteirinha Digital e QR Code', icon: CreditCard },
  { id: 'sec-16', title: '16. Segurança e Auditoria', icon: ShieldCheck },
  { id: 'sec-17', title: '17. Dúvidas Frequentes', icon: HelpCircle },
]

export const AdminManual: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPdf = () => {
    try {
      setDownloading(true)
      exportAdminManualPdf()
      toast({
        title: 'Download iniciado',
        description: 'O arquivo Manual_Admin_EuroMotors_Club.pdf foi gerado com sucesso.',
      })
    } catch (e) {
      console.error('Erro ao gerar PDF do manual:', e)
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Houve uma falha na criação do documento em PDF.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
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
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest font-montserrat">
              <BookOpen className="w-3.5 h-3.5" />
              Documentação Oficial
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-montserrat tracking-tight">
              Manual do Administrador
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Guia completo de procedimentos, regras de negócio, gestão de membros, pontuação e
              operação de todo o sistema{' '}
              <strong className="text-slate-200 font-semibold">Euro Motors Motorrad Club</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-montserrat text-xs font-bold uppercase tracking-wider px-5 py-5 shadow-lg shadow-blue-600/20 border border-blue-400/30 flex items-center gap-2"
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
            <Sparkles className="w-4 h-4 text-blue-400" />
            Índice Rápido de Navegação ({SECTIONS.length} seções)
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar seção ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs pl-9 h-9 placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-2">
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#121824] hover:bg-[#192233] border border-[#1f2a3f] hover:border-blue-500/50 text-left transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
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
                  href="https://euromotorsclub.goskip.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 font-mono text-xs"
                >
                  https://euromotorsclub.goskip.app <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Faça login com seu e-mail e senha de administrador.</li>
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
                      <td className="p-3 font-semibold text-white">Ricardo Euro Motors</td>
                      <td className="p-3 font-mono text-slate-300">
                        ricardo@grupoeuromotors.com.br
                      </td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-semibold text-white">ADAUTO SAMPAIO</td>
                      <td className="p-3 font-mono text-slate-300">
                        eventos@grupoeuromotors.com.br
                      </td>
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
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 2
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                2. Gestão de Membros
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Membros
            </p>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.1 Buscar e Filtrar
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>
                  Use a barra de pesquisa para localizar por{' '}
                  <strong className="text-white">nome, CPF ou e-mail</strong>.
                </li>
                <li>
                  Filtros disponíveis: <strong className="text-white">categoria</strong>{' '}
                  (Bronze/Prata/Gold/Platinum) e <strong className="text-white">status</strong>{' '}
                  (Ativo/Pendente/Inativo/Bloqueado/Pré-cadastrado).
                </li>
              </ul>
            </div>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.2 Editar Membro
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>Clique no nome do membro → abre modal com todos os dados cadastrais.</li>
                <li>
                  Campos editáveis: nome, telefone, e-mail, cidade, marca/modelo/ano da moto e
                  chassi.
                </li>
                <li>
                  <strong className="text-blue-400 font-semibold">
                    Ajuste manual de categoria:
                  </strong>{' '}
                  exige justificativa obrigatória e fica registrado permanentemente no histórico de
                  auditoria.
                </li>
                <li>
                  Botão <strong className="text-white">"Recalcular categoria"</strong>: recalcula
                  automaticamente com base no volume de motos e passagens em oficina.
                </li>
              </ul>
            </div>

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
                        Importado via planilha, aguardando o cliente validar e criar senha no site.
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

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 2.4 Deletar Membro
              </h3>
              <p className="text-xs text-slate-300">
                Ícone de lixeira (🗑️) na coluna Ações → modal de confirmação de segurança → exclusão
                permanente do banco de dados.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> 2.5 Importar Membros em
                Massa
              </h3>
              <p className="text-xs text-slate-300">
                Clique em <strong className="text-white">📥 IMPORTAR MEMBROS</strong> e faça o
                upload de uma planilha Excel (<code className="text-blue-400 font-mono">.xlsx</code>
                ) ou CSV.
              </p>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3">Coluna</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Obrigatório</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538] font-mono text-[11px]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">nome</td>
                      <td className="p-2.5 font-sans">Nome completo do membro</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">cpf</td>
                      <td className="p-2.5 font-sans">CPF (apenas números ou formatado)</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">telefone</td>
                      <td className="p-2.5 font-sans">WhatsApp com DDD</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">email</td>
                      <td className="p-2.5 font-sans">E-mail válido de contato</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">cidade</td>
                      <td className="p-2.5 font-sans">Cidade de residência</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">bike_brand</td>
                      <td className="p-2.5 font-sans">Marca da moto (ex: BMW)</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">bike_model</td>
                      <td className="p-2.5 font-sans">Modelo da moto (ex: R 1250 GS)</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 font-bold text-blue-400">bike_year</td>
                      <td className="p-2.5 font-sans">Ano de fabricação</td>
                      <td className="p-2.5 font-sans font-semibold text-emerald-400">✅ Sim</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 text-slate-400">bike_chassi</td>
                      <td className="p-2.5 font-sans">Chassi completo da motocicleta</td>
                      <td className="p-2.5 font-sans text-slate-400">Não</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 text-slate-400">quantidade_motos_compradas</td>
                      <td className="p-2.5 font-sans">Total histórico de motos compradas</td>
                      <td className="p-2.5 font-sans text-slate-400">Não</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 text-slate-400">data_ultima_passagem_oficina</td>
                      <td className="p-2.5 font-sans">Data da revisão (DD/MM/AAAA)</td>
                      <td className="p-2.5 font-sans text-slate-400">Não</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 text-slate-400">data_primeira_compra</td>
                      <td className="p-2.5 font-sans">Data da primeira aquisição</td>
                      <td className="p-2.5 font-sans text-slate-400">Não</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-2.5 text-slate-400">data_ultima_compra</td>
                      <td className="p-2.5 font-sans">Data da última aquisição</td>
                      <td className="p-2.5 font-sans text-slate-400">Não</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2 pt-1">
                <li>
                  <strong className="text-white">Preview automático:</strong> o sistema valida linha
                  por linha e exibe quais registros estão corretos e quais contêm erros.
                </li>
                <li>
                  Ao confirmar a gravação, todos os membros entram com status{' '}
                  <strong className="text-amber-400">"Pré-cadastrado"</strong>.
                </li>
                <li>
                  Para obter a planilha de exemplo pronta, clique no botão{' '}
                  <strong className="text-white">"Baixar modelo"</strong> no próprio modal de
                  importação.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEÇÃO 3 */}
        <section
          id="sec-3"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 3
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                3. Gestão de Passeios
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Passeios
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 3.1 Criar Passeio
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
                      <td className="p-3">Local de partida (ex: Euro Motors) e ponto final</td>
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
                  <ChevronRight className="w-4 h-4 text-blue-400" /> 3.2 Editar / Excluir Passeio
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique no card do passeio → edite qualquer informação → Salvar. Ícone de lixeira
                  para exclusão com confirmação.
                </p>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
                <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-400" /> 3.3 Ver Inscritos & Check-in
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aba <strong className="text-white">Inscritos</strong>: lista com piloto, garupa,
                  moto, contatos de emergência e contadores em tempo real (motos e participantes).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4 */}
        <section
          id="sec-4"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 4
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                4. Inscrições
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Inscrições
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>Centraliza todas as inscrições realizadas em todos os passeios do Clube.</li>
              <li>
                <strong className="text-white">Filtros rápidos:</strong> localize inscrições por
                passeio específico, por membro ou por status da vaga.
              </li>
              <li>
                Cada registro detalha: nome do piloto, moto utilizada, presença e identificação de
                garupa, telefone de emergência e aceite legal dos regulamentos.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 5 */}
        <section
          id="sec-5"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 5
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                5. Programa de Pontos e Categorias
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 5.1 Como Funciona
              </h3>
              <p className="text-xs text-slate-300">
                O sistema calcula e classifica automaticamente cada membro em uma categoria de
                prestígio com base nos pontos acumulados e histórico com a concessionária.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 5.2 Categorias e Pontuação
              </h3>
              <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                    <tr>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Pontuação</th>
                      <th className="p-3">Badge Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2538]">
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-blue-400">PLATINUM</td>
                      <td className="p-3 font-semibold">500+ pontos</td>
                      <td className="p-3 text-slate-300">💎 Azul premium especial</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-amber-400">GOLD</td>
                      <td className="p-3 font-semibold">300 – 499 pontos</td>
                      <td className="p-3 text-slate-300">👑 Dourado</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-slate-300">PRATA</td>
                      <td className="p-3 font-semibold">100 – 299 pontos</td>
                      <td className="p-3 text-slate-300">⭐ Prata</td>
                    </tr>
                    <tr className="hover:bg-[#141b27]/60">
                      <td className="p-3 font-bold text-amber-600">BRONZE</td>
                      <td className="p-3 font-semibold">0 – 99 pontos</td>
                      <td className="p-3 text-slate-300">🛡️ Bronze</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 5.3 Como os Membros Ganham Pontos
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
                      <td className="p-3 font-medium text-white">Compra de moto na Euro Motors</td>
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

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 5.4 Regras Importantes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>
                  A categoria é <strong className="text-white">calculada automaticamente</strong>{' '}
                  sempre que o membro ganha pontos.
                </li>
                <li>
                  Evolução imediata: ao atingir o threshold, o membro sobe de categoria na hora na
                  carteirinha digital.
                </li>
                <li>
                  Toda mudança de categoria fica registrada no{' '}
                  <strong className="text-white">histórico de auditoria</strong>.
                </li>
                <li>
                  O admin pode realizar <strong className="text-white">ajuste manual</strong> (exige
                  justificativa obrigatória).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEÇÃO 6 */}
        <section
          id="sec-6"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-5 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 6
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                6. QR Code da Loja (Check-in de Visita)
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → QR Code Loja
            </p>

            <div className="space-y-2 bg-[#121824] p-4 rounded-lg border border-[#1c2538]">
              <h3 className="text-sm font-bold text-white font-montserrat flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400" /> 6.1 Como Funciona
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                <li>Um QR Code oficial fica exposto no balcão de atendimento da Euro Motors.</li>
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
                <Printer className="w-4 h-4 text-blue-400" /> 6.2 Rotina Diária Recomendada
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

        {/* SEÇÃO 7 */}
        <section
          id="sec-7"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 7
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                7. Dashboard
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Dashboard
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Indicadores em Tempo Real
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Total de membros</li>
                  <li>Novos membros no mês</li>
                  <li>Membros ativos</li>
                  <li>Próximo passeio e data</li>
                  <li>Motos e participantes</li>
                  <li>Vagas disponíveis</li>
                  <li>Passeios realizados</li>
                </ul>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Cards por Categoria
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>🔷 Platinum ativos</li>
                  <li>🥇 Gold ativos</li>
                  <li>🥈 Prata ativos</li>
                  <li>🥉 Bronze ativos</li>
                  <li>⚠️ Bronze próximos do vencimento</li>
                  <li>💤 Bronze inativos</li>
                </ul>
              </div>

              <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                  Ranking Geral
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  🏆 <strong className="text-white">TOP MEMBROS</strong> por pontuação acumulada
                  total com badges e medalhas de honra (🥇🥈🥉).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 8 */}
        <section
          id="sec-8"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 8
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                8. Benefícios
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Benefícios
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>
                Permite <strong className="text-white">criar, editar e excluir</strong> benefícios
                concedidos aos membros.
              </li>
              <li>
                Cada benefício pode ser vinculado a uma ou mais categorias (Bronze, Prata, Gold,
                Platinum).
              </li>
              <li>
                Campos: título, descrição completa, imagem de divulgação, categorias contempladas e
                validade.
              </li>
              <li>
                A <strong className="text-white">Matriz de Benefícios</strong> (quadro comparativo
                geral por categoria) é atualizada e exibida na página pública e na área logada do
                membro.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 9 */}
        <section
          id="sec-9"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 9
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                9. Parceiros
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Parceiros
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>Cadastro de estabelecimentos e parceiros comerciais conveniados ao Clube.</li>
              <li>
                Campos: nome da empresa parceira, logotipo, descrição da vantagem/desconto, link
                oficial e categorias com acesso.
              </li>
              <li>
                Aparecem automaticamente na página pública de parceiros e na área restrita do
                membro.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 10 */}
        <section
          id="sec-10"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 10
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                10. Banners e Galeria
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
                <li>Imagens em alta resolução do topo da Home (carrossel principal).</li>
                <li>Upload de arquivos, reordenação de exibição e controle de ativar/desativar.</li>
              </ul>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-2">
              <h4 className="text-sm font-bold text-white font-montserrat">Galeria de Fotos</h4>
              <p className="text-xs text-slate-400">
                <strong className="text-blue-400">Caminho:</strong> Admin → Galeria
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                <li>Upload de fotos oficiais dos passeios e eventos promovidos.</li>
                <li>Organização por álbuns temáticos com lightbox integrado no site.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEÇÃO 11 */}
        <section
          id="sec-11"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 11
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                11. Comunicados
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Comunicados
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>
                Publicação de notícias oficiais, avisos urgentes e alertas gerais para os membros.
              </li>
              <li>
                Campos: título, texto formatado, data de emissão, imagem ilustrativa e marcação de
                urgência.
              </li>
              <li>Aparecem com destaque prioritário na área do membro.</li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 12 */}
        <section
          id="sec-12"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 12
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                12. Relatórios
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Relatórios
            </p>

            <div className="overflow-x-auto border border-[#1c2538] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121824] text-slate-400 uppercase font-montserrat font-bold">
                  <tr>
                    <th className="p-3">Relatório</th>
                    <th className="p-3">Conteúdo Gerado</th>
                    <th className="p-3">Formatos de Exportação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2538]">
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Membros</td>
                    <td className="p-3">Lista completa com nome, CPF, categoria, motos e pontos</td>
                    <td className="p-3 font-mono text-blue-400 font-bold">CSV, PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Passeios</td>
                    <td className="p-3">Passeios realizados, agendados, ocupação e datas</td>
                    <td className="p-3 font-mono text-blue-400 font-bold">CSV, PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Inscrições</td>
                    <td className="p-3">Inscritos, acompanhantes e check-in por passeio</td>
                    <td className="p-3 font-mono text-blue-400 font-bold">CSV, PDF</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Ranking</td>
                    <td className="p-3">Top membros por pontuação acumulada geral</td>
                    <td className="p-3 font-mono text-blue-400 font-bold">CSV, PDF</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 pt-1">
              <strong className="text-white">Filtros disponíveis:</strong> por categoria (Bronze,
              Prata, Gold, Platinum), por status (Ativo, Inativo, Pendente) e por intervalo de
              datas.
            </p>
          </div>
        </section>

        {/* SEÇÃO 13 */}
        <section
          id="sec-13"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 13
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                13. Configurações
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho:</strong> Admin → Configurações
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
                    <td className="p-3 font-semibold text-white">Instagram URL</td>
                    <td className="p-3">Link do Instagram oficial (exibido no rodapé e na Home)</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Facebook URL</td>
                    <td className="p-3">Link da página oficial do Facebook</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Telefone de contato</td>
                    <td className="p-3">
                      Telefone e WhatsApp oficial exibido na página de Contato
                    </td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">E-mail de contato</td>
                    <td className="p-3">E-mail oficial para suporte aos associados</td>
                  </tr>
                  <tr className="hover:bg-[#141b27]/60">
                    <td className="p-3 font-semibold text-white">Endereço</td>
                    <td className="p-3">
                      Endereço da Euro Motors exibido no rodapé e página Contato
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SEÇÃO 14 */}
        <section
          id="sec-14"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 14
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                14. Fluxos Principais
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 1: Importação de Membros
              </h4>
              <p className="leading-relaxed">
                Admin faz upload da planilha → Sistema valida linha por linha → Preview: X válidos,
                Y com erro → Admin confirma → membros entram como{' '}
                <strong className="text-amber-400">"Pré-cadastrado"</strong> → Categoria calculada
                automaticamente.
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 2: Cliente Ativa o Cadastro
              </h4>
              <p className="leading-relaxed">
                Cliente acessa o site → clica em{' '}
                <strong className="text-white">"JÁ SOU CLIENTE"</strong> → Digita CPF ou 7 últimos
                dígitos do chassi → Sistema puxa os dados pré-cadastrados → Cliente confere, cria
                senha, aceita termos LGPD →{' '}
                <strong className="text-emerald-400">ATIVO automaticamente</strong> (sem necessidade
                de aprovação do admin).
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 3: Cadastro Novo (Não Pré-cadastrado)
              </h4>
              <p className="leading-relaxed">
                Visitante preenche formulário completo no site público → Status:{' '}
                <strong className="text-yellow-400">PENDENTE</strong> → Admin aprova manualmente em
                Admin → Membros → Status torna-se{' '}
                <strong className="text-emerald-400">ATIVO</strong>.
              </p>
            </div>

            <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1c2538]">
              <h4 className="font-bold text-white font-montserrat text-sm mb-1 text-blue-400">
                Fluxo 4: Inscrição em Passeio
              </h4>
              <p className="leading-relaxed">
                Cliente acessa Passeios → escolhe um →{' '}
                <strong className="text-white">"QUERO PARTICIPAR"</strong> → Sistema preenche nome,
                telefone e moto automaticamente → Cliente informa se vai com garupa (Sim/Não) → Se
                sim, preenche dados do acompanhante → Contato de emergência + aceite do regulamento
                → <strong className="text-white">"CONFIRMAR PARTICIPAÇÃO"</strong> → Inscrição
                realizada com sucesso.
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 15 */}
        <section
          id="sec-15"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 15
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                15. Carteirinha Digital e QR Code
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">
              <strong className="text-blue-400">Caminho do membro:</strong> Área do Membro →
              Carteirinha
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>
                Exibe: nome, categoria com badge oficial colorida, ID exclusivo do membro e QR Code.
              </li>
              <li>
                O QR Code é <strong className="text-white">real e exclusivo</strong> por membro.
              </li>
              <li>
                Ao ser escaneado, abre a página de validação pública:
                <ul className="list-none space-y-1 pl-6 pt-1">
                  <li className="text-emerald-400 font-semibold">
                    ✅ MEMBRO ATIVO — mostra nome e categoria
                  </li>
                  <li className="text-red-400 font-semibold">
                    ❌ MEMBRO INATIVO — alerta se o cadastro estiver bloqueado ou expirado
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-white">Privacidade e Proteção de Dados:</strong> Dados
                sensíveis <strong className="text-blue-400">NUNCA</strong> aparecem na validação
                pública (CPF, telefone, e-mail).
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 16 */}
        <section
          id="sec-16"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 16
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                16. Segurança e Auditoria
              </h2>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <strong className="text-white">Histórico e Auditoria:</strong> toda alteração de
                categoria fica registrada (quem alterou, valor anterior, valor novo, data/hora e
                justificativa).
              </li>
              <li>
                <strong className="text-white">Ações protegidas:</strong> apenas administradores
                autenticados com credenciais autorizadas acessam o painel administrativo.
              </li>
              <li>
                <strong className="text-white">Check-in de loja seguro:</strong> token diário
                criptográfico (SHA-256) — impossível de ser burlado ou reutilizado no dia seguinte.
              </li>
              <li>
                <strong className="text-white">CPF único:</strong> o sistema impede duplicidade de
                CPF em cadastros novos e importações.
              </li>
            </ul>
          </div>
        </section>

        {/* SEÇÃO 17 */}
        <section
          id="sec-17"
          className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-5 sm:p-7 space-y-4 scroll-mt-24 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2538]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-montserrat">
                Seção 17
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-montserrat">
                17. Dúvidas Frequentes (FAQ)
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Um membro Bronze perdeu o status. Como reativar?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> O status Bronze expira após 6 meses
                sem passagem pela oficina. Quando o cliente fizer uma nova visita à loja (check-in
                QR Code) ou tiver uma nova passagem de oficina registrada, o sistema reativa
                automaticamente como Bronze ativo.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Posso mudar a categoria de um membro manualmente?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> Sim. No menu Admin → Membros, edite o
                membro e use <strong className="text-white">"Ajuste manual de categoria"</strong>. É
                obrigatório preencher a justificativa, e a alteração fica registrada na auditoria.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: O QR Code da loja parou de funcionar. O que fazer?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> O token expira todo dia à meia-noite.
                Acesse <strong className="text-white">Admin → QR Code Loja</strong> e imprima o novo
                QR Code do dia.
              </p>
            </div>

            <div className="bg-[#121824] p-4 rounded-lg border border-[#1c2538] space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                P: Como adicionar pontos manualmente para um membro?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-blue-400">R:</strong> O sistema calcula automaticamente com
                base nas ações do membro. Se precisar de ajuste, edite o membro e atualize os campos{' '}
                <code className="text-blue-400 font-mono">quantidade_motos_compradas</code> ou{' '}
                <code className="text-blue-400 font-mono">data_ultima_passagem_oficina</code> — o
                sistema recalcula a categoria.
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
            Você está visualizando a versão completa e atualizada do Manual do Administrador.
          </span>
        </div>
        <Button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-montserrat text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-lg shadow-blue-600/20 border border-blue-400/30 flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Gerando PDF...' : '📥 Baixar Manual em PDF'}
        </Button>
      </section>
    </div>
  )
}

export default AdminManual
