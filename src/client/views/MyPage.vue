<template>
  <div class="my-page">
    <h2>My Page</h2>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="data" class="booking-details">
      <div class="status-badge" :class="data.status.toLowerCase()">
        {{ data.status }}
      </div>
      
      <h3>{{ data.seminar.title }}</h3>
      <p><strong>Starts:</strong> {{ formatDate(data.seminar.startAt) }}</p>
      
      <div class="user-info">
        <h4>Attendee Info</h4>
        <p>Name: {{ data.user.name }}</p>
        <p>Email: {{ data.user.email }}</p>
      </div>
      
      <div v-if="data.status === 'PAID'" class="paid-content">
        <h4>Zoom URL</h4>
        <div class="zoom-box">
          <a :href="data.zoomUrl" target="_blank">{{ data.zoomUrl }}</a>
          <p class="note">Please access this URL at the scheduled time.</p>
        </div>
      </div>
      
      <div v-if="data.status === 'PENDING'" class="pending-content">
        <p>Payment is pending. Please check your email for the payment link used during booking.</p>
        <!-- Retry payment link could be added here if we return it in update logic -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { gasBackend } from '../api/gas';
import { MyPageData } from '../../shared/types';

const route = useRoute();
const setLoading = inject('setLoading') as (loading: boolean, message?: string) => void;

const error = ref('');
const data = ref<MyPageData | null>(null);

const fetchMyPage = async () => {
  const token = route.query.token as string;
  if (!token) {
    error.value = 'Invalid Access: No token provided.';
    return;
  }

  setLoading(true, 'Loading booking details...');
  try {
    const response = await gasBackend.run('getMyPageData', token);
    if (response.success && response.data) {
        data.value = response.data;
    } else {
        error.value = 'Failed to load data: ' + (response.error || 'Unknown error');
    }
  } catch (e) {
    error.value = 'Error: ' + e;
  } finally {
    setLoading(false);
  }
};

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleString('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

onMounted(() => {
  fetchMyPage();
});
</script>

<style scoped>
.my-page {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
.error {
  color: red;
  font-weight: bold;
}
.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
}
.status-badge.paid { background-color: #27ae60; }
.status-badge.pending { background-color: #f39c12; }
.status-badge.cancelled { background-color: #c0392b; }

.zoom-box {
  background: #e8f8f5;
  padding: 15px;
  border: 1px dashed #27ae60;
  border-radius: 4px;
}
</style>
