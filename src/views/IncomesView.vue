<template>
  <div class="container">
    <h1>Поступления</h1>

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
        <label>Артикул поставщика:</label>
        <InputText v-model="filters.supplierArticle" placeholder="Введите артикул" />
      </div>
      <div class="filter-group">
        <label>Склад:</label>
        <InputText v-model="filters.warehouseName" placeholder="Введите склад" />
      </div>
      <Button label="Применить фильтры" @click="fetchData" :loading="loading" />
      <Button label="Сбросить" @click="resetFilters" severity="secondary" text />
    </div>

    <div class="chart-container">
      <BarChart :chart-data="chartData" v-if="incomes.length > 0" />
      <div v-else class="no-data">Нет данных для отображения графика</div>
    </div>

    <DataTable
      :value="incomes"
      paginator
      :rows="10"
      :loading="loading"
      :totalRecords="incomes.length"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
    >
      <Column field="date" header="Дата" sortable />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Income } from '@/stores/api'
import BarChart from '@/components/BarChart.vue'

// Компоненты PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const apiStore = useApiStore()
const incomes = ref<Income[]>([])
const loading = ref(false)

const filters = ref({
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
  supplierArticle: '',
  warehouseName: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.dateFrom) params.dateFrom = filters.value.dateFrom.toISOString().split('T')[0]
    if (filters.value.dateTo) params.dateTo = filters.value.dateTo.toISOString().split('T')[0]
    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.warehouseName) params.warehouseName = filters.value.warehouseName

    incomes.value = await apiStore.fetchData<Income>('incomes', params)
  } catch (error) {
    console.error('Error fetching incomes:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    dateFrom: null,
    dateTo: null,
    supplierArticle: '',
    warehouseName: ''
  }
  fetchData()
}

const chartData = computed(() => ({
  labels: incomes.value.slice(0, 20).map(i => i.date.split('T')[0]),
  datasets: [{
    label: 'Количество поступлений',
    data: incomes.value.slice(0, 20).map(i => i.quantity),
    backgroundColor: '#42A5F5',
    borderColor: '#1976D2',
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
/* Только специфичные для компонента стили */
.container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-container {
  height: 400px;
  margin: 2rem 0;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
