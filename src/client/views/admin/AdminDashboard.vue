<template>
  <div class="admin-dashboard">
    <div class="header">
      <h2>管理者ダッシュボード</h2>
      <button @click="openEditor(null)" class="btn-primary">新規セミナー作成</button>
    </div>

    <table class="seminar-table">
      <thead>
        <tr>
          <th>タイトル</th>
          <th>開催日時</th>
          <th>予約/定員</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="seminar in seminars" :key="seminar.id">
          <td>{{ seminar.title }}</td>
          <td>{{ formatDate(seminar.startAt) }}</td>
          <td>{{ seminar.booked_count || 0 }} / {{ seminar.capacity }}</td>
          <td>
            <button @click="openEditor(seminar)">編集</button>
            <button @click="deleteSeminar(seminar)" class="btn-danger">削除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showEditor" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editingSeminar.id ? 'セミナー編集' : '新規セミナー作成' }}</h3>
        <form @submit.prevent="saveSeminar">
          <div class="form-group">
            <label>タイトル</label>
            <input v-model="editingSeminar.title" required />
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>開始日時</label>
              <input v-model="editingSeminar.startAt" type="datetime-local" required />
            </div>
            <div class="form-group half">
              <label>終了日時</label>
              <input v-model="editingSeminar.endAt" type="datetime-local" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>定員</label>
              <input v-model.number="editingSeminar.capacity" type="number" required />
            </div>
            <div class="form-group half">
              <label>参加費 (円)</label>
              <input v-model.number="editingSeminar.price" type="number" required />
            </div>
          </div>
          <div class="form-group">
            <label>Zoom URL (任意)</label>
            <input v-model="editingSeminar.zoom_url" type="url" />
          </div>
          <div class="form-group">
            <label>詳細説明</label>
            <textarea v-model="editingSeminar.description" rows="4"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditor">キャンセル</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { gasBackend } from '../../api/gas';
import { Seminar } from '../../../shared/types';

const router = useRouter();
const setLoading = inject('setLoading') as (loading: boolean, message?: string) => void;
const seminars = ref<Seminar[]>([]);
const showEditor = ref(false);

const defaultSeminar: Partial<Seminar> = {
  title: '',
  startAt: '',
  endAt: '',
  capacity: 10,
  price: 0,
  description: '',
  remaining: 10,
  zoom_url: '',
  booked_count: 0
};

const editingSeminar = ref<any>({ ...defaultSeminar });

const getPassword = () => sessionStorage.getItem('adminPassword') || '';

const fetchSeminars = async () => {
  setLoading(true, 'データ取得中...');
  try {
    // For admin, we might want a different API that returns ALL seminars (including past), 
    // but for now reusing getSeminars is fine for MVP.
    const response = await gasBackend.run('getSeminars');
    if (response.success && response.data) {
      seminars.value = response.data;
    }
  } catch (e) {
    alert('エラー: ' + e);
  } finally {
    setLoading(false);
  }
};

const openEditor = (seminar: Seminar | null) => {
  if (seminar) {
    // Clone to avoid editing directly in list
    editingSeminar.value = JSON.parse(JSON.stringify(seminar));
    // Check if date needs formatting for input type="datetime-local"
    // Ideally use data formatting libs, here simplified assuming string fits or simple conversion
  } else {
    editingSeminar.value = { ...defaultSeminar };
  }
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
};

const saveSeminar = async () => {
  setLoading(true, '保存中...');
  try {
    const seminarData = { ...editingSeminar.value } as Seminar;
    // ensure remaining is updated based on capacity if new? 
    // Backend logic might be better but let's send what we have.
    
    const response = await gasBackend.run('saveSeminar', seminarData, getPassword());
    if (response.success) {
      alert('保存しました');
      closeEditor();
      fetchSeminars();
    } else {
      alert('保存失敗: ' + response.error);
    }
  } catch (e) {
    alert('エラー: ' + e);
  } finally {
    setLoading(false);
  }
};

const deleteSeminar = async (seminar: Seminar) => {
  if (!confirm(`「${seminar.title}」を削除してもよろしいですか？`)) return;

  setLoading(true, '削除中...');
  try {
    const response = await gasBackend.run('deleteSeminar', seminar.id, getPassword());
    if (response.success) {
      alert('削除しました');
      fetchSeminars();
    } else {
      alert('削除失敗: ' + response.error);
    }
  } catch (e) {
    alert('エラー: ' + e);
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
  if (!getPassword()) {
    router.push('/admin/login');
    return;
  }
  fetchSeminars();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.seminar-table {
  width: 100%;
  border-collapse: collapse;
}
.seminar-table th, .seminar-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-left: 5px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}
.form-row {
  display: flex;
  gap: 10px;
}
.half { flex: 1; }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; }
input, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
