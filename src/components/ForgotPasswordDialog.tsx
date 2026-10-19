import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Mail, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBackToLogin?: () => void
  defaultEmail?: string
}

export const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onOpenChange,
  onBackToLogin,
  defaultEmail = '',
}) => {
  const { requestPasswordReset } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState(defaultEmail)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sincroniza email default quando modal abrir
  React.useEffect(() => {
    if (open) {
      if (defaultEmail && !email) {
        setEmail(defaultEmail)
      }
      setErrorMessage(null)
    } else {
      // Ao fechar, limpa estado temporário
      setSubmitting(false)
    }
  }, [open, defaultEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const { error } = await requestPasswordReset(cleanEmail)
    setSubmitting(false)

    if (error) {
      // PocketBase por padrão retorna sucesso ou erro de rate limit/formato
      const msg =
        error?.data?.message ||
        error?.message ||
        'Não foi possível processar o pedido. Tente novamente mais tarde.'
      setErrorMessage(msg)
      toast({
        title: 'Erro ao solicitar redefinição',
        description: msg,
        variant: 'destructive',
      })
      return
    }

    setSentEmail(cleanEmail)
    setSubmitted(true)
    toast({
      title: 'Link de redefinição enviado!',
      description:
        'Enviamos um link de redefinição para seu e-mail. Verifique a caixa de entrada e a pasta de spam.',
    })
  }

  const handleResetDialogState = () => {
    setSubmitted(false)
    setSentEmail('')
    setErrorMessage(null)
  }

  const handleBack = () => {
    handleResetDialogState()
    onOpenChange(false)
    if (onBackToLogin) {
      onBackToLogin()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleResetDialogState()
        onOpenChange(next)
      }}
    >
      <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md p-6">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-[#0066FF] mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-wider text-center text-white font-montserrat uppercase">
            Recuperar Senha
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 text-center leading-relaxed">
            {submitted
              ? 'Instruções enviadas com sucesso para o seu e-mail.'
              : 'Informe o e-mail cadastrado na sua conta de membro para receber o link de redefinição.'}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                E-mail enviado!
              </div>
              <p className="leading-relaxed text-slate-300">
                Enviamos um link de redefinição para{' '}
                <strong className="text-white font-mono break-all">{sentEmail}</strong>. Verifique
                sua caixa de entrada e a pasta de spam.
              </p>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-emerald-900/50">
                O link expira em alguns minutos. Se não encontrar a mensagem, aguarde instantes ou
                solicite novamente.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleBack}
                className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider h-10 rounded-sm"
              >
                Voltar para o Login
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full border-[#222c3f] bg-[#141b27] text-slate-300 hover:text-white text-xs h-9"
              >
                Enviar para outro e-mail
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="forgot-password-email"
                className="text-xs text-slate-300 font-medium flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" /> E-mail cadastrado
              </Label>
              <Input
                id="forgot-password-email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10 focus:border-[#0066FF]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !email.trim()}
              className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider h-10 mt-2 rounded-sm uppercase font-montserrat shadow-lg shadow-blue-950/50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ENVIANDO LINK...
                </>
              ) : (
                'ENVIAR LINK DE REDEFINIÇÃO'
              )}
            </Button>

            <div className="text-center pt-3 border-t border-[#1c2436]">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para o login
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
