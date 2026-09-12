# Firebase Integration Guide

This app is now fully integrated with Firebase for authentication, real-time data sync, and cloud storage of attendance records.

## 📋 Features Implemented

### ✅ Authentication
- User registration with email/password
- Secure login system
- Session persistence
- Logout functionality
- Protected routes (redirect to auth if not logged in)

### ✅ Firestore Database
- Real-time sync of attendance records
- Cloud storage for all user data
- Automatic date-ordered queries
- Per-user data isolation (users only see their records)

### ✅ Real-time Updates
- Live data synchronization across devices
- Automatic updates when records are added/edited/deleted
- Real-time statistics calculation

### ✅ Data Persistence
- All records stored in Firestore
- Automatic backup in Firebase
- Cross-device sync

## 🔧 Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "attendance-tracker")
4. Follow the setup wizard

### 2. Set Up Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Save changes

### 3. Create Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose location (closest to your region)
4. Start in **Test Mode** (for development) or **Production Mode** (with security rules)
5. Click **Enable**

### 4. Get Firebase Credentials
1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the web icon (</> )
3. Copy your Firebase config object
4. It should look like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
}
```

### 5. Configure Environment Variables
1. Create `.env.local` file in project root (copy from `.env.example`)
2. Fill in your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 6. (Optional) Set Up Security Rules
For production, update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own records
    match /attendanceRecords/{document=**} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 App Flow

1. **AuthPage** (`/auth`)
   - Users register or login
   - Email/password authentication
   - Automatic redirect to home on success

2. **HomePage** (`/`)
   - Protected route (requires authentication)
   - Shows all user's attendance records
   - Real-time updates from Firestore
   - Full CRUD operations

## 🔐 Security Notes

- **Never commit `.env.local`** - Add to `.gitignore`
- Use **Test Mode** only for development
- Set up proper **Security Rules** before going to production
- Users can only access their own data (enforced by rules)
- All data is encrypted in transit and at rest

## 📦 Project Structure

```
src/
├── config/
│   └── firebaseConfig.ts          # Firebase initialization
├── services/
│   ├── authService.ts             # Authentication logic
│   └── firestoreService.ts        # Database operations
├── composables/
│   └── useAttendance.ts           # Vue composable (main API)
├── components/
│   └── AttendanceTracker-v2.vue   # Main tracker UI
├── views/
│   ├── AuthPage.vue               # Login/Register page
│   └── HomePage.vue               # Home page
└── router/
    └── index.ts                   # Routes with auth guards
```

## 🛠 API Reference

### useAttendance Composable

```typescript
const {
  // Auth state
  isAuthenticated,      // boolean
  currentUser,          // Firebase User | null
  
  // Attendance data
  records,              // AttendanceRecord[]
  stats,                // { present, absent, late, excused, total }
  recordsLoading,       // boolean
  
  // Auth methods
  login,                // (email, password) => Promise<boolean>
  register,             // (email, password) => Promise<boolean>
  logout,               // () => Promise<void>
  
  // Record methods
  addRecord,            // (name, status, date, reason) => Promise<boolean>
  updateRecord,         // (id, updates) => Promise<boolean>
  deleteRecord,         // (id) => Promise<boolean>
  
  // Utilities
  formatDate,           // (date: string) => string
  filterByStatus,       // (status: string) => AttendanceRecord[]
  filterByDateRange,    // (start, end) => AttendanceRecord[]
} = useAttendance();
```

## 🐛 Troubleshooting

### Records not showing?
- Check if Firebase credentials are correct in `.env.local`
- Verify Firestore database is created
- Check browser console for errors
- Ensure user is authenticated

### Authentication not working?
- Verify Email/Password provider is enabled in Firebase
- Check that `.env.local` has correct credentials
- Clear browser cache and try again

### Data not persisting?
- Verify Firestore Database exists
- Check Firestore rules allow read/write
- Check browser console for Firebase errors

### App not redirecting to auth?
- Clear browser cache
- Ensure auth guards in router are working
- Check localStorage for authentication token

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Vue 3 Composables](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Ionic Vue](https://ionicframework.com/docs/vue/overview)
