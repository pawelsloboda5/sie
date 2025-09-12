import type { Provider as SharedProvider } from './copilot'

export interface ServiceUI {
  _id: string
  provider_id: string
  name: string
  category: string
  description: string
  is_free: boolean
  is_discounted: boolean
  price_info: string
  searchScore?: number
}

export type ProviderUI = Omit<SharedProvider, 'services'> & {
  address: string
  services?: ServiceUI[]
  freeServicePreview?: ServiceUI[]
}

export interface SearchResultsUI {
  providers: ProviderUI[]
  services: ServiceUI[]
  query: string
  totalResults: number
  isFiltered?: boolean
}


