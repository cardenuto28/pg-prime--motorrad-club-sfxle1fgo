import React from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react'
import { Announcement } from '@/services/api'
import { formatDate } from '@/lib/member'

interface AnnouncementPopupModalProps {
  isOpen: boolean
  announcement: Announcement | null
  currentIndex: number
  totalCount: number
  isMarking: boolean
  onNext: () => void
  onPrev: () => void
  onUnderstood: () => void
  onClose: () => void
}

export const AnnouncementPopupModal: React.FC<AnnouncementPopupModalProps> = ({
  isOpen,
  announcement,
  currentIndex,
  totalCount,
  isMarking,
  onNext,
  onPrev,
  onUnderstood,
  onClose,
}) => {
  if (!isOpen || !announcement) return null

  const priority = announcement.priority || 'normal'
  const isUrgent = priority === 'urgent'
  const isImportant = priority === 'important'

  // Prioridade badges & estilos
  let badgeLabel = 'NORMAL'
  let badgeClass = 'bg-[#0066FF]/20 text-[#38bdf8] border-[#0066FF]/40'
  let badgeIcon = Megaphone

  if (isUrgent) {
    badgeLabel = 'URGENTE'
    badgeClass =
      'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
    badgeIcon = AlertTriangle
  } else if (isImportant) {
    badgeLabel = 'IMPORTANTE'
    badgeClass =
      'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
    badgeIcon = AlertCircle
  }

  const BadgeIconComponent = badgeIcon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        className={`relative w-full max-w-xl bg-[#090d16] text-[#e2e8f0] rounded-xl shadow-2xl overflow-hidden z-10 transition-all border ${
          isUrgent
            ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.45)] ring-2 ring-red-500/40 animate-pulse'
            : 'border-[#0066FF] shadow-[0_0_30px_rgba(0,102,255,0.35)] ring-1 ring-[#0066FF]/30'
        }`}
      >
        {/* Top Glow Accent Bar */}
        <div
          className={`h-1.5 w-full ${
            isUrgent
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600'
              : isImportant
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
                : 'bg-gradient-to-r from-[#0066FF] via-cyan-400 to-[#0066FF]'
          }`}
        />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#182338] bg-[#0b101c]/80 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Badge de prioridade */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase font-montserrat tracking-widest border ${badgeClass}`}
              >
                <BadgeIconComponent className={`w-3.5 h-3.5 ${isUrgent ? 'animate-bounce' : ''}`} />
                {badgeLabel}
              </span>

              {/* Indicador de múltiplos comunicados */}
              {totalCount > 1 && (
                <span className="text-[11px] font-semibold text-slate-400 bg-[#121929] border border-[#1e2a42] px-2.5 py-0.5 rounded-full font-montserrat">
                  {currentIndex + 1} de {totalCount} comunicados
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>{formatDate(announcement.publish_at || announcement.date)}</span>
              {announcement.category && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{announcement.category}</span>
                </>
              )}
            </div>
          </div>

          {/* Botão Fechar X */}
          <button
            onClick={onClose}
            aria-label="Fechar comunicado"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#182338] transition-colors -mr-2 -mt-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Urgent Warning Banner */}
          {isUrgent && (
            <div className="flex items-center gap-3 p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold font-montserrat uppercase tracking-wider">Aviso Urgente</p>
                <p className="text-red-300/90 text-[11px]">
                  Leia atentamente as orientações abaixo antes de continuar.
                </p>
              </div>
            </div>
          )}

          {/* Título do Comunicado */}
          <h2
            id="announcement-title"
            className={`text-lg sm:text-xl font-bold font-montserrat tracking-tight leading-snug text-white ${
              isUrgent ? 'text-red-100' : ''
            }`}
          >
            {announcement.title}
          </h2>

          {/* Conteúdo completo */}
          <div className="text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-line space-y-2 bg-[#0c1220]/60 p-4 rounded-lg border border-[#162034]">
            {announcement.content || 'Sem conteúdo adicional.'}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-5 sm:p-6 pt-4 border-t border-[#182338] bg-[#0b101c]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navegação entre múltiplos comunicados */}
          {totalCount > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrev}
                disabled={currentIndex === 0 || isMarking}
                aria-label="Comunicado anterior"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-[#121929] border border-[#1e2a42] hover:bg-[#1a243b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={currentIndex >= totalCount - 1 || isMarking}
                aria-label="Próximo comunicado"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-[#121929] border border-[#1e2a42] hover:bg-[#1a243b] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-[#0066FF]" />
              <span>Euro Motors Club Oficial</span>
            </div>
          )}

          {/* Botão Principal OK ENTENDI */}
          <button
            type="button"
            onClick={onUnderstood}
            disabled={isMarking}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold font-montserrat tracking-wider uppercase transition-all shadow-lg ${
              isUrgent
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 hover:shadow-red-700/60 active:scale-[0.98]'
                : 'bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-blue-900/40 hover:shadow-blue-600/60 active:scale-[0.98]'
            } disabled:opacity-50 disabled:cursor-wait`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMarking ? 'SALVANDO...' : 'OK, ENTENDI'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
