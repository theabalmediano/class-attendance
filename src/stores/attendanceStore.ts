import { ref, computed } from 'vue';

export interface AttendanceRecord {
  id: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  date: string;
  reason?: string;
}

// Create a shared store instance
let storeInstance: ReturnType<typeof createAttendanceStore> | null = null;

const createAttendanceStore = () => {
  const records = ref<AttendanceRecord[]>([
    {
      id: '1',
      name: 'Lena Fischer',
      status: 'ABSENT',
      date: '2026-09-12',
      reason: 'Illness reported'
    },
    {
      id: '2',
      name: 'Toriq Mansour',
      status: 'PRESENT',
      date: '2026-09-12'
    },
    {
      id: '3',
      name: 'Amora Osei',
      status: 'PRESENT',
      date: '2026-09-12'
    }
  ]);

  const stats = computed(() => {
    const present = records.value.filter(r => r.status === 'PRESENT').length;
    const absent = records.value.filter(r => r.status === 'ABSENT').length;
    const late = records.value.filter(r => r.status === 'LATE').length;
    const excused = records.value.filter(r => r.status === 'EXCUSED').length;
    
    return { present, absent, late, excused };
  });

  const addRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const id = Date.now().toString();
    records.value.push({ ...record, id });
    return id;
  };

  const updateRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    const index = records.value.findIndex(r => r.id === id);
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...updates };
      return true;
    }
    return false;
  };

  const deleteRecord = (id: string) => {
    const index = records.value.findIndex(r => r.id === id);
    if (index !== -1) {
      records.value.splice(index, 1);
      return true;
    }
    return false;
  };

  const getRecord = (id: string) => {
    return records.value.find(r => r.id === id);
  };

  return {
    records,
    stats,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord
  };
};

// Export a singleton instance
export const useAttendanceStore = () => {
  if (!storeInstance) {
    storeInstance = createAttendanceStore();
  }
  return storeInstance;
};
