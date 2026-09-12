import { computed, ref } from 'vue';
import {
  getAuthState,
  loginUser,
  registerUser,
  logoutUser,
  useAuthState
} from '../services/authService';
import {
  getRecords,
  useRecords,
  addAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  initializeRealtimeListener,
  stopRealtimeListener,
  AttendanceRecord,
  getLoadingState,
  getErrorState
} from '../services/firestoreService';

export const useAttendance = () => {
  const authState = useAuthState();
  const recordsRef = useRecords();
  const error = ref<string | null>(null);

  // Computed properties for stats
  const stats = computed(() => ({
    present: recordsRef.value.filter(r => r.status === 'PRESENT').length,
    absent: recordsRef.value.filter(r => r.status === 'ABSENT').length,
    late: recordsRef.value.filter(r => r.status === 'LATE').length,
    excused: recordsRef.value.filter(r => r.status === 'EXCUSED').length,
    total: recordsRef.value.length
  }));

  // Filter by status
  const filterByStatus = (status: string) => {
    if (!status) return recordsRef.value;
    return recordsRef.value.filter(r => r.status === status);
  };

  // Filter by date range
  const filterByDateRange = (startDate: string, endDate: string) => {
    return recordsRef.value.filter(r => r.date >= startDate && r.date <= endDate);
  };

  // Format date for display
  const formatDate = (date: string): string => {
    try {
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

  // Auth methods
  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    if (user) {
      initializeRealtimeListener();
      return true;
    }
    error.value = getAuthState().error || 'Login failed';
    return false;
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    const user = await registerUser(email, password);
    if (user) {
      initializeRealtimeListener();
      return true;
    }
    error.value = getAuthState().error || 'Registration failed';
    return false;
  };

  const logout = async (): Promise<void> => {
    stopRealtimeListener();
    await logoutUser();
  };

  // Attendance record methods
  const addRecord = async (
    name: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
    date: string,
    reason?: string
  ): Promise<boolean> => {
    const recordId = await addAttendanceRecord(name, status, date, reason);
    if (!recordId) {
      error.value = getErrorState() || 'Failed to add record';
      return false;
    }
    return true;
  };

  const updateRecord = async (
    recordId: string,
    updates: Partial<AttendanceRecord>
  ): Promise<boolean> => {
    const success = await updateAttendanceRecord(recordId, updates);
    if (!success) {
      error.value = getErrorState() || 'Failed to update record';
    }
    return success;
  };

  const deleteRecord = async (recordId: string): Promise<boolean> => {
    const success = await deleteAttendanceRecord(recordId);
    if (!success) {
      error.value = getErrorState() || 'Failed to delete record';
    }
    return success;
  };

  return {
    // Auth state
    authState,
    isAuthenticated: computed(() => !!authState.value.user),
    currentUser: computed(() => authState.value.user),
    authLoading: computed(() => authState.value.loading),

    // Attendance records
    records: recordsRef,
    stats,
    recordsLoading: computed(() => getLoadingState()),
    error: computed(() => error.value || getErrorState()),

    // Auth methods
    login,
    register,
    logout,

    // Attendance methods
    addRecord,
    updateRecord,
    deleteRecord,
    filterByStatus,
    filterByDateRange,
    formatDate,

    // Listener management
    initializeListener: initializeRealtimeListener,
    stopListener: stopRealtimeListener
  };
};
