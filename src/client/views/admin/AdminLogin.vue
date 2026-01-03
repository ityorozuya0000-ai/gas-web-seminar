<template>
  <div class="admin-login">
    <h2>管理者ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>パスワード</label>
        <input v-model="password" type="password" required />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-primary">ログイン</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { gasBackend } from '../../api/gas';

const password = ref('');
const error = ref('');
const router = useRouter();
const setLoading = inject('setLoading') as (loading: boolean, message?: string) => void;

const handleLogin = async () => {
  setLoading(true, '認証中...');
  try {
    const response = await gasBackend.run('adminLogin', password.value);
    if (response.success) {
      // Store password simply in sessionStorage for MVP
      sessionStorage.setItem('adminPassword', password.value);
      router.push('/admin/dashboard');
    } else {
      error.value = response.error || '認証に失敗しました';
    }
  } catch (e) {
    error.value = 'エラーが発生しました: ' + e;
  } finally {
    setLoading(false);
  }
};
</script>

<style scoped>
.admin-login {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}
.form-group {
  margin-bottom: 20px;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
.error {
  color: red;
  margin-bottom: 10px;
}
</style>
