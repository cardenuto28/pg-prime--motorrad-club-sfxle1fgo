import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Ride, UserProfile, registrationService } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import {
  Bike,
  Users,
  ShieldAlert,
  AlertTriangle,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react'

interface RideRegistrationModalProps {
  ride: Ride | null
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RideRegistrationModal: React.FC<RideRegistrationModalProps> = ({
  ride,
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast()

  // Garupa state (usado tanto para membro quanto não-membro)
  const [hasPillion, setHasPillion] = useState<boolean>(false)
  const [pillionName, setPillionName] = useState<string>('')
  const [pillionPhone, setPillionPhone] = useState<string>('')

  // Emergência state (ambos)
  const [emergencyName, setEmergencyName] = useState<string>('')
  const [emergencyPhone, setEmergencyPhone] = useState<string>('')

  // Campos específicos de NÃO-MEMBRO
  const [guestName, setGuestName] = useState<string>('')
  const [guestPhone, setGuestPhone] = useState<string>('')
  const [guestEmail, setGuestEmail] = useState<string>('')
  const [guestCpf, setGuestCpf] = useState<string>('')
  const [guestCity, setGuestCity] = useState<string>('')
  const [guestBikeBrand, setGuestBikeBrand] = useState<string>('')
  const [guestBikeModel, setGuestBikeModel] = useState<string>('')
  const [guestBikeYear, setGuestBikeYear] = useState<string>('')

  // Aceites para NÃO-MEMBRO
  const [guestAcceptedImage, setGuestAcceptedImage] = useState<boolean>(false)
  const [guestAcceptedPrivacy, setGuestAcceptedPrivacy] = useState<boolean>(false)

  const [submitting, setSubmitting] = useState<boolean>(false)

  // Reset / prefill when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Membro logado: preenche garupa se houver cadastrado no perfil
        setHasPillion(!!user.pillion_name)
        setPillionName(user.pillion_name || '')
        setPillionPhone(user.pillion_phone || '')
        setEmergencyName('')
        setEmergencyPhone('')
      } else {
        // Não-membro: limpa campos
        setHasPillion(false)
        setPillionName('')
        setPillionPhone('')
        setEmergencyName('')
        setEmergencyPhone('')
        setGuestName('')
        setGuestPhone('')
        setGuestEmail('')
        setGuestCpf('')
        setGuestCity('')
        setGuestBikeBrand('')
        setGuestBikeModel('')
        setGuestBikeYear('')
        setGuestAcceptedImage(false)
        setGuestAcceptedPrivacy(false)
      }
    }
  }, [user, isOpen])

  if (!ride) return null

  const isMember = !!user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validação de garupa
    if (hasPillion && (!pillionName.trim() || !pillionPhone.trim())) {
      toast({
        title: 'Dados do Garupa',
        description: 'Preencha o nome e o telefone do garupa.',
        variant: 'destructive',
      })
      return
    }

    // 2. Validação de contato de emergência
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      toast({
        title: 'Contato de Emergência',
        description: 'Preencha o nome e o telefone do contato de emergência.',
        variant: 'destructive',
      })
      return
    }

    // 3. Validações adicionais para NÃO-MEMBRO
    if (!isMember) {
      if (
        !guestName.trim() ||
        !guestPhone.trim() ||
        !guestEmail.trim() ||
        !guestCpf.trim() ||
        !guestCity.trim() ||
        !guestBikeBrand.trim() ||
        !guestBikeModel.trim() ||
        !guestBikeYear.trim()
      ) {
        toast({
          title: 'Campos incompletos',
          description: 'Por favor, preencha todos os campos do participante.',
          variant: 'destructive',
        })
        return
      }

      if (!guestAcceptedImage) {
        toast({
          title: 'Autorização de imagem e voz',
          description:
            'A autorização de uso de imagem e voz é condição obrigatória para participar do passeio.',
          variant: 'destructive',
        })
        return
      }

      if (!guestAcceptedPrivacy) {
        toast({
          title: 'Política de Privacidade',
          description:
            'É necessário aceitar a Política de Privacidade e o tratamento de dados pessoais conforme a LGPD.',
          variant: 'destructive',
        })
        return
      }
    }

    setSubmitting(true)
    try {
      const nowIso = new Date().toISOString()

      if (isMember) {
        // FLUXO MEMBRO LOGADO:
        // Não precisa repetir aceites pois já foram aceitos no cadastro
        await registrationService.registerForRide({
          ride: ride.id,
          user: user.id,
          has_pillion: hasPillion,
          pillion_name: hasPillion ? pillionName.trim() : '',
          pillion_phone: hasPillion ? pillionPhone.trim() : '',
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_phone: emergencyPhone.trim(),
          accepted_rules: true,
          accepted_terms: true,
          accepted_terms_at: nowIso,
          accepted_image_at: user.accepted_image_at || nowIso,
          is_guest: false,
          status: 'confirmada',
        })

        toast({
          title: 'Inscrição confirmada!',
          description: `Sua vaga para o passeio ${ride.name} está garantida. Nos vemos no ponto de encontro!`,
        })
      } else {
        // FLUXO NÃO-MEMBRO:
        await registrationService.registerForRide({
          ride: ride.id,
          has_pillion: hasPillion,
          pillion_name: hasPillion ? pillionName.trim() : '',
          pillion_phone: hasPillion ? pillionPhone.trim() : '',
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_phone: emergencyPhone.trim(),
          is_guest: true,
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim(),
          guest_email: guestEmail.trim().toLowerCase(),
          guest_cpf: guestCpf.trim(),
          guest_city: guestCity.trim(),
          guest_bike_brand: guestBikeBrand.trim(),
          guest_bike_model: guestBikeModel.trim(),
          guest_bike_year: parseInt(guestBikeYear, 10) || new Date().getFullYear(),
          accepted_rules: true,
          accepted_terms: true,
          accepted_terms_at: nowIso,
          accepted_image_at: nowIso,
          accepted_privacy_at: nowIso,
          status: 'pendente',
        })

        toast({
          title: 'Inscrição enviada com sucesso!',
          description:
            'Sua solicitação de participação foi registrada. Nossa equipe entrará em contato para confirmar sua vaga.',
        })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Erro ao inscrever:', err)
      toast({
        title: 'Erro ao realizar inscrição',
        description: err.message || 'Ocorreu um erro ao processar sua inscrição. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0d14] text-white border-[#1c2538] p-5 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs tracking-wider uppercase">
            <Bike className="w-4 h-4" /> Euro Motors Motorrad Club
          </div>
          <DialogTitle className="text-xl font-bold text-white font-montserrat">
            Inscrição no Passeio: {ride.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {isMember
              ? 'Confirme seus dados e do garupa para garantir sua vaga.'
              : 'Preencha seus dados para solicitar participação neste passeio.'}
          </DialogDescription>
        </DialogHeader>

        {/* Status das Vagas */}
        <div className="bg-[#0f1420] p-3 rounded-md flex items-center justify-between border border-[#1d273a] my-2">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300">
              Vagas de Motos:{' '}
              <strong className="text-white">
                {ride.bikes_registered || 0} / {ride.max_bikes}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">
              Total de Participantes:{' '}
              <strong className="text-emerald-300">{ride.participants_registered || 0}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* FLUXO 1: MEMBRO LOGADO — DADOS PREENCHIDOS AUTOMATICAMENTE */}
          {isMember ? (
            <div className="space-y-3 bg-[#0d121c] p-4 rounded-md border border-[#1a2334]">
              <div className="flex items-center justify-between border-b border-[#1a2334] pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-montserrat flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Seus Dados (Membro)
                </h4>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded uppercase">
                  Identificado
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Nome</span>
                  <span className="font-semibold text-slate-200">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">E-mail</span>
                  <span className="font-semibold text-slate-200">{user.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Telefone / WhatsApp</span>
                  <span className="font-semibold text-slate-200">
                    {user.phone || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Motocicleta</span>
                  <span className="font-semibold text-slate-200">
                    {[user.bike_brand, user.bike_model].filter(Boolean).join(' ')}{' '}
                    {user.bike_year ? `(${user.bike_year})` : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* FLUXO 2: NÃO-MEMBRO — TODOS OS CAMPOS DE CADASTRO */
            <div className="space-y-3 bg-[#0d121c] p-4 rounded-md border border-[#1a2334]">
              <div className="border-b border-[#1a2334] pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-montserrat flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Dados do Participante
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Informe seus dados completos para registro no passeio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Nome */}
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Nome completo <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="Seu nome completo"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Telefone / WhatsApp <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="(00) 00000-0000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    E-mail <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* CPF */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    CPF <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="000.000.000-00"
                      value={guestCpf}
                      onChange={(e) => setGuestCpf(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Cidade */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Cidade <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="Sua cidade"
                      value={guestCity}
                      onChange={(e) => setGuestCity(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Marca da moto */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Marca da moto <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="Ex: BMW"
                      value={guestBikeBrand}
                      onChange={(e) => setGuestBikeBrand(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <Bike className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Modelo da moto */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Modelo <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      placeholder="Ex: R 1250 GS"
                      value={guestBikeModel}
                      onChange={(e) => setGuestBikeModel(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <Bike className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Ano da moto */}
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] text-slate-300">
                    Ano da moto <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      required
                      placeholder="Ex: 2024"
                      value={guestBikeYear}
                      onChange={(e) => setGuestBikeYear(e.target.value)}
                      className="bg-[#131924] border-[#1f293d] text-white text-xs h-9 pr-8"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PERGUNTA SOBRE GARUPA (Ambos os fluxos) */}
          <div className="space-y-3 bg-[#0d121c] p-4 rounded-md border border-[#1a2334]">
            <Label className="text-xs font-bold text-white uppercase tracking-wider font-montserrat">
              Você irá com garupa? <span className="text-red-400">*</span>
            </Label>
            <RadioGroup
              value={hasPillion ? 'sim' : 'nao'}
              onValueChange={(v) => setHasPillion(v === 'sim')}
              className="flex gap-6 pt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="sim"
                  id="modal-pillion-sim"
                  className="border-[#0066FF] text-[#0066FF]"
                />
                <Label
                  htmlFor="modal-pillion-sim"
                  className="cursor-pointer text-xs font-normal text-slate-200"
                >
                  Sim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="nao"
                  id="modal-pillion-nao"
                  className="border-[#0066FF] text-[#0066FF]"
                />
                <Label
                  htmlFor="modal-pillion-nao"
                  className="cursor-pointer text-xs font-normal text-slate-200"
                >
                  Não
                </Label>
              </div>
            </RadioGroup>

            {hasPillion && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1a2334] mt-2 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <Label htmlFor="pillion-name" className="text-[11px] text-slate-300">
                    Nome do garupa <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="pillion-name"
                    placeholder="Nome completo do garupa"
                    value={pillionName}
                    onChange={(e) => setPillionName(e.target.value)}
                    className="bg-[#131924] border-[#1f293d] text-white text-xs h-9"
                    required={hasPillion}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pillion-phone" className="text-[11px] text-slate-300">
                    Telefone do garupa <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="pillion-phone"
                    placeholder="(00) 00000-0000"
                    value={pillionPhone}
                    onChange={(e) => setPillionPhone(e.target.value)}
                    className="bg-[#131924] border-[#1f293d] text-white text-xs h-9"
                    required={hasPillion}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CONTATO DE EMERGÊNCIA (Ambos os fluxos) */}
          <div className="space-y-3 bg-[#0d121c] p-4 rounded-md border border-[#1a2334]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-montserrat flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Contato de Emergência
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="emergency-name" className="text-[11px] text-slate-300">
                  Nome do contato de emergência <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="emergency-name"
                  placeholder="Nome de um parente ou amigo"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="bg-[#131924] border-[#1f293d] text-white text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emergency-phone" className="text-[11px] text-slate-300">
                  Telefone de emergência <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="emergency-phone"
                  placeholder="(00) 00000-0000"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="bg-[#131924] border-[#1f293d] text-white text-xs h-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* ACEITES DE IMAGEM E PRIVACIDADE (APENAS PARA NÃO-MEMBRO) */}
          {!isMember && (
            <div className="space-y-3">
              {/* Alerta Destacado Âmbar / Dourado */}
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-sm p-3 flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/95 leading-relaxed font-normal">
                  <strong className="text-amber-300 font-semibold">Importante:</strong> os eventos
                  do Euromotors Motorrad Club são experiências coletivas e poderão ser fotografados
                  e filmados. Por esse motivo, a autorização de uso de imagem e voz é requisito para
                  participação no Clube.
                </p>
              </div>

              <div className="space-y-3 bg-[#0d121c] p-4 rounded-md border border-[#1a2334] text-xs text-slate-300">
                {/* Checkbox 1: Autorização de Imagem e Voz */}
                <div className="flex items-start space-x-2.5">
                  <Checkbox
                    id="guest-image-voice"
                    checked={guestAcceptedImage}
                    onCheckedChange={(checked) => setGuestAcceptedImage(!!checked)}
                    className="mt-0.5 border-[#0066FF] data-[state=checked]:bg-[#0066FF]"
                  />
                  <Label
                    htmlFor="guest-image-voice"
                    className="cursor-pointer text-[11px] font-normal leading-relaxed text-slate-300"
                  >
                    Li, compreendi e autorizo o uso da minha imagem e voz exclusivamente em fotos do
                    passeio, fotos do grupo, vídeos do passeio e demais registros vinculados às
                    atividades do Euromotors Motorrad Club, estando ciente de que essa autorização é
                    condição para minha participação no Club.{' '}
                    <span className="text-red-400 font-bold">*</span>
                  </Label>
                </div>

                {/* Checkbox 2: Política de Privacidade */}
                <div className="flex items-start space-x-2.5 pt-2 border-t border-[#1a2334]">
                  <Checkbox
                    id="guest-privacy"
                    checked={guestAcceptedPrivacy}
                    onCheckedChange={(checked) => setGuestAcceptedPrivacy(!!checked)}
                    className="mt-0.5 border-[#0066FF] data-[state=checked]:bg-[#0066FF]"
                  />
                  <Label
                    htmlFor="guest-privacy"
                    className="cursor-pointer text-[11px] font-normal leading-relaxed text-slate-300"
                  >
                    Li e estou ciente da{' '}
                    <a
                      href="/politica-de-privacidade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0066FF] hover:text-blue-400 font-semibold underline underline-offset-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Política de Privacidade
                    </a>{' '}
                    e do tratamento dos meus dados pessoais conforme a LGPD.{' '}
                    <span className="text-red-400 font-bold">*</span>
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-[#1a2334]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#1f293d] bg-[#0d121c] text-slate-300 hover:text-white hover:bg-[#141b26] text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || (!isMember && (!guestAcceptedImage || !guestAcceptedPrivacy))}
              className="bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 h-10 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'PROCESSANDO...' : 'CONFIRMAR PARTICIPAÇÃO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
