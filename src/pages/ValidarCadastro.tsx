import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Bike,
  FileCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryBadge } from '@/components/CategoryBadge'
import { userService } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import { formatCPF } from '@/lib/membership'
import { useToast } from '@/hooks/use-toast'

export const ValidarCadastro: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [memberData, setMemberData] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [alreadyActive, setAlreadyActive] = useState(false)

  // Campos de ativação
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptImage, setAcceptImage] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [activating, setActivating] = useState(false)

  // Máscara dinâmica de CPF
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    // se for apenas números, tenta formatar CPF se tiver até 11 dígitos
    const clean = val.replace(/\D/g, '')
    if (/^\d+$/.test(val.replace(/[.-]/g, '')) && clean.length <= 11) {
      if (clean.length > 9) {
        val = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
      } else if (clean.length > 6) {
        val = clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      } else if (clean.length > 3) {
        val = clean.replace(/(\d{3})(\d{1,3})/, '$1.$2')
      }
    }
    setSearch(val)
    setErrorMessage(null)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!search.trim()) {
      setErrorMessage('Informe o CPF ou os últimos 7 dígitos do chassi.')
      return
    }

    setSearching(true)
    setErrorMessage(null)
    setMemberData(null)
    setAlreadyActive(false)

    try {
      const data = await userService.findPreRegistration(search.trim())
      setMemberData(data)
    } catch (err: any) {
      if (err.message && err.message.includes('já foi ativado')) {
        setAlreadyActive(true)
      }
      setErrorMessage(
        err.message || 'Cadastro não encontrado. Verifique o CPF ou chassi informado.',
      )
    } finally {
      setSearching(false)
    }
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!memberData) return

    if (!password || password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter no mínimo 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'Por favor, confirme a mesma senha digitada.',
        variant: 'destructive',
      })
      return
    }

    if (!acceptImage || !acceptTerms) {
      toast({
        title: 'Consentimento obrigatório',
        description:
          'É necessário autorizar o uso de imagem/voz e aceitar os Termos e Política de Privacidade.',
        variant: 'destructive',
      })
      return
    }

    setActivating(true)

    try {
      await userService.activatePreRegistration({
        memberId: memberData.id,
        password,
        acceptImage,
        acceptTerms,
      })

      // Realiza login automático
      await pb.collection('users').authWithPassword(memberData.email, password)

      toast({
        title: 'Cadastro ativado com sucesso!',
        description: 'Bem-vindo ao PG PRIME CLUB!',
      })

      navigate('/membro')
    } catch (err: any) {
      toast({
        title: 'Erro ao ativar cadastro',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-600/20">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ativar Meu Cadastro
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Localize seu pré-cadastro do <strong>PG PRIME CLUB</strong> informando seu CPF ou os
          últimos dígitos do chassi da sua BMW.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Formulário de Busca */}
            {!memberData && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label
                    htmlFor="search-input"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    CPF ou Chassi da Moto
                  </Label>
                  <div className="mt-1.5 relative">
                    <Input
                      id="search-input"
                      type="text"
                      placeholder="Ex: 000.000.000-00 ou Z123456"
                      value={search}
                      onChange={handleSearchChange}
                      className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 text-sm h-12 pr-10 font-medium"
                    />
                    <Search className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Digite seu CPF completo ou os últimos 7 caracteres do chassi da sua motocicleta.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
                      alreadyActive
                        ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                        : 'bg-red-950/40 border-red-800/60 text-red-300'
                    }`}
                  >
                    {alreadyActive ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{errorMessage}</p>
                      {alreadyActive && (
                        <Link
                          to="/"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline font-semibold mt-2"
                        >
                          Ir para o Login
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={searching || !search.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-blue-600/30"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando cadastro...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar Meu Cadastro
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Cadastro Encontrado - Ativação */}
            {memberData && (
              <form
                onSubmit={handleActivate}
                className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Resumo do Membro */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Pré-cadastro Localizado
                      </span>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {memberData.name}
                      </h3>
                    </div>
                    {memberData.categoria && (
                      <CategoryBadge category={memberData.categoria} size="sm" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{memberData.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{memberData.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{memberData.city || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bike className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>
                        {memberData.bike_model
                          ? `${memberData.bike_model} (${memberData.bike_year})`
                          : 'BMW Motorrad'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Criação de Senha */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Criar Senha de Acesso (mínimo 8 caracteres)
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-slate-950/80 border-slate-700 text-white focus:border-blue-500 h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Confirme a Senha
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-slate-950/80 border-slate-700 text-white focus:border-blue-500 h-11 text-sm"
                    />
                  </div>
                </div>

                {/* Alerta Âmbar de Consentimento de Imagem */}
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    Aviso Importante sobre Imagem e Eventos
                  </div>
                  <p>
                    Os eventos do <strong>PG PRIME CLUB</strong> são experiências coletivas e
                    poderão ser fotografados e filmados. Por esse motivo, a autorização de uso de
                    imagem e voz é requisito para participação no Clube.
                  </p>
                </div>

                {/* Checkboxes de Consentimento Obrigatórios */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="validar-imagem"
                      checked={acceptImage}
                      onCheckedChange={(checked) => setAcceptImage(checked === true)}
                      className="mt-0.5 border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor="validar-imagem"
                      className="text-xs text-slate-300 leading-snug cursor-pointer select-none"
                    >
                      Autorizo o <strong>uso de imagem e voz</strong> nos eventos e mídias oficiais
                      do PG PRIME CLUB.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="validar-termos"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-0.5 border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor="validar-termos"
                      className="text-xs text-slate-300 leading-snug cursor-pointer select-none"
                    >
                      Aceito a{' '}
                      <Link
                        to="/politica-privacidade"
                        target="_blank"
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        Política de Privacidade
                      </Link>{' '}
                      e os{' '}
                      <Link
                        to="/termos"
                        target="_blank"
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        Termos de Adesão
                      </Link>
                      .
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMemberData(null)
                      setPassword('')
                      setConfirmPassword('')
                      setAcceptImage(false)
                      setAcceptTerms(false)
                    }}
                    className="border-slate-700 text-slate-300 text-xs h-12 px-4"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={activating || !acceptImage || !acceptTerms || password.length < 8}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-blue-600/30"
                  >
                    {activating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ativando Acesso...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Concluir e Acessar o Club
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <p>
            Já possui acesso ativo?{' '}
            <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold underline">
              Fazer login no site
            </Link>
          </p>
          <p>
            Dúvidas ou problemas com seu cadastro?{' '}
            <Link to="/contato" className="text-slate-400 hover:text-slate-300 underline">
              Fale com o suporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ValidarCadastro
