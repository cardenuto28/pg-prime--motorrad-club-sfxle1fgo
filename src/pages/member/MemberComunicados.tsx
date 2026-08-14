import React, { useEffect, useState } from 'react'
import { Megaphone, Calendar, AlertCircle, Pin, AlertTriangle, ChevronDown } from 'lucide-react'
import { Announcement, announcementService } from '@/services/api'
import { formatDate } from '@/lib/member'

const PRIORITY_META: Record<
  Announcement['priority'],
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  normal: {
    label: 'Normal',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
    icon: Pin,
  },
  important: {
    label: 'Importante',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    icon: AlertCircle,
  },
  urgent: {
    label: 'Urgente',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
    icon: AlertTriangle,
  },
}

const MemberComunicados: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const data = await announcementService.getActive()
        setItems(data)
      } catch (e) {
        console.error('Erro ao carregar comunicados:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const urgent = items.filter((i) => i.priority === 'urgent')
  const important = items.filter((i) => i.priority === 'important')
  const regular = items.filter((i) => i.priority === 'normal' || !i.priority)

  const renderSection = (
    title: string,
    list: Announcement[],
    accent: 'red' | 'amber' | 'slate',
  ) => {
    if (list.length === 0) return null
    const accentClass =
      accent === 'red' ? 'text-red-400' : accent === 'amber' ? 'text-amber-400' : 'text-slate-400'
    return (
      <section className="space-y-3">
        <h2
          className={`text-xs font-bold font-montserrat tracking-widest uppercase flex items-center gap-2 ${accentClass}`}
        >
          {title}
        </h2>
        <div className="space-y-3">
          {list.map((a) => (
            <AnnouncementCard
              key={a.id}
              a={a}
              expanded={!!expanded[a.id]}
              onToggle={() => toggle(a.id)}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-500" /> Comunicados
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Avisos e comunicados oficiais da administração do clube.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-10 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum comunicado ativo no momento.</p>
        </div>
      ) : (
        <>
          {renderSection('Urgentes', urgent, 'red')}
          {renderSection('Importantes', important, 'amber')}
          {renderSection('Comunicados', regular, 'slate')}
        </>
      )}
    </div>
  )
}

const AnnouncementCard: React.FC<{
  a: Announcement
  expanded: boolean
  onToggle: () => void
}> = ({ a, expanded, onToggle }) => {
  const meta = PRIORITY_META[a.priority] || PRIORITY_META.normal
  const Icon = meta.icon
  const isUrgent = a.priority === 'urgent'

  return (
    <div
      className={`rounded-md p-4 border space-y-2 transition-colors ${
        isUrgent
          ? 'bg-red-950/20 border-red-800/60'
          : a.priority === 'important'
            ? 'bg-amber-950/20 border-amber-800/50'
            : 'bg-[#0e131d] border-[#1c2538]'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-start justify-between gap-3 w-full text-left"
      >
        <div className="flex items-start gap-2 min-w-0">
          <Icon
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              isUrgent
                ? 'text-red-400'
                : a.priority === 'important'
                  ? 'text-amber-400'
                  : 'text-blue-500'
            }`}
          />
          <h3 className="text-sm font-bold text-white font-montserrat tracking-wide">{a.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${meta.className}`}
          >
            {meta.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {a.content && (
        <p
          className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-6 ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {a.content}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-6">
        <Calendar className="w-3 h-3" /> {formatDate(a.publish_at || a.date)}
      </div>
    </div>
  )
}

export default MemberComunicados
