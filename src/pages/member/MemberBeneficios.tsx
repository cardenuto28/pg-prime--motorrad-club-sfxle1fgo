import React, { useEffect, useState } from 'react'
import { Gift, Phone, ExternalLink, CalendarClock, Tag, Store, Info } from 'lucide-react'
import { Benefit, benefitService } from '@/services/api'
import { resolveFileUrl, coverFallback, formatDate } from '@/lib/member'

const MemberBeneficios: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await benefitService.getAllBenefits()
        setBenefits(data)
      } catch (e) {
        console.error('Erro ao carregar benefícios:', e)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight flex items-center gap-2">
          <Gift className="w-5 h-5 text-blue-500" /> Benefícios do Membro
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Condições exclusivas e descontos especiais com nossos parceiros credenciados.
        </p>
      </div>

      {benefits.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-10 text-center">
          <Gift className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            Nenhum benefício disponível no momento. Volte em breve!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((b) => {
            const img = resolveFileUrl(b.image) || coverFallback('discount,store,benefit')
            return (
              <div
                key={b.id}
                className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={img}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />
                  {b.partner && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-blue-300 bg-blue-950/80 border border-blue-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                      <Store className="w-3 h-3" /> {b.partner}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3 flex-1">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat">
                    {b.title}
                  </h3>
                  {b.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{b.description}</p>
                  )}

                  {b.exclusive_condition && (
                    <div className="flex items-start gap-2 bg-[#121824] border border-[#1c2538] rounded-sm p-2.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                          Condição exclusiva
                        </p>
                        <p className="text-[11px] text-slate-300">{b.exclusive_condition}</p>
                      </div>
                    </div>
                  )}

                  {(b.how_to_use || b.valid_until || b.contact_link) && (
                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      {b.how_to_use && (
                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <span className="text-slate-500">Como utilizar: </span>
                            {b.how_to_use}
                          </span>
                        </div>
                      )}
                      {b.valid_until && (
                        <div className="flex items-center gap-2">
                          <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            <span className="text-slate-500">Validade: </span>
                            {formatDate(b.valid_until)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {b.contact_link && (
                  <div className="p-4 pt-0">
                    <a
                      href={b.contact_link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 border border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all"
                    >
                      {b.contact_link.startsWith('http') && b.contact_link.includes('wa.me') ? (
                        <Phone className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      Utilizar Benefício
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MemberBeneficios
