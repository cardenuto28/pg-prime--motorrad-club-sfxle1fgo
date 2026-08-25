import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Bike,
  Wrench,
  Target,
  TrendingUp,
  Calendar,
  History,
  Loader2,
  Crown,
  Shield,
  CreditCard,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  UserProfile,
  Registration,
  userService,
  registrationService,
  historicoMetricasService,
  type HistoricoMetricaMembro,
} from '@/services/api'
import { MemberStatusBadge, formatDate } from '@/lib/member'
import { CategoryBadge } from '@/components/CategoryBadge'
import { exportMemberProfilePdf } from '@/lib/pdfExport'
import { exportMemberProfileExcel } from '@/lib/excelExport'
import { FileText, FileSpreadsheet } from 'lucide-react'
import {
  calcularCategoriaMembro,
  normalizeCategory,
  parseTags,
  nivelRelacionamentoMeta,
  tagBadgeClass,
} from '@/lib/membership'

const formatBRL = (v: number) =>
  (Number(v) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  })

const formatDateTime = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/**
 * PARTE 3 — Página 360º do Cliente (/admin/membros/:id)
 *
 * Visão consolidada de um membro, reunindo:
 *  - Cabeçalho (nome, categoria, score, nível, status)
 *  - Histórico comercial (compras, valores, datas)
 *  - Pós-vendas (oficina: passagens, valor, última passagem, meses)
 *  - Oportunidade (próxima melhor ação, dias/meses desde venda)
 *  - Histórico de métricas (tabela com snapshots de cada importação que afetou o membro)
 *
 * Os dados vêm do registro do membro em `users` (atualizado a cada importação)
 * e dos snapshots salvos em `historico_metricas_membro` (migration 0021).
 */
const AdminMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [metricas, setMetricas] = useState<HistoricoMetricaMembro[]>([])
  const [ridesHistory, setRidesHistory] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [u, hist, userRegs] = await Promise.all([
        userService.getUserById(id),
        historicoMetricasService.getByMembro(id),
        registrationService.getRegistrationsByUser(id).catch(() => [] as Registration[]),
      ])
      if (!u) {
        toast({ title: 'Membro não encontrado', variant: 'destructive' })
        navigate('/admin/membros')
        return
      }
      setUser(u)
      setMetricas(hist)
      setRidesHistory(userRegs)
    } catch (e) {
      console.error('Erro ao carregar membro:', e)
      toast({ title: 'Erro ao carregar membro', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id, navigate, toast])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const calc = calcularCategoriaMembro({
    quantidade_motos_compradas: user.quantidade_motos_compradas,
    data_ultima_passagem_oficina: user.data_ultima_passagem_oficina,
    status_membro_atual: user.status_membro || user.status,
  })
  const effectiveCat = normalizeCategory(user.categoria || user.category || calc.categoria)
  const score = Number(user.score_oficina || 0)
  const meta = nivelRelacionamentoMeta(user.nivel_relacionamento || '')
  const tags = parseTags(user.tags)
  const proximaAcao = user.proxima_melhor_acao || 'SEM AÇÃO'

  // Métricas calculadas
  const totalComprado = Number(user.total_valor_vendido || 0)
  const totalOficina = Number(user.total_liquido_oficina || 0)
  const totalCompras = Number(user.quantidade_motos_compradas || 0)
  const totalPassagens = Number(user.numero_passagens_oficina || 0)
  const veiculosElegiveis = Number(user.total_veiculos_elegiveis || 0)
  const diasDesdeVenda = Number(user.dias_desde_venda || 0)
  const mesesDesdeVenda = Number(user.meses_desde_venda || 0)
  const mesesDesdeUltimaPassagem = Number(user.meses_desde_ultima_passagem || 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb / voltar & Ações de Exportação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/membros')}
          className="text-slate-400 hover:text-white w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar para Lista
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              exportMemberProfileExcel(user, metricas, ridesHistory)
              toast({
                title: 'Excel Gerado',
                description: `Ficha de ${user.name || 'Membro'} exportada em XLSX.`,
              })
            }}
            variant="outline"
            size="sm"
            className="border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:text-white hover:bg-emerald-950/60 text-xs gap-1.5 h-8"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> EXPORTAR EXCEL
          </Button>
          <Button
            onClick={() => {
              exportMemberProfilePdf(user, metricas, ridesHistory)
              toast({
                title: 'PDF Gerado',
                description: `Ficha 360º de ${user.name || 'Membro'} exportada em PDF.`,
              })
            }}
            variant="outline"
            size="sm"
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 h-8"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" /> EXPORTAR PDF
          </Button>
          <Link
            to={`/verificar/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 ml-1"
          >
            <CreditCard className="w-3.5 h-3.5" /> VER CARTEIRINHA{' '}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ===== CABEÇALHO 360º ===== */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Avatar + nome + contatos */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-2xl flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight truncate">
                  {user.name || '—'}
                </h1>
                <MemberStatusBadge status={user.status} statusMembro={user.status_membro} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {user.phone}
                  </span>
                )}
                {user.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {user.city}
                  </span>
                )}
                {user.cpf && (
                  <span className="flex items-center gap-1 font-mono">
                    <User className="w-3 h-3" /> {user.cpf}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <CategoryBadge category={effectiveCat} size="md" />
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                >
                  {meta.short}
                </span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold ${tagBadgeClass(t)}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Score circular */}
          <div className="flex items-center gap-4 bg-[#0a0d14] border border-[#1c2538] rounded-lg p-4 min-w-[220px]">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1c2538" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                  className={meta.textColor.replace('text-', 'text-')}
                  style={{ color: 'currentColor' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-black ${meta.textColor}`}>{score}</span>
                <span className="text-[9px] text-slate-500">/100</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Score de Oficina
              </p>
              <p className={`text-sm font-bold ${meta.textColor}`}>{meta.label}</p>
              <p className="text-[10px] text-slate-500">Relacionamento</p>
            </div>
          </div>
        </div>

        {/* Barra linear do score */}
        <div className="mt-4">
          <div className="w-full h-2.5 rounded-full bg-[#1c2538] overflow-hidden">
            <div className={`h-full ${meta.barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </section>

      {/* ===== GRID: Histórico Comercial + Pós-Vendas + Oportunidade ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* HISTÓRICO COMERCIAL */}
        <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1c2538] pb-2">
            <Bike className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Histórico Comercial
            </h2>
          </div>
          <div className="space-y-2.5">
            <MetricRow label="Veículos elegíveis" value={String(veiculosElegiveis)} />
            <MetricRow
              label="Valor total comprado"
              value={formatBRL(totalComprado)}
              valueClass="text-blue-300"
            />
            <MetricRow
              label="Data última compra"
              value={user.data_primeira_compra ? formatDate(user.data_primeira_compra) : '—'}
            />
            <MetricRow label="Total de compras" value={String(totalCompras)} />
          </div>
        </section>

        {/* PÓS-VENDAS */}
        <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1c2538] pb-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Pós-Vendas
            </h2>
          </div>
          <div className="space-y-2.5">
            <MetricRow label="Nº passagens oficina" value={String(totalPassagens)} />
            <MetricRow
              label="Valor total gasto oficina"
              value={formatBRL(totalOficina)}
              valueClass="text-cyan-300"
            />
            <MetricRow
              label="Última passagem"
              value={
                user.data_ultima_passagem_oficina
                  ? formatDate(user.data_ultima_passagem_oficina)
                  : '—'
              }
            />
            <MetricRow
              label="Meses desde última passagem"
              value={mesesDesdeUltimaPassagem > 0 ? `${mesesDesdeUltimaPassagem} mês(es)` : '—'}
            />
          </div>
        </section>

        {/* OPORTUNIDADE */}
        <section className="bg-gradient-to-br from-[#0c1322] via-[#090e18] to-[#0c1424] border border-amber-600/40 rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-amber-300 font-montserrat tracking-widest uppercase">
              Oportunidade
            </h2>
          </div>
          <div className="space-y-2.5">
            <div className="bg-amber-950/30 border border-amber-600/40 rounded-lg p-3">
              <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-1">
                Próxima melhor ação
              </p>
              <p className="text-sm font-bold text-amber-200">{proximaAcao}</p>
            </div>
            <MetricRow
              label="Dias desde venda"
              value={diasDesdeVenda > 0 ? `${diasDesdeVenda} dia(s)` : '—'}
            />
            <MetricRow
              label="Meses desde venda"
              value={mesesDesdeVenda > 0 ? `${mesesDesdeVenda} mês(es)` : '—'}
            />
          </div>
        </section>
      </div>

      {/* ===== HISTÓRICO DE PASSEIOS DO MEMBRO ===== */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2538] pb-2">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Histórico de Inscrições em Passeios
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">
            {ridesHistory.length} passeio(s) registrado(s)
          </span>
        </div>

        {ridesHistory.length === 0 ? (
          <div className="bg-[#0a0d14] border border-dashed border-[#1c2538] rounded-md p-6 text-center">
            <p className="text-xs text-slate-500">
              Este membro ainda não possui inscrições em passeios.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1c2538]">
                  <th className="p-2 font-semibold">Passeio</th>
                  <th className="p-2 font-semibold">Data</th>
                  <th className="p-2 font-semibold">KM Informado</th>
                  <th className="p-2 font-semibold">Garupa</th>
                  <th className="p-2 font-semibold text-center">Check-in</th>
                  <th className="p-2 font-semibold text-center">Pagamento</th>
                  <th className="p-2 font-semibold text-center">Status</th>
                  <th className="p-2 font-semibold">Data Inscrição</th>
                </tr>
              </thead>
              <tbody>
                {ridesHistory.map((reg) => {
                  const ride = reg.expand?.ride
                  return (
                    <tr key={reg.id} className="border-b border-[#161e2c] hover:bg-[#11172250]">
                      <td className="p-2 font-bold text-white uppercase">
                        {ride?.name || 'Passeio do Clube'}
                      </td>
                      <td className="p-2 text-slate-300">{ride ? formatDate(ride.date) : '—'}</td>
                      <td className="p-2 font-mono text-blue-300 font-semibold">
                        {reg.km_atual != null
                          ? `${Number(reg.km_atual).toLocaleString('pt-BR')} km`
                          : '—'}
                      </td>
                      <td className="p-2 text-slate-400">
                        {reg.has_pillion ? `Sim (${reg.pillion_name || '—'})` : 'Não'}
                      </td>
                      <td className="p-2 text-center">
                        {reg.checked_in ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 uppercase">
                            ✅ Presente
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                            ⏳ Aguardando
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {reg.payment_status === 'pago' ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 uppercase">
                            🟢 Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 uppercase">
                            🟡 Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-[10px] font-semibold text-slate-300 uppercase">
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-2 text-[10px] text-slate-500">{formatDate(reg.created)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== HISTÓRICO DE MÉTRICAS ===== */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2538] pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Histórico de Métricas
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">
            {metricas.length} snapshot(s) registrado(s)
          </span>
        </div>

        {metricas.length === 0 ? (
          <div className="bg-[#0a0d14] border border-dashed border-[#1c2538] rounded-md p-8 text-center">
            <p className="text-xs text-slate-500">
              Nenhum snapshot de métrica registrado para este membro ainda.
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Os snapshots são salvos automaticamente a cada importação de planilha que afeta o
              membro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1c2538]">
                  <th className="p-2 font-semibold">Data importação</th>
                  <th className="p-2 font-semibold">Categoria</th>
                  <th className="p-2 font-semibold text-center">Score</th>
                  <th className="p-2 font-semibold text-center">Total compras</th>
                  <th className="p-2 font-semibold text-right">Total vendido</th>
                  <th className="p-2 font-semibold text-center">Passagens</th>
                  <th className="p-2 font-semibold text-right">Total oficina</th>
                  <th className="p-2 font-semibold text-center">Status</th>
                  <th className="p-2 font-semibold">Nível</th>
                  <th className="p-2 font-semibold">Registrado em</th>
                </tr>
              </thead>
              <tbody>
                {metricas.map((m) => {
                  const mMeta = nivelRelacionamentoMeta(m.nivel_relacionamento || '')
                  return (
                    <tr key={m.id} className="border-b border-[#161e2c] hover:bg-[#11172250]">
                      <td className="p-2 text-slate-300">
                        {m.data_importacao ? formatDate(m.data_importacao) : '—'}
                      </td>
                      <td className="p-2">
                        <CategoryBadge category={m.categoria} size="sm" />
                      </td>
                      <td className="p-2 text-center">
                        <span className={`font-bold ${mMeta.textColor}`}>
                          {Number(m.score_oficina || 0)}
                        </span>
                      </td>
                      <td className="p-2 text-center text-slate-300">
                        {Number(m.total_compras || 0)}
                      </td>
                      <td className="p-2 text-right text-blue-300">
                        {formatBRL(Number(m.total_valor_vendido || 0))}
                      </td>
                      <td className="p-2 text-center text-slate-300">
                        {Number(m.numero_passagens || 0)}
                      </td>
                      <td className="p-2 text-right text-cyan-300">
                        {formatBRL(Number(m.total_liquido_oficina || 0))}
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {(m.status || '—').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${mMeta.badgeClass}`}
                        >
                          {mMeta.short}
                        </span>
                      </td>
                      <td className="p-2 text-[10px] text-slate-500">
                        {formatDateTime(m.created)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

const MetricRow: React.FC<{
  label: string
  value: string
  valueClass?: string
}> = ({ label, value, valueClass = 'text-white' }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[11px] text-slate-400">{label}</span>
    <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
  </div>
)

export default AdminMemberDetail
