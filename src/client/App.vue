<template>
  <div class="app-container">
    <header>
      <h1>Web Seminar System</h1>
      <nav>
        <router-link to="/">Seminars</router-link> |
        <!-- Check My Page is usually via token link, but maybe good to have a generic login/check link if implemented -->
      </nav>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" @set-loading="setLoading" />
        </transition>
      </router-view>
    </main>

    <LoadingSpinner :loading="isLoading" :message="loadingMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import LoadingSpinner from './components/ui/LoadingSpinner.vue';

const isLoading = ref(false);
const loadingMessage = ref('Loading...');

const setLoading = (loading: boolean, message: string = 'Loading...') => {
  isLoading.value = loading;
  loadingMessage.value = message;
};

// Provide loading capability to all children
provide('setLoading', setLoading);
</script>

<style>
/* Global Styles */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f7f9fc;
  color: #333;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
  text-align: center;
}

h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
