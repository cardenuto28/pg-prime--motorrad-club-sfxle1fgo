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
import { Bike, Users, ShieldAlert, CheckCircle2 } from 'lucide-react'

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
  const [hasPillion, setHasPillion] = useState<boolean>(false)
  const [pillionName, setPillionName] = useState<string>('')
  const [pillionPhone, setPillionPhone] = useState<string>('')
  const [emergencyName, setEmergencyName] = useState<string>('')
  const [emergencyPhone, setEmergencyPhone] = useState<string>('')
  const [acceptedRules, setAcceptedRules] = useState<boolean>(false)
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (user) {
      if (user.pillion_name) {
        setPillionName(user.pillion_name)
        setPillionPhone(user.pillion_phone || '')
      }
    }
  }, [user, isOpen])

  if (!ride || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedRules || !acceptedTerms) {
      toast({
        title: 'Atenção',
        description:
          'Você precisa aceitar o regulamento e o termo de responsabilidade para se inscrever.',
        variant: 'destructive',
      })
      return
    }

    if (hasPillion && (!pillionName.trim() || !pillionPhone.trim())) {
      toast({
        title: 'Dados do Garupa',
        description: 'Preencha o nome e telefone do garupa obrigatoriamente.',
        variant: 'destructive',
      })
      return
    }

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      toast({
        title: 'Contato de Emergência',
        description: 'Preencha o nome e telefone do contato de emergência.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await registrationService.registerForRide({
        ride: ride.id,
        user: user.id,
        has_pillion: hasPillion,
        pillion_name: hasPillion ? pillionName : '',
        pillion_phone: hasPillion ? pillionPhone : '',
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        accepted_rules: acceptedRules,
        accepted_terms: acceptedTerms,
      })

      toast({
        title: 'Inscrição realizada com sucesso!',
        description: `Sua vaga para o passeio ${ride.name} está garantida. Nos vemos no ponto de encontro!`,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <Bike className="w-4 h-4" /> Euro Motors Motorrad Club
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Inscrição no Passeio: {ride.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Confirme seus dados e do garupa para efetuar a reserva da sua vaga.
          </DialogDescription>
        </DialogHeader>

        {/* Status das Vagas */}
        <div className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between border border-slate-700/60 my-2">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300">
              Vagas de Motos:{' '}
              <strong>
                {ride.bikes_registered || 0} / {ride.max_bikes}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">
              Total de Participantes: <strong>{ride.participants_registered || 0}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Dados do Piloto (Preenchido Automaticamente) */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
              Seus Dados (Piloto)
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nome Completo</span>
                <span className="font-medium text-slate-200">{user.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">E-mail</span>
                <span className="font-medium text-slate-200">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Telefone / WhatsApp</span>
                <span className="font-medium text-slate-200">{user.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Motocicleta</span>
                <span className="font-medium text-slate-200">
                  {user.bike_brand} {user.bike_model} ({user.bike_year})
                </span>
              </div>
            </div>
          </div>

          {/* Garupa Option */}
          {ride.allow_pillion && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <Label className="text-sm font-semibold text-slate-200">
                Você participará com garupa? <span className="text-red-400">*</span>
              </Label>
              <RadioGroup
                value={hasPillion ? 'sim' : 'nao'}
                onValueChange={(v) => setHasPillion(v === 'sim')}
                className="flex gap-6 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="sim"
                    id="pillion-sim"
                    className="border-blue-500 text-blue-500"
                  />
                  <Label
                    htmlFor="pillion-sim"
                    className="cursor-pointer text-sm font-normal text-slate-200"
                  >
                    Sim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="nao"
                    id="pillion-nao"
                    className="border-blue-500 text-blue-500"
                  />
                  <Label
                    htmlFor="pillion-nao"
                    className="cursor-pointer text-sm font-normal text-slate-200"
                  >
                    Não
                  </Label>
                </div>
              </RadioGroup>

              {hasPillion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mt-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <Label htmlFor="pillion-name" className="text-xs text-slate-300">
                      Nome do garupa <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="pillion-name"
                      placeholder="Nome completo do garupa"
                      value={pillionName}
                      onChange={(e) => setPillionName(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-9"
                      required={hasPillion}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pillion-phone" className="text-xs text-slate-300">
                      Telefone do garupa <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="pillion-phone"
                      placeholder="(00) 00000-0000"
                      value={pillionPhone}
                      onChange={(e) => setPillionPhone(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-9"
                      required={hasPillion}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contato de Emergência */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Contato de Emergência
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="emergency-name" className="text-xs text-slate-300">
                  Nome do contato de emergência <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="emergency-name"
                  placeholder="Nome de um parente ou amigo"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emergency-phone" className="text-xs text-slate-300">
                  Telefone de emergência <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="emergency-phone"
                  placeholder="(00) 00000-0000"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 text-sm h-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* Aceites de Termos */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rules"
                checked={acceptedRules}
                onCheckedChange={(checked) => setAcceptedRules(!!checked)}
                className="mt-0.5 border-blue-500 data-[state=checked]:bg-blue-600"
              />
              <Label
                htmlFor="rules"
                className="cursor-pointer text-xs font-normal leading-relaxed text-slate-300"
              >
                Li e aceito as regras do passeio, incluindo formação em comboio e uso obrigatório de
                equipamentos de proteção completos.
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                className="mt-0.5 border-blue-500 data-[state=checked]:bg-blue-600"
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-xs font-normal leading-relaxed text-slate-300"
              >
                Li e concordo com o Termo de Responsabilidade e isenção de riscos na pilotagem
                durante o percurso organizado.
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6"
            >
              {submitting ? 'Inscrevendo...' : 'CONFIRMAR PARTICIPAÇÃO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
