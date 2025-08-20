<template>
  <div class="container">
    <h1 class="page-title">Заказы</h1>

    <div v-if="apiStore.error" class="error-message">
      <Message severity="error">Ошибка API: {{ apiStore.error }}</Message>
    </div>

    <div class="filters">
      <div class="filter-group required">
        <label>Дата от:*</label>
        <Calendar
          v-model="filters.dateFrom"
          dateFormat="yy-mm-dd"
          showIcon
          :class="{ 'p-invalid': !filters.dateFrom }"
          placeholder="Выберите дату"
        />
        <small v-if="!filters.dateFrom" class="required-hint">Обязательное поле</small>
      </div>

      <div class="filter-group required">
        <label>Дата до:*</label>
        <Calendar
          v-model="filters.dateTo"
          dateFormat="yy-mm-dd"
          showIcon
          :class="{ 'p-invalid': !filters.dateTo }"
          placeholder="Выберите дату"
        />
        <small v-if="!filters.dateTo" class="required-hint">Обязательное поле</small>
      </div>

      <div class="filter-group">
        <label>Артикул:</label>
        <InputText v-model="filters.supplierArticle" placeholder="Введите артикул" />
      </div>

      <div class="filter-group">
        <label>Бренд:</label>
        <InputText v-model="filters.brand" placeholder="Введите бренд" />
      </div>

      <div class="filter-actions">
        <Button
          label="Применить фильтры"
          @click="fetchData(1)"
          :loading="loading"
          :disabled="!filters.dateFrom || !filters.dateTo"
          class="orange-button"
        />
        <Button label="Сбросить" @click="resetFilters" severity="secondary" text />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <ProgressSpinner />
      <span>Загрузка данных...</span>
    </div>

    <div v-if="!loading && orders.length > 0" class="chart-container">
      <LineChart :chart-data="chartData" />
    </div>
    <div v-else-if="!loading" class="no-data">Нет данных для отображения графика</div>

    <DataTable
      v-if="orders.length > 0"
      :value="orders"
      paginator
      :rows="limit"
      :loading="loading"
      :totalRecords="totalRecords"
      @page="onPageChange"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
      class="orange-table"
    >
      <Column field="date" header="Дата" sortable>
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
      </Column>
      <Column field="supplierArticle" header="Артикул" sortable />
      <Column field="brand" header="Бренд" sortable />
      <Column field="totalPrice" header="Сумма" sortable>
        <template #body="{ data }">
          {{ formatCurrency(data.totalPrice) }}
        </template>
      </Column>
      <Column field="warehouseName" header="Склад" sortable />
      <Column field="isCancel" header="Отменен" sortable>
        <template #body="{ data }">
          <Tag :value="data.isCancel ? 'Да' : 'Нет'"
               :severity="data.isCancel ? 'danger' : 'success'" />
        </template>
      </Column>
      <Column field="subject" header="Предмет" sortable />
    </DataTable>

    <div v-if="orders.length > 0" class="result-info">
      Найдено записей: {{ orders.length }}
    </div>

    <div v-if="!orders.length && !loading" class="welcome-message">
      <Card>
        <template #title>Добро пожаловать!</template>
        <template #content>
          <p>Для просмотра данных о заказах укажите обязательные параметры:</p>
          <ul>
            <li><strong>Дата от</strong> - начало периода</li>
            <li><strong>Дата до</strong> - конец периода</li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Order } from '@/stores/api'
import LineChart from '@/components/LineChart.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const apiStore = useApiStore()
const orders = ref<Order[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const totalRecords = ref(0)

const defaultDateTo = new Date()
const defaultDateFrom = new Date()
defaultDateFrom.setDate(defaultDateFrom.getDate() - 7)

const filters = ref({
  dateFrom: defaultDateFrom,
  dateTo: defaultDateTo,
  supplierArticle: '',
  brand: ''
})

const fetchData = async (page: number = 1) => {
  if (!filters.value.dateFrom || !filters.value.dateTo) {
    apiStore.error = 'Пожалуйста, заполните обязательные поля: Дата от и Дата до'
    return
  }

  loading.value = true
  try {
    const params: any = {
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo,
      page,
      limit: limit.value
    }

    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.brand) params.brand = filters.value.brand

    const response = await apiStore.fetchData<Order>('orders', params)
    orders.value = response
    totalRecords.value = response.length
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    supplierArticle: '',
    brand: ''
  }
  fetchData(1)
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  fetchData(currentPage.value)
}

const chartData = computed(() => ({
  labels: orders.value.slice(0, 20).map(o => o.date ? formatDate(o.date) : ''),
  datasets: [{
    label: 'Сумма заказов',
    data: orders.value.slice(0, 20).map(o => o.totalPrice || 0),
    backgroundColor: '#FF8C00',
    borderColor: '#FF6B00',
    borderWidth: 2,
    fill: false
  }]
}))

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}

onMounted(() => fetchData(1))
</script>

<style scoped>
/* Все стили вынесены в global.css */
</style>
