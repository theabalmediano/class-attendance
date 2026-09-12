<template>
  <ion-page>
    <ion-content class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
          <ion-icon :icon="checkmarkCircle" class="auth-icon"></ion-icon>
          <h1>Attendance Tracker</h1>
          <p>Manage your class attendance records</p>
        </div>

        <div class="form-container" v-if="!isAuthenticated">
          <div class="tab-buttons">
            <button
              :class="['tab-btn', { active: isLoginMode }]"
              @click="setAuthMode(true)"
            >
              Login
            </button>
            <button
              :class="['tab-btn', { active: !isLoginMode }]"
              @click="setAuthMode(false)"
            >
              Register
            </button>
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Full Name</ion-label>
              <ion-input
                v-model="fullName"
                type="text"
                placeholder="Enter full name"
              ></ion-input>
            </ion-item>
          </div>

          <div v-if="!isLoginMode && role === 'student'" class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Gender</ion-label>
              <ion-select v-model="gender">
                <ion-select-option value="Female">Female</ion-select-option>
                <ion-select-option value="Male">Male</ion-select-option>
                <ion-select-option value="Other">Other</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Username</ion-label>
              <ion-input
                v-model="username"
                type="text"
                placeholder="Enter username"
                @ion-input="clearError"
              ></ion-input>
            </ion-item>
          </div>

          <div class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Password</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="Enter password"
                @ion-input="clearError"
              ></ion-input>
            </ion-item>
          </div>

          <div v-if="!isLoginMode && role === 'student'" class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Section</ion-label>
              <ion-select v-model="section">
                <ion-select-option v-for="item in sections" :key="item" :value="item">{{ item }}</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div v-if="!isLoginMode && role === 'student'" class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Subject</ion-label>
              <ion-select v-model="subject">
                <ion-select-option v-for="item in subjects" :key="item" :value="item">{{ item }}</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <ion-item class="dark-item">
              <ion-label position="stacked">Role</ion-label>
              <ion-input value="Student" readonly></ion-input>
            </ion-item>
          </div>

          <div v-if="displayedError" class="error-message">
            <ion-icon :icon="alertCircle"></ion-icon>
            {{ displayedError }}
          </div>

          <ion-button
            expand="block"
            @click="handleAuth"
            :disabled="!username || !password || loading"
          >
            <ion-spinner v-if="loading" slot="start"></ion-spinner>
            {{ isLoginMode ? 'Login' : 'Register' }}
          </ion-button>
        </div>

          <div class="logged-in-section" v-else>
            <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
            <h2>Welcome!</h2>
            <p class="user-email">{{ username }}</p>
            <p class="user-role">{{ role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student' }}</p>
            <ion-button expand="block" @click="handleLogout" :disabled="loading">
              <ion-spinner v-if="loading" slot="start"></ion-spinner>
              Logout
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  alertController
} from '@ionic/vue';
import { checkmarkCircle, alertCircle } from 'ionicons/icons';
import { login, register, logout, isAuthenticated, currentUsername, currentRole, getAuthState } from '../services/roleAuthService';
import { useClassCatalog } from '../services/classCatalogService';

const router = useRouter();

const fullName = ref('');
const gender = ref('Female');
const username = ref('');
const password = ref('');
const section = ref('A');
const subject = ref('Math');
const role = ref<'student' | 'admin'>('student');
const isLoginMode = ref(true);
const loading = ref(false);
const error = ref<string | null>(null);
const { sections, subjects } = useClassCatalog();
const displayedError = computed(() => (
  isLoginMode.value && error.value === 'Registration failed' ? null : error.value
));

const clearError = () => {
  if (error.value) error.value = null;
};

const setAuthMode = (loginMode: boolean) => {
  isLoginMode.value = loginMode;
  clearError();
};

onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/home');
  }
});

const handleAuth = async () => {
  if (isLoginMode.value) {
    if (!username.value.trim() || !password.value.trim()) {
      error.value = 'Please fill in all fields';
      return;
    }
  } else {
    if (!fullName.value.trim() || !username.value.trim() || !password.value.trim()) {
      error.value = 'Please fill in all required fields';
      return;
    }
  }

  loading.value = true;
  error.value = null;

  try {
    if (isLoginMode.value) {
      const success = await login(username.value, password.value);
      if (success) {
        router.push('/home');
      } else {
        error.value = getAuthState().error || 'Login failed';
      }
    } else {
      const success = await register(
        username.value,
        password.value,
        role.value,
        fullName.value,
        role.value === 'student' ? gender.value : '',
        role.value === 'student' ? section.value : '',
        role.value === 'student' ? subject.value : ''
      );
      if (success) {
        clearError();
        setAuthMode(true);
        alertController.create({
          header: 'Success',
          message: 'Account created! You can now login.',
          buttons: ['OK']
        }).then(a => a.present());
        fullName.value = '';
        gender.value = 'Female';
        username.value = '';
        password.value = '';
        section.value = 'A';
        subject.value = 'Math';
      } else {
        error.value = getAuthState().error || 'Registration failed';
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  loading.value = true;
  await logout();
  loading.value = false;
  router.push('/');
};
</script>

<style scoped>
.auth-container {
  --background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.auth-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
  display: block;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.success-icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
  display: block;
  text-align: center;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.auth-header h1 {
  margin: 0;
  font-size: 28px;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 700;
}

.auth-header p {
  margin: 0;
  font-size: 14px;
  color: #cbd5e1;
}

.logged-in-section {
  text-align: center;
}

.logged-in-section h2 {
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 700;
}

.user-email,
.user-role {
  color: #60a5fa;
  margin: 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.form-container {
  width: 100%;
}

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: rgba(30, 41, 59, 0.5);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-btn.active {
  background: #10b981;
  color: white;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.form-group {
  margin-bottom: 20px;
}

.dark-item {
  --background: rgba(30, 41, 59, 0.8);
  --border-color: #3b82f6;
  --color: #ffffff;
  border: 1px solid #3b82f6;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.error-message ion-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.info-box {
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
  color: #60a5fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
}

.info-box p {
  margin: 0;
}

ion-button {
  margin-top: 24px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
