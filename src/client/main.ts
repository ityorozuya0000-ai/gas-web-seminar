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
    { path: '/mypage', name: 'MyPage', component: MyPage },
    { path: '/admin/login', name: 'AdminLogin', component: () => import('./views/admin/AdminLogin.vue') },
    { path: '/admin/dashboard', name: 'AdminDashboard', component: () => import('./views/admin/AdminDashboard.vue'), meta: { requiresAuth: true } }
];

// Router (Hash mode for GAS compatibility)
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const isAdmin = !!sessionStorage.getItem('adminPassword');

    if (to.meta.requiresAuth && !isAdmin) {
        next('/admin/login');
    } else {
        next();
    }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
