import React, { useEffect, useState } from 'react'
import { Megaphone, Calendar, AlertCircle, Pin } from 'lucide-react'
import { Announcement, announcementService } from '@/services/api'
import { formatDate } from '@/lib/member'

const MemberComunicados: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await announcementService.getAllAnnouncements()
        setItems(data)
      } catch (e) {
        console.error('Erro ao carregar comunicados:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const important = items.filter((i) => i.important)
  const regular = items.filter((i) => !i.important)

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
          <p className="text-sm text-slate-500">Nenhum comunicado publicado no momento.</p>
        </div>
      ) : (
        <>
          {important.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-amber-400 font-montserrat tracking-widest uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Importantes
              </h2>
              <div className="space-y-3">
                {important.map((a) => (
                  <AnnouncementCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}

          {regular.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                Comunicados
              </h2>
              <div className="space-y-3">
                {regular.map((a) => (
                  <AnnouncementCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

const AnnouncementCard: React.FC<{ a: Announcement }> = ({ a }) => (
  <div
    className={`rounded-md p-4 border space-y-2 ${
      a.important ? 'bg-amber-950/20 border-amber-800/50' : 'bg-[#0e131d] border-[#1c2538]'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 min-w-0">
        {a.important ? (
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        ) : (
          <Pin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        )}
        <h3 className="text-sm font-bold text-white font-montserrat tracking-wide">{a.title}</h3>
      </div>
      {a.important && (
        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
          Importante
        </span>
      )}
    </div>
    {a.content && (
      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-6">{a.content}</p>
    )}
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-6">
      <Calendar className="w-3 h-3" /> {formatDate(a.date)}
    </div>
  </div>
)

export default MemberComunicados
