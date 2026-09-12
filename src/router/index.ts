import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import { getAuthState } from '../services/roleAuthService';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/students/:sectionName',
    name: 'SectionDetail',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/students/:sectionName/:subjectName',
    name: 'SubjectDetail',
    component: HomePage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards for authentication
router.beforeEach((to, from, next) => {
  const authState = getAuthState();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !authState.isAuthenticated) {
    next('/login');
  } else if (requiresGuest && authState.isAuthenticated) {
    next('/home');
  } else if (requiresAdmin && authState.role !== 'admin') {
    next('/home');
  } else {
    next();
  }
});

export default router
