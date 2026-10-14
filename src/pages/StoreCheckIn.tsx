import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Trophy,
  ArrowRight,
  User,
  Lock,
  Loader2,
  QrCode,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { storeVisitService, userService, UserProfile } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getMemberCategory } from '@/lib/member'
import { CategoryBadge } from '@/components/CategoryBadge'
import { PG_PRIME_LOGO_URL } from '@/lib/branding'

export const StoreCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = (searchParams.get('token') || '').trim()

  const { user, loading: authLoading, login } = useAuth()
  const { toast } = useToast()

  // Login form state (if not logged in)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  // Check-in processing state
  const [processing, setProcessing] = useState(false)
  const [resultStatus, setResultStatus] = useState<
    'idle' | 'success' | 'already_checked' | 'inactive' | 'pending' | 'invalid_token' | 'error'
  >('idle')
  const [resultMessage, setResultMessage] = useState<string>('')
  const [pointsData, setPointsData] = useState<{
    rideCheckins: number
    storeVisits: number
    ridePoints: number
    storePoints: number
    totalPoints: number
  }>({
    rideCheckins: 0,
    storeVisits: 0,
    ridePoints: 0,
    storePoints: 0,
    totalPoints: 0,
  })

  const performCheckIn = useCallback(
    async (currentUser: UserProfile) => {
      // 1. Validação prévia de Token
      if (!token) {
        setResultStatus('invalid_token')
        setResultMessage('QR Code inválido ou expirado. Escaneie o QR Code na loja PG PRIME.')
        const pts = await storeVisitService.getMemberPoints(currentUser.id)
        setPointsData(pts)
        return
      }

      setProcessing(true)
      try {
        // Validação de status ativo
        const isSuper = currentUser.role === 'admin'
        const isStatusAtivo =
          currentUser.status === 'ativo' ||
          currentUser.status_membro === 'ATIVO' ||
          currentUser.status_membro === 'ATENCAO'
        const isInactive =
          currentUser.status === 'inativo' ||
          currentUser.status === 'bloqueado' ||
          currentUser.status_membro === 'INATIVO' ||
          currentUser.categoria === 'INATIVO'

        if (
          !isSuper &&
          (currentUser.status === 'pendente' ||
            currentUser.status_membro === 'PRE_CADASTRADO' ||
            currentUser.status_membro === 'PENDENTE')
        ) {
          setResultStatus('pending')
          setResultMessage(
            'Seu cadastro ainda está em aprovação pela equipe PG PRIME. O check-in presencial é exclusivo para membros com cadastro aprovado.',
          )
          const pts = await storeVisitService.getMemberPoints(currentUser.id)
          setPointsData(pts)
          setProcessing(false)
          return
        }

        if (!isSuper && (isInactive || !isStatusAtivo)) {
          setResultStatus('inactive')
          setResultMessage(
            'Seu status de membro não está ativo no momento. Regularize sua situação ou entre em contato com a equipe PG PRIME para pontuar nas visitas à loja.',
          )
          const pts = await storeVisitService.getMemberPoints(currentUser.id)
          setPointsData(pts)
          setProcessing(false)
          return
        }

        // Tenta registrar a visita via endpoint com token diário
        try {
          await storeVisitService.performStoreCheckInWithToken(token)
          const pts = await storeVisitService.getMemberPoints(currentUser.id)
          setPointsData(pts)
          setResultStatus('success')
          setResultMessage('Visita registrada com sucesso! Você ganhou +10 pontos no ranking.')
          toast({
            title: 'Check-in na loja realizado!',
            description: '+10 pontos creditados na sua conta.',
          })
        } catch (err: any) {
          const rawErr = err?.response?.data || err?.data || {}
          const errMsg = rawErr.error || err?.message || ''
          const errCode = rawErr.code || ''
          const pts = await storeVisitService.getMemberPoints(currentUser.id)
          setPointsData(pts)

          if (
            errCode === 'TOKEN_INVALID' ||
            errCode === 'TOKEN_MISSING' ||
            errMsg.includes('QR Code inválido') ||
            errMsg.includes('expirado')
          ) {
            setResultStatus('invalid_token')
            setResultMessage('QR Code inválido ou expirado. Escaneie o QR Code na loja PG PRIME.')
          } else if (
            errCode === 'ALREADY_CHECKED' ||
            errMsg.includes('já fez check-in na loja hoje') ||
            errMsg.includes('já fez check-in')
          ) {
            setResultStatus('already_checked')
            setResultMessage(
              'Você já registrou seu check-in na loja hoje. É permitido 1 check-in de visita por dia.',
            )
          } else if (errCode === 'MEMBER_PENDING' || errMsg.includes('ainda está em aprovação')) {
            setResultStatus('pending')
            setResultMessage(
              'Seu cadastro ainda está em aprovação pela equipe PG PRIME. O check-in presencial é exclusivo para membros com cadastro aprovado.',
            )
          } else if (
            errCode === 'MEMBER_INACTIVE' ||
            errMsg.includes('exclusivo para membros ativos') ||
            errMsg.includes('não está ativo')
          ) {
            setResultStatus('inactive')
            setResultMessage(errMsg)
          } else {
            setResultStatus('error')
            setResultMessage(errMsg || 'Ocorreu um erro ao registrar sua visita na loja.')
          }
        }
      } catch (err: any) {
        setResultStatus('error')
        setResultMessage(err?.message || 'Erro inesperado ao processar check-in.')
      } finally {
        setProcessing(false)
      }
    },
    [token, toast],
  )

  // Dispara automaticamente para usuário autenticado
  useEffect(() => {
    if (!authLoading && user && resultStatus === 'idle' && !processing) {
      if (!token) {
        setResultStatus('invalid_token')
        setResultMessage('QR Code inválido ou expirado. Escaneie o QR Code na loja PG PRIME.')
        storeVisitService
          .getMemberPoints(user.id)
          .then(setPointsData)
          .catch(() => {})
      } else {
        performCheckIn(user)
      }
    }
  }, [authLoading, user, resultStatus, processing, performCheckIn, token])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha seu e-mail e senha.',
        variant: 'destructive',
      })
      return
    }
    setLoginSubmitting(true)
    try {
      const ok = await login(email, password)
      if (!ok) {
        toast({
          title: 'Credenciais inválidas',
          description: 'E-mail ou senha incorretos. Tente novamente.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Login efetuado!',
          description: 'Processando seu check-in na loja...',
        })
        const currentUser = await userService.getCurrentUser()
        if (currentUser) {
          await performCheckIn(currentUser)
        }
      }
    } catch (err: any) {
      toast({
        title: 'Erro de login',
        description: err?.message || 'Não foi possível conectar.',
        variant: 'destructive',
      })
    } finally {
      setLoginSubmitting(false)
    }
  }

  // Loading inicial
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-montserrat">Carregando PG PRIME CLUB...</p>
      </div>
    )
  }

  // Se o usuário não estiver logado: Exibe tela amigável de login para check-in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-slate-200/20 inline-flex items-center">
                <img
                  src={PG_PRIME_LOGO_URL}
                  alt="PG PRIME CLUB"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="bg-[#0e131d] border border-[#1d2638] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/50 text-[10px] font-black uppercase tracking-widest text-blue-300 font-montserrat mb-2">
                <Store className="w-3.5 h-3.5" /> Check-in Presencial
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-montserrat uppercase tracking-tight">
                Visita na Loja
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faça login com sua conta de membro para registrar sua presença e ganhar{' '}
                <strong className="text-blue-400 font-bold">+10 pontos</strong> no ranking.
              </p>
            </div>

            {!token ? (
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white uppercase font-montserrat">
                  QR Code Obrigatório
                </h3>
                <p className="text-xs text-red-300 leading-relaxed">
                  QR Code inválido ou expirado. Escaneie o QR Code na loja PG PRIME.
                </p>
                <p className="text-[11px] text-slate-400">
                  O check-in presencial só pode ser realizado através do QR Code físico localizado
                  no balcão da concessionária.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-montserrat">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="bg-[#141b27] border-[#222c3f] text-white text-xs h-10 pl-9 focus:border-blue-500"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-montserrat">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#141b27] border-[#222c3f] text-white text-xs h-10 pl-9 focus:border-blue-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider font-montserrat h-10 shadow-lg shadow-blue-950/60 mt-2"
                >
                  {loginSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Entrando...
                    </>
                  ) : (
                    'Entrar e Registrar Visita'
                  )}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-[#1c2538] text-center space-y-2 text-xs text-slate-400">
              <p>
                Ainda não tem cadastro no clube?{' '}
                <Link to="/validar-cadastro" className="text-blue-400 font-bold hover:underline">
                  Ativar cadastro
                </Link>
              </p>
              <p>
                <Link to="/" className="text-slate-500 hover:text-slate-300 text-[11px]">
                  ← Voltar para a página inicial
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se o usuário está logado e o check-in está sendo processado
  if (processing) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#0e131d] border border-[#1d2638] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <h2 className="text-lg font-bold font-montserrat uppercase">Processando Check-in...</h2>
          <p className="text-xs text-slate-400">
            Validando sua presença na loja PG PRIME e atualizando sua pontuação...
          </p>
        </div>
      </div>
    )
  }

  // TELA DE RESULTADO DO CHECK-IN
  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-slate-200/20 inline-flex items-center">
              <img
                src={PG_PRIME_LOGO_URL}
                alt="PG PRIME CLUB"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="bg-[#0e131d] border border-[#1d2638] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header do Status */}
          <div className="text-center space-y-3">
            {resultStatus === 'success' && (
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            {resultStatus === 'already_checked' && (
              <div className="w-16 h-16 rounded-full bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 mx-auto shadow-lg shadow-blue-950/40">
                <Clock className="w-9 h-9" />
              </div>
            )}
            {(resultStatus === 'inactive' || resultStatus === 'pending') && (
              <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/40">
                <AlertTriangle className="w-9 h-9" />
              </div>
            )}
            {(resultStatus === 'error' || resultStatus === 'invalid_token') && (
              <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-950/40">
                <ShieldAlert className="w-9 h-9" />
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-montserrat">
                <MapPin className="w-3 h-3 text-blue-400" /> Concessionária PG PRIME
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-montserrat uppercase tracking-tight mt-1">
                {resultStatus === 'success' && '✅ Visita Registrada!'}
                {resultStatus === 'already_checked' && 'Check-in de Hoje Já Realizado'}
                {resultStatus === 'pending' && 'Cadastro em Análise'}
                {resultStatus === 'inactive' && 'Cadastro Inativo'}
                {resultStatus === 'invalid_token' && 'QR Code Inválido'}
                {resultStatus === 'error' && 'Não foi possível registrar'}
              </h1>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              {resultStatus === 'success' && (
                <span>
                  Você ganhou <strong className="text-emerald-400 font-bold">+10 pontos</strong>.
                  Sua presença na concessionária foi computada com sucesso!
                </span>
              )}
              {resultStatus !== 'success' && resultMessage}
            </p>
          </div>

          {/* Card de Identificação do Membro e Pontos */}
          <div className="bg-[#080b12] border border-[#1b2538] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#162030] pb-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-montserrat">
                  Membro Identificado
                </p>
                <h3 className="text-sm font-extrabold text-white font-montserrat">{user.name}</h3>
                <p className="text-[11px] text-slate-400">{user.email}</p>
              </div>
              <div className="text-right">
                <CategoryBadge
                  category={user.categoria || user.category || getMemberCategory(user)}
                  size="sm"
                />
              </div>
            </div>

            {/* Destaque da Pontuação Geral */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-montserrat flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Seu Total de Pontos
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">
                  Ranking Atualizado
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-950/40 via-[#0e1626] to-blue-950/40 border border-blue-600/40 rounded-lg p-3.5 text-center">
                <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-300">
                  {pointsData.totalPoints}{' '}
                  <span className="text-lg font-bold text-blue-400">PTS</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  100 pts por passeio · 10 pts por visita na loja
                </p>
              </div>
            </div>

            {/* Grid de Detalhe dos Pontos */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-lg p-2.5 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-montserrat">
                  Passeios Realizados
                </span>
                <p className="text-base font-extrabold text-white font-mono mt-0.5">
                  {pointsData.rideCheckins}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({pointsData.ridePoints} pts)
                  </span>
                </p>
              </div>

              <div className="bg-[#0e131d] border border-[#1c2538] rounded-lg p-2.5 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-montserrat">
                  Visitas na Loja
                </span>
                <p className="text-base font-extrabold text-white font-mono mt-0.5">
                  {pointsData.storeVisits}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({pointsData.storePoints} pts)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2.5">
            <Link to="/member/dashboard" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider font-montserrat h-10 shadow-lg shadow-blue-950/60 gap-1.5">
                Ir para Minha Área do Membro <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/" className="block">
              <Button
                variant="outline"
                className="w-full border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs h-9"
              >
                Voltar para a Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreCheckIn
