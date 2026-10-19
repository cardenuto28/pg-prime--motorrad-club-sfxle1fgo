import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { CLUB_OFFICIAL_BADGE_URL } from '@/lib/branding'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog'

export const RedefinirSenha: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { confirmPasswordReset } = useAuth()
  const { toast } = useToast()

  // O PocketBase envia o token como query param ?token=...
  const rawToken = searchParams.get('token') || ''
  const [token, setToken] = useState(rawToken.trim())

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [forgotModalOpen, setForgotModalOpen] = useState(false)

  // Atualiza se a URL mudar
  useEffect(() => {
    if (rawToken) {
      setToken(rawToken.trim())
    }
  }, [rawToken])

  // Validação em tempo real das regras de senha (mínimo 8 caracteres, padrão do projeto)
  const isLengthValid = password.length >= 8
  const hasNumberOrSymbol = /[\d\W]/.test(password)
  const passwordsMatch = password.length > 0 && password === passwordConfirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage(
        'Token de redefinição não encontrado. Abra o link enviado no seu e-mail ou solicite um novo.',
      )
      return
    }

    if (password.length < 8) {
      setErrorMessage('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('A confirmação da nova senha não confere.')
      return
    }

    setLoading(true)

    try {
      const { error } = await confirmPasswordReset(token, password)

      if (error) {
        const rawMsg =
          error?.data?.message ||
          error?.message ||
          'Token inválido, expirado ou formato incorreto. Solicite um novo link de redefinição.'
        setErrorMessage(rawMsg)
        toast({
          title: 'Não foi possível redefinir a senha',
          description: rawMsg,
          variant: 'destructive',
        })
        return
      }

      setSuccess(true)
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Agora você já pode fazer login com sua nova credencial.',
      })
    } catch (err: any) {
      const msg = err?.message || 'Erro inesperado ao redefinir a senha.'
      setErrorMessage(msg)
      toast({
        title: 'Erro inesperado',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] text-[#e2e8f0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow & accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#0066FF]/10 blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-5">
          <Link to="/">
            <div className="relative bg-white/95 p-3 rounded-2xl border-2 border-[#0066FF]/50 shadow-[0_12px_28px_rgba(0,0,0,0.85)] inline-flex items-center justify-center transition-transform hover:scale-105">
              <img
                src={CLUB_OFFICIAL_BADGE_URL}
                alt="PG PRIME MOTORRAD CLUB"
                className="h-20 sm:h-24 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/40 text-[10px] font-black uppercase tracking-widest text-blue-300 font-montserrat mb-3">
          <KeyRound className="w-3.5 h-3.5 text-[#0066FF]" /> Redefinição de Senha
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white font-montserrat uppercase tracking-tight">
          Crie Sua Nova Senha
        </h1>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Área do Membro — <strong>PG PRIME CLUB</strong>. Escolha uma nova senha forte para acessar
          sua conta com segurança.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-[#0e131d] border-[#1e2738] shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {success ? (
              <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-white font-montserrat uppercase tracking-tight">
                    Senha Alterada!
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sua nova senha foi gravada com sucesso. Você já pode acessar a Área do Membro
                    com a nova credencial.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/', { state: { openLogin: true } })}
                    className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider font-montserrat h-11 shadow-lg shadow-blue-950/60 rounded-sm gap-2"
                  >
                    Fazer Login Agora <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!rawToken && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="token-input"
                      className="text-xs text-slate-300 font-medium flex items-center justify-between"
                    >
                      <span>Código / Token de Redefinição</span>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-[11px] text-[#0066FF] hover:text-blue-300 underline font-normal"
                      >
                        Não tenho token
                      </button>
                    </Label>
                    <Input
                      id="token-input"
                      type="text"
                      required
                      placeholder="Cole aqui o token recebido no e-mail"
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Normalmente este código vem preenchido automaticamente ao clicar no link do
                      e-mail.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-password"
                    className="text-xs text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#0066FF]" /> Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-11 pr-10 focus:border-[#0066FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm-password"
                    className="text-xs text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF]" /> Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={passwordConfirm}
                      onChange={(e) => {
                        setPasswordConfirm(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-11 pr-10 focus:border-[#0066FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Validação visual de requisitos */}
                <div className="p-3.5 rounded-lg bg-[#080d1a] border border-[#1b2538] space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-montserrat">
                    Critérios de Segurança:
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          isLengthValid
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className={isLengthValid ? 'text-emerald-300' : 'text-slate-400'}>
                        No mínimo 8 caracteres
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          hasNumberOrSymbol
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className={hasNumberOrSymbol ? 'text-emerald-300' : 'text-slate-400'}>
                        Contém números ou símbolos recomendados
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          passwordsMatch
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className={passwordsMatch ? 'text-emerald-300' : 'text-slate-400'}>
                        Senhas coincidem
                      </span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">Erro na redefinição</p>
                      <p className="text-[11px] text-red-200/90 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !token.trim() || password.length < 8 || !passwordsMatch}
                  className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider font-montserrat h-11 shadow-lg shadow-blue-950/60 rounded-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      REDEFININDO SENHA...
                    </>
                  ) : (
                    'SALVAR NOVA SENHA'
                  )}
                </Button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  <p>
                    Lembrou da senha ou quer solicitar novo link?{' '}
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[#0066FF] hover:text-blue-300 font-bold underline"
                    >
                      Reenviar link
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <p>
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              ← Voltar para a Página Inicial
            </Link>
          </p>
          <p className="text-[11px]">
            PG PRIME CLUB · Dúvidas com seu acesso?{' '}
            <Link to="/contato" className="text-blue-400 hover:underline">
              Fale com o suporte
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotModalOpen} onOpenChange={setForgotModalOpen} />
    </div>
  )
}

export default RedefinirSenha
