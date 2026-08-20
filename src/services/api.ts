import pb from '@/lib/pocketbase/client'

/** Parses a PocketBase file token like `gallery_xx/image.webp` or a URL. */
export function getFileUrl(record: { id: string } | null | undefined, filename?: string): string {
  if (!filename) return ''
  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('/')
  ) {
    return filename
  }
  if (!record) return ''
  return `${pb.baseUrl}/api/files/galleries/${record.id}/${filename}`
}

export type MemberCategory = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'INATIVO'
export type MemberStatusType = 'ATIVO' | 'INATIVO' | 'ATENCAO' | 'PENDENTE' | 'PRE_CADASTRADO'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  category?: string
  categoria?: MemberCategory | string
  status_membro?: MemberStatusType | string
  quantidade_motos_compradas?: number
  data_primeira_compra?: string
  data_ultima_compra?: string
  data_ultima_passagem_oficina?: string
  data_categoria_atualizada?: string
  motivo_categoria?: string
  member_id?: string
  phone?: string
  cpf?: string
  city?: string
  bike_brand?: string
  bike_model?: string
  bike_year?: number
  bike_chassi?: string
  pillion_name?: string
  pillion_phone?: string
  status: 'pendente' | 'ativo' | 'inativo' | 'bloqueado'
  accepted_privacy_at?: string
  accepted_image_at?: string
  created: string
  updated: string
}

export interface HistoricoCategoria {
  id: string
  membro_id: string
  categoria_anterior?: string
  categoria_nova: string
  data_alteracao: string
  motivo: string
  origem: 'automatico' | 'admin'
  justificativa?: string
  created: string
  updated: string
  expand?: {
    membro_id?: UserProfile
  }
}

export interface HistoricoComprasMotos {
  id: string
  membro_id?: string
  cpf?: string
  modelo?: string
  ano?: number
  chassi?: string
  data_compra?: string
  status_venda?: 'FATURADA' | 'ENTREGUE' | 'CANCELADA'
  created_at?: string
  created: string
  updated: string
}

export interface HistoricoOficina {
  id: string
  membro_id?: string
  cpf?: string
  data_passagem?: string
  tipo_servico?: string
  ordem_servico?: string
  status?: 'CONCLUIDA' | 'CANCELADA'
  created_at?: string
  created: string
  updated: string
}

export interface Ride {
  id: string
  name: string
  cover_image?: string
  description?: string
  date: string
  meeting_time?: string
  departure_time?: string
  meeting_point?: string
  destination?: string
  route?: string
  distance_km?: number
  estimated_time?: string
  max_bikes: number
  allow_pillion: boolean
  price?: number
  important_info?: string
  whats_included?: string
  rules?: string
  map_link?: string
  registration_deadline?: string
  ride_type?: 'bate_e_volta' | 'bate_e_fica'
  status:
    | 'rascunho'
    | 'inscricoes_abertas'
    | 'lotado'
    | 'inscricoes_encerradas'
    | 'realizado'
    | 'cancelado'
  created: string
  updated: string
  // Computed / expanded fields
  bikes_registered?: number
  participants_registered?: number
  is_user_registered?: boolean
}

export interface Registration {
  id: string
  ride: string
  user?: string
  has_pillion: boolean
  pillion_name?: string
  pillion_phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  accepted_rules: boolean
  accepted_terms: boolean
  accepted_terms_at?: string
  accepted_image_at?: string
  is_guest?: boolean
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  guest_cpf?: string
  guest_city?: string
  guest_bike_brand?: string
  guest_bike_model?: string
  guest_bike_year?: number
  accepted_privacy_at?: string
  checked_in?: boolean
  checked_in_at?: string
  payment_status?: 'pendente' | 'pago'
  payment_notes?: string
  status: 'confirmada' | 'cancelada' | 'pendente'
  created: string
  updated: string
  expand?: {
    user?: UserProfile
    ride?: Ride
  }
}

export interface Benefit {
  id: string
  title: string
  image?: string
  partner?: string
  description?: string
  exclusive_condition?: string
  valid_until?: string
  how_to_use?: string
  contact_link?: string
  active?: boolean
  created: string
  updated: string
}

export interface Partner {
  id: string
  name: string
  category:
    | 'hoteis'
    | 'restaurantes'
    | 'equipamentos'
    | 'vestuario'
    | 'turismo'
    | 'seguros'
    | 'servicos'
    | 'outros'
  logo?: string
  description?: string
  discount_info?: string
  website?: string
  phone?: string
  city?: string
  active?: boolean
  created: string
  updated: string
}

