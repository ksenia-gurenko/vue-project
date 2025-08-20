import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE_URL = 'http://109.73.206.144:6969/api'
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

      // Добавляем API ключ
      url.searchParams.append('key', API_KEY)

      // Добавляем только те параметры, которые предоставлены и не пустые
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          // Форматируем даты в YYYY-MM-DD
          if (params[key] instanceof Date) {
            url.searchParams.append(key, formatDateParam(params[key]))
          } else {
            url.searchParams.append(key, params[key].toString())
          }
        }
      })

      // Добавляем пагинацию если не указана
      if (!params.page) url.searchParams.append('page', '1')
      if (!params.limit) url.searchParams.append('limit', '10')

      console.log('API Запрос:', url.toString())

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ошибка API:', errorText)

        // Пробуем запрос без dateFrom и dateTo если получили ошибку валидации
        if (response.status === 400 && (errorText.includes('date from') || errorText.includes('date to'))) {
          console.log('Пробуем запрос без dateFrom и dateTo...')
          return tryWithoutDates<T>(endpoint, params)
        }

        throw new Error(`Ошибка HTTP! статус: ${response.status}, сообщение: ${errorText}`)
      }

      const data = await response.json()
      console.log('Ответ API:', data)

      // Обрабатываем разные структуры ответа
      return parseApiResponse(data)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Произошла неизвестная ошибка'
      console.error('Ошибка API:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Функция для попытки без параметров дат
  const tryWithoutDates = async <T>(endpoint: string, params: Record<string, any>): Promise<T[]> => {
    try {
      const url = new URL(`${API_BASE_URL}/${endpoint}`)
      url.searchParams.append('key', API_KEY)

      // Добавляем все параметры кроме dateFrom и dateTo
      Object.keys(params).forEach(key => {
        if (key !== 'dateFrom' && key !== 'dateTo' &&
            params[key] !== null && params[key] !== undefined && params[key] !== '') {
          url.searchParams.append(key, params[key].toString())
        }
      })

      // Добавляем пагинацию если не указана
      if (!params.page) url.searchParams.append('page', '1')
      if (!params.limit) url.searchParams.append('limit', '10')

      console.log('API Запрос (без дат):', url.toString())

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка HTTP! статус: ${response.status}, сообщение: ${errorText}`)
      }

      const data = await response.json()
      return parseApiResponse(data)

    } catch (err) {
      throw new Error(`Не удалось получить данные даже без параметров дат: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`)
    }
  }

  // Функция для парсинга различных структур ответа API
  const parseApiResponse = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data
    } else if (data.data && Array.isArray(data.data)) {
      return data.data
    } else if (data.incomes && Array.isArray(data.incomes)) {
      return data.incomes
    } else if (data.stocks && Array.isArray(data.stocks)) {
      return data.stocks
    } else if (data.orders && Array.isArray(data.orders)) {
      return data.orders
    } else if (data.sales && Array.isArray(data.sales)) {
      return data.sales
    } else {
      console.warn('Неожиданная структура ответа API:', data)
      return []
    }
  }

  // Вспомогательная функция для форматирования даты в YYYY-MM-DD
  const formatDateParam = (date: Date | string): string => {
    if (typeof date === 'string') {
      return date.split('T')[0] // Если это строка ISO, берем только дату
    }
    return date.toISOString().split('T')[0]
  }

  return {
    loading,
    error,
    fetchData
  }
})
