<template>
  <div class="container">
    <h1 class="page-title">Поступления</h1>

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
        <label>Артикул поставщика:</label>
        <InputText v-model="filters.supplierArticle" placeholder="Введите артикул" />
      </div>

      <div class="filter-group">
        <label>Склад:</label>
        <InputText v-model="filters.warehouseName" placeholder="Введите склад" />
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

    <div v-if="!loading && incomes.length > 0" class="chart-container">
      <BarChart :chart-data="chartData" />
    </div>

    <div v-else-if="!loading && hasData" class="no-data">
      Нет данных для отображения графика
    </div>

    <DataTable
      v-if="hasData"
      :value="incomes"
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
      <Column field="techSize" header="Размер" sortable />
      <Column field="quantity" header="Количество" sortable />
      <Column field="totalPrice" header="Сумма" sortable>
        <template #body="{ data }">
          {{ formatCurrency(data.totalPrice) }}
        </template>
      </Column>
      <Column field="warehouseName" header="Склад" sortable />
      <Column field="status" header="Статус" sortable />
    </DataTable>

    <div v-if="hasData" class="result-info">
      Найдено записей: {{ incomes.length }}
    </div>

    <div v-if="!hasData && !loading" class="welcome-message">
      <Card>
        <template #title>Добро пожаловать!</template>
        <template #content>
          <p>Для просмотра данных о поступлениях укажите обязательные параметры:</p>
          <ul>
            <li><strong>Дата от</strong> - начало периода</li>
            <li><strong>Дата до</strong> - конец периода</li>
          </ul>
          <p>После заполнения этих полей нажмите "Применить фильтры".</p>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Income } from '@/stores/api'
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
const incomes = ref<Income[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const totalRecords = ref(0)
const hasData = ref(false)

const defaultDateTo = new Date()
const defaultDateFrom = new Date()
defaultDateFrom.setDate(defaultDateFrom.getDate() - 7)

const filters = ref({
  dateFrom: defaultDateFrom,
  dateTo: defaultDateTo,
  supplierArticle: '',
  warehouseName: ''
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
      dateTo: filters.value.dateTo
    }

    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.warehouseName) params.warehouseName = filters.value.warehouseName

    const response = await apiStore.fetchData<Income>('incomes', params)
    incomes.value = response
    totalRecords.value = response.length
    hasData.value = true
  } catch (error) {
    console.error('Ошибка загрузки поступлений:', error)
    hasData.value = false
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    supplierArticle: '',
    warehouseName: ''
  }
  hasData.value = false
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  fetchData(currentPage.value)
}

const chartData = computed(() => ({
  labels: incomes.value.slice(0, 20).map(i => i.date ? formatDate(i.date) : ''),
  datasets: [{
    label: 'Количество поступлений',
    data: incomes.value.slice(0, 20).map(i => i.quantity || 0),
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

onMounted(() => {
  fetchData(1)
})
</script>

<style scoped>
/* Все стили вынесены в global.css */
</style>