export interface Gallery {
  id: string
  title: string
  ride?: string
  category: 'passeios' | 'videos' | 'eventos' | 'viagens' | 'encontros'
  type: 'photo' | 'video'
  cover_image?: string
  images_json?: string
  video_url?: string
  description?: string
  event_date?: string
  featured?: boolean
  sort_order?: number
  expand?: {
    ride?: Ride
  }
  created: string
  updated: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  category?: string
  important?: boolean
  priority: 'normal' | 'important' | 'urgent'
  active?: boolean
  publish_at?: string
  expires_at?: string
  created: string
  updated: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  /** URL externa (modo legado). */
  image?: string
  button_text?: string
  button_link?: string
  sort_order?: number
  active?: boolean
  /** Página onde o banner aparece (home, club, passeios, etc.). */
  page?: string
  /** Nome do arquivo enviado via upload. */
  image_file?: string
  created: string
  updated: string
}

export interface StoreVisit {
  id: string
  user: string
  notes?: string
  created_at?: string
  created: string
  updated: string
  expand?: {
    user?: UserProfile
  }
}

// Data Services
export const userService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!pb.authStore.isValid || !pb.authStore.model) return null
    return pb.authStore.model as unknown as UserProfile
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const records = await pb.collection('users').getFullList({ sort: '-created' })
    return records as unknown as UserProfile[]
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const record = await pb.collection('users').getOne(id)
      return record as unknown as UserProfile
    } catch {
      return null
    }
  },

  async updateUserStatus(id: string, status: UserProfile['status']): Promise<UserProfile> {
    const updated = await pb.collection('users').update(id, { status })
    return updated as unknown as UserProfile
  },

  async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await pb.collection('users').update(id, data)
    return updated as unknown as UserProfile
  },

  async adjustMemberCategory(
    id: string,
    newCategory: MemberCategory,
    justificativa: string,
    newStatusMembro?: MemberStatusType,
  ): Promise<UserProfile> {
    const currentUser = await pb.collection('users').getOne(id)
    const oldCat = currentUser.categoria || currentUser.category || ''

    const updateData: Partial<UserProfile> = {
      categoria: newCategory,
      category: newCategory,
      status_membro: newStatusMembro || (newCategory === 'INATIVO' ? 'INATIVO' : 'ATIVO'),
      status: newCategory === 'INATIVO' ? 'inativo' : 'ativo',
      motivo_categoria: 'AJUSTE_ADMINISTRATIVO',
      data_categoria_atualizada: new Date().toISOString(),
    }

    const updated = await pb.collection('users').update(id, updateData)

    // Grava no histórico de auditoria
    try {
      await pb.collection('historico_categoria').create({
        membro_id: id,
        categoria_anterior: oldCat || null,
        categoria_nova: newCategory,
        data_alteracao: new Date().toISOString(),
        motivo: 'AJUSTE_ADMINISTRATIVO',
        origem: 'admin',
        justificativa: justificativa.trim(),
      })
    } catch (err) {
      console.error('Erro ao registrar histórico de categoria:', err)
    }

    return updated as unknown as UserProfile
  },

  async getCategoryHistory(memberId?: string): Promise<HistoricoCategoria[]> {
    try {
      const filter = memberId ? `membro_id='${memberId}'` : ''
      const records = await pb.collection('historico_categoria').getFullList({
        filter,
        sort: '-data_alteracao,-created',
        expand: 'membro_id',
      })
      return records as unknown as HistoricoCategoria[]
    } catch {
      return []
    }
  },

  async findPreRegistration(search: string): Promise<any> {
    const response = await fetch(`${pb.baseUrl}/api/club/find-pre-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar pré-cadastro')
    }
    return data
  },

  async activatePreRegistration(payload: {
    memberId: string
    password: string
    acceptImage: boolean
    acceptTerms: boolean
  }): Promise<any> {
    const response = await fetch(`${pb.baseUrl}/api/club/activate-pre-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao ativar cadastro')
    }
    return data
  },

  async registerCustomer(data: {
    email: string
    password: string
    name: string
    phone: string
    cpf: string
    city: string
    bike_brand: string
    bike_model: string
    bike_year: number
    bike_chassi?: string
    pillion_name?: string
    pillion_phone?: string
    accepted_privacy_at?: string
    accepted_image_at?: string
  }): Promise<UserProfile> {
    const passwordToUse = data.password
    if (!passwordToUse || passwordToUse.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres.')
    }
    const nowIso = new Date().toISOString()
    const record = await pb.collection('users').create({
      ...data,
      password: passwordToUse,
      passwordConfirm: passwordToUse,
      role: 'member',
      status: 'pendente',
      accepted_privacy_at: data.accepted_privacy_at || nowIso,
      accepted_image_at: data.accepted_image_at || nowIso,
    })
    // Tenta autenticar após cadastro
    try {
      await pb.collection('users').authWithPassword(data.email, passwordToUse)
    } catch (e) {
      console.log('Auto-login após cadastro:', e)
    }
    return record as unknown as UserProfile
  },
}

