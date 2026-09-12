<template>
  <div class="subject-detail-page">
    <div class="page-header">
      <button class="back-button" @click="goBack">← Back</button>
      <div>
        <p class="detail-label">{{ decodedSectionName }} · Subject</p>
        <h2>{{ decodedSubjectName }}</h2>
      </div>
      <button v-if="currentProfile?.role === 'admin'" class="attendance-button" @click="openAttendance">
        View Attendance
      </button>
    </div>

    <ion-searchbar
      v-model="searchQuery"
      class="student-search"
      placeholder="Search student name"
      show-clear-button="focus"
    ></ion-searchbar>

    <div class="results-summary">{{ filteredStudents.length }} students</div>

    <div v-if="filteredStudents.length === 0" class="empty-state">
      <ion-icon :icon="peopleOutline"></ion-icon>
      <p>No students found for this section and subject.</p>
    </div>

    <div v-else class="student-list">
      <div v-for="student in filteredStudents" :key="student.username" class="student-card">
        <div class="student-profile">
          <img
            class="student-avatar"
            :src="getStudentAvatar(student.fullName || student.username)"
            :alt="`${student.fullName || student.username} avatar`"
          />
          <div>
            <h3>{{ student.fullName || student.username }}</h3>
            <p>{{ student.username }}</p>
          </div>
        </div>
        <div class="student-gender">Gender: {{ student.gender || 'Not specified' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonIcon, IonSearchbar } from '@ionic/vue';
import { peopleOutline } from 'ionicons/icons';
import { getCurrentUserProfile } from '../services/roleAuthService';

interface StudentProfile {
  username: string;
  fullName?: string;
  gender?: string;
  section?: string;
  subject?: string;
  role?: string;
}

const route = useRoute();
const router = useRouter();
const searchQuery = ref('');
const currentProfile = getCurrentUserProfile();

const decodedSectionName = computed(() => decodeURIComponent(String(route.params.sectionName || '')));
const decodedSubjectName = computed(() => decodeURIComponent(String(route.params.subjectName || '')));

const students = computed<StudentProfile[]>(() => {
  const stored = localStorage.getItem('attendanceUsers');
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StudentProfile[];
    return parsed.filter(
      (user) => user.role === 'student'
        && user.section?.trim() === decodedSectionName.value
        && user.subject?.trim() === decodedSubjectName.value
        && (currentProfile?.role !== 'student'
          || (currentProfile.section?.trim() === decodedSectionName.value
            && currentProfile.subject?.trim() === decodedSubjectName.value))
    );
  } catch {
    return [];
  }
});

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return [...students.value]
    .filter((student) => !query || (student.fullName || student.username).toLowerCase().includes(query))
    .sort((a, b) => (a.fullName || a.username).localeCompare(b.fullName || b.username));
});

const getStudentAvatar = (name: string) => {
  const safeName = (name || 'student').trim() || 'student';
  return `https://api.dicebear.com/10.x/pixel-art/svg?seed=${encodeURIComponent(safeName)}&backgroundColor=1d4ed8,3b82f6,10b981`;
};

const goBack = () => {
  router.push(`/students/${encodeURIComponent(decodedSectionName.value)}`);
};

const openAttendance = () => {
  router.push({
    path: '/home',
    query: { section: decodedSectionName.value, subject: decodedSubjectName.value }
  });
};
</script>

<style scoped>
.subject-detail-page {
  min-height: calc(100vh - 120px);
  padding: 20px;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-button,
.attendance-button {
  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 10px;
  color: #dbeafe;
  background: rgba(59, 130, 246, 0.15);
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.attendance-button {
  margin-left: auto;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
}

.detail-label {
  margin: 0 0 6px;
  color: #93c5fd;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.page-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 28px;
}

.student-search {
  --background: rgba(15, 23, 42, 0.8);
  --color: #ffffff;
  --placeholder-color: #94a3b8;
  --icon-color: #60a5fa;
  --border-radius: 10px;
  padding: 0;
}

.results-summary {
  margin: 12px 0 16px;
  color: #cbd5e1;
  font-size: 13px;
}

.student-list,
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.student-card,
.subject-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(96, 165, 250, 0.45);
  border-radius: 14px;
  padding: 16px;
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 2px solid rgba(96, 165, 250, 0.7);
  background: rgba(15, 23, 42, 0.8);
  object-fit: cover;
}

.student-profile h3,
.subject-card h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
}

.student-profile p,
.student-gender {
  margin: 4px 0 0;
  color: #cbd5e1;
  font-size: 13px;
}

.student-gender {
  margin-top: 14px;
  color: #93c5fd;
}

.subject-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subject-card .student-count {
  color: #dbeafe;
  font-size: 13px;
}

.open-button {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
}

.empty-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 2px dashed rgba(96, 165, 250, 0.4);
  border-radius: 12px;
  color: #cbd5e1;
}

.empty-state ion-icon {
  margin-bottom: 14px;
  color: #60a5fa;
  font-size: 42px;
}

@media (max-width: 560px) {
  .subject-detail-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .attendance-button {
    margin-left: 0;
  }
}
</style>
