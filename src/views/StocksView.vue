<template>
  <div class="container">
    <h1 class="page-title">Склады</h1>

    <div v-if="apiStore.error" class="error-message">
      <Message severity="error">Ошибка API: {{ apiStore.error }}</Message>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Дата от (опционально):</label>
        <Calendar
          v-model="filters.dateFrom"
          dateFormat="yy-mm-dd"
          showIcon
          placeholder="Выберите дату (необязательно)"
        />
        <small class="date-hint">Параметр может быть не обязательным</small>
      </div>

      <div class="filter-group">
        <label>Дата до (опционально):</label>
        <Calendar
          v-model="filters.dateTo"
          dateFormat="yy-mm-dd"
          showIcon
          placeholder="Выберите дату (необязательно)"
        />
        <small class="date-hint">Параметр может быть не обязательным</small>
      </div>

      <div class="filter-group">
        <label>Артикул:</label>
        <InputText v-model="filters.supplierArticle" placeholder="Введите артикул" />
      </div>
      <div class="filter-group">
        <label>Склад:</label>
        <InputText v-model="filters.warehouseName" placeholder="Введите склад" />
      </div>
      <div class="filter-group">
        <label>Бренд:</label>
        <InputText v-model="filters.brand" placeholder="Введите бренд" />
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
          class="orange-button"
        />
        <Button label="Сбросить" @click="resetFilters" severity="secondary" text />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <ProgressSpinner />
      <span>Загрузка данных...</span>
    </div>

    <div v-if="!loading && stocks.length > 0" class="chart-container">
      <BarChart :chart-data="chartData" />
    </div>
    <div v-else-if="!loading" class="no-data">Нет данных для отображения графика</div>

    <DataTable
      v-if="stocks.length > 0"
      :value="stocks"
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
      <Column field="lastChangeDate" header="Дата изменения" sortable>
        <template #body="{ data }">
          {{ formatDate(data.lastChangeDate) }}
        </template>
      </Column>
      <Column field="supplierArticle" header="Артикул" sortable />
      <Column field="brand" header="Бренд" sortable />
      <Column field="category" header="Категория" sortable />
      <Column field="quantity" header="Количество" sortable />
      <Column field="quantityFull" header="Полное количество" sortable />
      <Column field="warehouseName" header="Склад" sortable />
      <Column field="Price" header="Цена" sortable>
        <template #body="{ data }">
          {{ formatCurrency(data.Price) }}
        </template>
      </Column>
      <Column field="inWayToClient" header="В пути к клиенту" sortable />
      <Column field="inWayFromClient" header="В пути от клиенту" sortable />
    </DataTable>

    <div v-if="stocks.length > 0" class="result-info">
      Найдено записей: {{ stocks.length }}
    </div>

    <div v-if="!loading && stocks.length === 0" class="no-data-message">
      <Card>
        <template #title>Данные не найдены</template>
        <template #content>
          <p>Попробуйте изменить параметры фильтрации.</p>
          <p><small>API может не требовать параметры дат. Попробуйте оставить их пустыми.</small></p>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Stock } from '@/stores/api'
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
const stocks = ref<Stock[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const totalRecords = ref(0)

const filters = ref({
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
  supplierArticle: '',
  warehouseName: '',
  brand: '',
  category: ''
})

const fetchData = async (page: number = 1) => {
  loading.value = true
  try {
    const params: any = {
      page,
      limit: limit.value
    }

    // Добавляем только те параметры, которые указаны
    if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom
    if (filters.value.dateTo) params.dateTo = filters.value.dateTo
    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.warehouseName) params.warehouseName = filters.value.warehouseName
    if (filters.value.brand) params.brand = filters.value.brand
    if (filters.value.category) params.category = filters.value.category

    const response = await apiStore.fetchData<Stock>('stocks', params)
    stocks.value = response
    totalRecords.value = response.length
  } catch (error) {
    console.error('Error fetching stocks:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: null,
    dateTo: null,
    supplierArticle: '',
    warehouseName: '',
    brand: '',
    category: ''
  }
  fetchData(1)
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  fetchData(currentPage.value)
}

const chartData = computed(() => ({
  labels: stocks.value.slice(0, 20).map(s => s.supplierArticle || ''),
  datasets: [{
    label: 'Количество на складе',
    data: stocks.value.slice(0, 20).map(s => s.quantity || 0),
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
.no-data-message {
  margin: 2rem 0;
}

.date-hint {
  color: var(--text-light);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.no-data-message ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.no-data-message li {
  margin: 0.25rem 0;
}
</style>
