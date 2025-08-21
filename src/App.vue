<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h2 class="nav-title">ЛОГО</h2>
        <div class="nav-links">
          <RouterLink to="/incomes" class="nav-link">Поступления</RouterLink>
          <RouterLink to="/orders" class="nav-link">Заказы</RouterLink>
          <RouterLink to="/sales" class="nav-link">Продажи</RouterLink>
          <RouterLink to="/stocks" class="nav-link">Склады</RouterLink>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #fafafa;
}

.navbar {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #333;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-bottom: 2px solid #FFC107;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: #FFC107;
}

.nav-link.router-link-active {
  background-color: #FFC107;
  color: #333;
  border-color: #FFA000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
  background: linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%);
}
</style>
