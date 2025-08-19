<template>
  <div class="container">
    <h1>Склады</h1>

    <div class="filters">
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
      <Button label="Применить фильтры" @click="fetchData" :loading="loading" />
      <Button label="Сбросить" @click="resetFilters" severity="secondary" text />
    </div>

    <div class="chart-container">
      <BarChart :chart-data="chartData" v-if="stocks.length > 0" />
      <div v-else class="no-data">Нет данных для отображения графика</div>
    </div>

    <DataTable
      :value="stocks"
      paginator
      :rows="10"
      :loading="loading"
      :totalRecords="stocks.length"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Показано {first} - {last} из {totalRecords} записей"
    >
      <Column field="lastChangeDate" header="Дата изменения" sortable />
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
      <Column field="inWayFromClient" header="В пути от клиента" sortable />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore, type Stock } from '@/stores/api'
import BarChart from '@/components/BarChart.vue'

// Компоненты PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const apiStore = useApiStore()
const stocks = ref<Stock[]>([])
const loading = ref(false)

const filters = ref({
  supplierArticle: '',
  warehouseName: '',
  brand: '',
  category: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.supplierArticle) params.supplierArticle = filters.value.supplierArticle
    if (filters.value.warehouseName) params.warehouseName = filters.value.warehouseName
    if (filters.value.brand) params.brand = filters.value.brand
    if (filters.value.category) params.category = filters.value.category

    stocks.value = await apiStore.fetchData<Stock>('stocks', params)
  } catch (error) {
    console.error('Error fetching stocks:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    supplierArticle: '',
    warehouseName: '',
    brand: '',
    category: ''
  }
  fetchData()
}

const chartData = computed(() => ({
  labels: stocks.value.slice(0, 20).map(s => s.supplierArticle),
  datasets: [{
    label: 'Количество на складе',
    data: stocks.value.slice(0, 20).map(s => s.quantity),
    backgroundColor: 'rgba(255, 159, 64, 0.2)',
    borderColor: 'rgba(255, 159, 64, 1)',
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
