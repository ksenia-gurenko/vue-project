<template>
  <div class="container">
    <h1 class="page-title">Продажи</h1>

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
        <label>Категория:</label>
        <InputText v-model="filters.category" placeholder="Введите категорию" />
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

    <div v-if="!loading && sales.length > 0" class="chart-container">
      <BarChart :chart-data="chartData" />
    </div>
    <div v-else-if="!loading" class="no-data">Нет данных для отображения графика</div>

    <DataTable
      v-if="sales.length > 0"
      :value="sales"
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
      <Column field="category" header="Категория" sortable />
      <Column field="totalPrice" header="Сумма" sortable>
        <template #body="{ data }">
          {{ formatCurrency(data.totalPrice) }}
        </template>
      </Column>
      <Column field="forPay" header="К оплате" sortable>
        <template #body="{ data }">
          {{ formatCurrency(data.forPay) }}
        </template>
      </Column>
      <Column field="warehouseName" header="Склад" sortable />
    </DataTable>

    <div v-if="sales.length > 0" class="result-info">
      Найдено записей: {{ sales.length }}
    </div>

    <div v-if="!sales.length && !loading" class="welcome-message">
      <Card>
        <template #title>Добро пожаловать!</template>
        <template #content>
          <p>Для просмотра данных о продажах укажите обязательные параметры:</p>
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
import { useApiStore, type Sale } from '@/stores/api'
import BarChart from '@/components/BarChart.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'

const apiStore = useApiStore()
const sales = ref<Sale[]>([])
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
  category: ''
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
    if (filters.value.category) params.category = filters.value.category

    const response = await apiStore.fetchData<Sale>('sales', params)
    sales.value = response
    totalRecords.value = response.length
  } catch (error) {
    console.error('Error fetching sales:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    supplierArticle: '',
    category: ''
  }
  fetchData(1)
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  fetchData(currentPage.value)
}

const chartData = computed(() => ({
  labels: sales.value.slice(0, 20).map(s => s.date ? formatDate(s.date) : ''),
  datasets: [{
    label: 'Сумма продаж',
    data: sales.value.slice(0, 20).map(s => s.totalPrice || 0),
    backgroundColor: '#FF8C00',
    borderColor: '#FF6B00',
    borderWidth: 2
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
