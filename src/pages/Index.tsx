import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { RideRegistrationModal } from '@/components/RideRegistrationModal'
import { SidebarSignup } from '@/components/SidebarSignup'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import {
  Ride,
  Registration,
  rideService,
  registrationService,
  galleryService,
} from '@/services/api'
import {
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Compass,
  Users,
  Heart,
  CheckCircle2,
  Route,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Bike,
  Lock,
} from 'lucide-react'
import {
  EnvelopeMailboxIcon,
  WindingRoadIcon,
  SpannerWrenchIcon,
  WaterDropRipplesIcon,
  MotorcycleHelmetIcon,
  BarberSpecificIcon,
} from '@/components/BenefitIcons'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import heroBg from '@/assets/chatgpt-image-14-de-ago.de-2026-140658-cc4d6.png'
import logoImage from '@/assets/logo-e67e1.jpeg'

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [rides, setRides] = useState<Ride[]>([])
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [, setLoading] = useState(true)

  // Modal de Inscrição na Ride
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Modais de Cadastro e Login na Home
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const { login } = useAuth()

  // Inscrições do usuário logado (dados reais para o widget Área do Membro)
  const [userRegs, setUserRegs] = useState<Registration[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const ridesData = await rideService.getAllRides()
      setRides(ridesData)

      // Galeria real — apenas cover_image reais vindas do backend, sem placeholders.
      try {
        const galleries = await galleryService.getAll()
        const photos = galleries
          .map((g) => g.cover_image || '')
          .filter((url) => url && url.trim() !== '')
        setGalleryPhotos(photos)
      } catch (galleryErr) {
        console.error('Erro ao carregar galeria da Home:', galleryErr)
        setGalleryPhotos([])
      }

      if (user?.id) {
        try {
          const regs = await registrationService.getRegistrationsByUser(user.id)
          setUserRegs(regs)
        } catch (err) {
          console.error('Erro ao carregar inscrições do membro:', err)
          setUserRegs([])
        }
      } else {
        setUserRegs([])
      }
    } catch (err) {
      console.error('Erro ao carregar dados da Home:', err)
    } finally {
      setLoading(false)
    }
  }
  const handleOpenRegistration = (ride: Ride | null) => {
    if (!ride) {
      navigate('/member/dashboard')
      return
    }
    setSelectedRide(ride)
    setModalOpen(true)
  }

  const handleHomeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const ok = await login(loginEmail, loginPassword)
    setLoginLoading(false)
    if (ok) {
      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      })
      setLoginModalOpen(false)
      navigate('/member/dashboard')
    } else {
      toast({
        title: 'Falha na autenticação',
        description: 'E-mail ou senha incorretos. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // Passeios — SOMENTE dados reais vindos do backend (sem mesclar com dados fake).
  // Se rides[] tiver menos de 3 itens, mostra menos cards; se vazio, não mostra nenhum.
  const MONTHS_PT = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]
  const displayRides = rides.slice(0, 3).map((ride) => {
    // ride.date vem no formato ISO "2026-04-18"; se for outro formato, tratamos com fallback.
    let day = '--'
    let month = '---'
    const dateStr = (ride.date || '').trim()
    if (dateStr) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        day = parts[2]
        const mIdx = parseInt(parts[1], 10) - 1
        if (!isNaN(mIdx) && mIdx >= 0 && mIdx < 12) month = MONTHS_PT[mIdx]
      }
    }
    return {
      id: ride.id,
      day,
      month,
      name: ride.name || 'PASSEIO',
      date: ride.date || '',
      location: ride.destination || '',
      time: ride.meeting_time ? `Saída: ${ride.meeting_time}` : '',
      cover_image: ride.cover_image || '',
      rawRide: ride,
    }
  })

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e2e8f0] font-sans selection:bg-[#0066FF] selection:text-white">
      {/* Header Superior */}
      <Header />

      {/* Main Content Container */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* HERO SECTION */}
        <section className="relative w-full rounded-xl overflow-hidden bg-[#060812] border border-[#131d30] shadow-2xl">
          {/* Hero Background Image - Vivid & Alive */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Euro Motors Motorrad Club GS"
              className="w-full h-full object-cover object-[center_25%] saturate-[1.15] contrast-[1.05]"
            />
            {/* Minimal gradient overlays to preserve vivid background colors while ensuring text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/75 via-[#05070d]/25 to-[#05070d]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070d]/80 via-transparent to-black/20" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Esquerda: Título, Subtítulo e Botão Azul */}
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.05] uppercase font-montserrat drop-shadow-2xl">
                  MOTORRAD CLUBE
                </h1>

                <p className="text-sm sm:text-lg text-slate-200 font-medium leading-relaxed max-w-xl">
                  Estrada. Amizade. Liberdade.
                  <br />
                  Essa é a nossa direção.
                </p>

                <div className="pt-2">
                  <Link to="/club">
                    <Button className="bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-7 py-3 h-auto rounded-sm uppercase shadow-xl shadow-blue-950/60 transition-all gap-2">
                      CONHEÇA O CLUBE <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Direita: Slogan, Texto e 4 Ícones Azuis em Linha */}
              <div className="lg:col-span-5 space-y-5 lg:pl-2">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#0066FF] uppercase tracking-widest block font-montserrat">
                    MAIS QUE UM CLUBE.
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-montserrat">
                    UMA TRIBO.
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  O Euromotors Motorrad Club foi criado para quem vive a estrada com propósito. Mais
                  do que motos, conectamos pessoas por meio de experiências, amizade, eventos e
                  passeios que ficam para sempre.
                </p>
                {/* 4 Ícones de linha azul circulares exatos da referência */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                  {/* Item 1 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-11 h-11 rounded-full bg-[#061022]/80 border border-[#0066FF]/70 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-110 transition-all shadow-lg shadow-blue-950/30">
                      <Users className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[9.5px] font-extrabold text-slate-300 group-hover:text-white uppercase tracking-wider leading-tight font-montserrat">
                      EXPERIÊNCIAS
                      <br />
                      EXCLUSIVAS
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-11 h-11 rounded-full bg-[#061022]/80 border border-[#0066FF]/70 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-110 transition-all shadow-lg shadow-blue-950/30">
                      <Users className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[9.5px] font-extrabold text-slate-300 group-hover:text-white uppercase tracking-wider leading-tight font-montserrat">
                      COMUNIDADE
                      <br />
                      AUTÊNTICA
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-11 h-11 rounded-full bg-[#061022]/80 border border-[#0066FF]/70 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-110 transition-all shadow-lg shadow-blue-950/30">
                      <Route className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[9.5px] font-extrabold text-slate-300 group-hover:text-white uppercase tracking-wider leading-tight font-montserrat">
                      PASSEIOS
                      <br />
                      MEMORÁVEIS
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-11 h-11 rounded-full bg-[#061022]/80 border border-[#0066FF]/70 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-110 transition-all shadow-lg shadow-blue-950/30">
                      <Heart className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[9.5px] font-extrabold text-slate-300 group-hover:text-white uppercase tracking-wider leading-tight font-montserrat">
                      RELACIONAMENTO
                      <br />
                      QUE INSPIRA
                    </span>
                  </div>
                </div>{' '}
              </div>
            </div>
          </div>
        </section>

        {/* CONTAINER ESCURO CENTRAL (Fundo Azul Muito Escuro / Preto com Bordas Elegantes) */}
        <div className="bg-[#060a14] border border-[#121c2e] rounded-xl p-5 sm:p-8 lg:p-10 space-y-10 shadow-2xl">
          {/* RETA CENTRAL: COMO FUNCIONA | PRÓXIMOS PASSEIOS | ÁREA DO MEMBRO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Coluna 1: COMO FUNCIONA (Esquerda) */}
            <div className="lg:col-span-3 space-y-5 lg:border-r border-[#121c2e] lg:pr-6">
              <h2 className="text-xs font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                COMO FUNCIONA
              </h2>

              <div className="space-y-5">
                {/* Passo 01 */}
                <div className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-[#08142b] border border-blue-500/40 flex items-center justify-center text-[#0066FF] flex-shrink-0 group-hover:border-[#0066FF] transition-all">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#0066FF] font-montserrat">01</span>
                      <h3 className="text-[11px] font-bold text-white uppercase font-montserrat tracking-wider">
                        FAÇA PARTE DA TRIBO
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Junte-se a uma comunidade de apaixonados por duas rodas.
                    </p>
                  </div>
                </div>

                {/* Passo 02 */}
                <div className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-[#08142b] border border-blue-500/40 flex items-center justify-center text-[#0066FF] flex-shrink-0 group-hover:border-[#0066FF] transition-all">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#0066FF] font-montserrat">02</span>
                      <h3 className="text-[11px] font-bold text-white uppercase font-montserrat tracking-wider">
                        VIVA EXPERIÊNCIAS ÚNICAS
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Participe de passeios e eventos exclusivos em destinos incríveis.
                    </p>
                  </div>
                </div>

                {/* Passo 03 */}
                <div className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-[#08142b] border border-blue-500/40 flex items-center justify-center text-[#0066FF] flex-shrink-0 group-hover:border-[#0066FF] transition-all">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#0066FF] font-montserrat">03</span>
                      <h3 className="text-[11px] font-bold text-white uppercase font-montserrat tracking-wider">
                        CONECTE-SE E COMPARTILHE
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Crie laços, troque histórias e fortaleça amizades que vão além da estrada.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: PRÓXIMOS PASSEIOS (Centro) */}
            <div id="proximos-passeios" className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                  PRÓXIMOS PASSEIOS
                </h2>
                <Link
                  to="/member/passeios"
                  className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat transition-colors"
                >
                  VER TODOS <ChevronRight className="w-3 h-3 text-[#0066FF]" />
                </Link>
              </div>

              {/* Grid com 3 Cards Horizontais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {displayRides.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#09101e] border border-[#142036] rounded-md overflow-hidden flex flex-col justify-between group hover:border-[#0066FF]/60 transition-all duration-300 shadow-lg"
                  >
                    <div>
                      {/* Banner Imagem + Badge de Data Azul */}
                      <div className="relative h-28 overflow-hidden bg-[#0a0d14]">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.name}
                            className="w-full h-full object-cover saturate-[1.1] group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bike className="w-8 h-8 text-slate-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09101e] via-transparent to-transparent" />

                        {/* Date Badge Top Left Azul */}
                        <div className="absolute top-2 left-2 bg-[#0066FF] text-white rounded-sm px-2 py-0.5 text-center shadow-md">
                          <span className="block text-xs font-black leading-none font-montserrat">
                            {item.day}
                          </span>
                          <span className="block text-[8px] font-extrabold uppercase tracking-wider font-montserrat">
                            {item.month}
                          </span>
                        </div>
                      </div>

                      {/* Informações do Passeio */}
                      <div className="p-2.5 space-y-1.5">
                        <h3 className="text-[10px] sm:text-[11px] font-extrabold text-white tracking-wide uppercase font-montserrat line-clamp-1">
                          {item.name}
                        </h3>

                        <div className="space-y-1 text-[9px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 pt-0">
                      <Button
                        onClick={() => handleOpenRegistration(item.rawRide)}
                        variant="outline"
                        className="w-full border-[#182847] hover:border-[#0066FF] bg-[#0c1628] hover:bg-[#0066FF] text-white font-semibold text-[9px] tracking-wider h-6 rounded-sm uppercase transition-all"
                      >
                        VER DETALHES
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 3: ÁREA DO MEMBRO (Direita - Widget Dashboard) */}
            <div className="lg:col-span-3 bg-[#09101e]/95 border border-[#142036] rounded-md p-3.5 space-y-3 shadow-xl">
              <h3 className="text-xs font-extrabold text-white tracking-widest font-montserrat uppercase">
                ÁREA DO MEMBRO
              </h3>

              {user ? (
                <>
                  {/* User Bar — dados reais do membro */}
                  <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-[#0066FF]/60 flex items-center justify-center text-blue-400 font-bold text-[10px] flex-shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <span className="text-[9px] text-slate-300 font-medium uppercase tracking-wider block leading-tight truncate">
                        BEM-VINDO,{' '}
                        <strong className="text-white font-bold">
                          {user.name.split(' ')[0].toUpperCase()}
                        </strong>
                      </span>
                    </div>
                    <span
                      className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border flex-shrink-0 ${
                        user.status === 'ativo' || user.role === 'admin'
                          ? 'text-blue-300 bg-blue-900/60 border-blue-700/60'
                          : 'text-amber-300 bg-amber-900/60 border-amber-700/60'
                      }`}
                    >
                      {user.status === 'ativo' || user.role === 'admin'
                        ? 'MEMBRO ATIVO'
                        : `STATUS: ${user.status?.toUpperCase() || 'PENDENTE'}`}
                    </span>
                  </div>

                  {/* Carteirinha Digital link */}
                  <Link
                    to="/member/card"
                    className="block bg-[#121d30] hover:bg-blue-600 border border-blue-500/30 hover:border-blue-400 rounded-sm p-1.5 text-center text-white font-bold text-[8.5px] uppercase tracking-wider transition-colors font-montserrat shadow-sm"
                  >
                    VER CARTEIRINHA DIGITAL
                  </Link>

                  {/* Moto do membro */}
                  {((user.bike_brand && user.bike_model) || user.bike_model) && (
                    <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-1.5 flex items-center gap-1.5 text-[8.5px] text-slate-300">
                      <Bike className="w-3 h-3 text-[#0066FF] flex-shrink-0" />
                      <span className="truncate font-medium">
                        {user.bike_brand ? `${user.bike_brand} ` : ''}
                        {user.bike_model || ''}
                        {user.bike_year ? ` · ${user.bike_year}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Próximo Passeio confirmado (dados reais) */}
                  {(() => {
                    const confirmed = userRegs.filter((r) => r.status === 'confirmada')
                    const next = confirmed.find((r) => r.expand?.ride) || confirmed[0]
                    const ride = next?.expand?.ride
                    if (!ride) return null
                    return (
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
                          PRÓXIMO PASSEIO
                        </span>
                        <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-1.5 flex gap-2 items-center">
                          {ride.cover_image && (
                            <img
                              src={ride.cover_image}
                              alt={ride.name}
                              className="w-12 h-12 object-cover rounded-sm border border-slate-700/50 flex-shrink-0"
                            />
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className="text-[9.5px] font-extrabold text-white truncate font-montserrat">
                              {ride.name.toUpperCase()}
                            </h4>
                            <p className="text-[8.5px] text-slate-400">
                              {ride.date}
                              {ride.meeting_time ? ` - ${ride.meeting_time}` : ''}
                            </p>
                            {ride.destination && (
                              <p className="text-[8.5px] text-slate-400 truncate">
                                {ride.destination}
                              </p>
                            )}
                            <button
                              onClick={() => navigate('/member/dashboard')}
                              className="text-[8px] font-bold text-[#0066FF] hover:text-blue-300 uppercase tracking-wider block mt-0.5"
                            >
                              VER DETALHES
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Inscrições do membro (dados reais) */}
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
                      MINHAS INSCRIÇÕES
                    </span>
                    <div className="space-y-1">
                      {userRegs.length === 0 ? (
                        <p className="text-[8.5px] text-slate-500 py-1.5 text-center">
                          Nenhuma inscrição ainda.
                        </p>
                      ) : (
                        userRegs.slice(0, 2).map((reg) => {
                          const ride = reg.expand?.ride
                          return (
                            <div
                              key={reg.id}
                              className="bg-[#0e1728] border border-[#1a2a46] rounded-sm p-1.5 flex items-center justify-between text-[8.5px]"
                            >
                              <div className="flex items-center gap-1 truncate pr-1 min-w-0">
                                <CheckCircle2 className="w-3 h-3 text-[#0066FF] flex-shrink-0" />
                                <span className="text-slate-300 truncate font-medium">
                                  {ride?.name?.toUpperCase() || 'PASSEIO'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-slate-500 text-[8px]">
                                  {ride?.date || ''}
                                </span>
                                <span
                                  className={`text-[7.5px] font-bold px-1 py-0.2 rounded uppercase border ${
                                    reg.status === 'confirmada'
                                      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
                                      : reg.status === 'cancelada'
                                        ? 'text-red-400 bg-red-950/80 border-red-800/60'
                                        : 'text-amber-400 bg-amber-950/80 border-amber-800/60'
                                  }`}
                                >
                                  {reg.status === 'confirmada'
                                    ? 'CONFIRMADO'
                                    : reg.status.toUpperCase()}
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
                    className="w-full text-center text-[9.5px] font-extrabold text-[#0066FF] hover:text-blue-300 tracking-wider uppercase pt-1 flex items-center justify-center gap-1 font-montserrat transition-colors"
                  >
                    VER HISTÓRICO COMPLETO <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                /* Usuário não logado — card de convite para cadastro/login */
                <div className="space-y-3">
                  <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-3 space-y-2 text-center">
                    <div className="w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                      <Lock className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Faça parte da nossa comunidade exclusiva ou faça login para acessar sua área,
                      ver passeios confirmados e benefícios.
                    </p>
                  </div>
                  <Button
                    onClick={() => setSignupModalOpen(true)}
                    className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-[10px] tracking-wider h-9 rounded-sm uppercase shadow-lg shadow-blue-950/50"
                  >
                    QUERO FAZER PARTE
                  </Button>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="w-full text-center text-[9px] font-bold text-slate-400 hover:text-white tracking-wider uppercase flex items-center justify-center gap-1 transition-colors"
                  >
                    JÁ SOU MEMBRO / FAZER LOGIN <ChevronRight className="w-3 h-3 text-[#0066FF]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BENEFÍCIOS EXCLUSIVOS EURO MOTORS com linha azul indicadora idênticos à imagem de referência */}
          <div className="pt-2 space-y-3">
            {/* Header: Title with vibrant blue accent bar floating directly ABOVE the word "BENEFÍCIOS" */}
            <div className="relative pt-3 flex flex-col items-start gap-1.5 border-t border-[#121c2e]/80">
              <div className="w-8 h-[3px] bg-[#0066FF] rounded-full shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
              <h2 className="text-[11px] sm:text-[12px] font-black text-slate-200 tracking-[0.12em] uppercase font-montserrat leading-tight">
                BENEFÍCIOS EXCLUSIVOS EURO MOTORS
              </h2>
            </div>

            {/* 6 Horizontal Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {/* Card 1: Convênios e parcerias */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <EnvelopeMailboxIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Convênios e parcerias para festas, lançamentos, cafés da manhã e passeios.
                </p>
              </div>

              {/* Card 2: Viagens Motorrad Euro Motors Jundiaí */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <WindingRoadIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Condições e descontos exclusivos em viagens Motorrad Euro Motors Jundiaí.
                </p>
              </div>

              {/* Card 3: Pós-vendas */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <SpannerWrenchIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Prioridade na agenda e condições diferenciadas no pós-vendas.
                </p>
              </div>

              {/* Card 4: Lavagem da moto */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <WaterDropRipplesIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Preço diferenciado na lavagem da moto.
                </p>
              </div>

              {/* Card 5: Treinamentos e experiências */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <MotorcycleHelmetIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Experiências e treinamentos com instrutores especializados em condução de motos.
                </p>
              </div>

              {/* Card 6: Barbearia */}
              <div className="bg-[#060b14]/90 border border-[#132035] rounded-md p-3 flex items-start gap-3 hover:border-[#0066FF]/80 hover:bg-[#081224] transition-all group shadow-md min-h-[105px]">
                <div className="text-[#0066FF] flex-shrink-0 group-hover:scale-105 transition-transform pt-0.5">
                  <BarberSpecificIcon className="w-8 h-8" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-300 leading-snug font-normal font-sans">
                  Ações e promoções exclusivas na barbearia.
                </p>
              </div>
            </div>
          </div>

          {/* TRANSIÇÃO: FAÇA PARTE DESTE ECOSSISTEMA entre duas linhas finas horizontais */}
          <div className="relative py-5 border-t border-b border-[#121c2e]/80 flex items-center justify-center my-2">
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#0066FF] uppercase font-montserrat tracking-[0.45em] sm:tracking-[0.6em] text-center drop-shadow-[0_0_12px_rgba(0,102,255,0.4)]">
              F A Ç A &nbsp; P A R T E &nbsp; D E S T E &nbsp; E C O S S I S T E M A .
            </p>
          </div>

          {/* GALERIA DE MOMENTOS */}
          {galleryPhotos.length > 0 && (
            <div className="space-y-4 border-t border-[#121c2e] pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold text-slate-300 tracking-widest uppercase font-montserrat">
                  GALERIA DE MOMENTOS
                </h2>
                <Link
                  to="/galeria"
                  className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat transition-colors"
                >
                  VER GALERIA COMPLETA <ChevronRight className="w-3 h-3 text-[#0066FF]" />
                </Link>
              </div>
              {/* Faixa Horizontal - fotos reais vindas do backend */}
              <div
                className={`grid gap-2 ${
                  galleryPhotos.length >= 7
                    ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {galleryPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-24 sm:h-28 rounded-md overflow-hidden border border-[#142036] group cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`Galeria de Momentos ${idx + 1}`}
                      className="w-full h-full object-cover saturate-[1.15] contrast-[1.05] group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>{' '}
            </div>
          )}

          {/* FOOTER INTERNO DO CONTAINER ESCURO REPLICA EXACT */}
          <div className="pt-6 border-t border-[#121c2e] flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Esquerda: SIGA-NOS com ícones sociais idênticos à referência */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                SIGA-NOS
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-md bg-[#0a1222] border border-[#172642] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-md bg-[#0a1222] border border-[#172642] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-md bg-[#0a1222] border border-[#172642] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                  aria-label="Youtube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://euromotorsmc.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-md bg-[#0a1222] border border-[#172642] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Centro: Logo Euro Motors */}
            <div className="flex items-center justify-center">
              <img
                src={logoImage}
                alt="Euromotors Motorrad Club"
                className="h-12 sm:h-[3.6rem] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Direita: Slogan "MAIS QUE UM CLUBE. UMA TRIBO." */}
            <div className="text-center md:text-right border-l-0 md:border-l border-[#121c2e] md:pl-6">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block font-montserrat leading-tight">
                MAIS QUE UM CLUBE.
              </span>
              <span className="text-sm font-black text-white tracking-widest uppercase font-montserrat leading-tight">
                UMA TRIBO.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Geral */}
      <Footer />

      {/* Modal de Inscrição */}
      <RideRegistrationModal
        ride={selectedRide}
        user={user}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Modal de Cadastro (Quero Fazer Parte) */}
      <Dialog open={signupModalOpen} onOpenChange={setSignupModalOpen}>
        <DialogContent className="bg-[#0b0f17] border-[#1d2638] text-white w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-1 text-left pb-2 border-b border-[#162032]">
            <DialogTitle className="text-base sm:text-lg font-black text-white uppercase font-montserrat tracking-wide">
              SOLICITAR CADASTRO NO CLUBE
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              O Euro Motors Motorrad Club é exclusivo para clientes Euro Motors.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <SidebarSignup onSuccess={() => {}} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Login na Home */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-wider text-center text-white font-montserrat uppercase">
              ÁREA DO MEMBRO
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 text-center">
              Acesse sua conta para visualizar seus passeios e benefícios exclusivos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleHomeLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">E-mail</Label>
              <Input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Senha</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider h-10 mt-2 rounded-sm uppercase"
            >
              {loginLoading ? 'ENTRANDO...' : 'ENTRAR NA ÁREA DO MEMBRO'}
            </Button>

            <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-[#1c2436] flex flex-col gap-1.5">
              <span>Ainda não faz parte?</span>
              <button
                type="button"
                onClick={() => {
                  setLoginModalOpen(false)
                  setSignupModalOpen(true)
                }}
                className="text-[#0066FF] hover:text-blue-400 font-bold uppercase tracking-wider text-xs underline"
              >
                Solicite seu cadastro aqui
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
