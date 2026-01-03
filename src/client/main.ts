import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import SeminarList from './views/SeminarList.vue';
import BookingForm from './views/BookingForm.vue';
import MyPage from './views/MyPage.vue';

// Routes
const routes = [
    { path: '/', name: 'Home', component: SeminarList },
    { path: '/book/:id', name: 'Booking', component: BookingForm },
    { path: '/mypage', name: 'MyPage', component: MyPage } // ?token=...
];

// Router (Hash mode for GAS compatibility)
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');
