<template>
  <div class="booking-form">
    <h2>Book Seminar: {{ seminarTitle }}</h2>
    <form @submit.prevent="submitBooking">
      <div class="form-group">
        <label>Name</label>
        <input v-model="form.name" required placeholder="Yamada Taro" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" required placeholder="taro@example.com" />
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input v-model="form.dob" type="date" required />
      </div>
      
      <div class="actions">
        <button type="button" @click="$router.back()" class="btn-secondary">Back</button>
        <button type="submit" class="btn-primary">Proceed to Payment</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gasBackend } from '../api/gas';
import { BookingRequest } from '../../shared/types';

const route = useRoute();
const router = useRouter();
const setLoading = inject('setLoading') as (loading: boolean, message?: string) => void;

const seminarId = route.params.id as string;
const seminarTitle = route.query.title as string || 'Unknown Seminar';

const form = ref({
  name: '',
  email: '',
  dob: ''
});

const submitBooking = async () => {
  if (!confirm('Proceed to booking?')) return;
  
  setLoading(true, 'Processing booking...');
  try {
    const request: BookingRequest = {
      seminarId: seminarId,
      user: form.value
    };
    
    const response = await gasBackend.run('bookSeminar', request);
    
    if (response.success) {
      // Navigate to success page or show message
      // If we have a payment link, we might redirect there validation first
      if (response.paymentLink) {
        window.location.href = response.paymentLink; // Direct redirect to Square
        // OR show a success page with the link
        // router.push({ name: 'Success', query: { link: response.paymentLink } });
      } else {
        alert('Booking successful! Please check your email.');
        router.push('/');
      }
    } else {
        alert('Booking Failed: ' + response.message);
    }
  } catch (e) {
    alert('Error: ' + e);
  } finally {
    setLoading(false);
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