export const rideService = {
  async getAllRides(): Promise<Ride[]> {
    const rides = await pb.collection('rides').getFullList({ sort: '-date' })
    const registrations = await pb
      .collection('registrations')
      .getFullList({ filter: "status='confirmada'" })

    const userId = pb.authStore.model?.id

    return rides.map((r: any) => {
      const rideRegs = registrations.filter((reg: any) => reg.ride === r.id)
      const bikesCount = rideRegs.length
      const peopleCount = rideRegs.reduce(
        (acc: number, reg: any) => acc + (reg.has_pillion ? 2 : 1),
        0,
      )
      const isRegistered = userId ? rideRegs.some((reg: any) => reg.user === userId) : false

      return {
        ...r,
        bikes_registered: bikesCount,
        participants_registered: peopleCount,
        is_user_registered: isRegistered,
      } as Ride
    })
  },

  async getRideById(id: string): Promise<Ride | null> {
    try {
      const r = await pb.collection('rides').getOne(id)
      const registrations = await pb
        .collection('registrations')
        .getFullList({ filter: `ride='${id}' && status='confirmada'` })
      const userId = pb.authStore.model?.id

      return {
        ...r,
        bikes_registered: registrations.length,
        participants_registered: registrations.reduce(
          (acc, reg) => acc + (reg.has_pillion ? 2 : 1),
          0,
        ),
        is_user_registered: userId ? registrations.some((reg) => reg.user === userId) : false,
      } as unknown as Ride
    } catch {
      return null
    }
  },

  async createRide(data: Omit<Ride, 'id' | 'created' | 'updated'>): Promise<Ride> {
    const created = await pb.collection('rides').create(data)
    return created as unknown as Ride
  },

  async updateRide(id: string, data: Partial<Ride>): Promise<Ride> {
    const updated = await pb.collection('rides').update(id, data)
    return updated as unknown as Ride
  },

  async deleteRide(id: string): Promise<boolean> {
    await pb.collection('rides').delete(id)
    return true
  },
}

export const registrationService = {
  async registerForRide(data: {
    ride: string
    user?: string
    has_pillion: boolean
    pillion_name?: string
    pillion_phone?: string
    emergency_contact_name: string
    emergency_contact_phone: string
    accepted_rules?: boolean
    accepted_terms?: boolean
    accepted_terms_at?: string
    accepted_image_at?: string
    is_guest?: boolean
    guest_name?: string
    guest_phone?: string
    guest_email?: string
    guest_cpf?: string
    guest_city?: string
    guest_bike_brand?: string
    guest_bike_model?: string
    guest_bike_year?: number
    accepted_privacy_at?: string
    status?: 'confirmada' | 'cancelada' | 'pendente'
  }): Promise<Registration> {
    const nowIso = new Date().toISOString()
    const record = await pb.collection('registrations').create({
      ...data,
      accepted_rules: data.accepted_rules ?? true,
      accepted_terms: data.accepted_terms ?? true,
      accepted_terms_at: data.accepted_terms_at || nowIso,
      accepted_image_at: data.accepted_image_at || nowIso,
      status: data.status || (data.is_guest ? 'pendente' : 'confirmada'),
    })
    return record as unknown as Registration
  },

  async getRegistrationsByRide(rideId: string): Promise<Registration[]> {
    const records = await pb.collection('registrations').getFullList({
      filter: `ride='${rideId}'`,
      expand: 'user',
      sort: '-created',
    })
    return records as unknown as Registration[]
  },

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    const records = await pb.collection('registrations').getFullList({
      filter: `user='${userId}'`,
      expand: 'ride',
      sort: '-created',
    })
    return records as unknown as Registration[]
  },

  async getAllRegistrations(): Promise<Registration[]> {
    const records = await pb.collection('registrations').getFullList({
      expand: 'ride,user',
      sort: '-created',
    })
    return records as unknown as Registration[]
  },

  async updateRegistrationStatus(
    id: string,
    status: 'confirmada' | 'cancelada' | 'pendente',
  ): Promise<Registration> {
    const updated = await pb.collection('registrations').update(id, { status })
    return updated as unknown as Registration
  },

  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration> {
    const updated = await pb.collection('registrations').update(id, data)
    return updated as unknown as Registration
  },

  async checkInMember(
    rideId: string,
    userId: string,
  ): Promise<{
    success: boolean
    message: string
    registration?: Registration
    memberName?: string
  }> {
    try {
      // Find registration for this user and ride
      const records = await pb.collection('registrations').getFullList({
        filter: `ride='${rideId}' && user='${userId}'`,
        expand: 'user',
      })

      if (!records || records.length === 0) {
        return {
          success: false,
          message: 'Membro não inscrito neste passeio',
        }
      }

      const reg = records[0] as unknown as Registration
      const memberName = reg.expand?.user?.name || 'Membro'

      if (reg.checked_in) {
        return {
          success: true,
          message: `${memberName} — Check-in já havia sido realizado!`,
          registration: reg,
          memberName,
        }
      }

      const nowIso = new Date().toISOString()
      const updated = await pb.collection('registrations').update(reg.id, {
        checked_in: true,
        checked_in_at: nowIso,
      })

      return {
        success: true,
        message: `${memberName} — PRESENÇA CONFIRMADA`,
        registration: { ...reg, ...updated, expand: reg.expand },
        memberName,
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Erro ao processar check-in',
      }
    }
  },
}

