<template>
  <div class="attendance-container">
    <!-- Top Bar / Controls -->
    <div class="controls-section">
      <div class="header-title">
        <ion-icon :icon="checkmarkCircle" class="header-icon"></ion-icon>
        <span>Attendance</span>
      </div>
      <div class="action-group">
        <div class="user-profile">
          <img
            class="user-avatar"
            :src="getStudentAvatar(currentUsername)"
            :alt="`${currentUsername || 'User'} avatar`"
          />
          <div class="user-info">
            <span class="username">{{ currentUsername }}</span>
            <span class="role" :class="currentRole">{{ currentRole === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student' }}</span>
          </div>
        </div>
        <ion-button fill="clear" size="small" class="filter-btn" @click="openFilterModal">
          <ion-icon :icon="filterOutline" slot="start"></ion-icon>
          Filter
        </ion-button>
        <ion-button v-if="isAdmin" @click="openAddModal" class="add-button" size="small">
          <ion-icon :icon="add" slot="start"></ion-icon>
          Add
        </ion-button>
        <ion-button fill="clear" size="small" class="filter-btn" @click="handleLogout">
          <ion-icon :icon="logOut" slot="start"></ion-icon>
        </ion-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="recordsLoading" class="loading-section">
      <ion-spinner></ion-spinner>
      <p>Loading attendance records...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-section">
      <ion-icon :icon="alertCircle"></ion-icon>
      <p>{{ error }}</p>
    </div>

    <!-- Unified Stats Section -->
    <div v-if="!recordsLoading" class="stats-section">
      <div class="stat-card present">
        <div class="stat-number">{{ stats.present }}</div>
        <div class="stat-label">PRESENT</div>
      </div>
      <div class="stat-card absent">
        <div class="stat-number">{{ stats.absent }}</div>
        <div class="stat-label">ABSENT</div>
      </div>
      <div class="stat-card late">
        <div class="stat-number">{{ stats.late }}</div>
        <div class="stat-label">LATE</div>
      </div>
      <div class="stat-card excused">
        <div class="stat-number">{{ stats.excused }}</div>
        <div class="stat-label">EXCUSED</div>
      </div>
    </div>

    <!-- Records Count -->
    <div class="records-toolbar">
      <div class="records-count">Total Records: {{ stats.total }}</div>
      <ion-searchbar
        v-model="searchQuery"
        class="student-search"
        placeholder="Search student name"
        show-clear-button="focus"
      ></ion-searchbar>
    </div>

    <!-- Records List -->
    <div class="records-section">
      <div v-if="filteredRecords.length === 0" class="empty-state">
        <ion-icon :icon="documentOutline"></ion-icon>
        <p>No attendance records found</p>
      </div>
      <div v-for="record in filteredRecords" :key="record.id" class="record-card">
        <div class="record-header">
          <div class="student-profile">
            <img class="student-avatar" :src="getStudentAvatar(record.name)" :alt="`${record.name} avatar`" />
            <div class="record-name">{{ record.name }}</div>
          </div>
          <div v-if="record.status" :class="['record-status', record.status.toLowerCase()]">
            • {{ record.status }}
          </div>
        </div>
        <div class="record-date">{{ formatDate(record.date) }}</div>
        <div v-if="record.section || record.subject" class="record-group">
          {{ record.section || 'Unknown Section' }} · {{ record.subject || 'Unknown Subject' }}
        </div>
        <div v-if="record.reason" class="record-reason">{{ record.reason }}</div>
        <div class="record-actions">
          <button v-if="isAdmin" class="action-btn edit" @click="openEditModal(record.id)">Edit</button>
          <button v-if="isAdmin" class="action-btn delete" @click="deleteRecordConfirm(record.id)">Delete</button>
          <span v-if="!isAdmin" class="view-only">View Only</span>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <ion-modal :is-open="isAddModalOpen" @did-dismiss="closeAddModal">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>Log Attendance</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeAddModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content">
        <ion-item class="dark-item">
          <ion-label position="stacked">Student Name</ion-label>
          <ion-input
            v-model="addForm.name"
            placeholder="Enter name"
            @ion-input="syncStudentProfile"
          ></ion-input>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Section</ion-label>
          <ion-select v-model="addForm.section" placeholder="Select section">
            <ion-select-option v-for="section in catalogSections" :key="section" :value="section">
              {{ section }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Subject</ion-label>
          <ion-select v-model="addForm.subject" placeholder="Select subject">
            <ion-select-option v-for="subject in catalogSubjects" :key="subject" :value="subject">
              {{ subject }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Status</ion-label>
          <ion-select v-model="addForm.status">
            <ion-select-option value="PRESENT">Present</ion-select-option>
            <ion-select-option value="ABSENT">Absent</ion-select-option>
            <ion-select-option value="LATE">Late</ion-select-option>
            <ion-select-option value="EXCUSED">Excused</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Reason (Optional)</ion-label>
          <ion-input v-model="addForm.reason" placeholder="Enter reason"></ion-input>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Date</ion-label>
          <ion-datetime v-model="addForm.date" presentation="date"></ion-datetime>
        </ion-item>
        <div class="button-group">
          <ion-button expand="block" @click="addAttendance" :disabled="addLoading">
            <ion-spinner v-if="addLoading" slot="start"></ion-spinner>
            Save
          </ion-button>
          <ion-button expand="block" fill="outline" color="medium" @click="closeAddModal">Cancel</ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Edit Modal -->
    <ion-modal :is-open="isEditModalOpen" @did-dismiss="closeEditModal">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>Edit Attendance</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content" v-if="editingRecord">
        <ion-item class="dark-item">
          <ion-label position="stacked">Student Name</ion-label>
          <ion-input v-model="editForm.name" placeholder="Enter name"></ion-input>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Status</ion-label>
          <ion-select v-model="editForm.status">
            <ion-select-option value="PRESENT">Present</ion-select-option>
            <ion-select-option value="ABSENT">Absent</ion-select-option>
            <ion-select-option value="LATE">Late</ion-select-option>
            <ion-select-option value="EXCUSED">Excused</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Reason (Optional)</ion-label>
          <ion-input v-model="editForm.reason" placeholder="Enter reason"></ion-input>
        </ion-item>
        <ion-item class="dark-item">
          <ion-label position="stacked">Date</ion-label>
          <ion-datetime v-model="editForm.date" presentation="date"></ion-datetime>
        </ion-item>
        <div class="button-group">
          <ion-button expand="block" @click="saveEdit" :disabled="editLoading">
            <ion-spinner v-if="editLoading" slot="start"></ion-spinner>
            Update
          </ion-button>
          <ion-button expand="block" fill="outline" color="medium" @click="closeEditModal">Cancel</ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Filter Modal -->
    <ion-modal :is-open="isFilterModalOpen" @did-dismiss="closeFilterModal">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>Filter Records</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeFilterModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content">
        <ion-item class="dark-item">
          <ion-label position="stacked">Status</ion-label>
          <ion-select v-model="filterStatus">
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="PRESENT">Present</ion-select-option>
            <ion-select-option value="ABSENT">Absent</ion-select-option>
            <ion-select-option value="LATE">Late</ion-select-option>
            <ion-select-option value="EXCUSED">Excused</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="dark-item">
          <ion-label position="stacked">Sort By</ion-label>
          <ion-select v-model="sortOption">
            <ion-select-option value="name-asc">Name: A-Z</ion-select-option>
            <ion-select-option value="name-desc">Name: Z-A</ion-select-option>
            <ion-select-option value="date-newest">Date: Newest</ion-select-option>
            <ion-select-option value="date-oldest">Date: Oldest</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="dark-item">
          <ion-label position="stacked">Date Filter</ion-label>
          <ion-select v-model="dateFilterPreset" @ion-change="onDateFilterChange">
            <ion-select-option value="all">All Dates</ion-select-option>
            <ion-select-option value="today">Today</ion-select-option>
            <ion-select-option value="week">This Week</ion-select-option>
            <ion-select-option value="month">This Month</ion-select-option>
            <ion-select-option value="custom">Custom Date</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item v-if="dateFilterPreset === 'custom'" class="dark-item">
          <ion-label position="stacked">Custom Date</ion-label>
          <ion-datetime v-model="customDateFilter" presentation="date" @ion-change="applyCustomDateFilter"></ion-datetime>
        </ion-item>

        <div class="button-group">
          <ion-button expand="block" @click="closeFilterModal">Apply</ion-button>
          <ion-button expand="block" fill="outline" color="medium" @click="resetFilterControls">Clear Filter</ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonButton,
  IonIcon,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonSpinner,
  IonSearchbar,
  alertController
} from '@ionic/vue';
import { add, checkmarkCircle, filterOutline, alertCircle, documentOutline, logOut } from 'ionicons/icons';
import { logout, getAuthState, getCurrentUserProfile } from '../services/roleAuthService';
import { useClassCatalog } from '../services/classCatalogService';
import {
  initializeRealtimeListener,
  stopRealtimeListener,
  addAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  useRecords,
  getLoadingState,
  getErrorState
} from '../services/firestoreService';

const route = useRoute();
const router = useRouter();

interface AttendanceRecord {
  id: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  date: string;
  reason?: string;
  section?: string;
  subject?: string;
}

// Auth state
const authState = getAuthState();
const currentUsername = ref(authState.username || '');
const currentRole = ref<'admin' | 'student' | null>(authState.role);
const isAdmin = computed(() => currentRole.value === 'admin');
const currentProfile = getCurrentUserProfile();
const { sections: catalogSections, subjects: catalogSubjects } = useClassCatalog();

// Firebase based attendance records
const records = useRecords();
const recordsLoading = computed(() => getLoadingState());
const error = computed(() => getErrorState());

// Filter state
const filterStatus = ref('');
const dateFilterPreset = ref('all');
const customDateFilter = ref('');
const sortOption = ref<'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest'>('name-asc');
const searchQuery = ref('');
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isFilterModalOpen = ref(false);
const editingRecord = ref<any>(null);
const addLoading = ref(false);
const editLoading = ref(false);

const activeSection = computed(() => {
  const routeSection = String(route.query.section || '').trim();
  return routeSection || (!isAdmin.value ? currentProfile?.section?.trim() || '' : '');
});

const activeSubject = computed(() => {
  const routeSubject = String(route.query.subject || '').trim();
  return routeSubject || (!isAdmin.value ? currentProfile?.subject?.trim() || '' : '');
});

const recordMatchesActiveGroup = (record: AttendanceRecord) => {
  const profile = registeredStudentProfile(record.name);
  const recordSection = record.section?.trim() || profile?.section?.trim() || '';
  const recordSubject = record.subject?.trim() || profile?.subject?.trim() || '';
  const sectionMatches = !activeSection.value || recordSection === activeSection.value;
  const subjectMatches = !activeSubject.value || recordSubject === activeSubject.value;
  return sectionMatches && subjectMatches;
};

const registeredStudentProfile = (name: string) => {
  const stored = localStorage.getItem('attendanceUsers');
  if (!stored) return null;

  try {
    const users = JSON.parse(stored) as Array<{ role?: string; username: string; fullName?: string; section?: string; subject?: string }>;
    const normalizedName = name.trim().toLowerCase();
    return users.find((user) => user.role === 'student'
      && [user.fullName, user.username].some((value) => value?.trim().toLowerCase() === normalizedName)) || null;
  } catch {
    return null;
  }
};

// Stats computed
const scopedRecords = computed(() => records.value.filter(recordMatchesActiveGroup));

const stats = computed(() => ({
  present: scopedRecords.value.filter(r => r.status === 'PRESENT').length,
  absent: scopedRecords.value.filter(r => r.status === 'ABSENT').length,
  late: scopedRecords.value.filter(r => r.status === 'LATE').length,
  excused: scopedRecords.value.filter(r => r.status === 'EXCUSED').length,
  total: scopedRecords.value.length
}));

// Format date
const formatDate = (date: string): string => {
  try {
    if (date.includes('T')) {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return date;
  }
};

const addForm = ref({
  name: '',
  section: '',
  subject: '',
  status: 'PRESENT' as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
  reason: '',
  date: new Date().toISOString()
});

const editForm = ref({
  name: '',
  status: 'PRESENT' as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
  reason: '',
  date: ''
});

const normalizeStudentName = (name: string) => name.trim().toLowerCase();

const normalizeAttendanceDate = (date: string) => {
  if (!date) return '';
  const value = date.includes('T') ? new Date(date).toISOString().split('T')[0] : date;
  return value;
};

const hasDuplicateAttendanceRecord = (name: string, date: string, excludeId?: string) => {
  const normalizedName = normalizeStudentName(name);
  const normalizedDate = normalizeAttendanceDate(date);

  return records.value.some(record => {
    const isSameRecord = excludeId ? record.id === excludeId : false;
    if (isSameRecord) return false;

    return normalizeStudentName(record.name) === normalizedName && normalizeAttendanceDate(record.date) === normalizedDate;
  });
};

const getStudentAvatar = (name: string) => {
  const safeName = (name || 'student').trim() || 'student';
  return `https://api.dicebear.com/10.x/pixel-art/svg?seed=${encodeURIComponent(safeName)}&backgroundColor=1d4ed8,3b82f6,10b981`;
};

const getStartOfWeek = (date: Date) => {
  const normalizedDate = new Date(date);
  const day = normalizedDate.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const start = new Date(normalizedDate);
  start.setDate(normalizedDate.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const matchesDateFilter = (recordDate: string) => {
  const record = new Date(recordDate);
  if (Number.isNaN(record.getTime())) return true;

  const today = new Date();

  if (dateFilterPreset.value === 'all') return true;

  if (dateFilterPreset.value === 'today') {
    return record.toDateString() === today.toDateString();
  }

  if (dateFilterPreset.value === 'week') {
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return record >= startOfWeek && record <= endOfWeek;
  }

  if (dateFilterPreset.value === 'month') {
    const startOfMonth = getStartOfMonth(today);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    return record >= startOfMonth && record <= endOfMonth;
  }

  if (dateFilterPreset.value === 'custom' && customDateFilter.value) {
    const customDate = new Date(customDateFilter.value);
    return customDate.toDateString() === record.toDateString();
  }

  return true;
};

const filteredRecords = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  const filtered = scopedRecords.value.filter(record => {
    const matchesStatus = !filterStatus.value || record.status === filterStatus.value;
    const matchesDate = matchesDateFilter(record.date);
    const matchesSearch = !normalizedQuery || record.name.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesDate && matchesSearch;
  });

  const sorted = [...filtered];

  sorted.sort((a, b) => {
    if (sortOption.value === 'name-desc') {
      return b.name.localeCompare(a.name);
    }

    if (sortOption.value === 'date-newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    if (sortOption.value === 'date-oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    return a.name.localeCompare(b.name);
  });

  return sorted;
});

const onDateFilterChange = () => {
  if (dateFilterPreset.value !== 'custom') {
    customDateFilter.value = '';
  }
};

const applyCustomDateFilter = () => {
  if (customDateFilter.value) {
    dateFilterPreset.value = 'custom';
  }
};

const openAddModal = () => {
  addForm.value.name = '';
  addForm.value.section = activeSection.value || catalogSections.value[0] || '';
  addForm.value.subject = activeSubject.value || catalogSubjects.value[0] || '';
  addForm.value.status = 'PRESENT';
  addForm.value.reason = '';
  addForm.value.date = new Date().toISOString();
  isAddModalOpen.value = true;
};

const syncStudentProfile = () => {
  const studentProfile = registeredStudentProfile(addForm.value.name);
  if (studentProfile?.section) addForm.value.section = studentProfile.section;
  if (studentProfile?.subject) addForm.value.subject = studentProfile.subject;
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
};

const addAttendance = async () => {
  const studentName = addForm.value.name.trim();

  if (!studentName) {
    await alertController.create({
      header: 'Error',
      message: 'Please enter a student name',
      buttons: ['OK']
    }).then(a => a.present());
    return;
  }

  const dateStr = new Date(addForm.value.date).toISOString().split('T')[0];
  const studentProfile = registeredStudentProfile(studentName);

  if (!studentProfile || !addForm.value.section || !addForm.value.subject) {
    await alertController.create({
      header: 'Student Profile Required',
      message: 'Select a registered student, Section, and Subject before saving attendance.',
      buttons: ['OK']
    }).then(a => a.present());
    return;
  }

  if (hasDuplicateAttendanceRecord(studentName, dateStr)) {
    await alertController.create({
      header: 'Duplicate Record',
      message: `${studentName} already has attendance recorded on ${formatDate(dateStr)}.`,
      buttons: ['OK']
    }).then(a => a.present());
    return;
  }

  addLoading.value = true;
  try {
    const id = await addAttendanceRecord(
      studentName,
      addForm.value.status,
      dateStr,
      addForm.value.reason,
      addForm.value.section,
      addForm.value.subject
    );

    if (id) {
      closeAddModal();
      await alertController.create({
        header: 'Success',
        message: 'Attendance record added successfully',
        buttons: ['OK']
      }).then(a => a.present());
    }
  } finally {
    addLoading.value = false;
  }
};

const openEditModal = (id: string) => {
  const record = records.value.find(r => r.id === id);
  if (record) {
    editingRecord.value = record;
    editForm.value.name = record.name;
    editForm.value.status = record.status;
    editForm.value.reason = record.reason || '';
    editForm.value.date = record.date;
    isEditModalOpen.value = true;
  }
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingRecord.value = null;
};

const saveEdit = async () => {
  if (editingRecord.value && editForm.value.name.trim()) {
    const studentName = editForm.value.name.trim();
    const dateStr = editForm.value.date.includes('T')
      ? new Date(editForm.value.date).toISOString().split('T')[0]
      : editForm.value.date;

    if (hasDuplicateAttendanceRecord(studentName, dateStr, editingRecord.value.id)) {
      await alertController.create({
        header: 'Duplicate Record',
        message: `${studentName} already has attendance recorded on ${formatDate(dateStr)}.`,
        buttons: ['OK']
      }).then(a => a.present());
      return;
    }

    editLoading.value = true;
    try {
      const studentProfile = registeredStudentProfile(studentName);
      const success = await updateAttendanceRecord(editingRecord.value.id, {
        name: studentName,
        status: editForm.value.status,
        reason: editForm.value.reason,
        date: dateStr,
        section: studentProfile?.section || editingRecord.value.section || '',
        subject: studentProfile?.subject || editingRecord.value.subject || ''
      });

      if (success) {
        closeEditModal();
        await alertController.create({
          header: 'Success',
          message: 'Attendance record updated successfully',
          buttons: ['OK']
        }).then(a => a.present());
      }
    } finally {
      editLoading.value = false;
    }
  }
};

const deleteRecordConfirm = (id: string) => {
  alertController.create({
    header: 'Delete Record',
    message: 'Are you sure you want to delete this attendance record?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          const success = await deleteAttendanceRecord(id);
          if (success) {
            await alertController.create({
              header: 'Success',
              message: 'Attendance record deleted successfully',
              buttons: ['OK']
            }).then(a => a.present());
          }
        }
      }
    ]
  }).then(a => a.present());
};

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const openFilterModal = () => {
  isFilterModalOpen.value = true;
};

const closeFilterModal = () => {
  isFilterModalOpen.value = false;
};

const resetFilterControls = () => {
  filterStatus.value = '';
  dateFilterPreset.value = 'all';
  customDateFilter.value = '';
  sortOption.value = 'name-asc';
};

onMounted(() => {
  const authState = getAuthState();
  currentUsername.value = authState.username || '';
  currentRole.value = authState.role;
  initializeRealtimeListener();
});

onUnmounted(() => {
  stopRealtimeListener();
});
</script>

<style scoped>
.attendance-container {
  width: min(100%, 1100px);
  max-width: 1100px;
  padding: clamp(12px, 2vw, 24px);
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

/* Header Section */
.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 25px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  flex-wrap: wrap;
  min-height: 82px;
  box-sizing: border-box;
  contain: layout;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
}

.header-icon {
  color: #10b981;
  font-size: 28px;
}

.action-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: nowrap;
  min-height: 44px;
  flex-shrink: 0;
  contain: layout;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 2px;
  padding-right: 14px;
  border-right: 2px solid #3b82f6;
  min-width: 0;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border: 2px solid rgba(96, 165, 250, 0.7);
  border-radius: 50%;
  object-fit: cover;
  background: rgba(15, 23, 42, 0.8);
  flex-shrink: 0;
}

.username {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1.15;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role {
  font-size: 12px;
  color: #cbd5e1;
  margin-top: 4px;
  font-weight: 600;
}

.role.admin {
  color: #fbbf24;
}

.role.student {
  color: #60a5fa;
}

.filter-btn {
  --color: #ffffff;
  --background: rgba(59, 130, 246, 0.2);
  --border-radius: 6px;
  --border: 1px solid #3b82f6;
  text-transform: none;
  font-size: 13px;
  height: 36px;
  font-weight: 600;
}

.add-button {
  --background: #10b981;
  --color: #ffffff;
  --border-radius: 6px;
  text-transform: none;
  font-weight: 700;
  font-size: 13px;
  height: 36px;
  margin: 0;
}

/* Loading and Error States */
.loading-section,
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid #3b82f6;
  border-radius: 10px;
  margin-bottom: 20px;
}

.loading-section p,
.error-section p {
  margin-top: 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.error-section {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
}

.error-section ion-icon {
  color: #ef4444;
  font-size: 32px;
}

/* Stats Section Card */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 16px 0;
  margin-bottom: 25px;
  gap: 0;
}

.stat-card {
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 8px;
}

.stat-card:last-child {
  border-right: none;
}

.stat-number {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
  color: #ffffff;
}

.stat-card.present .stat-number { 
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.stat-card.absent .stat-number { 
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.stat-card.late .stat-number { 
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.stat-card.excused .stat-number { 
  color: #8b5cf6;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  margin-top: 6px;
  color: #cbd5e1;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Records Section */
.records-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.student-search {
  width: 100%;
  max-width: 100%;
}

.records-count {
  font-size: 12px;
  color: #cbd5e1;
  font-family: monospace;
  font-weight: 600;
  padding: 0 8px;
}

.student-search {
  --background: rgba(15, 23, 42, 0.7);
  --color: #ffffff;
  --placeholder-color: #94a3b8;
  --icon-color: #60a5fa;
  --border-radius: 10px;
  padding: 0;
}

.records-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(59, 130, 246, 0.08);
  border: 2px dashed #3b82f6;
  border-radius: 10px;
  color: #cbd5e1;
}

.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
  color: #3b82f6;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.record-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(23, 37, 51, 0.6) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.record-card:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(23, 37, 51, 0.8) 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.student-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(96, 165, 250, 0.7);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.record-name {
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status Badges */
.record-status {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.record-status.present {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
  border: 1px solid #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.record-status.absent {
  background: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  border: 1px solid #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.record-status.late {
  background: rgba(251, 191, 36, 0.25);
  color: #fbbf24;
  border: 1px solid #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.record-status.excused {
  background: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  border: 1px solid #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}

.record-date {
  font-size: 12px;
  color: #60a5fa;
  font-weight: 600;
}

.record-reason {
  font-size: 13px;
  color: #cbd5e1;
  margin-top: 2px;
  font-style: italic;
  border-left: 3px solid #3b82f6;
  padding-left: 10px;
}

/* Action Buttons */
.record-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 100px;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  border: 1px solid #3b82f6;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

.view-only {
  padding: 8px 12px;
  font-size: 12px;
  color: #cbd5e1;
  text-align: center;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Modals */
.modal-content {
  --background: #1a1a2e;
}

.dark-item {
  --background: rgba(30, 41, 59, 0.9);
  --color: #ffffff;
  --border-color: #3b82f6;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

ion-button {
  text-transform: none;
  margin: 0;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.controls-section ion-button,
.controls-section ion-button::part(native) {
  transform: none !important;
  transition: none !important;
}

/* Modals Dark Styling */
.modal-content {
  --background: #0b0e17;
}

.dark-item {
  --background: #121826;
  --color: #ffffff;
  margin-bottom: 12px;
  border-radius: 8px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 860px) {
  .attendance-container {
    width: 100%;
  }

  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    justify-content: center;
  }

  .action-group {
    justify-content: space-between;
    width: 100%;
    min-height: 52px;
  }

  .user-profile {
    border-right: none;
    border-bottom: 1px solid rgba(59, 130, 246, 0.5);
    padding-right: 0;
    padding-bottom: 10px;
    margin-right: 0;
    width: 100%;
  }

  .stats-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .attendance-container {
    padding: 12px;
  }

  .controls-section {
    padding: 14px;
  }

  .action-group {
    gap: 8px;
  }

  .filter-btn,
  .add-button {
    flex: 1 1 calc(50% - 8px);
    min-width: 0;
  }

  .stat-number {
    font-size: 20px;
  }

  .stat-label {
    letter-spacing: 0.6px;
  }

  .record-card {
    padding: 14px;
  }

  .record-header {
    align-items: flex-start;
  }

  .student-profile {
    width: 100%;
  }

  .record-name {
    font-size: 14px;
  }

  .record-status {
    margin-left: auto;
  }

  .record-actions {
    flex-direction: column;
  }

  .action-btn,
  .view-only {
    width: 100%;
    flex: 1 1 100%;
  }
}

/* Calendar / Date Picker Styling */
::v-deep(.datetime-picker-column) {
  background: #1a2332 !important;
  color: #ffffff !important;
}

::v-deep(.datetime-time) {
  background: #1a2332 !important;
  color: #ffffff !important;
}

::v-deep(.datetime-button) {
  background: #3b82f6 !important;
  color: #ffffff !important;
  font-weight: 600;
}

::v-deep(ion-datetime) {
  --background: #1a2332 !important;
  --color: #ffffff !important;
  --text-color: #ffffff !important;
  --ion-text-color: #ffffff !important;
}

::v-deep(.datetime-selected) {
  color: #3b82f6 !important;
  font-weight: 700 !important;
}

::v-deep(.picker-column) {
  background: #1a2332 !important;
}

::v-deep(.picker-column-text) {
  color: #ffffff !important;
  font-weight: 500 !important;
}

::v-deep(.picker-column-highlight) {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #3b82f6 !important;
  font-weight: 700 !important;
}
</style>