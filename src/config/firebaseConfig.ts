import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

// Firebase config for Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyDkv_V80nOZdtsfhVnZaPd3EjDhT_UVkNM",
  authDomain: "class-attendance--crud.firebaseapp.com",
  databaseURL: "https://class-attendance--crud-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "class-attendance--crud",
  storageBucket: "class-attendance--crud.firebasestorage.app",
  messagingSenderId: "844180729475",
  appId: "1:844180729475:web:e3a9cf5db575c44d0e35b6",
  measurementId: "G-5XP5B1K43X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firebase Realtime Database
export const realtimeDb: Database = getDatabase(app);

export default app;
