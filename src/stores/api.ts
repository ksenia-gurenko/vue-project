// src/stores/api.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Income, Order, Sale, Stock } from '../types'

const API_BASE_URL = 'http://109.73.206.144:6969/api'
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

      // Добавляем параметры
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          if (params[key] instanceof Date) {
            url.searchParams.append(key, formatDateParam(params[key]))
          } else {
            url.searchParams.append(key, params[key].toString())
          }
        }
      })

      // Добавляем пагинацию по умолчанию
      if (!params.page) url.searchParams.append('page', '1')
      if (!params.limit) url.searchParams.append('limit', '10')

      console.log('API Запрос:', url.toString())

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
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
