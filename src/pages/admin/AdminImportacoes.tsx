import React, { useEffect, useState, useCallback } from 'react'
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { importLogService, type ImportLog } from '@/services/api'
import { exportImportLogsPdf } from '@/lib/pdfExport'
import { exportImportLogsExcel } from '@/lib/excelExport'
import { FileText } from 'lucide-react'

/**
 * PARTE 3 — Página de Histórico de Importações (/admin/importacoes)
 *
 * Lista todos os uploads de planilha processados pelo modal ImportMembersModal,
 * exibindo o resumo de cada importação (registros processados, clientes criados,
 * atualizados, erros e status), com a data/hora em que ocorreu.
 *
 * Os registros vêm da collection `import_logs` (criada na migration 0021), preenchida
 * automaticamente ao final de cada importação bem-sucedida.
 */
export default function AdminImportacoes() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    const data = await importLogService.getAll()
    setLogs(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro de importação? A ação não desfaz os dados importados.'))
      return
    const ok = await importLogService.delete(id)
    if (ok) {
      toast({ title: 'Registro excluído', description: 'O log de importação foi removido.' })
      setLogs((prev) => prev.filter((l) => l.id !== id))
    } else {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const parseErros = (
    erros?: string,
  ): Array<{ linha: number; cpf: string; erro: string; motivo: string }> => {
    if (!erros) return []
    try {
      const parsed = JSON.parse(erros)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = (status || '').toUpperCase()
    let cls = 'bg-slate-700/40 text-slate-300 border-slate-600/40'
    let Icon = AlertCircle
    if (s === 'CONCLUIDO') {
      cls = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
      Icon = CheckCircle2
    } else if (s === 'PARCIAL') {
      cls = 'bg-amber-950/40 text-amber-400 border-amber-800/40'
      Icon = AlertTriangle
    } else if (s === 'FALHOU') {
      cls = 'bg-red-950/40 text-red-400 border-red-800/40'
      Icon = AlertCircle
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${cls}`}
      >
        <Icon className="w-3 h-3" />
        {s || '—'}
      </span>
    )
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const formatTime = (iso?: string) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            Histórico de Importações
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro de todas as planilhas de membros processadas pelo sistema.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              if (logs.length === 0) {
                toast({
                  title: 'Sem dados',
                  description: 'Nenhum histórico de importação para exportar.',
                  variant: 'destructive',
                })
                return
              }
              exportImportLogsExcel(logs)
              toast({
                title: 'Excel Gerado',
                description: `${logs.length} registros exportados em planilha XLSX.`,
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
              if (logs.length === 0) {
                toast({
                  title: 'Sem dados',
                  description: 'Nenhum histórico de importação para exportar.',
                  variant: 'destructive',
                })
                return
              }
              exportImportLogsPdf(logs)
              toast({
                title: 'PDF Gerado',
                description: `${logs.length} registros exportados em PDF.`,
              })
            }}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1.5 h-8"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" /> EXPORTAR PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 h-8"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1.5" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Total de importações</div>
          <div className="text-2xl font-bold text-white mt-1">{logs.length}</div>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-4">
          <div className="text-xs text-emerald-400 font-medium">Clientes criados (acumulado)</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            {logs.reduce((acc, l) => acc + (l.clientes_criados || 0), 0)}
          </div>
        </div>
        <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-4">
          <div className="text-xs text-blue-400 font-medium">Clientes atualizados (acumulado)</div>
          <div className="text-2xl font-bold text-blue-300 mt-1">
            {logs.reduce((acc, l) => acc + (l.clientes_atualizados || 0), 0)}
          </div>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
          <div className="text-xs text-amber-400 font-medium">Linhas com erro (acumulado)</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {logs.reduce((acc, l) => {
              const errs = parseErros(l.erros)
              return acc + errs.length
            }, 0)}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
            <p className="text-sm">Carregando importações...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <FileDown className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-400">
              Nenhuma importação registrada ainda.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Importe uma planilha de membros para que o registro apareça aqui.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-340px)]">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 sticky top-0">
                <tr className="text-left text-xs text-slate-400">
                  <th className="p-3 font-semibold">Arquivo</th>
                  <th className="p-3 font-semibold">Data</th>
                  <th className="p-3 font-semibold">Hora</th>
                  <th className="p-3 font-semibold text-center">Linhas</th>
                  <th className="p-3 font-semibold text-center">Criados</th>
                  <th className="p-3 font-semibold text-center">Atualizados</th>
                  <th className="p-3 font-semibold text-center">Erros</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                  <th className="p-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const erros = parseErros(log.erros)
                  const isExpanded = expandedLog === log.id
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      >
                        <td className="p-3 text-slate-200 font-medium">{log.nome_arquivo}</td>
                        <td className="p-3 text-slate-400 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {log.data ? formatDate(log.data) : formatDate(log.created)}
                        </td>
                        <td className="p-3 text-slate-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.hora ? log.hora : formatTime(log.created)}
                        </td>
                        <td className="p-3 text-center text-slate-300 font-mono">
                          {log.linhas_processadas ?? 0}
                        </td>
                        <td className="p-3 text-center text-emerald-400 font-semibold">
                          {log.clientes_criados ?? 0}
                        </td>
                        <td className="p-3 text-center text-blue-400 font-semibold">
                          {log.clientes_atualizados ?? 0}
                        </td>
                        <td className="p-3 text-center">
                          {erros.length > 0 ? (
                            <span className="text-amber-400 font-semibold">{erros.length}</span>
                          ) : (
                            <span className="text-slate-600">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(log.id)
                            }}
                            className="text-slate-500 hover:text-red-400 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && erros.length > 0 && (
                        <tr key={log.id + '-detail'} className="bg-slate-950/40">
                          <td colSpan={9} className="p-3">
                            <div className="border border-red-900/40 bg-red-950/20 rounded-lg p-3">
                              <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" />
                                Detalhe dos erros ({erros.length})
                              </div>
                              <div className="max-h-48 overflow-y-auto space-y-1">
                                {erros.map((e, i) => (
                                  <div
                                    key={i}
                                    className="text-[11px] text-red-300/90 bg-red-950/30 border border-red-900/30 rounded px-2 py-1 flex flex-wrap gap-x-2 gap-y-0.5"
                                  >
                                    <span className="font-mono text-red-200">Linha {e.linha}</span>
                                    <span className="text-red-400/70">|</span>
                                    <span>CPF: {e.cpf}</span>
                                    <span className="text-red-400/70">|</span>
                                    <span className="text-slate-400">{e.motivo}</span>
                                    <span className="text-red-400/70">|</span>
                                    <span className="text-red-300">{e.erro}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