export const benefitService = {
  async getAllBenefits(): Promise<Benefit[]> {
    const records = await pb.collection('benefits').getFullList({ sort: '-created' })
    return records as unknown as Benefit[]
  },

  /** Apenas benefícios ativos — usados nas páginas públicas e da área do membro. */
  async getActiveBenefits(): Promise<Benefit[]> {
    const records = await pb
      .collection('benefits')
      .getFullList({ filter: "active='true'", sort: '-created' })
    return records as unknown as Benefit[]
  },

  async createBenefit(data: Omit<Benefit, 'id' | 'created' | 'updated'>): Promise<Benefit> {
    const created = await pb.collection('benefits').create(data)
    return created as unknown as Benefit
  },

  async updateBenefit(id: string, data: Partial<Benefit>): Promise<Benefit> {
    const updated = await pb.collection('benefits').update(id, data)
    return updated as unknown as Benefit
  },

  async deleteBenefit(id: string): Promise<boolean> {
    await pb.collection('benefits').delete(id)
    return true
  },
}

export const partnerService = {
  async getAllPartners(): Promise<Partner[]> {
    const records = await pb.collection('partners').getFullList({ sort: '-created' })
    return records as unknown as Partner[]
  },

  /** Apenas parceiros ativos — usados na página pública de parceiros. */
  async getActivePartners(): Promise<Partner[]> {
    const records = await pb
      .collection('partners')
      .getFullList({ filter: "active='true'", sort: '-created' })
    return records as unknown as Partner[]
  },

  async createPartner(data: Omit<Partner, 'id' | 'created' | 'updated'>): Promise<Partner> {
    const created = await pb.collection('partners').create(data)
    return created as unknown as Partner
  },

  async updatePartner(id: string, data: Partial<Partner>): Promise<Partner> {
    const updated = await pb.collection('partners').update(id, data)
    return updated as unknown as Partner
  },

  async deletePartner(id: string): Promise<boolean> {
    await pb.collection('partners').delete(id)
    return true
  },
}

export const galleryService = {
  /** Todas as mídias ordenadas por sort_order (crescente) e criadas (decrescente). */
  async getAll(): Promise<Gallery[]> {
    const records = await pb.collection('galleries').getFullList({
      sort: 'sort_order,-created',
      expand: 'ride',
    })
    return records as unknown as Gallery[]
  },

  /** Alias legado — usado pelas páginas antigas (Index, etc). */
  async getAllGalleries(): Promise<Gallery[]> {
    return this.getAll()
  },

  /** Mídias vinculadas a um passeio específico. */
  async getByRide(rideId: string): Promise<Gallery[]> {
    const records = await pb.collection('galleries').getFullList({
      filter: `ride='${rideId}'`,
      sort: 'sort_order,-created',
      expand: 'ride',
    })
    return records as unknown as Gallery[]
  },

  /** Mídias destacadas (featured = true). */
  async getFeatured(): Promise<Gallery[]> {
    const records = await pb.collection('galleries').getFullList({
      filter: "featured='true'",
      sort: 'sort_order,-created',
      expand: 'ride',
    })
    return records as unknown as Gallery[]
  },

  async createGallery(data: Partial<Gallery>): Promise<Gallery> {
    const created = await pb.collection('galleries').create(data)
    return created as unknown as Gallery
  },

  async updateGallery(id: string, data: Partial<Gallery>): Promise<Gallery> {
    const updated = await pb.collection('galleries').update(id, data)
    return updated as unknown as Gallery
  },

  async deleteGallery(id: string): Promise<boolean> {
    await pb.collection('galleries').delete(id)
    return true
  },
}

