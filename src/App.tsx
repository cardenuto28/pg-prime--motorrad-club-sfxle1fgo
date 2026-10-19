/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Club from './pages/Club'
import Beneficios from './pages/Beneficios'
import Parceiros from './pages/Parceiros'
import RideDetail from './pages/RideDetail'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './components/AdminLayout'
import { MemberLayout } from './components/MemberLayout'
import MemberDashboard from './pages/member/MemberDashboard'
import MemberPasseios from './pages/member/MemberPasseios'
import MemberInscricoes from './pages/member/MemberInscricoes'
import MemberBeneficios from './pages/member/MemberBeneficios'
import MemberGaleria from './pages/member/MemberGaleria'
import MemberComunicados from './pages/member/MemberComunicados'
import MemberPerfil from './pages/member/MemberPerfil'
import MemberCard from './pages/member/MemberCard'
import VerifyMember from './pages/VerifyMember'
import ValidarCadastro from './pages/ValidarCadastro'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMembers from './pages/admin/AdminMembers'
import AdminMemberDetail from './pages/admin/AdminMemberDetail'
import AdminImportacoes from './pages/admin/AdminImportacoes'
import AdminRides from './pages/admin/AdminRides'
import AdminRideDetail from './pages/admin/AdminRideDetail'
import AdminBenefits from './pages/admin/AdminBenefits'
import AdminPartners from './pages/admin/AdminPartners'
import AdminGallery from './pages/admin/AdminGallery'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import ScoreConfig from './pages/admin/ScoreConfig'
import AdminBanners from './pages/admin/AdminBanners'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminStoreQrCode from './pages/admin/AdminStoreQrCode'
import AdminManual from './pages/admin/AdminManual'
import StoreCheckIn from './pages/StoreCheckIn'
import Passeios from './pages/Passeios'
import Galeria from './pages/Galeria'
import Contato from './pages/Contato'
import Termos from './pages/Termos'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import RedefinirSenha from './pages/RedefinirSenha'
import { AuthProvider } from './context/AuthContext'
import { PWAInstallBanner } from './components/PWAInstallBanner'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <PWAInstallBanner />
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/club" element={<Club />} />
            <Route path="/beneficios" element={<Beneficios />} />
            <Route path="/parceiros" element={<Parceiros />} />
            {/* ADD ALL CUSTOM ROUTES MUST BE ADDED HERE */}
            <Route path="/passeios" element={<Passeios />} />
            <Route path="/passeios/:id" element={<RideDetail />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            {/* Redefinição de senha via link de e-mail */}
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/reset-password" element={<RedefinirSenha />} />
            {/* Validação de cadastro pública - PG PRIME */}
            <Route path="/validar-cadastro" element={<ValidarCadastro />} />
            <Route path="/validar-pgprime" element={<ValidarCadastro />} />
            <Route path="/validar-pgprime/*" element={<ValidarCadastro />} />
            {/* Redirects seguros de rotas antigas com "euromotors" para não quebrar links impressos */}
            <Route
              path="/validar-euromotors"
              element={<Navigate to="/validar-pgprime" replace />}
            />
            <Route
              path="/validar-euromotors/*"
              element={<Navigate to="/validar-pgprime" replace />}
            />
            <Route
              path="/validar-cadastro-euromotors"
              element={<Navigate to="/validar-cadastro" replace />}
            />
            <Route
              path="/validar-cadastro-euromotors/*"
              element={<Navigate to="/validar-cadastro" replace />}
            />
            <Route path="/euromotors" element={<Navigate to="/" replace />} />
            <Route path="/euromotors/*" element={<Navigate to="/" replace />} />
            <Route
              path="/verificar-euromotors/:id"
              element={<Navigate to="/verificar/:id" replace />}
            />

            <Route path="/verificar/:id" element={<VerifyMember />} />
            <Route path="/checkin-loja" element={<StoreCheckIn />} />
          </Route>
          {/* Área do Membro (protegida) */}
          <Route
            path="/member"
            element={
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboard />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="passeios" element={<MemberPasseios />} />
            <Route path="inscricoes" element={<MemberInscricoes />} />
            <Route path="beneficios" element={<MemberBeneficios />} />
            <Route path="card" element={<MemberCard />} />
            <Route path="carteirinha" element={<MemberCard />} />
            <Route path="galeria" element={<MemberGaleria />} />
            <Route path="comunicados" element={<MemberComunicados />} />
            <Route path="perfil" element={<MemberPerfil />} />
          </Route>
          {/* Área Administrativa (protegida — admin) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="membros" element={<AdminMembers />} />
            <Route path="membros/:id" element={<AdminMemberDetail />} />
            <Route path="importacoes" element={<AdminImportacoes />} />
            <Route path="rides" element={<AdminRides />} />
            <Route path="rides/:id" element={<AdminRideDetail />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="benefits" element={<AdminBenefits />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="score-config" element={<ScoreConfig />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="qrcode-loja" element={<AdminStoreQrCode />} />
            <Route path="manual" element={<AdminManual />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
