import { ref, Ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const authState: Ref<AuthState> = ref({
  user: null,
  loading: true,
  error: null
});

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
  authState.value.user = user;
  authState.value.loading = false;
});

/**
 * Register a new user
 */
export const registerUser = async (email: string, password: string): Promise<User | null> => {
  try {
    authState.value.error = null;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    authState.value.user = result.user;
    return result.user;
  } catch (error: any) {
    authState.value.error = error.message;
    console.error('Registration error:', error);
    return null;
  }
};

/**
 * Sign in an existing user
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    authState.value.error = null;
    const result = await signInWithEmailAndPassword(auth, email, password);
    authState.value.user = result.user;
    return result.user;
  } catch (error: any) {
    authState.value.error = error.message;
    console.error('Login error:', error);
    return null;
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    authState.value.error = null;
    await signOut(auth);
    authState.value.user = null;
  } catch (error: any) {
    authState.value.error = error.message;
    console.error('Logout error:', error);
  }
};

/**
 * Get current auth state
 */
export const getAuthState = () => authState.value;

/**
 * Get reactive auth state
 */
export const useAuthState = () => authState;