export const announcementService = {
  async getAllAnnouncements(): Promise<Announcement[]> {
    const records = await pb.collection('announcements').getFullList({ sort: '-publish_at' })
    return records as unknown as Announcement[]
  },

  /** Apenas comunicados ativos (active = true). */
  async getActive(): Promise<Announcement[]> {
    const records = await pb.collection('announcements').getFullList({
      filter: "active='true'",
      sort: '-publish_at',
    })
    return records as unknown as Announcement[]
  },

  /** Apenas comunicados urgentes ativos. */
  async getUrgent(): Promise<Announcement[]> {
    const records = await pb.collection('announcements').getFullList({
      filter: "active='true' && priority='urgent'",
      sort: '-publish_at',
    })
    return records as unknown as Announcement[]
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const created = await pb.collection('announcements').create(data)
    return created as unknown as Announcement
  },

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const updated = await pb.collection('announcements').update(id, data)
    return updated as unknown as Announcement
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    await pb.collection('announcements').delete(id)
    return true
  },
}

export const bannerService = {
  async getAll(): Promise<Banner[]> {
    const records = await pb.collection('banners').getFullList({ sort: 'sort_order,-created' })
    return records as unknown as Banner[]
  },

  async getActive(): Promise<Banner[]> {
    const records = await pb
      .collection('banners')
      .getFullList({ filter: "active='true'", sort: 'sort_order,-created' })
    return records as unknown as Banner[]
  },

  async create(data: Partial<Banner>): Promise<Banner> {
    const created = await pb.collection('banners').create(data)
    return created as unknown as Banner
  },

  async update(id: string, data: Partial<Banner>): Promise<Banner> {
    const updated = await pb.collection('banners').update(id, data)
    return updated as unknown as Banner
  },

  async delete(id: string): Promise<boolean> {
    await pb.collection('banners').delete(id)
    return true
  },
}

export const storeVisitService = {
  async getAllVisits(): Promise<StoreVisit[]> {
    try {
      const records = await pb.collection('store_visits').getFullList({
        sort: '-created',
        expand: 'user',
      })
      return records as unknown as StoreVisit[]
    } catch {
      return []
    }
  },

  async getVisitsByUser(userId: string): Promise<StoreVisit[]> {
    try {
      const records = await pb.collection('store_visits').getFullList({
        filter: `user='${userId}'`,
        sort: '-created',
      })
      return records as unknown as StoreVisit[]
    } catch {
      return []
    }
  },

  async recordStoreVisit(userId: string, notes?: string): Promise<StoreVisit> {
    const record = await pb.collection('store_visits').create({
      user: userId,
      notes: notes || 'Check-in presencial na loja Euro Motors',
      created_at: new Date().toISOString(),
    })
    return record as unknown as StoreVisit
  },

  async performStoreCheckInWithToken(token: string): Promise<{
    success: boolean
    pointsAwarded: number
    visitId: string
    message: string
  }> {
    const res = await pb.send('/api/club/store-checkin', {
      method: 'POST',
      body: { token },
    })
    return res
  },

  async getAdminDailyToken(): Promise<{
    date: string
    token: string
    targetUrl: string
  }> {
    const res = await pb.send('/api/club/store-daily-token', {
      method: 'GET',
    })
    return res
  },

  async getMemberPoints(userId: string): Promise<{
    rideCheckins: number
    storeVisits: number
    ridePoints: number
    storePoints: number
    totalPoints: number
  }> {
    try {
      const [regs, visits] = await Promise.all([
        pb.collection('registrations').getFullList({
          filter: `user='${userId}' && checked_in=true`,
        }),
        pb.collection('store_visits').getFullList({
          filter: `user='${userId}'`,
        }),
      ])
      const rideCheckins = regs.length
      const storeVisits = visits.length
      const ridePoints = rideCheckins * 100
      const storePoints = storeVisits * 10
      const totalPoints = ridePoints + storePoints

      return {
        rideCheckins,
        storeVisits,
        ridePoints,
        storePoints,
        totalPoints,
      }
    } catch {
      return {
        rideCheckins: 0,
        storeVisits: 0,
        ridePoints: 0,
        storePoints: 0,
        totalPoints: 0,
      }
    }
  },
}
