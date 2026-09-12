import { ref, Ref } from 'vue';
import {
  ref as dbRef,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  Unsubscribe,
  child,
  query,
  orderByChild,
  limitToLast
} from 'firebase/database';
import { realtimeDb } from '../config/firebaseConfig';

export interface AttendanceRecord {
  id: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  date: string;
  reason?: string;
  section?: string;
  subject?: string;
  createdAt?: number;
}

const records: Ref<AttendanceRecord[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const error: Ref<string | null> = ref(null);
let unsubscribe: Unsubscribe | null = null;

/**
 * Initialize real-time listener for attendance records
 */
export const initializeRealtimeListener = () => {
  loading.value = true;
  error.value = null;

  try {
    // Listen to all attendance records
    const attendanceRef = dbRef(realtimeDb, 'attendanceRecords');
    
    console.log('Attempting to connect to Firebase Realtime Database...');
    
    unsubscribe = onValue(
      attendanceRef,
      (snapshot) => {
        console.log('Firebase data received:', snapshot.exists());
        if (snapshot.exists()) {
          const data = snapshot.val();
          const recordsArray: AttendanceRecord[] = [];
          
          // Flatten the nested structure
          Object.keys(data).forEach((key) => {
            const record = {
              id: key,
              ...data[key]
            } as AttendanceRecord;
            recordsArray.push(record);
          });
          
          // Sort by date descending
          recordsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          records.value = recordsArray;
          console.log('Records loaded:', recordsArray.length);
        } else {
          console.log('No records found in database (empty)');
          records.value = [];
        }
        loading.value = false;
      },
      (err) => {
        const firebaseError = err as Error & { code?: string };
        const errorMsg = `Firebase Error: ${firebaseError.code || 'UNKNOWN'} - ${firebaseError.message}`;
        error.value = errorMsg;
        loading.value = false;
        console.error('Realtime Database error:', err);
      }
    );
  } catch (err: any) {
    const errorMsg = `Connection Error: ${err.message}`;
    error.value = errorMsg;
    loading.value = false;
    console.error('Error initializing listener:', err);
  }
};

/**
 * Stop listening to real-time updates
 */
export const stopRealtimeListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

/**
 * Add a new attendance record
 */
export const addAttendanceRecord = async (
  name: string,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
  date: string,
  reason?: string,
  section?: string,
  subject?: string
): Promise<string | null> => {
  try {
    error.value = null;
    const attendanceRef = dbRef(realtimeDb, 'attendanceRecords');
    const newRecordRef = push(attendanceRef);
    
    await set(newRecordRef, {
      name,
      status,
      date,
      reason: reason || '',
      section: section || '',
      subject: subject || '',
      createdAt: Date.now()
    });

    return newRecordRef.key;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error adding record:', err);
    return null;
  }
};

/**
 * Update an existing attendance record
 */
export const updateAttendanceRecord = async (
  recordId: string,
  updates: Partial<AttendanceRecord>
): Promise<boolean> => {
  try {
    error.value = null;
    const recordRef = dbRef(realtimeDb, `attendanceRecords/${recordId}`);
    await update(recordRef, updates);
    return true;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error updating record:', err);
    return false;
  }
};

/**
 * Delete an attendance record
 */
export const deleteAttendanceRecord = async (recordId: string): Promise<boolean> => {
  try {
    error.value = null;
    await remove(dbRef(realtimeDb, `attendanceRecords/${recordId}`));
    return true;
  } catch (err: any) {
    error.value = err.message;
    console.error('Error deleting record:', err);
    return false;
  }
};

/**
 * Get all records
 */
export const getRecords = () => records.value;

/**
 * Get reactive records reference
 */
export const useRecords = () => records;

/**
 * Get loading state
 */
export const getLoadingState = () => loading.value;

/**
 * Get error state
 */
export const getErrorState = () => error.value;
