<template>
  <div class="container">
    <h1>Продажи</h1>

    <div class="filters">
      <div class="filter-group">
        <label>Дата от:</label>
        <Calendar v-model="filters.dateFrom" dateFormat="yy-mm-dd" showIcon />
      </div>
      <div class="filter-group">
        <label>Дата до:</label>
        <Calendar v-model="filters.dateTo" dateFormat="yy-mm-dd" showIcon />
      </div>
      <div class="filter-group">
        <label>Артикул:</label>
        <InputText v-model="filters.supplierArticle" placeholder="Введите артикул" />
      </div>
      <div class="filter-group">
        <label>Категория:</label>
        <InputText v-model="filters.category" placeholder="Введите категорию" />
      </div>
      <Button label="Применить фильтры" @click="fetchData" :loading="loading" />
      <Button label="Сбросить" @click="resetFilters" severity="secondary" text />
    </div>

    <div class="chart-container">
      <BarChart :chart-data="chartData" v-if="sales.length > 0" />
      <div v-else class="no-data">Нет данных для отображения графика</div>
    </div>

    <DataTable
      :value="sales"
      paginator
      :rows="10"
      :loading="loading"
      :totalRecords="sales.length"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
    >
      <Column field="date" header="Дата" sortable />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Sale } from '@/stores/api'
import BarChart from '@/components/BarChart.vue'

// Компоненты PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const apiStore = useApiStore()
const sales = ref<Sale[]>([])
const loading = ref(false)

const filters = ref({
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
  supplierArticle: '',
  category: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom.toISOString().split('T')[0]
    if (filters.value.dateTo) params.dateTo = filters.value.dateTo.toISOString().split('T')[0]
    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.category) params.category = filters.value.category

    sales.value = await apiStore.fetchData<Sale>('sales', params)
  } catch (error) {
    console.error('Error fetching sales:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: null,
    dateTo: null,
    supplierArticle: '',
    category: ''
  }
  fetchData()
}

const chartData = computed(() => ({
  labels: sales.value.slice(0, 20).map(s => s.date.split('T')[0]),
  datasets: [{
    label: 'Сумма продаж',
    data: sales.value.slice(0, 20).map(s => s.totalPrice),
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    borderColor: 'rgba(153, 102, 255, 1)',
    borderWidth: 1
  }]
}))

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
}

.chart-container {
  height: 400px;
  margin: 2rem 0;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}
</style>
