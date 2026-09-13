<template>
  <div class="section-detail-page">
    <div class="page-header">
      <button class="back-button" @click="goBack">← Back</button>
      <div>
        <p class="detail-label">Section</p>
        <h2>{{ decodedSectionName }}</h2>
      </div>
    </div>

    <div class="subjects-grid">
      <div v-for="subject in subjects" :key="subject" class="subject-card">
        <div>
          <p class="detail-label">Subject</p>
          <h3>{{ subject }}</h3>
        </div>
        <span class="student-count">{{ subjectCounts[subject] }} students</span>
        <button class="open-button" @click="openSubject(subject)">Open Subject</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { peopleOutline } from 'ionicons/icons';
import { getCurrentUserProfile } from '../services/roleAuthService';
import { useClassCatalog } from '../services/classCatalogService';
import { initializeRealtimeListener, stopRealtimeListener, useRecords } from '../services/firestoreService';
import { getDirectoryStudents, StudentDirectoryProfile } from '../services/studentDirectoryService';

const route = useRoute();
const router = useRouter();
const currentProfile = getCurrentUserProfile();
const { subjects: catalogSubjects } = useClassCatalog();
const records = useRecords();
const subjects = computed(() => {
  if (currentProfile?.role !== 'student') return catalogSubjects.value;
  if (currentProfile.section?.trim() !== decodedSectionName.value || !currentProfile.subject?.trim()) return [];
  return [currentProfile.subject.trim()];
});

const decodedSectionName = computed(() => decodeURIComponent(String(route.params.sectionName || '')));

const students = computed<StudentDirectoryProfile[]>(() => getDirectoryStudents(records.value).filter(
  (student) => student.section?.trim() === decodedSectionName.value
));

const subjectCounts = computed<Record<string, number>>(() => Object.fromEntries(
  subjects.value.map((subject) => [subject, students.value.filter((student) => student.subject?.trim() === subject).length])
));

const openSubject = (subjectName: string) => {
  router.push(`/students/${encodeURIComponent(decodedSectionName.value)}/${encodeURIComponent(subjectName)}`);
};

const goBack = () => {
  router.push('/students');
};

onMounted(() => initializeRealtimeListener());
onUnmounted(() => stopRealtimeListener());
</script>

<style scoped>
.section-detail-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 20px;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-button {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.5);
  color: #dbeafe;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
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

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 16px;
  min-width: 0;
}

.subject-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(96, 165, 250, 0.45);
  border-radius: 14px;
  padding: 16px;
}

.subject-card h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
}

.student-count {
  color: #dbeafe;
  font-size: 13px;
}

.open-button {
  width: 100%;
  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 220px;
  border: 2px dashed rgba(96, 165, 250, 0.4);
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  color: #cbd5e1;
}

.empty-state ion-icon {
  font-size: 42px;
  color: #60a5fa;
  margin-bottom: 14px;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 560px) {
  .section-detail-page {
    padding: 16px clamp(16px, 5vw, 24px);
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
