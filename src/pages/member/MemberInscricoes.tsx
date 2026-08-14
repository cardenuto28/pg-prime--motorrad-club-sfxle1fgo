import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Calendar, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Registration, registrationService } from '@/services/api'
import { formatDate, isRidePast } from '@/lib/member'

const MemberInscricoes: React.FC = () => {
  const { user } = useAuth()
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const data = await registrationService.getRegistrationsByUser(user.id)
        setRegs(data)
      } catch (e) {
        console.error('Erro ao carregar inscrições:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const upcoming = regs.filter((r) => {
    const ride = r.expand?.ride
    return ride && !isRidePast(ride.date) && r.status !== 'cancelada'
  })
  const past = regs.filter((r) => {
    const ride = r.expand?.ride
    return ride && isRidePast(ride.date)
  })
  const cancelled = regs.filter((r) => r.status === 'cancelada')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-500" /> Minhas Inscrições
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe seus passeios confirmados e o histórico de participação.
        </p>
      </div>

      {/* Próximas */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
          Próximos Passeios
        </h2>
        {upcoming.length === 0 ? (
          <EmptyBox text="Você não tem inscrições em passeios futuros." />
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((reg) => (
              <RegCard key={reg.id} reg={reg} />
            ))}
          </div>
        )}
      </section>

      {/* Histórico */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
          Histórico de Passeios
        </h2>
        {past.length === 0 ? (
          <EmptyBox text="Nenhum passeio realizado ainda." />
        ) : (
          <div className="space-y-2.5">
            {past.map((reg) => (
              <RegCard key={reg.id} reg={reg} past />
            ))}
          </div>
        )}
      </section>

      {/* Canceladas */}
      {cancelled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
            Inscrições Canceladas
          </h2>
          <div className="space-y-2.5">
            {cancelled.map((reg) => (
              <RegCard key={reg.id} reg={reg} />
            ))}
          </div>
        </section>
      )}

      {regs.length === 0 && (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-8 text-center space-y-3">
          <p className="text-sm text-slate-400">Você ainda não se inscreveu em nenhum passeio.</p>
          <Link
            to="/member/passeios"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
          >
            Ver próximos passeios
          </Link>
        </div>
      )}
    </div>
  )
}

const EmptyBox: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-6 text-center">
    <p className="text-xs text-slate-500">{text}</p>
  </div>
)

const RegCard: React.FC<{ reg: Registration; past?: boolean }> = ({ reg, past }) => {
  const ride = reg.expand?.ride
  if (!ride) return null

  const statusMeta =
    reg.status === 'confirmada'
      ? { color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50', Icon: CheckCircle2 }
      : reg.status === 'cancelada'
        ? { color: 'text-red-300 bg-red-950/60 border-red-800/50', Icon: XCircle }
        : { color: 'text-amber-300 bg-amber-950/60 border-amber-800/50', Icon: Clock }

  return (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="text-sm font-bold text-white font-montserrat uppercase tracking-wide">
          {ride.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(ride.date)}
          </span>
          {ride.destination && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-500" /> {ride.destination}
            </span>
          )}
          {ride.meeting_time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" /> {ride.meeting_time}
            </span>
          )}
          {reg.has_pillion && <span className="text-blue-400 font-semibold">com garupa</span>}
        </div>
      </div>
      <span
        className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border flex items-center gap-1 self-start ${statusMeta.color}`}
      >
        <statusMeta.Icon className="w-3 h-3" />
        {past && reg.status === 'confirmada' ? 'Participou' : reg.status}
      </span>
    </div>
  )
}

export default MemberInscricoes
