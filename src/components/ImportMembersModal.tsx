import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  Info,
} from 'lucide-react'
import { isValidCPF, formatCPF, parseDateFlexible, calcularCategoriaMembro } from '@/lib/membership'
import pb from '@/lib/pocketbase/client'
import { CategoryBadge } from '@/components/CategoryBadge'

interface ImportRow {
  rowIndex: number
  nome: string
  cpf: string
  cpfClean: string
  telefone: string
  email: string
  cidade: string
  bike_brand: string
  bike_model: string
  bike_year: number
  bike_chassi: string
  quantidade_motos_compradas: number
  data_ultima_passagem_oficina: string
  data_primeira_compra: string
  data_ultima_compra: string
  categoriaCalculada: string
  statusCalculado: string
  errors: string[]
  isValid: boolean
}

interface ImportMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<{
    total: number
    valid: number
    invalid: number
    importedCount?: number
  } | null>(null)
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'invalid'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setImportRows([])
    setSummary(null)
    setFilterTab('all')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Baixar modelo de exemplo
  const handleDownloadTemplate = () => {
    const templateData = [
      [
        'nome',
        'cpf',
        'telefone',
        'email',
        'cidade',
        'bike_brand',
        'bike_model',
        'bike_year',
        'bike_chassi',
        'quantidade_motos_compradas',
        'data_ultima_passagem_oficina',
        'data_primeira_compra',
        'data_ultima_compra',
      ],
      [
        'Carlos Alberto Silva',
        '123.456.789-00',
        '(11) 98765-4321',
        'carlos.silva@exemplo.com.br',
        'Jundiaí - SP',
        'BMW Motorrad',
        'R 1300 GS',
        2024,
        'Z123456',
        3,
        '15/02/2025',
        '10/01/2020',
        '12/11/2024',
      ],
      [
        'Mariana Oliveira Santos',
        '987.654.321-99',
        '(11) 97654-3210',
        'mariana.santos@exemplo.com.br',
        'Campinas - SP',
        'BMW Motorrad',
        'F 900 R',
        2023,
        'Y654321',
        1,
        '20/01/2025',
        '15/03/2023',
        '15/03/2023',
      ],
      [
        'Roberto Mendes',
        '111.222.333-44',
        '(11) 99887-6655',
        'roberto.mendes@exemplo.com.br',
        'São Paulo - SP',
        'BMW Motorrad',
        'R 1250 GS Adventure',
        2022,
        'X987654',
        0,
        '10/01/2025',
        '',
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Membros')
    XLSX.writeFile(wb, 'modelo_importacao_membros_euromotors.xlsx')
  }

  // Processar arquivo Excel / CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setParsing(true)

    try {
      // 1. Carrega CPFs e emails já existentes no banco para checar duplicidade
      const existingUsers = await pb.collection('users').getFullList({
        fields: 'id,cpf,email',
      })
      const existingCpfs = new Set<string>()
      const existingEmails = new Set<string>()

      existingUsers.forEach((u: any) => {
        if (u.cpf) existingCpfs.add(u.cpf.replace(/\D/g, ''))
        if (u.email) existingEmails.add(u.email.toLowerCase().trim())
      })

      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Converte para JSON
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      })

      if (rawRows.length <= 1) {
        throw new Error('A planilha está vazia ou contém apenas o cabeçalho.')
      }

      // Pula a linha do cabeçalho
      const dataRows = rawRows.slice(1)
      const parsedRows: ImportRow[] = []
      const seenCpfsInFile = new Set<string>()

      dataRows.forEach((row, index) => {
        // Se a linha toda estiver vazia, pula
        if (!row || row.every((c: any) => !c || String(c).trim() === '')) return

        const errors: string[] = []

        // 13 colunas na ordem
        const nome = String(row[0] || '').trim()
        const cpfRaw = String(row[1] || '').trim()
        const telefone = String(row[2] || '').trim()
        const email = String(row[3] || '').trim()
        const cidade = String(row[4] || '').trim()
        const bike_brand = String(row[5] || 'BMW Motorrad').trim()
        const bike_model = String(row[6] || '').trim()
        const bike_year = parseInt(String(row[7] || ''), 10) || new Date().getFullYear()
        const bike_chassi = String(row[8] || '').trim()
        const quantidade_motos = parseInt(String(row[9] || '0'), 10) || 0

        const oficinaRaw = String(row[10] || '').trim()
        const primeiraCompraRaw = String(row[11] || '').trim()
        const ultimaCompraRaw = String(row[12] || '').trim()

        const cleanCpf = cpfRaw.replace(/\D/g, '')

        // Validações
        if (!nome) {
          errors.push('Nome completo é obrigatório')
        }

        if (!cleanCpf) {
          errors.push('CPF é obrigatório')
        } else if (!isValidCPF(cleanCpf)) {
          errors.push('CPF com formato ou dígitos inválidos')
        } else if (existingCpfs.has(cleanCpf)) {
          errors.push('CPF já cadastrado no Euro Motors Club')
        } else if (seenCpfsInFile.has(cleanCpf)) {
          errors.push('CPF duplicado nesta planilha')
        } else {
          seenCpfsInFile.add(cleanCpf)
        }

        // Validação de datas
        if (oficinaRaw && !parseDateFlexible(oficinaRaw)) {
          errors.push('Data de oficina inválida (use DD/MM/AAAA)')
        }
        if (primeiraCompraRaw && !parseDateFlexible(primeiraCompraRaw)) {
          errors.push('Data 1ª compra inválida (use DD/MM/AAAA)')
        }
        if (ultimaCompraRaw && !parseDateFlexible(ultimaCompraRaw)) {
          errors.push('Data última compra inválida (use DD/MM/AAAA)')
        }

        // Cálculo da categoria
        const oficinaDate = parseDateFlexible(oficinaRaw)
        const calc = calcularCategoriaMembro({
          quantidade_motos_compradas: quantidade_motos,
          data_ultima_passagem_oficina: oficinaDate,
          status_membro_atual: 'PRE_CADASTRADO',
        })

        parsedRows.push({
          rowIndex: index + 2, // linha 1 é cabeçalho
          nome,
          cpf: formatCPF(cleanCpf) || cpfRaw,
          cpfClean: cleanCpf,
          telefone,
          email,
          cidade,
          bike_brand,
          bike_model,
          bike_year,
          bike_chassi,
          quantidade_motos_compradas: quantidade_motos,
          data_ultima_passagem_oficina: oficinaRaw,
          data_primeira_compra: primeiraCompraRaw,
          data_ultima_compra: ultimaCompraRaw,
          categoriaCalculada: calc.categoria,
          statusCalculado: 'Pré-cadastrado',
          errors,
          isValid: errors.length === 0,
        })
      })

      const validCount = parsedRows.filter((r) => r.isValid).length
      const invalidCount = parsedRows.filter((r) => !r.isValid).length

      setImportRows(parsedRows)
      setSummary({
        total: parsedRows.length,
        valid: validCount,
        invalid: invalidCount,
      })
    } catch (err: any) {
      alert('Erro ao processar o arquivo: ' + (err.message || 'Arquivo inválido'))
      resetState()
    } finally {
      setParsing(false)
    }
  }

  // Confirmar e criar registros válidos
  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r.isValid)
    if (validRows.length === 0) return

    setLoading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const row of validRows) {
        try {
          const oficinaDate = parseDateFlexible(row.data_ultima_passagem_oficina)
          const primeiraDate = parseDateFlexible(row.data_primeira_compra)
          const ultimaDate = parseDateFlexible(row.data_ultima_compra)

          // Gera email fallback caso a planilha não tenha informado
          const emailToUse =
            row.email && row.email.includes('@')
              ? row.email.trim().toLowerCase()
              : `membro.${row.cpfClean || Math.random().toString(36).slice(2, 7)}@euromotors.club`

          // Senha temporária aleatória segura (membro definirá no /validar-cadastro)
          const randomPassword = 'EMC@' + Math.random().toString(36).slice(2, 10) + '2025'

          const createdUser = await pb.collection('users').create({
            name: row.nome,
            email: emailToUse,
            password: randomPassword,
            passwordConfirm: randomPassword,
            cpf: row.cpfClean,
            phone: row.telefone,
            city: row.cidade,
            bike_brand: row.bike_brand || 'BMW Motorrad',
            bike_model: row.bike_model,
            bike_year: row.bike_year,
            bike_chassi: row.bike_chassi,
            quantidade_motos_compradas: row.quantidade_motos_compradas,
            data_primeira_compra: primeiraDate ? primeiraDate.toISOString() : null,
            data_ultima_compra: ultimaDate ? ultimaDate.toISOString() : null,
            data_ultima_passagem_oficina: oficinaDate ? oficinaDate.toISOString() : null,
            categoria: row.categoriaCalculada,
            category: row.categoriaCalculada,
            status_membro: 'PRE_CADASTRADO',
            status: 'pendente',
            role: 'member',
            motivo_categoria: 'IMPORTACAO',
            data_categoria_atualizada: new Date().toISOString(),
          })

          // Grava histórico de categoria
          try {
            await pb.collection('historico_categoria').create({
              membro_id: createdUser.id,
              categoria_anterior: null,
              categoria_nova: row.categoriaCalculada,
              data_alteracao: new Date().toISOString(),
              motivo: 'IMPORTACAO',
              origem: 'automatico',
              justificativa: 'Importação inicial de planilha em massa',
            })
          } catch {
            /* intentionally ignored */
          }

          // Se tiver compra de moto registrada, grava histórico
          if (row.quantidade_motos_compradas > 0 && row.bike_model) {
            try {
              await pb.collection('historico_compras_motos').create({
                membro_id: createdUser.id,
                cpf: row.cpfClean,
                modelo: row.bike_model,
                ano: row.bike_year,
                chassi: row.bike_chassi,
                data_compra: ultimaDate ? ultimaDate.toISOString() : new Date().toISOString(),
                status_venda: 'ENTREGUE',
                created_at: new Date().toISOString(),
              })
            } catch {
              /* intentionally ignored */
            }
          }

          // Se tiver oficina registrada, grava histórico
          if (oficinaDate) {
            try {
              await pb.collection('historico_oficina').create({
                membro_id: createdUser.id,
                cpf: row.cpfClean,
                data_passagem: oficinaDate.toISOString(),
                tipo_servico: 'Revisão Periódica',
                ordem_servico: 'IMPORT-01',
                status: 'CONCLUIDA',
                created_at: new Date().toISOString(),
              })
            } catch {
              /* intentionally ignored */
            }
          }

          successCount++
        } catch (err) {
          console.error('Erro ao importar linha', row.rowIndex, err)
          failCount++
        }
      }

      setSummary((prev) =>
        prev
          ? {
              ...prev,
              importedCount: successCount,
            }
          : null,
      )

      alert(
        `${successCount} membros importados com sucesso!${
          failCount > 0 ? ` ${failCount} registros falharam.` : ''
        }`,
      )
      onSuccess()
      onOpenChange(false)
      resetState()
    } catch (err: any) {
      alert('Erro geral durante importação: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = importRows.filter((r) => {
    if (filterTab === 'valid') return r.isValid
    if (filterTab === 'invalid') return !r.isValid
    return true
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetState()
          onOpenChange(v)
        }
      }}
    >
      <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 text-white max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Importação de Membros em Massa
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-0.5">
                  Importe planilhas .xlsx ou .csv com cálculo automático de categorias e status
                  Pré-cadastrado.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Baixar Modelo (.xlsx)
            </Button>
          </div>
        </DialogHeader>

        {/* Upload Área */}
        {!summary ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all w-full max-w-xl group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={parsing}
              />
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                {parsing ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                {parsing
                  ? 'Processando e validando planilha...'
                  : 'Selecione ou arraste seu arquivo'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Suporta planilhas Excel (.xlsx, .xls) ou CSV com as 13 colunas obrigatórias
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs text-blue-400 font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Selecionar Arquivo
              </span>
            </label>

            <div className="mt-6 max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Regras de Validação e Categorização:
              </p>
              <p>
                • <strong>CPF:</strong> Obrigatório, válido e único no sistema.
              </p>
              <p>
                • <strong>Platinum:</strong> 5+ motos compradas | <strong>Gold:</strong> 3 ou 4
                motos | <strong>Prata:</strong> 1 ou 2 motos.
              </p>
              <p>
                • <strong>Bronze:</strong> 0 motos com passagem na oficina nos últimos 6 meses.
              </p>
              <p>
                • Todos os membros válidos serão criados com status <strong>Pré-cadastrado</strong>{' '}
                para ativação pelo próprio membro.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 pt-4">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-400 font-medium">Total de Registros</div>
                <div className="text-2xl font-bold text-white mt-1">{summary.total}</div>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prontos para Importar
                </div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{summary.valid}</div>
              </div>
              <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3">
                <div className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Com Erros / Duplicados
                </div>
                <div className="text-2xl font-bold text-red-300 mt-1">{summary.invalid}</div>
              </div>
            </div>

            {/* Abas de Filtro da Prévia */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'all'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Todos ({summary.total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('valid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'valid'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Válidos ({summary.valid})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('invalid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'invalid'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Com Erros ({summary.invalid})
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Arquivo: <strong className="text-slate-200">{file?.name}</strong>
              </span>
            </div>

            {/* Tabela de Prévia */}
            <ScrollArea className="flex-1 border border-slate-800 rounded-lg bg-slate-900/60 h-[320px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Linha</th>
                    <th className="p-2.5">Nome</th>
                    <th className="p-2.5">CPF</th>
                    <th className="p-2.5">Motocicleta</th>
                    <th className="p-2.5 text-center">Motos</th>
                    <th className="p-2.5">Última Oficina</th>
                    <th className="p-2.5 text-center">Categoria</th>
                    <th className="p-2.5">Status / Erros</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        !row.isValid ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center text-slate-500 font-mono">{row.rowIndex}</td>
                      <td className="p-2.5 font-medium text-white">
                        {row.nome || <span className="text-red-400 italic">Vazio</span>}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">
                        {row.cpf || <span className="text-red-400 italic">Vazio</span>}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {row.bike_model ? (
                          `${row.bike_model} (${row.bike_year})`
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-400">
                        {row.quantidade_motos_compradas}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {row.data_ultima_passagem_oficina || (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <CategoryBadge category={row.categoriaCalculada} size="sm" />
                      </td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Válido (Pré-cadastrado)
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1 text-red-400 text-[11px] font-medium"
                              >
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {err}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        {/* Rodapé com botões de ação */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-auto">
          {summary ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetState}
                disabled={loading}
                className="text-slate-400 hover:text-white"
              >
                Trocar Arquivo
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="border-slate-700 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={loading || summary.valid === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando {summary.valid} membros...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirmar e Importar {summary.valid} Membros
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-slate-700 text-slate-300"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
