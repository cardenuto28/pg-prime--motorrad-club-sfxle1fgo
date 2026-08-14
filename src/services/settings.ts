import pb from '@/lib/pocketbase/client'

export interface SiteSettings {
  id: string
  key: string
  club_name: string
  slogan: string
  address: string
  phone: string
  contact_email: string
  website_url: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  whatsapp_number: string
  eligibility_criteria: string
  admin_email: string
}

export const settingsService = {
  /** Retorna o documento único de configurações do site (key = "site"). */
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const record = await pb.collection('settings').getFirstListItem('key="site"')
      return record as unknown as SiteSettings
    } catch (e: any) {
      // 404 — ainda não existe
      if (e?.status === 404) return null
      throw e
    }
  },

  /** Cria ou atualiza o documento único de configurações. */
  async saveSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const payload = {
      key: data.key || 'site',
      club_name: data.club_name || '',
      slogan: data.slogan || '',
      address: data.address || '',
      phone: data.phone || '',
      contact_email: data.contact_email || '',
      website_url: data.website_url || '',
      instagram_url: data.instagram_url || '',
      facebook_url: data.facebook_url || '',
      youtube_url: data.youtube_url || '',
      whatsapp_number: data.whatsapp_number || '',
      eligibility_criteria: data.eligibility_criteria || '',
      admin_email: data.admin_email || '',
    }

    // Se já existe, atualiza; senão cria.
    if (data.id) {
      const updated = await pb.collection('settings').update(data.id, payload)
      return updated as unknown as SiteSettings
    }

    try {
      const existing = await pb.collection('settings').getFirstListItem('key="site"')
      const updated = await pb.collection('settings').update(existing.id, payload)
      return updated as unknown as SiteSettings
    } catch (e: any) {
      if (e?.status === 404) {
        const created = await pb.collection('settings').create(payload)
        return created as unknown as SiteSettings
      }
      throw e
    }
  },
}
