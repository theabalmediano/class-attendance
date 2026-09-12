<template>
  <ion-page>
    <div class="admin-shell">
      <button
        v-if="showMobileMenuToggle"
        class="mobile-menu-toggle"
        type="button"
        @click="isSidebarOpen = !isSidebarOpen"
        aria-label="Toggle navigation menu"
        :aria-expanded="isSidebarOpen"
      >
        <ion-icon :icon="menuOutline"></ion-icon>
      </button>
      <button
        v-if="isSidebarOpen"
        class="sidebar-backdrop"
        type="button"
        aria-label="Close navigation menu"
        @click="isSidebarOpen = false"
      ></button>
      <aside class="sidebar" :class="{ 'sidebar-closed': !isSidebarOpen }">
        <div class="sidebar-brand">Attendance</div>

        <nav class="sidebar-nav">
          <button
            class="nav-item"
            :class="{ active: isAttendanceRoute }"
            @click="navigateTo('/home')"
          >
            <ion-icon :icon="calendarOutline" class="nav-icon"></ion-icon>
            <span>Attendance</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: isStudentsRoute }"
            @click="navigateTo('/students')"
          >
            <ion-icon :icon="peopleOutline" class="nav-icon"></ion-icon>
            <span>Students</span>
          </button>
        </nav>
      </aside>

      <main class="content-panel">
        <ion-content :fullscreen="true">
          <Transition name="page-transition" mode="out-in">
            <component :is="currentPageComponent" :key="currentPath" />
          </Transition>
        </ion-content>
      </main>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { calendarOutline, menuOutline, peopleOutline } from 'ionicons/icons';
import AttendanceTracker from '../components/AttendanceTracker-v2.vue';
import StudentsPage from './StudentsPage.vue';
import SectionDetailPage from './SectionDetailPage.vue';
import SubjectDetailPage from './SubjectDetailPage.vue';
import { currentRole } from '../services/roleAuthService';

const route = useRoute();
const router = useRouter();
const isSidebarOpen = ref(typeof window === 'undefined' || window.innerWidth > 760);
const isAdmin = computed(() => currentRole.value === 'admin');
const currentPath = computed(() => route?.path || '');
const isAttendanceRoute = computed(() => currentPath.value === '/home');
const isStudentsRoute = computed(() => currentPath.value === '/students');
const isSubjectDetailRoute = computed(() => currentPath.value.split('/').length === 4);
const isSectionDetailRoute = computed(() => currentPath.value.startsWith('/students/'));
const showMobileMenuToggle = computed(() => (isAttendanceRoute.value || isStudentsRoute.value) && (!isSectionDetailRoute.value && !isSubjectDetailRoute.value));
const currentPageComponent = computed(() => {
  if (isAttendanceRoute.value) return AttendanceTracker;
  if (isStudentsRoute.value) return StudentsPage;
  if (isSubjectDetailRoute.value) return SubjectDetailPage;
  if (isSectionDetailRoute.value) return SectionDetailPage;
  return AttendanceTracker;
});

const navigateTo = (path: string) => {
  router.push(path);
  if (typeof window !== 'undefined' && window.innerWidth <= 760) {
    isSidebarOpen.value = false;
  }
};

watch(() => route?.fullPath, () => {
  if (typeof window !== 'undefined' && window.innerWidth <= 760) {
    isSidebarOpen.value = false;
  }
});
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.sidebar {
  position: relative;
  z-index: 10;
  width: 220px;
  background: rgba(15, 23, 42, 0.92);
  border-right: 1px solid rgba(59, 130, 246, 0.3);
  padding: 20px 14px;
  box-sizing: border-box;
}

.sidebar-brand {
  padding: 12px 10px 20px;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 14px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  color: #dbeafe;
  border-radius: 10px;
  padding: 12px 10px;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(96, 165, 250, 0.6);
  color: #ffffff;
}

.nav-icon {
  font-size: 18px;
}

.content-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.content-panel ion-content {
  position: relative;
  flex: 1;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.18s ease, transform 0.22s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.mobile-menu-toggle {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1002;
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 38px;
  margin: 10px 12px 0;
  border: 1px solid rgba(96, 165, 250, 0.6);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.95);
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 760px) {
  .admin-shell {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 1000;
    width: 100%;
    max-width: 280px;
    height: 100vh;
    flex-shrink: 0;
    border-right: 1px solid rgba(59, 130, 246, 0.3);
    border-bottom: none;
    padding-top: 64px;
    transition: transform 0.2s ease;
  }

  .sidebar.sidebar-closed {
    display: block;
    transform: translateX(-105%);
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: block;
    border: 0;
    background: rgba(2, 6, 23, 0.62);
  }

  .content-panel {
    width: 100%;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .nav-item {
    flex: 1 1 180px;
  }
}
</style>
