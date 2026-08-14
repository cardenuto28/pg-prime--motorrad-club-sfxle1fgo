import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Compass,
  Route as RouteIcon,
  Bike,
  Users,
  Timer,
  Wallet,
  Info,
  PackageCheck,
  ScrollText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ShieldAlert,
  User,
  Lock,
  Images,
  ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { RideRegistrationModal } from '@/components/RideRegistrationModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  rideService,
  registrationService,
  galleryService,
  Registration,
  Ride,
  Gallery,
} from '@/services/api'
import { formatDate, isRidePast, resolveFileUrl, coverFallback } from '@/lib/member'
import { GalleryGrid, galleriesToTiles, type GalleryTile } from '@/components/gallery/GalleryGrid'
import {
  GalleryLightbox,
  galleryToLightboxItems,
  type LightboxItem,
} from '@/components/gallery/GalleryLightbox'

const RideDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, login, refreshUser } = useAuth()
  const { toast } = useToast()

  const [ride, setRide] = useState<Ride | null>(null)
  const [userRegs, setUserRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [regModalOpen, setRegModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const r = await rideService.getRideById(id)
      if (!r) {
        setNotFound(true)
        return
      }
      setRide(r)
      // Carrega galeria se o passeio já foi realizado
      if (r.status === 'realizado') {
        try {
          const g = await galleryService.getByRide(id)
          setGallery(g)
        } catch (_) {
          setGallery([])
        }
      }
      if (user) {
        const regs = await registrationService.getRegistrationsByUser(user.id)
        setUserRegs(regs)
      } else {
        setUserRegs([])
      }
    } catch (e) {
      console.error('Erro ao carregar passeio:', e)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const galleryTiles: GalleryTile[] = useMemo(() => galleriesToTiles(gallery), [gallery])
  const lightboxItems: LightboxItem[] = useMemo(() => galleryToLightboxItems(gallery), [gallery])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const ok = await login(email, password)
    setLoginLoading(false)
    if (ok) {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' })
      setLoginModalOpen(false)
      setEmail('')
      setPassword('')
      await refreshUser()
      // após login bem-sucedido, abre direto o formulário de inscrição
      setRegModalOpen(true)
    } else {
      toast({
        title: 'Falha na autenticação',
        description: 'E-mail ou senha incorretos. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleQueroParticipar = () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    setRegModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-widest uppercase font-montserrat">
            Carregando passeio...
          </span>
        </div>
      </div>
    )
  }

  if (notFound || !ride) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#e2e8f0]">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-white font-montserrat uppercase tracking-tight">
            Passeio não encontrado
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            O passeio que você procura não existe ou foi removido.
          </p>
          <Link to="/">
            <Button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase">
              Voltar para a página inicial
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const img =
    resolveFileUrl(ride.cover_image) || coverFallback('motorcycle,bmw,serra,road', 1200, 600)

  const bikes = ride.bikes_registered || 0
  const maxBikes = ride.max_bikes || 0
  const participants = ride.participants_registered || 0
  const isFull = maxBikes > 0 && bikes >= maxBikes
  const percent = maxBikes > 0 ? Math.min(100, Math.round((bikes / maxBikes) * 100)) : 0
  const nearFull = !isFull && percent >= 80

  const ridePast = isRidePast(ride.date)
  const registrationsClosed =
    ride.status === 'inscricoes_encerradas' ||
    ride.status === 'realizado' ||
    ride.status === 'cancelado' ||
    ridePast

  const myConfirmedReg = userRegs.find((r) => r.ride === ride.id && r.status === 'confirmada')

  const InfoRow: React.FC<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    value?: string | number | null
  }> = ({ icon: Icon, label, value }) => {
    if (value === undefined || value === null || value === '') return null
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-[#1c2538] last:border-0">
        <div className="w-8 h-8 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-montserrat">
            {label}
          </p>
          <p className="text-sm text-slate-200 break-words">{value}</p>
        </div>
      </div>
    )
  }

  const SectionCard: React.FC<{
    icon: React.ComponentType<{ className?: string }>
    title: string
    children: React.ReactNode
  }> = ({ icon: Icon, title, children }) => (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-3">
      <h3 className="text-xs font-bold text-white uppercase tracking-widest font-montserrat flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" /> {title}
      </h3>
      <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar para a página inicial
        </button>

        {/* HERO */}
        <div className="relative rounded-md overflow-hidden min-h-[340px] sm:min-h-[460px] flex flex-col justify-end border border-[#1a2336] group">
          <div className="absolute inset-0 z-0">
            <img
              src={img}
              alt={ride.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              {ride.status && (
                <span className="text-[10px] font-bold text-blue-300 bg-blue-950/70 border border-blue-700/50 px-2.5 py-1 rounded uppercase tracking-widest font-montserrat">
                  {ride.status.replace(/_/g, ' ')}
                </span>
              )}
              {ride.date && (
                <span className="text-[10px] font-bold text-slate-200 bg-[#0d1422]/90 backdrop-blur border border-[#222e43] px-2.5 py-1 rounded uppercase tracking-widest font-montserrat flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-blue-400" /> {formatDate(ride.date)}
                </span>
              )}
              {ride.destination && (
                <span className="text-[10px] font-bold text-slate-200 bg-[#0d1422]/90 backdrop-blur border border-[#222e43] px-2.5 py-1 rounded uppercase tracking-widest font-montserrat flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-400" /> {ride.destination}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-montserrat tracking-tight leading-none uppercase drop-shadow-md">
              {ride.name}
            </h1>

            {ride.description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                {ride.description}
              </p>
            )}
          </div>
        </div>

        {/* LAYOUT: conteúdo + sidebar de inscrição */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detalhes do passeio */}
            <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-montserrat flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-blue-500" /> Detalhes do Passeio
              </h3>
              <div className="divide-y divide-[#1c2538]">
                <InfoRow icon={Calendar} label="Data" value={formatDate(ride.date)} />
                <InfoRow icon={Clock} label="Horário de encontro" value={ride.meeting_time} />
                <InfoRow icon={Timer} label="Horário de saída" value={ride.departure_time} />
                <InfoRow icon={MapPin} label="Ponto de encontro" value={ride.meeting_point} />
                <InfoRow icon={Compass} label="Destino" value={ride.destination} />
                <InfoRow icon={RouteIcon} label="Percurso" value={ride.route} />
                <InfoRow
                  icon={Bike}
                  label="Quilometragem aproximada"
                  value={ride.distance_km ? `${ride.distance_km} km` : undefined}
                />
                <InfoRow icon={Timer} label="Tempo estimado" value={ride.estimated_time} />
                <InfoRow
                  icon={Users}
                  label="Limite de motos"
                  value={ride.max_bikes ? `${ride.max_bikes} motos` : undefined}
                />
                <InfoRow
                  icon={Wallet}
                  label="Valor"
                  value={
                    ride.price !== undefined && ride.price !== null
                      ? ride.price > 0
                        ? `R$ ${Number(ride.price).toLocaleString('pt-BR')}`
                        : 'Gratuito'
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Descrição completa */}
            {ride.description && (
              <SectionCard icon={Info} title="Descrição do Passeio">
                {ride.description}
              </SectionCard>
            )}

            {/* Informações importantes */}
            {ride.important_info && (
              <SectionCard icon={AlertTriangle} title="Informações Importantes">
                {ride.important_info}
              </SectionCard>
            )}

            {/* O que está incluso */}
            {ride.whats_included && (
              <SectionCard icon={PackageCheck} title="O que está incluso">
                {ride.whats_included}
              </SectionCard>
            )}

            {/* Regulamento */}
            {ride.rules && (
              <SectionCard icon={ScrollText} title="Regulamento">
                {ride.rules}
              </SectionCard>
            )}

            {/* Mapa / rota */}
            {ride.map_link && (
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-montserrat flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-500" /> Mapa / Rota
                </h3>
                <a href={ride.map_link} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-xs tracking-wider uppercase gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Ver rota no mapa
                  </Button>
                </a>
              </div>
            )}

            {/* Galeria do Passeio (apenas para passeios realizados) */}
            {ride.status === 'realizado' && galleryTiles.length > 0 && (
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-montserrat flex items-center gap-2">
                    <Images className="w-4 h-4 text-blue-500" /> Galeria do Passeio
                  </h3>
                  <Link
                    to={`/galeria?ride=${ride.id}`}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 font-montserrat"
                  >
                    Ver galeria completa <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <GalleryGrid
                  tiles={galleryTiles}
                  onOpen={(i) => setLightboxIndex(i)}
                  masonry={false}
                />
              </div>
            )}
          </div>

          {/* COLUNA LATERAL: Vagas + CTA */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Cartão de vagas */}
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-montserrat flex items-center gap-2">
                  <Bike className="w-4 h-4 text-blue-500" /> Controle de Vagas
                </h3>

                {/* Motos */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-slate-500" /> Motos inscritas
                    </span>
                    <span className="font-bold text-white">
                      {bikes} <span className="text-slate-500 font-normal">de</span> {maxBikes}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111724] border border-[#1c2538] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-red-500' : nearFull ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Participantes */}
                <div className="flex items-center justify-between text-xs bg-[#131b2b] border border-[#222e43] rounded-md px-3 py-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Participantes
                  </span>
                  <span className="font-bold text-emerald-300">{participants}</span>
                </div>

                {/* Status textual */}
                <div className="text-center">
                  {isFull ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-300 bg-red-950/60 border border-red-800/50 px-3 py-1.5 rounded uppercase tracking-widest font-montserrat">
                      <AlertTriangle className="w-3.5 h-3.5" /> Vagas esgotadas
                    </span>
                  ) : nearFull ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-3 py-1.5 rounded uppercase tracking-widest font-montserrat">
                      <AlertTriangle className="w-3.5 h-3.5" /> Últimas vagas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded uppercase tracking-widest font-montserrat">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inscrições abertas
                    </span>
                  )}
                </div>

                {/* Exemplo visual requisitado */}
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Limite do passeio: {maxBikes} motos
                  <br />
                  Inscritos: {bikes} motos · {participants} participantes
                </p>
              </div>

              {/* CTA principal */}
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-3">
                {myConfirmedReg ? (
                  <div className="space-y-3 text-center">
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider font-montserrat">
                        Você já está inscrito
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Sua vaga neste passeio está garantida.
                      </p>
                    </div>
                    <Link to="/member/inscricoes">
                      <Button
                        variant="outline"
                        className="w-full border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-xs tracking-wider uppercase"
                      >
                        Ver minhas inscrições
                      </Button>
                    </Link>
                  </div>
                ) : isFull ? (
                  <Button
                    disabled
                    className="w-full bg-red-900/40 text-red-300 border border-red-800/50 font-bold text-sm tracking-wider uppercase h-12 cursor-not-allowed"
                  >
                    Vagas esgotadas
                  </Button>
                ) : registrationsClosed ? (
                  <Button
                    disabled
                    className="w-full bg-slate-800/40 text-slate-400 border border-slate-700 font-bold text-sm tracking-wider uppercase h-12 cursor-not-allowed"
                  >
                    Inscrições encerradas
                  </Button>
                ) : (
                  <Button
                    onClick={handleQueroParticipar}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm tracking-wider uppercase h-12 shadow-lg shadow-blue-900/30 transition-all gap-2"
                  >
                    <Bike className="w-5 h-5" /> Quero Participar
                  </Button>
                )}

                {!user && !isFull && !registrationsClosed && (
                  <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Faça login para se inscrever no passeio.
                  </p>
                )}
                {user && !myConfirmedReg && !isFull && !registrationsClosed && (
                  <p className="text-[10px] text-slate-500 text-center">
                    {ride.allow_pillion
                      ? 'Você poderá informar se irá com garupa.'
                      : 'Passeio sem garupa.'}
                  </p>
                )}
              </div>

              {/* Resumo rápido */}
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Equipamentos completos obrigatórios.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Formação em comboio supervisionada.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Modal de Login */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-wider text-center text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> ÁREA DO MEMBRO
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 text-center">
              Faça login para se inscrever no passeio <strong>{ride.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">E-mail</Label>
              <Input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Senha</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider h-10 mt-2"
            >
              {loginLoading ? 'ENTRANDO...' : 'ENTRAR E ME INSCREVER'}
            </Button>

            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-[#1c2436]">
              Ainda não é membro?{' '}
              <Link
                to="/"
                className="text-blue-400 hover:text-blue-300 font-semibold"
                onClick={() => setLoginModalOpen(false)}
              >
                Cadastre-se aqui.
              </Link>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Inscrição */}
      <RideRegistrationModal
        ride={ride}
        user={user}
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        onSuccess={load}
      />

      {/* Lightbox da galeria do passeio */}
      <GalleryLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  )
}

export default RideDetail
