import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Bike,
  CheckCircle2,
  ChevronRight,
  Compass,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Ride, Registration, rideService, registrationService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { RideRegistrationModal } from '@/components/RideRegistrationModal'
import { formatDate, isRidePast } from '@/lib/member'
import pb from '@/lib/pocketbase/client'

const MemberPasseios: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rides, setRides] = useState<Ride[]>([])
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [allRides, userRegs] = await Promise.all([
        rideService.getAllRides(),
        user ? registrationService.getRegistrationsByUser(user.id) : Promise.resolve([]),
      ])
      setRides(allRides)
      setRegs(userRegs)
    } catch (e) {
      console.error('Erro ao carregar passeios:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const registeredRideIds = new Set(
    regs.filter((r) => r.status === 'confirmada').map((r) => r.ride),
  )

  const upcoming = rides.filter(
    (r) => !isRidePast(r.date) && r.status !== 'cancelado' && r.status !== 'realizado',
  )

  const handleOpenRegistration = (ride: Ride) => {
    if (!user) {
      navigate('/')
      return
    }
    setSelectedRide(ride)
    setModalOpen(true)
  }

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
          <Compass className="w-5 h-5 text-blue-500" /> Próximos Passeios
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Confira os próximos passeios do clube e garanta sua vaga.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-10 text-center">
          <p className="text-sm text-slate-500">Nenhum passeio agendado no momento.</p>
          <Link
            to="/member/dashboard"
            className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            Voltar para o dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.map((ride) => {
            const isReg = registeredRideIds.has(ride.id)
            const img =
              ride.cover_image && ride.cover_image.startsWith('http')
                ? ride.cover_image
                : ride.cover_image
                  ? pb.baseUrl + ride.cover_image
                  : `https://img.usecurling.com/p/600/400?q=motorcycle,serra,road`

            return (
              <div
                key={ride.id}
                className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={img}
                    alt={ride.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-transparent to-transparent" />
                  {isReg && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Inscrito
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat">
                    {ride.name}
                  </h3>
                  {ride.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ride.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(ride.date)}
                    </div>
                    {ride.meeting_time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" /> {ride.meeting_time}
                      </div>
                    )}
                    {ride.destination && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500" />{' '}
                        <span className="truncate">{ride.destination}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Bike className="w-3 h-3 text-slate-500" /> {ride.bikes_registered || 0}/
                      {ride.max_bikes}
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0 flex flex-col gap-2">
                  <Link to={`/passeios/${ride.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all"
                    >
                      VER DETALHES
                    </Button>
                  </Link>
                  {isReg ? (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full border-emerald-600/60 text-emerald-300 bg-emerald-950/40 font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> INSCRIÇÃO CONFIRMADA
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenRegistration(ride)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all flex items-center justify-center gap-1"
                    >
                      INSCREVER-SE <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RideRegistrationModal
        ride={selectedRide}
        user={user}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
      />
    </div>
  )
}

export default MemberPasseios
