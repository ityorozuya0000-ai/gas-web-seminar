<template>
  <div class="seminar-list">
    <h2>開催予定のセミナー</h2>
    <div v-if="seminars.length === 0" class="no-data">
      現在、予約可能なセミナーはありません。
    </div>
    <div v-else class="seminar-cards">
      <div v-for="seminar in seminars" :key="seminar.id" class="card">
        <h3>{{ seminar.title }}</h3>
        <p class="date">開催日: {{ formatDate(seminar.startAt) }}</p>
        <p class="price">参加費: ¥{{ seminar.price.toLocaleString() }}</p>
        <p class="capacity">残り枠: {{ seminar.remaining }} / {{ seminar.capacity }}</p>
        <p class="desc">{{ seminar.description }}</p>
        
        <button @click="goToBooking(seminar)" :disabled="seminar.remaining <= 0" class="btn-book">
          {{ seminar.remaining > 0 ? '予約する' : '満席' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { gasBackend } from '../api/gas';
import { Seminar } from '../../shared/types';

const seminars = ref<Seminar[]>([]);
const router = useRouter();
const setLoading = inject('setLoading') as (loading: boolean, message?: string) => void;

const fetchSeminars = async () => {
  setLoading(true, 'セミナー情報を取得中...');
  try {
    const response = await gasBackend.run('getSeminars');
    if (response.success && response.data) {
      seminars.value = response.data;
    } else {
      alert('セミナー情報の取得に失敗しました: ' + response.error);
    }
  } catch (e) {
    alert('Error: ' + e);
  } finally {
    setLoading(false);
  }
};

const goToBooking = (seminar: Seminar) => {
  router.push({ name: 'Booking', params: { id: seminar.id }, query: { title: seminar.title } });
};

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleString('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

onMounted(() => {
  fetchSeminars();
});
</script>

<style scoped>
.seminar-cards {
  display: grid;
  gap: 20px;
}

.card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background: #fafafa;
}

.btn-book {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-book:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
