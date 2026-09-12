import { reactive } from 'vue';

export interface AttendanceRecord {
  id: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  date: string;
  reason?: string;
}

export const attendanceStore = reactive<{
  records: AttendanceRecord[];
  addRecord: (record: Omit<AttendanceRecord, 'id'>) => string;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => boolean;
  deleteRecord: (id: string) => boolean;
  getRecord: (id: string) => AttendanceRecord | undefined;
  getStats: () => { present: number; absent: number; late: number; excused: number };
}>({
  records: [
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
  ],
  addRecord(record: Omit<AttendanceRecord, 'id'>) {
    const id = Date.now().toString();
    this.records.push({ ...record, id });
    return id;
  },
  updateRecord(id: string, updates: Partial<AttendanceRecord>) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...updates };
      return true;
    }
    return false;
  },
  deleteRecord(id: string) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      return true;
    }
    return false;
  },
  getRecord(id: string) {
    return this.records.find(r => r.id === id);
  },
  getStats() {
    return {
      present: this.records.filter(r => r.status === 'PRESENT').length,
      absent: this.records.filter(r => r.status === 'ABSENT').length,
      late: this.records.filter(r => r.status === 'LATE').length,
      excused: this.records.filter(r => r.status === 'EXCUSED').length
    };
  }
});
