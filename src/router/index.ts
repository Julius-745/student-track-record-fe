import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AppLayout from '@/layouts/AppLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: 'dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
        {
          path: 'profile/change-password',
          name: 'change-password',
          component: () => import('@/views/profile/ChangePasswordView.vue'),
        },
        {
          path: 'siswa',
          name: 'siswa',
          component: () => import('@/views/siswa/SiswaListView.vue'),
        },
        {
          path: 'siswa/:id',
          name: 'siswa-detail',
          component: () => import('@/views/siswa/SiswaDetailView.vue'),
        },
        {
          path: 'guru',
          name: 'guru',
          component: () => import('@/views/guru/GuruListView.vue'),
          meta: { role: 'admin' },
        },
        {
          path: 'pelaporan',
          name: 'pelaporan',
          component: () => import('@/views/pelaporan/PelaporanListView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Ensure we check auth status from localStorage on first load
  if (!authStore.isAuthenticated) {
    authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    // Role based guard
    next('/login')
  } else {
    next()
  }
})

export default router
