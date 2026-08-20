import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Registration, Ride, registrationService, rideService } from '@/services/api'
import { Shield, ChevronRight, Calendar, MapPin, CheckCircle2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, Link } from 'react-router-dom'
import { formatMemberId, getMemberCategory } from '@/lib/member'
import { CategoryBadge } from '@/components/CategoryBadge'

export const SidebarMemberWidget: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userRegs, setUserRegs] = useState<Registration[]>([])
  const [nextRide, setNextRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadMemberData()
    }
  }, [user])

  const loadMemberData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const regs = await registrationService.getRegistrationsByUser(user.id)
      setUserRegs(regs)

      // Carregar proximo passeio confirmado
      const allRides = await rideService.getAllRides()
      const confirmedReg = regs.find((r) => r.status === 'confirmada')
      if (confirmedReg) {
        const found = allRides.find((rd) => rd.id === confirmedReg.ride)
        if (found) setNextRide(found)
      } else if (allRides.length > 0) {
        setNextRide(allRides[0])
      }
    } catch (e) {
      console.error('Erro ao carregar dados do membro:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const isPremium = user.status === 'ativo' || user.role === 'admin'

  return (
    <div className="bg-[#0f131c] border border-[#1d2638] rounded-md p-5 shadow-2xl space-y-4">
      {/* Header Widget */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white tracking-wider font-montserrat uppercase">
          ÁREA DO MEMBRO
        </h3>
        <p className="text-[11px] text-slate-400">
          Acesse sua área exclusiva e fique por dentro de tudo que acontece no clube.
        </p>
      </div>

      {/* User Welcome Card */}
      <div className="bg-[#141b27] border border-[#202b3d] rounded-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-tight">
              BEM-VINDO, <strong className="text-white">{user.name.split(' ')[0]}</strong>
            </span>
          </div>
        </div>
        {isPremium ? (
          <CategoryBadge
            category={user.categoria || user.category || getMemberCategory(user)}
            size="sm"
          />
        ) : (
          <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
            STATUS: PENDENTE
          </span>
        )}
      </div>

      {/* Carteirinha Digital Button */}
      <Link to="/member/card" className="block">
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-[#141d2d] hover:bg-blue-600 border-blue-500/40 hover:border-blue-500 text-white font-bold text-[10px] tracking-wider h-8 uppercase flex items-center justify-center gap-1.5 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
          CARTEIRINHA DIGITAL ({formatMemberId(user)})
        </Button>
      </Link>

      {/* Próximo Passeio Section */}
      {nextRide && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
            PRÓXIMO PASSEIO
          </span>
          <div className="bg-[#141b27] border border-[#202b3d] rounded-sm p-2.5 flex gap-3 items-center">
            <img
              src={nextRide.cover_image || 'https://img.usecurling.com/p/200/200?q=motorcycle'}
              alt={nextRide.name}
              className="w-16 h-16 object-cover rounded-sm border border-slate-700/50 flex-shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate font-montserrat">
                {nextRide.name.toUpperCase()}
              </h4>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>
                  {nextRide.date} - {nextRide.meeting_time || '07:30'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="truncate">{nextRide.destination}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/member/dashboard')}
            variant="outline"
            size="sm"
            className="w-full bg-[#121824] hover:bg-[#192130] border-[#222d42] text-slate-300 hover:text-white text-[10px] font-semibold tracking-wider h-7"
          >
            VER DETALHES
          </Button>
        </div>
      )}

      {/* Outras Inscrições List */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
          MINHAS INSCRIÇÕES
        </span>
        <div className="space-y-1.5 text-[11px]">
          {userRegs.length === 0 ? (
            <p className="text-[10px] text-slate-500 py-2 text-center">Nenhuma inscrição ainda.</p>
          ) : (
            userRegs.slice(0, 2).map((reg) => {
              const ride = reg.expand?.ride
              return (
                <div
                  key={reg.id}
                  className="bg-[#121824] border border-[#1c2538] rounded-sm p-2 flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium truncate text-[10px]">
                    {ride?.name?.toUpperCase() || 'PASSEIO'}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-slate-500">{ride?.date || ''}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        reg.status === 'confirmada'
                          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                          : reg.status === 'cancelada'
                            ? 'text-red-400 bg-red-950/60 border-red-800/50'
                            : 'text-amber-400 bg-amber-950/60 border-amber-800/50'
                      }`}
                    >
                      {reg.status === 'confirmada' ? 'CONFIRMADO' : reg.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/member/dashboard')}
        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-wider py-2.5 rounded-sm uppercase transition-colors"
      >
        ACESSAR ÁREA DO MEMBRO <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
