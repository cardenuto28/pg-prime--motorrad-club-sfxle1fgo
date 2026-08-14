import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { RideRegistrationModal } from '@/components/RideRegistrationModal'
import { useAuth } from '@/context/AuthContext'
import { Ride, rideService } from '@/services/api'
import {
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Compass,
  Users,
  Heart,
  Mail,
  Wrench,
  Droplets,
  CheckCircle2,
  Route,
  ShieldCheck,
  Tag,
  Instagram,
  Facebook,
  Youtube,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import heroBg from '@/assets/chatgpt-image-14-de-ago.de-2026-140658-0d19a.png'
import logoImage from '@/assets/logo-e67e1.jpeg'

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [rides, setRides] = useState<Ride[]>([])
  const [, setLoading] = useState(true)

  // Modal de Inscrição na Ride
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const ridesData = await rideService.getAllRides()
      setRides(ridesData)
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
    if (!user) {
      toast({
        title: 'Área do Membro',
        description: 'Faça login na Área do Membro para se inscrever nos passeios.',
      })
      return
    }
    setSelectedRide(ride)
    setModalOpen(true)
  }

  // Passeios da Referência
  const displayRides = [
    {
      id: rides[0]?.id || 'r1',
      day: '07',
      month: 'JUN',
      name: 'SERRA DO RIO DO RASTRO',
      date: '07/06/2025',
      location: 'Lauro Müller - SC',
      time: 'Saída: 07h00',
      cover_image: 'https://img.usecurling.com/p/600/400?q=serra,road,curves,mountains',
      rawRide: rides[0] || null,
    },
    {
      id: rides[1]?.id || 'r2',
      day: '21',
      month: 'JUN',
      name: 'CAMINHOS DA MANTIQUEIRA',
      date: '21/06/2025',
      location: 'Campos do Jordão - SP',
      time: 'Saída: 08h00',
      cover_image: 'https://img.usecurling.com/p/600/400?q=bmw,motorcycle,mountains,road',
      rawRide: rides[1] || null,
    },
    {
      id: rides[2]?.id || 'r3',
      day: '05',
      month: 'JUL',
      name: 'LITORAL NORTE EXPERIENCE',
      date: '05/07/2025',
      location: 'Ubatuba - SP',
      time: 'Saída: 07h30',
      cover_image: 'https://img.usecurling.com/p/600/400?q=ocean,coast,motorcycle,beach',
      rawRide: rides[2] || null,
    },
  ]

  // Galeria de Momentos (7 fotos em faixa horizontal)
  const galleryPhotos = [
    'https://img.usecurling.com/p/400/300?q=bmw,r1250gs,motorcycles,riders,group&seed=1',
    'https://img.usecurling.com/p/400/300?q=bmw,gs,motorcycle,rider,front&seed=2',
    'https://img.usecurling.com/p/400/300?q=bmw,motorcycles,mountain,sunset&seed=3',
    'https://img.usecurling.com/p/400/300?q=bmw,r1250gs,riding,road,curves&seed=4',
    'https://img.usecurling.com/p/400/300?q=bmw,motorcycles,group,viewpoint&seed=5',
    'https://img.usecurling.com/p/400/300?q=bmw,gs1300,motorcycle,serra&seed=6',
    'https://img.usecurling.com/p/400/300?q=bmw,motorcycle,travel,landscape&seed=7',
  ]

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e2e8f0] font-sans selection:bg-[#0066FF] selection:text-white">
      {/* Header Superior */}
      <Header />

      {/* Main Content Container */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* HERO SECTION */}
        <section className="relative w-full rounded-xl overflow-hidden bg-[#060812] border border-[#131d30] shadow-2xl">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Euro Motors Motorrad Club GS"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark Cinematic Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/95 via-[#05070d]/70 to-[#05070d]/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Esquerda: Título, Subtítulo e Botão Azul */}
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.05] uppercase font-montserrat drop-shadow-2xl">
                  EUROMOTORS
                  <br />
                  <span className="text-white">MOTORRAD CLUB</span>
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

                {/* 4 Ícones em Linha em Azul */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                  {/* Item 1 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-10 h-10 rounded-full bg-[#081329] border border-blue-500/40 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-105 transition-all shadow-md">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-snug">
                      EXPERIÊNCIAS
                      <br />
                      EXCLUSIVAS
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-10 h-10 rounded-full bg-[#081329] border border-blue-500/40 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-105 transition-all shadow-md">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-snug">
                      COMUNIDADE
                      <br />
                      AUTÊNTICA
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-10 h-10 rounded-full bg-[#081329] border border-blue-500/40 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-105 transition-all shadow-md">
                      <Route className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-snug">
                      PASSEIOS
                      <br />
                      MEMORÁVEIS
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-10 h-10 rounded-full bg-[#081329] border border-blue-500/40 flex items-center justify-center text-[#0066FF] group-hover:border-[#0066FF] group-hover:scale-105 transition-all shadow-md">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-snug">
                      RELACIONAMENTO
                      <br />
                      QUE INSPIRA
                    </span>
                  </div>
                </div>
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
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={item.cover_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
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

              {/* User Bar */}
              <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=42"
                    alt="Marcelo"
                    className="w-6 h-6 rounded-full object-cover border border-[#0066FF]/60"
                  />
                  <span className="text-[9px] text-slate-300 font-medium uppercase tracking-wider block leading-tight">
                    BEM-VINDO,{' '}
                    <strong className="text-white font-bold">
                      {user ? user.name.split(' ')[0].toUpperCase() : 'MARCELO'}
                    </strong>
                  </span>
                </div>
                <span className="text-[7.5px] font-extrabold text-blue-300 bg-blue-900/60 border border-blue-700/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  MEMBRO PREMIUM
                </span>
              </div>

              {/* Próximo Passeio Card */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
                  PRÓXIMO PASSEIO
                </span>
                <div className="bg-[#0e1728] border border-[#1c2e4d] rounded-sm p-1.5 flex gap-2 items-center">
                  <img
                    src="https://img.usecurling.com/p/200/200?q=ocean,coast,motorcycle&seed=88"
                    alt="Litoral Norte Experience"
                    className="w-12 h-12 object-cover rounded-sm border border-slate-700/50 flex-shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-[9.5px] font-extrabold text-white truncate font-montserrat">
                      LITORAL NORTE EXPERIENCE
                    </h4>
                    <p className="text-[8.5px] text-slate-400">05/07/2025 - 07h30</p>
                    <p className="text-[8.5px] text-slate-400 truncate">Ubatuba - SP</p>
                    <button
                      onClick={() => navigate('/member/dashboard')}
                      className="text-[8px] font-bold text-[#0066FF] hover:text-blue-300 uppercase tracking-wider block mt-0.5"
                    >
                      VER DETALHES
                    </button>
                  </div>
                </div>
              </div>

              {/* Outras Inscrições */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-montserrat block">
                  OUTRAS INSCRIÇÕES
                </span>
                <div className="space-y-1">
                  <div className="bg-[#0e1728] border border-[#1a2a46] rounded-sm p-1.5 flex items-center justify-between text-[8.5px]">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <CheckCircle2 className="w-3 h-3 text-[#0066FF] flex-shrink-0" />
                      <span className="text-slate-300 truncate font-medium">
                        SERRA DO RIO DO RASTRO
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-slate-500 text-[8px]">07/06/2025</span>
                      <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.2 rounded uppercase">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0e1728] border border-[#1a2a46] rounded-sm p-1.5 flex items-center justify-between text-[8.5px]">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <CheckCircle2 className="w-3 h-3 text-[#0066FF] flex-shrink-0" />
                      <span className="text-slate-300 truncate font-medium">
                        CAMINHOS DA MANTIQUEIRA
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-slate-500 text-[8px]">21/06/2025</span>
                      <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.2 rounded uppercase">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/member/dashboard')}
                className="w-full text-center text-[9.5px] font-extrabold text-[#0066FF] hover:text-blue-300 tracking-wider uppercase pt-1 flex items-center justify-center gap-1 font-montserrat transition-colors"
              >
                VER HISTÓRICO COMPLETO <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* BENEFÍCIOS EXCLUSIVOS EURO MOTORS */}
          <div className="pt-4 space-y-4 border-t border-[#121c2e]">
            <h2 className="text-xs font-extrabold text-slate-300 tracking-widest uppercase font-montserrat">
              BENEFÍCIOS EXCLUSIVOS EURO MOTORS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Box 1 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Convênios e parcerias para festas, lançamentos, cafés da manhã e passeios.
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <Route className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Condições e descontos exclusivos em viagens Motorrad Euro Motors Jundiaí.
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <Wrench className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Prioridade na agenda e condições diferenciadas no pós-vendas.
                </p>
              </div>

              {/* Box 4 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <Droplets className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Preço diferenciado na lavagem da moto.
                </p>
              </div>

              {/* Box 5 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Experiências e treinamentos com instrutores especializados em condução de motos.
                </p>
              </div>

              {/* Box 6 */}
              <div className="bg-[#09101e] border border-[#142036] rounded-md p-3 space-y-2 hover:border-[#0066FF]/60 transition-all group">
                <div className="text-[#0066FF] group-hover:scale-110 transition-transform">
                  <Tag className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-normal">
                  Ações e promoções exclusivas na bandeira.
                </p>
              </div>
            </div>
          </div>

          {/* TRANSIÇÃO: FAÇA PARTE DESTE ECOSSISTEMA */}
          <div className="py-4 text-center border-t border-[#121c2e]">
            <p className="text-xs sm:text-sm md:text-base font-black text-[#0066FF] uppercase font-montserrat tracking-[0.25em] sm:tracking-[0.4em] drop-shadow-md">
              FAÇA PARTE DESTE ECOSSISTEMA.
            </p>
          </div>

          {/* GALERIA DE MOMENTOS */}
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

            {/* Faixa Horizontal de 7 Fotos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {galleryPhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-24 sm:h-28 rounded-md overflow-hidden border border-[#142036] group cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Galeria de Momentos ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER INTERNO DO CONTAINER ESCURO */}
          <div className="pt-6 border-t border-[#121c2e] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Siga-nos */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                SIGA-NOS
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0d1627] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0d1627] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0d1627] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://euromotorsmc.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0d1627] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Logo Euro Motors */}
            <div className="flex items-center justify-center">
              <img
                src={logoImage}
                alt="Euromotors Motorrad Club"
                className="h-9 sm:h-11 w-auto object-contain opacity-90"
              />
            </div>

            {/* Right Slogan */}
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block font-montserrat leading-tight">
                MAIS QUE UM CLUBE.
              </span>
              <span className="text-xs font-black text-white tracking-widest uppercase font-montserrat leading-tight">
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
    </div>
  )
}
