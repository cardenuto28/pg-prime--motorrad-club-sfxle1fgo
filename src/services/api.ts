import pb from '@/lib/pocketbase/client'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  phone?: string
  cpf?: string
  city?: string
  bike_brand?: string
  bike_model?: string
  bike_year?: number
  pillion_name?: string
  pillion_phone?: string
  status: 'pendente' | 'ativo' | 'inativo' | 'bloqueado'
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
  user: string
  has_pillion: boolean
  pillion_name?: string
  pillion_phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  accepted_rules: boolean
  accepted_terms: boolean
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
  created: string
  updated: string
}

export interface Gallery {
  id: string
  title: string
  ride?: string
  category: 'passeios' | 'videos' | 'eventos' | 'viagens' | 'encontros'
  cover_image?: string
  images_json?: string
  video_url?: string
  description?: string
  event_date?: string
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
  created: string
  updated: string
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

  async updateUserStatus(id: string, status: UserProfile['status']): Promise<UserProfile> {
    const updated = await pb.collection('users').update(id, { status })
    return updated as unknown as UserProfile
  },

  async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await pb.collection('users').update(id, data)
    return updated as unknown as UserProfile
  },

  async registerCustomer(data: {
    email: string
    password?: string
    name: string
    phone: string
    cpf: string
    city: string
    bike_brand: string
    bike_model: string
    bike_year: number
    pillion_name?: string
    pillion_phone?: string
  }): Promise<UserProfile> {
    const passwordToUse = data.password || 'Membro@2026'
    const record = await pb.collection('users').create({
      ...data,
      password: passwordToUse,
      passwordConfirm: passwordToUse,
      role: 'member',
      status: 'pendente',
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
    user: string
    has_pillion: boolean
    pillion_name?: string
    pillion_phone?: string
    emergency_contact_name: string
    emergency_contact_phone: string
    accepted_rules: boolean
    accepted_terms: boolean
  }): Promise<Registration> {
    const record = await pb.collection('registrations').create({
      ...data,
      status: 'confirmada',
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
    status: 'confirmada' | 'cancelada',
  ): Promise<Registration> {
    const updated = await pb.collection('registrations').update(id, { status })
    return updated as unknown as Registration
  },
}

export const benefitService = {
  async getAllBenefits(): Promise<Benefit[]> {
    const records = await pb.collection('benefits').getFullList({ sort: '-created' })
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
  async getAllGalleries(): Promise<Gallery[]> {
    const records = await pb.collection('galleries').getFullList({ sort: '-event_date' })
    return records as unknown as Gallery[]
  },

  async createGallery(data: Omit<Gallery, 'id' | 'created' | 'updated'>): Promise<Gallery> {
    const created = await pb.collection('galleries').create(data)
    return created as unknown as Gallery
  },

  async deleteGallery(id: string): Promise<boolean> {
    await pb.collection('galleries').delete(id)
    return true
  },
}

export const announcementService = {
  async getAllAnnouncements(): Promise<Announcement[]> {
    const records = await pb.collection('announcements').getFullList({ sort: '-date' })
    return records as unknown as Announcement[]
  },

  async createAnnouncement(
    data: Omit<Announcement, 'id' | 'created' | 'updated'>,
  ): Promise<Announcement> {
    const created = await pb.collection('announcements').create(data)
    return created as unknown as Announcement
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    await pb.collection('announcements').delete(id)
    return true
  },
}
