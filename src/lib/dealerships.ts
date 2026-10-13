/**
 * Dados oficiais das concessionárias PG PRIME.
 *
 * Unidades:
 * 1) BMW João Pessoa (Cabedelo - PB)
 * 2) BMW Natal (Natal - RN)
 */

export interface DealershipUnit {
  id: string
  name: string
  shortName: string
  address: string
  cityState: string
  phone: string
  phoneRaw: string
  phoneHref: string
  whatsapp: string
  whatsappRaw: string
  whatsappHref: string
  mapQuery: string
}

export const DEALERSHIP_UNITS: DealershipUnit[] = [
  {
    id: 'joao-pessoa',
    name: 'BMW João Pessoa',
    shortName: 'João Pessoa',
    address: 'Rodovia BR-230, Quadra 09 Loja 19 A - Parque Esperança',
    cityState: 'Cabedelo - Paraíba',
    phone: '(83) 3194-1800',
    phoneRaw: '558331941800',
    phoneHref: 'tel:558331941800',
    whatsapp: '(83) 3022-8726',
    whatsappRaw: '558330228726',
    whatsappHref: 'https://wa.me/558330228726',
    mapQuery: 'Rodovia BR-230, Quadra 09 Loja 19 A - Parque Esperança, Cabedelo - PB',
  },
  {
    id: 'natal',
    name: 'BMW Natal',
    shortName: 'Natal',
    address: 'Avenida Dão Silveira, 3712, Loja A - Candelária',
    cityState: 'Natal - Rio Grande do Norte',
    phone: '(84) 3204-9700',
    phoneRaw: '558432049700',
    phoneHref: 'tel:558432049700',
    whatsapp: '(84) 99644-7609',
    whatsappRaw: '5584996447609',
    whatsappHref: 'https://wa.me/5584996447609',
    mapQuery: 'Avenida Dão Silveira, 3712, Loja A - Candelária, Natal - RN',
  },
]
