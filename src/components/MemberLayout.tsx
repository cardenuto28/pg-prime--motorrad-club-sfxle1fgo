import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Gift,
  Images,
  Megaphone,
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatusBadge, statusLabel } from '@/lib/member'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAnnouncementPopup } from '@/hooks/useAnnouncementPopup'
import { AnnouncementPopupModal } from '@/components/AnnouncementPopupModal'
import { PG_PRIME_LOGO_URL } from '@/lib/branding'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/member/dashboard', label: 'Meu Club', icon: LayoutDashboard },
  { to: '/member/card', label: 'Carteirinha Digital', icon: CreditCard },
  { to: '/member/passeios', label: 'Próximos Passeios', icon: Calendar },
  { to: '/member/inscricoes', label: 'Minhas Inscrições', icon: ClipboardList },
  { to: '/member/beneficios', label: 'Benefícios', icon: Gift },
  { to: '/member/galeria', label: 'Galeria', icon: Images },
  { to: '/member/comunicados', label: 'Comunicados', icon: Megaphone },
  { to: '/member/perfil', label: 'Meu Perfil', icon: User },
]

export const MemberLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const popup = useAnnouncementPopup()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur border-b border-[#181f2f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="bg-[#0b101c] px-2 py-1 rounded border border-[#1b253b] flex items-center">
                <img
                  src={PG_PRIME_LOGO_URL}
                  alt="PG PRIME CLUB"
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                />
              </div>
              <span className="text-[10px] tracking-[0.2em] text-slate-300 font-bold uppercase font-montserrat border-l border-slate-700 pl-3">
                MEMBRO
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">
                {user?.name}
              </span>
              <span className="text-[10px] text-blue-400 uppercase font-semibold">
                {user?.role === 'admin' ? 'Administrador' : `Membro ${statusLabel(user?.status)}`}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-[#232d3f] bg-[#101622] hover:bg-slate-800 px-3 py-1.5 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Layout Body */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <MemberSidebarContent />
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 min-w-0">
            <ErrorBoundary context="a página da área do membro">
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Pop-up Modal de Comunicados Não Visualizados */}
      <AnnouncementPopupModal
        isOpen={popup.isOpen}
        announcement={popup.currentAnnouncement}
        currentIndex={popup.currentIndex}
        totalCount={popup.totalCount}
        isMarking={popup.isMarking}
        onNext={popup.next}
        onPrev={popup.prev}
        onUnderstood={popup.markCurrentAsUnderstood}
        onClose={popup.closeModal}
      />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0d14] border-r border-[#1c2436] p-4 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-white uppercase font-montserrat">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MemberSidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

const MemberSidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="space-y-4">
      {/* User card */}
      {user && (
        <div className="bg-[#0f131c] border border-[#1d2638] rounded-md p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Status</span>
            <StatusBadge status={user.status} />
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2436]">
            <span className="text-slate-500">Moto: </span>
            {user.bike_brand || user.bike_model
              ? `${user.bike_brand || ''} ${user.bike_model || ''} ${user.bike_year || ''}`.trim()
              : 'Não cadastrada'}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="bg-[#0f131c] border border-[#1d2638] rounded-md p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase font-montserrat transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-white border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-[#141b27] border-l-2 border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase font-montserrat text-red-300 hover:text-red-200 border border-red-900/50 bg-red-950/30 hover:bg-red-950/50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sair da Conta
      </button>

      <Link
        to="/"
        className="block text-center text-[10px] text-slate-500 hover:text-slate-300 pt-1"
      >
        ← Voltar para o site público
      </Link>
    </div>
  )
}
