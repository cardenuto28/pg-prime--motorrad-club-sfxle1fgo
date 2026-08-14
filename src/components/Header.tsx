import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, LogOut, Menu, X, Bike, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface HeaderProps {
  onOpenAuthModal?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const { user, logout, login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Abrir modal de login automaticamente quando redirecionado por ProtectedRoute
  useEffect(() => {
    if ((location.state as any)?.openLogin) {
      setLoginModalOpen(true)
      // limpa o state para não reabrir
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
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

  const handleOpenLogin = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal()
    } else {
      setLoginModalOpen(true)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#07090e]/95 backdrop-blur border-b border-[#181f2f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <svg
                width="42"
                height="32"
                viewBox="0 0 100 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white group-hover:text-blue-500 transition-colors"
              >
                {/* Custom Emblem / Winged Logo similar to Motorrad */}
                <path
                  d="M10 20 L40 20 L25 50 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <path
                  d="M35 10 L85 10 L60 60 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <path d="M45 25 L95 25 L80 45 Z" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.2em] text-lg text-white leading-none font-montserrat">
                EUROMOTORS
              </span>
              <span className="text-[10px] tracking-[0.25em] text-slate-400 font-semibold mt-1">
                MOTORRAD CLUB
              </span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/"
              className="text-xs font-semibold tracking-wider text-white border-b-2 border-blue-600 pb-1 hover:text-white transition-colors"
            >
              INÍCIO
            </Link>
            <Link
              to="/club"
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              O CLUB
            </Link>
            <Link
              to="/beneficios"
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              BENEFÍCIOS
            </Link>
            <a
              href="/#proximos-passeios"
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              PASSEIOS
            </a>
            <Link
              to="/parceiros"
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              PARCEIROS
            </Link>
            <a
              href="/#galeria"
              className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              GALERIA
            </a>
            <a
              href="/#cadastro-form"
              className="text-xs font-semibold tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
            >
              QUERO FAZER PARTE
            </a>
          </nav>

          {/* Action / Member Area Button */}
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/member/dashboard')}
                  className="text-right hover:opacity-80 transition-opacity"
                >
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-blue-400 uppercase font-semibold">
                    {user.role === 'admin' ? 'Administrador' : `Membro ${user.status}`}
                  </span>
                </button>
                <Button
                  onClick={() => navigate('/member/dashboard')}
                  variant="outline"
                  size="sm"
                  className="border-blue-600/60 hover:border-blue-500 bg-[#0d131f] hover:bg-blue-600/10 text-white font-semibold text-xs tracking-wider gap-1.5"
                >
                  <Bike className="w-3.5 h-3.5 text-blue-500" /> ÁREA DO MEMBRO
                </Button>
                {user.role === 'admin' && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    size="sm"
                    className="border-blue-600/60 hover:border-blue-500 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 font-semibold text-xs tracking-wider gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> ADMIN
                  </Button>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-[#232d3f] bg-[#101622] text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleOpenLogin}
                variant="outline"
                className="border-blue-600/60 hover:border-blue-500 bg-[#0d131f] hover:bg-blue-600/10 text-white font-semibold text-xs tracking-wider px-5 py-2 rounded-md transition-all gap-2"
              >
                <User className="w-4 h-4 text-blue-500" />
                ÁREA DO MEMBRO
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-300 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0d14] border-b border-[#1c2436] px-4 py-6 space-y-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-white hover:text-blue-400"
              >
                INÍCIO
              </Link>
              <Link
                to="/club"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                O CLUB
              </Link>
              <Link
                to="/beneficios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                BENEFÍCIOS
              </Link>
              <a
                href="/#proximos-passeios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                PASSEIOS
              </a>
              <Link
                to="/parceiros"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                PARCEIROS
              </Link>
              <a
                href="/#galeria"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                GALERIA
              </a>
              <a
                href="/#cadastro-form"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                QUERO FAZER PARTE
              </a>
            </nav>
            <div className="pt-4 border-t border-slate-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-blue-400">Membro {user.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        navigate('/member/dashboard')
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                    >
                      Área do Membro
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          navigate('/admin')
                        }}
                        variant="outline"
                        size="sm"
                        className="border-blue-600/60 bg-blue-600/10 text-blue-300 text-xs"
                      >
                        Admin
                      </Button>
                    )}
                    <Button
                      onClick={logout}
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-xs"
                    >
                      Sair
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleOpenLogin()
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider gap-2"
                >
                  <User className="w-4 h-4" /> ÁREA DO MEMBRO
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal de Login Geral */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-wider text-center text-white">
              ÁREA DO MEMBRO
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 text-center">
              Acesse sua conta para visualizar seus passeios e benefícios exclusivos.
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider h-10 mt-2"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR NA ÁREA DO MEMBRO'}
            </Button>

            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-[#1c2436]">
              Ainda não é membro? Cadastre-se na página principal!
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
