import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/incomes',
    name: 'Incomes',
    component: () => import('@/views/IncomesView.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue')
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('@/views/SalesView.vue')
  },
  {
    path: '/stocks',
    name: 'Stocks',
    component: () => import('@/views/StocksView.vue')
  },
  {
    path: '/',
    redirect: '/incomes'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/incomes'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
