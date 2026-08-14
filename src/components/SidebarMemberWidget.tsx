import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Registration, Ride, registrationService, rideService } from '@/services/api'
import { Shield, ChevronRight, Calendar, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const SidebarMemberWidget: React.FC = () => {
  const { user } = useAuth()
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
        <span
          className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${
            isPremium
              ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
              : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
          }`}
        >
          {isPremium ? 'MEMBRO PREMIUM' : 'STATUS: PENDENTE'}
        </span>
      </div>

      {/* Tabs / Sub-header */}
      <div className="border-b border-[#1c2436] flex gap-4 text-xs font-semibold">
        <button className="text-white border-b-2 border-blue-500 pb-1.5 text-[11px] tracking-wider uppercase font-montserrat">
          MINHAS INSCRIÇÕES
        </button>
        <button className="text-slate-400 hover:text-slate-200 pb-1.5 text-[11px] tracking-wider uppercase font-montserrat">
          MEUS DADOS
        </button>
      </div>

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
          OUTRAS INSCRIÇÕES
        </span>
        <div className="space-y-1.5 text-[11px]">
          <div className="bg-[#121824] border border-[#1c2538] rounded-sm p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-500 text-xs">👥</span>
              <span className="text-slate-300 font-medium truncate text-[10px]">
                SERRA DO RIO DO RASTRO
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-500">07/06/2025</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                CONFIRMADO
              </span>
            </div>
          </div>

          <div className="bg-[#121824] border border-[#1c2538] rounded-sm p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-500 text-xs">👥</span>
              <span className="text-slate-300 font-medium truncate text-[10px]">
                CAMINHOS DA MANTIQUEIRA
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-500">21/06/2025</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                CONFIRMADO
              </span>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#historico"
        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center justify-between pt-1 font-montserrat tracking-wider"
      >
        <span>VER HISTÓRICO COMPLETO</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}
