import { ref, Ref } from 'vue';

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'student';
  fullName?: string;
  gender?: string;
  section?: string;
  subject?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  role: 'admin' | 'student' | null;
  error: string | null;
}

const authState: Ref<AuthState> = ref({
  isAuthenticated: false,
  username: null,
  role: null,
  error: null
});

// Initialize auth state from localStorage
const initializeAuthState = () => {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    const session = JSON.parse(stored) as { username?: string };
    const user = getAllUsers().find((item) => item.username === session.username);
    if (!user) return;
    authState.value.isAuthenticated = true;
    authState.value.username = user.username;
    authState.value.role = user.role;
  }
};

// Get all users from localStorage
const getAllUsers = (): User[] => {
  const stored = localStorage.getItem('attendanceUsers');
  if (!stored) {
    // Initialize with admin user
    const defaultUsers: User[] = [
      { username: 'chicken', password: 'cookie', role: 'admin', fullName: 'Admin User', section: 'Admin', subject: 'Administration' }
    ];
    localStorage.setItem('attendanceUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  const users = JSON.parse(stored) as User[];
  const normalizedUsers = users.map((user) => (
    user.role === 'admin' && user.username !== 'chicken'
      ? { ...user, role: 'student' as const }
      : user
  ));
  localStorage.setItem('attendanceUsers', JSON.stringify(normalizedUsers));
  return normalizedUsers;
};

// Register a new user
export const register = async (
  username: string,
  password: string,
  role: 'admin' | 'student',
  fullName?: string,
  gender?: string,
  section?: string,
  subject?: string
): Promise<boolean> => {
  try {
    const users = getAllUsers();

    if (role === 'admin' && username.trim().toLowerCase() !== 'chicken') {
      authState.value.error = 'Only the chicken account can be an admin';
      return false;
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      authState.value.error = 'Username already exists';
      return false;
    }

    // Add new user
    users.push({
      username,
      password,
      role,
      fullName: fullName?.trim() || '',
      gender: gender?.trim() || '',
      section: section?.trim() || '',
      subject: subject?.trim() || ''
    });
    localStorage.setItem('attendanceUsers', JSON.stringify(users));
    authState.value.error = null;
    return true;
  } catch (error: any) {
    authState.value.error = error.message;
    return false;
  }
};

// Login user
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      authState.value.error = 'Invalid username or password';
      return false;
    }

    if (user.role === 'admin' && user.username !== 'chicken') {
      authState.value.error = 'Only the chicken account can be an admin';
      return false;
    }

    authState.value.isAuthenticated = true;
    authState.value.username = user.username;
    authState.value.role = user.role;
    authState.value.error = null;
    isAuthenticated.value = true;
    currentUsername.value = user.username;
    currentRole.value = user.role;
    error.value = null;

    // Store current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username,
      role: user.role
    }));

    return true;
  } catch (error: any) {
    authState.value.error = error.message;
    return false;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  authState.value.isAuthenticated = false;
  authState.value.username = null;
  authState.value.role = null;
  authState.value.error = null;
  isAuthenticated.value = false;
  currentUsername.value = null;
  currentRole.value = null;
  error.value = null;
  localStorage.removeItem('currentUser');
};

// Export reactive states
export const isAuthenticated = ref(authState.value.isAuthenticated);
export const currentUsername = ref(authState.value.username);
export const currentRole = ref(authState.value.role);
export const error = ref(authState.value.error);

// Watch for auth state changes
export const watchAuthState = () => {
  isAuthenticated.value = authState.value.isAuthenticated;
  currentUsername.value = authState.value.username;
  currentRole.value = authState.value.role;
  error.value = authState.value.error;
};

// Get auth state
export const getAuthState = () => authState.value;

export const getCurrentUserProfile = (): User | null => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return null;

  try {
    const session = JSON.parse(currentUser) as { username?: string };
    const users = getAllUsers();
    return users.find((user) => user.username === session.username) || null;
  } catch {
    return null;
  }
};

// Initialize auth on app load
initializeAuthState();
isAuthenticated.value = authState.value.isAuthenticated;
currentUsername.value = authState.value.username;
currentRole.value = authState.value.role;
