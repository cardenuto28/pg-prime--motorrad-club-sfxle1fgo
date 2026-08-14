import React, { useState } from 'react'
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Bike,
  Calendar,
  Lock,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { userService } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface SidebarSignupProps {
  onSuccess?: () => void
}

export const SidebarSignup: React.FC<SidebarSignupProps> = ({ onSuccess }) => {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    city: '',
    bike_brand: '',
    bike_model: '',
    bike_year: '',
    password: '',
    passwordConfirm: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa o erro de senha quando o usuário edita os campos de senha.
    if (name === 'password' || name === 'passwordConfirm') {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.cpf.trim() ||
      !formData.city.trim() ||
      !formData.bike_brand.trim() ||
      !formData.bike_model.trim() ||
      !formData.bike_year
    ) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, preencha todos os campos para solicitar seu cadastro.',
        variant: 'destructive',
      })
      return
    }

    // Validação de senha definida pelo usuário.
    if (formData.password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.')
      toast({
        title: 'Senha inválida',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setPasswordError('As senhas não conferem.')
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação da senha deve ser igual à senha informada.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      await userService.registerCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.trim(),
        city: formData.city.trim(),
        bike_brand: formData.bike_brand.trim(),
        bike_model: formData.bike_model.trim(),
        bike_year: parseInt(formData.bike_year, 10) || new Date().getFullYear(),
        password: formData.password,
      })

      setSuccessMsg(true)
      toast({
        title: 'Solicitação Enviada com Sucesso!',
        description:
          'Seu cadastro foi realizado e está com status pendente para aprovação do clube.',
      })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Erro de cadastro:', err)
      toast({
        title: 'Erro ao cadastrar',
        description:
          err?.message ||
          'Ocorreu um erro ao enviar seu cadastro. Verifique se o e-mail já está em uso.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (successMsg) {
    return (
      <div className="bg-[#0f141f] border border-[#1e273a] rounded-lg p-6 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-lg font-montserrat tracking-wide">
          CADASTRO SOLICITADO!
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Obrigado por se juntar ao Euro Motors Motorrad Club. Seus dados foram salvos com status{' '}
          <strong className="text-amber-400">pendente</strong>.
        </p>
        <p className="text-[11px] text-slate-400">
          Nossa equipe irá validar seus dados e liberará o acesso completo em breve.
        </p>
        <Button
          onClick={() => {
            setSuccessMsg(false)
            setFormData({
              name: '',
              phone: '',
              email: '',
              cpf: '',
              city: '',
              bike_brand: '',
              bike_model: '',
              bike_year: '',
              password: '',
              passwordConfirm: '',
            })
          }}
          variant="outline"
          className="border-[#263248] text-slate-300 hover:text-white hover:bg-slate-800 text-xs w-full mt-2"
        >
          Fazer novo cadastro
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#0f131c] border border-[#1d2638] rounded-md p-6 shadow-2xl space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white tracking-wider font-montserrat uppercase">
          FAÇA PARTE DO CLUBE
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Preencha seus dados e comece a viver experiências incríveis sobre duas rodas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nome Completo */}
        <div className="relative">
          <Input
            name="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Telefone / WhatsApp */}
        <div className="relative">
          <Input
            name="phone"
            placeholder="Telefone / WhatsApp"
            value={formData.phone}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* E-mail */}
        <div className="relative">
          <Input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* CPF */}
        <div className="relative">
          <Input
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Cidade */}
        <div className="relative">
          <Input
            name="city"
            placeholder="Cidade"
            value={formData.city}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Marca da moto */}
        <div className="relative">
          <Input
            name="bike_brand"
            placeholder="Marca da moto"
            value={formData.bike_brand}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Bike className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Modelo */}
        <div className="relative">
          <Input
            name="bike_model"
            placeholder="Modelo"
            value={formData.bike_model}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Bike className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Ano */}
        <div className="relative">
          <Input
            type="number"
            name="bike_year"
            placeholder="Ano"
            value={formData.bike_year}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Crie uma senha */}
        <div className="relative">
          <Input
            type="password"
            name="password"
            placeholder="Crie uma senha (mín. 6 caracteres)"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Confirme sua senha */}
        <div className="relative">
          <Input
            type="password"
            name="passwordConfirm"
            placeholder="Confirme sua senha"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className={`bg-[#141a26] ${
              passwordError
                ? 'border-red-500/70 focus:border-red-500'
                : 'border-[#202a3d] focus:border-blue-500'
            } text-white placeholder:text-slate-500 text-xs h-10 pr-9 rounded-sm`}
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
        {passwordError && <p className="text-[10px] text-red-400 -mt-1.5">{passwordError}</p>}

        {/* Botão Fazer Cadastro */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider h-11 rounded-sm mt-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
        >
          {submitting ? 'PROCESSANDO...' : 'FAZER CADASTRO'}
          {!submitting && <ChevronRight className="w-4 h-4" />}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
        <Lock className="w-3 h-3 text-slate-500" />
        <span>Seus dados estão protegidos conosco.</span>
      </div>
    </div>
  )
}
