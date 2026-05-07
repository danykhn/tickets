import apiClient from "@/lib/axios"
import type { BusinessInfo } from "@/lib/ticket-types"

export interface BusinessPayload {
  businessName: string
  legalName: string
  cuit: string
  ingresosBrutos: string
  address: string
  city: string
  postalCode: string
  province: string
  startDate: string | null
  taxCategory: string
  logo: string
}

export async function searchBusinesses(query: string): Promise<BusinessInfo[]> {
  if (!query || query.length < 3) return []

  const { data } = await apiClient.get<
    BusinessInfo[] | { businesses?: BusinessInfo[]; data?: BusinessInfo[]; items?: BusinessInfo[] } | BusinessInfo
  >(`/api/business/search`, { params: { q: query } })

  if (Array.isArray(data)) return data
  if ("businesses" in data && data.businesses) return data.businesses
  if ("data" in data && data.data) return data.data
  if ("items" in data && data.items) return data.items
  return [data as BusinessInfo]
}

export async function createBusiness(payload: BusinessPayload): Promise<void> {
  await apiClient.post("/api/business", payload)
}
