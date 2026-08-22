import React, { useEffect, useState } from 'react'
import { Gauge, Save, Plus, Trash2, RotateCcw, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { settingsService } from '@/services/settings'
import {
  ScoreValorRange,
  ScoreFrequenciaRange,
  DEFAULT_SCORE_VALOR_RANGES,
  DEFAULT_SCORE_FREQUENCIA_RANGES,
} from '@/lib/membership'

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

/**
 * Página de Configuração das Faixas do Score de Oficina (PARTE 2).
 * Permite ao administrador editar as faixas de VALOR (0–70 pts) e
 * FREQUÊNCIA (0–30 pts) usadas no cálculo do score de cada membro.
 * Persiste como JSON na coleção `settings` (keys score_valor_ranges e
 * score_frequencia_ranges).
 */
const ScoreConfig: React.FC = () => {
  const { toast } = useToast()
  const [valorRanges, setValorRanges] = useState<ScoreValorRange[]>([])
  const [frequenciaRanges, setFrequenciaRanges] = useState<ScoreFrequenciaRange[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [v, f] = await Promise.all([
          settingsService.getScoreValorRanges(),
          settingsService.getScoreFrequenciaRanges(),
        ])
        if (!cancelled) {
          setValorRanges(v)
          setFrequenciaRanges(f)
        }
      } catch (e) {
        if (!cancelled) {
          setValorRanges([...DEFAULT_SCORE_VALOR_RANGES])
          setFrequenciaRanges([...DEFAULT_SCORE_FREQUENCIA_RANGES])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const updateValorRange = (idx: number, field: keyof ScoreValorRange, value: string) => {
    setValorRanges((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              [field]: field === 'points' ? parseInt(value, 10) || 0 : parseFloat(value) || 0,
            }
          : r,
      ),
    )
  }

  const updateFrequenciaRange = (idx: number, field: keyof ScoreFrequenciaRange, value: string) => {
    setFrequenciaRanges((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: parseInt(value, 10) || 0 } : r)),
    )
  }

  const addValorRange = () => {
    setValorRanges((prev) => [...prev, { min: 0, max: 0, points: 0 }])
  }

  const addFrequenciaRange = () => {
    setFrequenciaRanges((prev) => [...prev, { min: 0, max: 0, points: 0 }])
  }

  const removeValorRange = (idx: number) => {
    setValorRanges((prev) => prev.filter((_, i) => i !== idx))
  }

  const removeFrequenciaRange = (idx: number) => {
    setFrequenciaRanges((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        settingsService.saveScoreValorRanges(valorRanges),
        settingsService.saveScoreFrequenciaRanges(frequenciaRanges),
      ])
      toast({
        title: 'Configuração salva',
        description:
          'As faixas do Score de Oficina foram persistidas e serão usadas nos próximos recálculos.',
      })
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e?.message || 'Não foi possível persistir a configuração.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setValorRanges([...DEFAULT_SCORE_VALOR_RANGES])
    setFrequenciaRanges([...DEFAULT_SCORE_FREQUENCIA_RANGES])
    toast({
      title: 'Faixas padrão restauradas',
      description: 'Clique em "Salvar Configuração" para persistir os valores padrão.',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    )
  }

  const valorTotalPts = valorRanges.reduce((m, r) => Math.max(m, Number(r.points) || 0), 0)
  const freqTotalPts = frequenciaRanges.reduce((m, r) => Math.max(m, Number(r.points) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
          Inteligência de Relacionamento
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-cyan-400" /> ⚙️ Configuração do Score de Oficina
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl">
          Ajuste as faixas de <strong className="text-blue-300">VALOR</strong> (0–70 pts) e{' '}
          <strong className="text-cyan-300">FREQUÊNCIA</strong> (0–30 pts) usadas no cálculo do
          Score de Oficina de cada membro. O Score total (máx 100) define o Nível de Relacionamento
          e as Tags Inteligentes.{' '}
          <strong className="text-amber-300">O Score NÃO altera a categoria do clube</strong>{' '}
          (Platinum/Gold/Prata/Bronze) — apenas as tags e a próxima melhor ação.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faixas de Valor */}
        <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-blue-950/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-bold text-xs">
                R$
              </span>
              <div>
                <h2 className="text-sm font-bold text-white font-montserrat tracking-wide">
                  Faixas de VALOR
                </h2>
                <p className="text-[10px] text-slate-400">0–70 pontos · gasto líquido em oficina</p>
              </div>
            </div>
            <span className="text-[10px] text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2 py-1 rounded">
              Máx atual: {valorTotalPts} pts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1c2538]">
                  <th className="p-2 text-left">Valor Mínimo (R$)</th>
                  <th className="p-2 text-left">Valor Máximo (R$)</th>
                  <th className="p-2 text-left">Pontos</th>
                  <th className="p-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {valorRanges.map((r, idx) => (
                  <tr key={idx} className="border-b border-[#161e2c]">
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r.min}
                        onChange={(e) => updateValorRange(idx, 'min', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r.max}
                        onChange={(e) => updateValorRange(idx, 'max', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        max={70}
                        value={r.points}
                        onChange={(e) => updateValorRange(idx, 'points', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 font-bold text-blue-400"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        title="Remover faixa"
                        onClick={() => removeValorRange(idx)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addValorRange}
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Faixa
          </Button>
        </section>

        {/* Faixas de Frequência */}
        <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-700/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                #
              </span>
              <div>
                <h2 className="text-sm font-bold text-white font-montserrat tracking-wide">
                  Faixas de FREQUÊNCIA
                </h2>
                <p className="text-[10px] text-slate-400">
                  0–30 pontos · nº de passagens na oficina
                </p>
              </div>
            </div>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded">
              Máx atual: {freqTotalPts} pts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1c2538]">
                  <th className="p-2 text-left">Passagens Mínimas</th>
                  <th className="p-2 text-left">Passagens Máximas</th>
                  <th className="p-2 text-left">Pontos</th>
                  <th className="p-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {frequenciaRanges.map((r, idx) => (
                  <tr key={idx} className="border-b border-[#161e2c]">
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        value={r.min}
                        onChange={(e) => updateFrequenciaRange(idx, 'min', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        value={r.max}
                        onChange={(e) => updateFrequenciaRange(idx, 'max', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={r.points}
                        onChange={(e) => updateFrequenciaRange(idx, 'points', e.target.value)}
                        className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 font-bold text-cyan-400"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        title="Remover faixa"
                        onClick={() => removeFrequenciaRange(idx)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFrequenciaRange}
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Faixa
          </Button>
        </section>
      </div>

      {/* Prévia das faixas formatadas */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
            Prévia das Faixas Configuradas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">
              Valor (R$ → pontos)
            </p>
            {valorRanges.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] bg-[#0a0d14] border border-[#161e2c] rounded px-2 py-1"
              >
                <span className="text-slate-300">
                  {formatBRL(r.min)} – {formatBRL(r.max)}
                </span>
                <span className="text-blue-300 font-bold">{r.points} pts</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
              Frequência (# → pontos)
            </p>
            {frequenciaRanges.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] bg-[#0a0d14] border border-[#161e2c] rounded px-2 py-1"
              >
                <span className="text-slate-300">
                  {r.min} – {r.max} passagens
                </span>
                <span className="text-cyan-300 font-bold">{r.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ações */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={saving}
          className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Restaurar Padrão
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-blue-600/30"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Configuração
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default ScoreConfig
