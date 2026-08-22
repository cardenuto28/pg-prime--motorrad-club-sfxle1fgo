import pb from '@/lib/pocketbase/client'
import {
  ScoreValorRange,
  ScoreFrequenciaRange,
  DEFAULT_SCORE_VALOR_RANGES,
  DEFAULT_SCORE_FREQUENCIA_RANGES,
} from '@/lib/membership'

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
  daily_token_secret?: string
}

/** Registro genérico da coleção settings que guarda um JSON em json_data. */
export interface JsonSetting {
  id: string
  key: string
  json_data: string
}

export const settingsService = {
  /** Retorna o documento único de configurações do site (key = "site"). */
  async getSettings(): Promise<SiteSettings | null> {
    try {
      // Filtro com aspas simples — convenção usada pelos demais serviços (api.ts).
      const record = await pb.collection('settings').getFirstListItem("key='site'")
      return record as unknown as SiteSettings
    } catch (e: any) {
      // Qualquer erro (404 ainda não existe, 403 sem acesso, rede, etc.)
      // retorna null silenciosamente para que a UI sempre consiga renderizar.
      console.warn('getSettings: não foi possível carregar configurações:', e?.status || e)
      return null
    }
  },

  /** Cria ou atualiza o documento único de configurações. */
  async saveSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const payload: Record<string, any> = {
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
    if (data.daily_token_secret !== undefined) {
      payload.daily_token_secret = data.daily_token_secret
    }

    // Se já temos o id, atualiza direto.
    if (data.id) {
      const updated = await pb.collection('settings').update(data.id, payload)
      return updated as unknown as SiteSettings
    }

    // Senão, tenta buscar o existente pelo key; se não houver, cria.
    try {
      const existing = await pb.collection('settings').getFirstListItem("key='site'")
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

  /**
   * Busca um documento JSON da coleção settings pela chave.
   * Retorna null se não existir (silencioso).
   */
  async getJsonSetting(key: string): Promise<JsonSetting | null> {
    try {
      const record = await pb.collection('settings').getFirstListItem(`key='${key}'`)
      return record as unknown as JsonSetting
    } catch (e: any) {
      return null
    }
  },

  /**
   * Cria ou atualiza um documento JSON da coleção settings pela chave.
   */
  async saveJsonSetting(key: string, data: unknown): Promise<JsonSetting> {
    const payload = { key, json_data: JSON.stringify(data) }
    try {
      const existing = await pb.collection('settings').getFirstListItem(`key='${key}'`)
      const updated = await pb.collection('settings').update(existing.id, payload)
      return updated as unknown as JsonSetting
    } catch (e: any) {
      const created = await pb.collection('settings').create(payload)
      return created as unknown as JsonSetting
    }
  },

  // ---- Faixas configuráveis do Score de Oficina (PARTE 2) ----

  /** Lê as faixas de valor configuradas. Retorna padrão se não houver. */
  async getScoreValorRanges(): Promise<ScoreValorRange[]> {
    const rec = await this.getJsonSetting('score_valor_ranges')
    if (!rec || !rec.json_data) return [...DEFAULT_SCORE_VALOR_RANGES]
    try {
      const arr = JSON.parse(rec.json_data)
      if (!Array.isArray(arr) || arr.length === 0) return [...DEFAULT_SCORE_VALOR_RANGES]
      return arr as ScoreValorRange[]
    } catch {
      return [...DEFAULT_SCORE_VALOR_RANGES]
    }
  },

  /** Lê as faixas de frequência configuradas. Retorna padrão se não houver. */
  async getScoreFrequenciaRanges(): Promise<ScoreFrequenciaRange[]> {
    const rec = await this.getJsonSetting('score_frequencia_ranges')
    if (!rec || !rec.json_data) return [...DEFAULT_SCORE_FREQUENCIA_RANGES]
    try {
      const arr = JSON.parse(rec.json_data)
      if (!Array.isArray(arr) || arr.length === 0) return [...DEFAULT_SCORE_FREQUENCIA_RANGES]
      return arr as ScoreFrequenciaRange[]
    } catch {
      return [...DEFAULT_SCORE_FREQUENCIA_RANGES]
    }
  },

  /** Salva (cria ou atualiza) as faixas de valor. */
  async saveScoreValorRanges(ranges: ScoreValorRange[]): Promise<void> {
    await this.saveJsonSetting('score_valor_ranges', ranges)
  },

  /** Salva (cria ou atualiza) as faixas de frequência. */
  async saveScoreFrequenciaRanges(ranges: ScoreFrequenciaRange[]): Promise<void> {
    await this.saveJsonSetting('score_frequencia_ranges', ranges)
  },

  /** Carrega ambas as faixas de uma vez (para uso no recálculo/importação). */
  async getScoreRanges(): Promise<{
    valorRanges: ScoreValorRange[]
    frequenciaRanges: ScoreFrequenciaRange[]
  }> {
    const [valorRanges, frequenciaRanges] = await Promise.all([
      this.getScoreValorRanges(),
      this.getScoreFrequenciaRanges(),
    ])
    return { valorRanges, frequenciaRanges }
  },
}
