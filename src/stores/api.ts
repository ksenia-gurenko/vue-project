// src/stores/api.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Income, Order, Sale, Stock } from '../types'

const API_BASE_URL = 'http://109.73.206.144:6969/api'
/*const API_BASE_URL = '/api' // теперь будет проксироваться через Vite*/
const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'

export const useApiStore = defineStore('api', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> => {
  loading.value = true
  error.value = null

  try {
    const url = new URL(`${API_BASE_URL}/${endpoint}`)
    url.searchParams.append('key', API_KEY)

    // Для эндпоинтов, которые не требуют dateFrom и dateTo
    const endpointsWithoutDate = ['stocks']

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

      // Для эндпоинтов stocks пробуем без date параметров
      if (endpointsWithoutDate.includes(endpoint) &&
          response.status === 400 &&
          (errorText.includes('date from') || errorText.includes('date to'))) {
        console.log('Пробуем запрос без dateFrom и dateTo для stocks...')
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
}finally {
      loading.value = false
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
      return date.split('T')[0]
    }
    return date.toISOString().split('T')[0]
  }

  return {
    loading,
    error,
    fetchData
  }
})

// Экспортируем типы для удобства
export type { Income, Order, Sale, Stock }
