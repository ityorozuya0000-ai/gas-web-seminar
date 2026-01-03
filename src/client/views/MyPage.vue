<template>
  <div class="my-page">
    <h2>マイページ</h2>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="data" class="booking-details">
      <div class="status-badge" :class="data.status.toLowerCase()">
        {{ data.status }}
      </div>
      
      <h3>{{ data.seminar.title }}</h3>
      <p><strong>開始日時:</strong> {{ formatDate(data.seminar.startAt) }}</p>
      
      <div class="user-info">
        <h4>参加者情報</h4>
        <p>お名前: {{ data.user.name }}</p>
        <p>メールアドレス: {{ data.user.email }}</p>
      </div>
      
      <div v-if="data.status === 'PAID'" class="paid-content">
        <h4>Zoom URL</h4>
        <div class="zoom-box">
          <a :href="data.zoomUrl" target="_blank">{{ data.zoomUrl }}</a>
          <p class="note">開催時間になりましたらこちらのURLからご参加ください。</p>
        </div>
      </div>
      
      <div v-if="data.status === 'PENDING'" class="pending-content">
        <p>お支払いが未完了です。予約時に送信された詳細メールをご確認のうえ、お支払いをお願いいたします。</p>
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
    error.value = 'アクセスが無効です：トークンがありません。';
    return;
  }

  setLoading(true, '予約情報を読み込み中...');
  try {
    const response = await gasBackend.run('getMyPageData', token);
    if (response.success && response.data) {
        data.value = response.data;
    } else {
        error.value = 'データの読み込みに失敗しました: ' + (response.error || '不明なエラー');
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
