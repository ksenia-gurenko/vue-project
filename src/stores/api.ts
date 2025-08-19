import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE_URL = 'http://109.73.206.144:6969'
const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'

export interface Income {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  dateClose: string
  warehouseName: string
  nmId: number
  status: string
}

export interface Order {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  warehouseName: string
  oblast: string
  incomeID: number
  odid: number
  nmId: number
  subject: string
  category: string
  brand: string
  isCancel: boolean
  cancel_dt: string
  gNumber: string
  sticker: string
}

export interface Sale {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  isSupply: boolean
  isRealization: boolean
  promoCodeDiscount: number
  warehouseName: string
  countryName: string
  oblastOkrugName: string
  regionName: string
  incomeID: number
  saleID: string
  odid: number
  spp: number
  forPay: number
  finishedPrice: number
  priceWithDisc: number
  nmId: number
  subject: string
  category: string
  brand: string
  isStorno: number
  gNumber: string
  sticker: string
}

export interface Stock {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantityFull: number
  warehouseName: string
  inWayToClient: number
  inWayFromClient: number
  nmId: number
  subject: string
  category: string
  daysOnSite: number
  brand: string
  SCCode: string
  Price: number
  Discount: number
}

export const useApiStore = defineStore('api', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> => {
    loading.value = true
    error.value = null

    try {
      const url = new URL(`${API_BASE_URL}/${endpoint}`)

      // Добавляем параметры в URL
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          url.searchParams.append(key, params[key])
        }
      })

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('API Error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchData
  }
})
