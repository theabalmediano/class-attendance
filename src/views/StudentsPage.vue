<template>
  <div class="students-page">
    <div v-if="isAdmin" class="catalog-actions">
      <div class="catalog-action">
        <input v-model="newSection" class="catalog-input" placeholder="New section" @keyup.enter="addNewSection" />
        <button class="catalog-button" type="button" @click="addNewSection">Add Section</button>
      </div>
      <div class="catalog-action">
        <input v-model="newSubject" class="catalog-input" placeholder="New subject" @keyup.enter="addNewSubject" />
        <button class="catalog-button" type="button" @click="addNewSubject">Add Subject</button>
      </div>
    </div>

    <div v-if="sectionGroups.length === 0" class="empty-state">
      <ion-icon :icon="peopleOutline"></ion-icon>
      <p>{{ currentProfile?.role === 'student' ? 'Your Section and Subject profile is incomplete.' : 'No registered students found.' }}</p>
    </div>

    <div v-else class="sections-grid">
      <div v-for="section in sectionGroups" :key="section.name" class="section-card">
        <div class="section-header">
          <div>
            <p class="section-label">Section</p>
            <h3>{{ section.name }}</h3>
          </div>
          <span class="student-count">{{ section.students.length }} students</span>
        </div>

        <div class="section-meta">
          <span class="meta-label">Subject</span>
          <span>{{ section.subject }}</span>
        </div>

        <button class="open-button" @click="openSection(section.name)">Open Section</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { peopleOutline } from 'ionicons/icons';
import { getCurrentUserProfile } from '../services/roleAuthService';
import { useClassCatalog } from '../services/classCatalogService';
import { initializeRealtimeListener, stopRealtimeListener, useRecords } from '../services/firestoreService';
import { getDirectoryStudents, StudentDirectoryProfile } from '../services/studentDirectoryService';

const router = useRouter();
const currentProfile = getCurrentUserProfile();
const isAdmin = currentProfile?.role === 'admin';
const newSection = ref('');
const newSubject = ref('');
const { sections, addSection, addSubject } = useClassCatalog();
const records = useRecords();

const students = computed<StudentDirectoryProfile[]>(() => getDirectoryStudents(records.value));

const sectionGroups = computed(() => {
  if (currentProfile?.role === 'student') {
    if (!currentProfile.section?.trim() || !currentProfile.subject?.trim()) return [];

    return [{
      name: currentProfile.section.trim(),
      subject: currentProfile.subject.trim(),
      students: students.value.filter((student) => student.section?.trim() === currentProfile.section?.trim()
        && student.subject?.trim() === currentProfile.subject?.trim())
    }];
  }

  return sections.value.map((name) => ({
    name,
    subject: 'All subjects',
    students: students.value.filter((student) => student.section?.trim() === name)
  }));
});

const addNewSection = () => {
  if (addSection(newSection.value)) newSection.value = '';
};

const addNewSubject = () => {
  if (addSubject(newSubject.value)) newSubject.value = '';
};

onMounted(() => initializeRealtimeListener());
onUnmounted(() => stopRealtimeListener());

const openSection = (sectionName: string) => {
  router.push(`/students/${encodeURIComponent(sectionName)}`);
};
</script>

<style scoped>
.students-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 20px;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  min-height: calc(100vh - 120px);
}

.catalog-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.catalog-action {
  display: flex;
  flex: 1 1 260px;
  gap: 8px;
}

.catalog-input {
  min-width: 0;
  flex: 1;
  border: 1px solid rgba(96, 165, 250, 0.45);
  border-radius: 8px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
}

.catalog-button {
  border: 1px solid rgba(52, 211, 153, 0.65);
  border-radius: 8px;
  padding: 10px 12px;
  background: #047857;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 18px;
  min-width: 0;
}

.section-card {
  min-width: 0;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(96, 165, 250, 0.45);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.35);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.section-label {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #93c5fd;
}

.section-card h3 {
  margin: 0;
  color: #ffffff;
  font-size: 26px;
}

.student-count {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.4);
  border-radius: 999px;
  color: #dbeafe;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.section-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 18px;
  color: #e2e8f0;
}

.meta-label {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #93c5fd;
}

.open-button {
  width: 100%;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  text-align: center;
  background: rgba(59, 130, 246, 0.08);
  border: 2px dashed rgba(96, 165, 250, 0.4);
  border-radius: 12px;
  color: #cbd5e1;
}

.empty-state ion-icon {
  font-size: 42px;
  color: #60a5fa;
  margin-bottom: 14px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 560px) {
  .students-page {
    padding: 16px clamp(16px, 5vw, 24px);
  }

  .section-card {
    padding: 16px;
  }

  .catalog-action {
    flex-basis: 100%;
  }

  .section-header {
    flex-direction: column;
  }

  .student-count {
    align-self: flex-start;
  }
}
</style>
