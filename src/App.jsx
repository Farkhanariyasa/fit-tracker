import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Icons (Inline SVGs for reliability) ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconTrack = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconGuide = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconBike = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>;
const IconDumbbell = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.4 14.4 5.2-5.2"/><path d="M22.6 11.3l-2.8-2.8"/><path d="m11.3 22.6-2.8-2.8"/><path d="m8.5 8.5 7 7"/><path d="m4.2 4.2 2.8 2.8"/><path d="m1.4 12.7 2.8 2.8"/><path d="m5.7 18.4 5.6-5.6"/></svg>;
const IconRest = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const IconFood = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconFlame = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IconTrophy = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconStar = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconScale = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.1 1-1 2-3 2s-2.9-1-3-2Z"/><path d="m2 16 3-8 3 8c-.1 1-1 2-3 2s-2.9-1-3-2Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// --- Built-in Mini Database ---
const FOOD_DB = [];

const DUMBBELL_EXERCISES = [
  { id: 'press', name: 'Dumbbell Floor Press', target: 'Dada & Lengan' },
  { id: 'row', name: 'Dumbbell Row', target: 'Punggung' },
  { id: 'squat', name: 'Goblet Squat', target: 'Paha Depan' },
  { id: 'rdl', name: 'Romanian Deadlift', target: 'Paha Belakang' }
];

// --- Schedule Definition ---
const DEFAULT_SCHEDULE = {
  0: { title: 'Minggu', type: '', workout: '', desc: '' },
  1: { title: 'Senin', type: '', workout: '', desc: '' },
  2: { title: 'Selasa', type: '', workout: '', desc: '' },
  3: { title: 'Rabu', type: '', workout: '', desc: '' },
  4: { title: 'Kamis', type: '', workout: '', desc: '' },
  5: { title: 'Jumat', type: '', workout: '', desc: '' },
  6: { title: 'Sabtu', type: '', workout: '', desc: '' },
};

const getIconForWorkout = (workoutName) => {
  const name = (workoutName || '').toLowerCase();
  if (name.includes('bike')) return <IconBike />;
  if (name.includes('dumbel') || name.includes('gym') || name.includes('latihan')) return <IconDumbbell />;
  if (name.includes('rest') || name.includes('recovery') || name.includes('istirahat') || name.includes('tidur')) return <IconRest />;
  return <IconDumbbell />; // Default focus
};

// --- Helper: Hitung Target Kalori Dinamis ---
// Pakai Rumus Mifflin-St Jeor (Paling akurat untuk medis)
const calculateTargetCalories = (weight, height, age) => {
  if (!weight || !height || !age) return 0;
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);
  
  // Rumus Pria: BMR = 10W + 6.25H - 5A + 5
  const bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
  const tdee = bmr * 1.2;
  return Math.round(tdee - 500);
};

// --- Firebase Initialization ---
let db, auth, appId;
const provider = new GoogleAuthProvider();

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = firebaseConfig.appId || 'default-app-id';
} catch (e) {
  console.error("Firebase init error:", e);
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Custom Schedule State
  const [userSchedule, setUserSchedule] = useState(DEFAULT_SCHEDULE);
  const [editingDay, setEditingDay] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Force Light Mode for the Earthy Palette
  useEffect(() => {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }, []);

  const [settingsTab, setSettingsTab] = useState('profil');
  const [workoutOptions, setWorkoutOptions] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [newActivityType, setNewActivityType] = useState('active');

  // Profile & Gamification (Expanded for targets)
  const [profile, setProfile] = useState({ 
    startWeight: '', 
    targetWeight: '', 
    height: '', 
    age: '',
    targetDuration: '',
    dailyBudget: '',
    waterTarget: ''
  });

  // Master state for all-in-one tracking
  const [todayLog, setTodayLog] = useState({
    weight: '',
    foods: [],
    totalCalories: 0,
    budgetSpent: 0,
    workoutCompleted: false,
    bikeDuration: '',
    dumbellSets: {},
    notes: '',
    additionalWorkouts: []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  
  // Temp states for UI inputs
  const [customFood, setCustomFood] = useState({ name: '', cal: '', price: '' });
  const [selectedMealWindow, setSelectedMealWindow] = useState('Sarapan');
  const [quickAddMenu, setQuickAddMenu] = useState(FOOD_DB);
  const [tempSet, setTempSet] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);

  const today = new Date();
  const dayIndex = today.getDay();
  const dateString = today.toISOString().split('T')[0];
  const todaySchedule = userSchedule[dayIndex];

  // --- 1. Init Auth & Fetch Data ---
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Fetch daily logs
    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'dailyLogs');
    const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(data);

      const todayData = data.find(log => log.date === dateString);
      if (todayData && !isInitialized) {
        setTodayLog({
          weight: todayData.weight || '',
          foods: todayData.foods || [],
          totalCalories: todayData.totalCalories || 0,
          budgetSpent: todayData.budgetSpent || 0,
          workoutCompleted: todayData.workoutCompleted || false,
          bikeDuration: todayData.bikeDuration || '',
          dumbellSets: todayData.dumbellSets || {},
          notes: todayData.notes || '',
          additionalWorkouts: todayData.additionalWorkouts || []
        });
        setIsInitialized(true);
      } else if (!todayData) {
        setIsInitialized(true); // Mark as ready even if no data today
      }
    }, (error) => console.error("Snapshot error:", error));

    // Fetch custom schedule
    const scheduleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userSchedule');
    const unsubscribeSchedule = onSnapshot(scheduleRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().schedule) {
        setUserSchedule(docSnap.data().schedule);
      }
    }, (error) => console.error("Snapshot schedule error:", error));

    // Fetch User Profile
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userProfile');
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...profile,
          ...data
        });
        // If profile is empty (like after reset), treat as new user
        if (!data.startWeight || !data.height) {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }
      } else {
        setIsNewUser(true);
      }
    }, (error) => console.error("Snapshot profile error:", error));

    // Fetch Quick Add Menu
    const quickMenuRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'quickAddMenu');
    const unsubscribeQuickMenu = onSnapshot(quickMenuRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        setQuickAddMenu([...FOOD_DB, ...docSnap.data().items]);
      }
    }, (error) => console.error("Snapshot quick menu error:", error));

    // Fetch Workout Options
    const workoutOptionsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'workoutOptions');
    const unsubscribeWorkoutOptions = onSnapshot(workoutOptionsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().options) {
        const rawOptions = docSnap.data().options;
        // Migration: If rawOptions is array of strings, convert to objects
        if (rawOptions.length > 0 && typeof rawOptions[0] === 'string') {
          const migrated = rawOptions.map(name => ({ name, type: name.toLowerCase().includes('istirahat') || name.toLowerCase().includes('recovery') || name.toLowerCase().includes('rest') ? 'rest' : 'active' }));
          setWorkoutOptions(migrated);
          setDoc(workoutOptionsRef, { options: migrated }, { merge: true });
        } else {
          setWorkoutOptions(rawOptions);
        }
      }
    }, (error) => console.error("Snapshot workout options error:", error));

    return () => { unsubscribeLogs(); unsubscribeSchedule(); unsubscribeProfile(); unsubscribeQuickMenu(); unsubscribeWorkoutOptions(); };
  }, [user]);


  // --- 2. Handlers ---
  const handleSaveProfile = async () => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userProfile'), profile, { merge: true });
      setModal({
        isOpen: true,
        title: 'Target Terupdate!',
        message: 'Goal kesehatanmu berhasil diperbarui. Mari kejar target tersebut!',
        type: 'success'
      });
    } catch (err) {
      console.error("Save profile error:", err);
      setModal({
        isOpen: true,
        title: 'Gagal Simpan',
        message: 'Terjadi kesalahan saat menyimpan profil. Coba lagi nanti.',
        type: 'danger'
      });
    }
  };

  const handleSaveLog = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dailyLogs', dateString);
      await setDoc(docRef, {
        ...todayLog,
        date: dateString,
        dayName: todaySchedule.title,
        scheduleType: todaySchedule.type,
        scheduleWorkout: todaySchedule.workout,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSaveMessage('Log Berhasil Disimpan!');
      setTimeout(() => setSaveMessage(''), 2000);
      return true;
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage('Gagal menyimpan.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSaveXP = async () => {
    const success = await handleSaveLog();
    if (success) {
      setModal({
        isOpen: true,
        title: 'Status Berhasil!',
        message: 'Aktivitasmu telah dicatat dan XP berhasil di-update. Teruslah konsisten!',
        type: 'success'
      });
    }
  };

  const handleAddFasting = () => {
    const fastingItem = { 
      name: `Puasa (${selectedMealWindow})`, 
      cal: 0, 
      price: 0, 
      category: selectedMealWindow, 
      logId: Date.now(),
      isFasting: true 
    };
    setTodayLog({ ...todayLog, foods: [...todayLog.foods, fastingItem] });
    setModal({
      isOpen: true,
      title: 'Puasa Dicatat',
      message: `Jendela ${selectedMealWindow} kamu ditandai sebagai puasa.`,
      type: 'info'
    });
  };

  const handleClaimRestXP = () => {
    setTodayLog({ ...todayLog, workoutCompleted: true });
    // Note: We don't auto-save, user must save manually or it will save on next trigger
    setModal({
      isOpen: true,
      title: 'Bonus Istirahat!',
      message: 'Kamu telah mengambil waktu istirahat sesuai jadwal. XP bonus diberikan!',
      type: 'success'
    });
  };

  const handleSaveQuickMenu = async (newItems) => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'quickAddMenu'), { items: newItems }, { merge: true });
    } catch (err) {
      console.error("Save manual menu error:", err);
    }
  };

  const handleResetData = async () => {
    if (!user || !db) return;
    try {
      // 1. Reset Settings Collection to truly EMPTY state
      const batchDocs = [
        { 
          ref: doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userProfile'), 
          data: { startWeight: '', targetWeight: '', height: '', age: '', dailyBudget: '', waterTarget: '' } 
        },
        { 
          ref: doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userSchedule'), 
          data: { schedule: DEFAULT_SCHEDULE } 
        },
        { 
          ref: doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'quickAddMenu'), 
          data: { items: [] } 
        },
        { 
          ref: doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'workoutOptions'), 
          data: { options: [] } 
        }
      ];

      for (const item of batchDocs) {
        await setDoc(item.ref, item.data, { merge: false });
      }
      
      // 2. Clear Today's Log
      const todayRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dailyLogs', dateString);
      await setDoc(todayRef, { weight: '', foods: [], totalCalories: 0, budgetSpent: 0, workoutCompleted: false, additionalWorkouts: [] });

      setModal({
        isOpen: true,
        title: 'Akuntansi Direset!',
        message: 'Seluruh custom goal, menu, dan aktivitas telah dihapus. Menunggu restart...',
        type: 'info'
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error("Reset error:", err);
      setModal({
        isOpen: true,
        title: 'Gagal Reset',
        message: 'Terjadi kesalahan sistem saat menghapus data akun.',
        type: 'danger'
      });
    }
  };

  const handleSaveWorkoutOptions = async (newOptions) => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'workoutOptions'), { options: newOptions }, { merge: true });
    } catch (err) {
      console.error("Save workout options error:", err);
    }
  };

  // Re-added helper for manual save messages, but removed auto-save timer

  const handleAddFood = (food) => {
    const newFoods = [...todayLog.foods, { ...food, category: selectedMealWindow, logId: Date.now() }];
    setTodayLog({ 
      ...todayLog, 
      foods: newFoods, 
      totalCalories: todayLog.totalCalories + Number(food.cal), 
      budgetSpent: todayLog.budgetSpent + Number(food.price) 
    });
  };

  const handleRemoveFood = (logId) => {
    const foodToRemove = todayLog.foods.find(f => f.logId === logId);
    if(!foodToRemove) return;
    const newFoods = todayLog.foods.filter(f => f.logId !== logId);
    setTodayLog({ 
      ...todayLog, 
      foods: newFoods, 
      totalCalories: todayLog.totalCalories - Number(foodToRemove.cal), 
      budgetSpent: todayLog.budgetSpent - Number(foodToRemove.price) 
    });
  };

  const handleAddCustomFood = () => {
    if(!customFood.name || !customFood.cal) return;
    handleAddFood({
      name: customFood.name,
      cal: Number(customFood.cal),
      price: Number(customFood.price || 0)
    });
    setCustomFood({ name: '', cal: '', price: '' });
  };

  const handleAddSet = (exerciseId) => {
    const kg = tempSet[`${exerciseId}_kg`];
    const reps = tempSet[`${exerciseId}_reps`];
    if(!kg || !reps) return;
    
    const currentSets = todayLog.dumbellSets[exerciseId] || [];
    const newSets = [...currentSets, { kg: Number(kg), reps: Number(reps), setId: Date.now() }];
    
    setTodayLog({
      ...todayLog,
      dumbellSets: { ...todayLog.dumbellSets, [exerciseId]: newSets }
    });
    setTempSet({ ...tempSet, [`${exerciseId}_kg`]: '', [`${exerciseId}_reps`]: '' });
  };

  const handleRemoveSet = (exerciseId, setId) => {
    const currentSets = todayLog.dumbellSets[exerciseId] || [];
    const newSets = currentSets.filter(s => s.setId !== setId);
    setTodayLog({
      ...todayLog,
      dumbellSets: { ...todayLog.dumbellSets, [exerciseId]: newSets }
    });
  };

  const handleSaveSchedule = async (dayKey) => {
    if (!user || !db) return;
    const newSchedule = {
      ...userSchedule,
      [dayKey]: {
        ...userSchedule[dayKey],
        type: editFormData.type,
        workout: editFormData.workout,
        desc: editFormData.desc
      }
    };
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userSchedule'), { schedule: newSchedule }, { merge: true });
      setUserSchedule(newSchedule);
      setEditingDay(null);
    } catch (err) {
      console.error("Failed to save schedule", err);
    }
  };

  // --- Gamification and Smart Calorie Math ---
  const currentWeightObj = logs.length > 0 ? logs[0].weight : profile.startWeight;
  const displayWeight = todayLog.weight || currentWeightObj || 0;
  
  // Hitung Target Kalori Berdasarkan BB Saat Ini
  const currentTargetCalories = calculateTargetCalories(displayWeight, profile.height, profile.age);

  // Perhitungan XP Dinamis (Real-time merge todayLog)
  let xp = 0;
  const historicLogs = logs.filter(l => l.date !== dateString);
  
  // 1. Process Past Logs (Only awarded for completed actions)
  historicLogs.forEach(log => {
    // Calorie Target met?
    const logTargetCal = calculateTargetCalories(log.weight || profile.startWeight, profile.height, profile.age);
    if (log.totalCalories > 0 && log.totalCalories <= logTargetCal) xp += 20; 
    
    // Workout Claimed?
    if (log.workoutCompleted) xp += 50;
    
    // Weight recorded?
    if (log.weight) xp += 10;

    // Jendela makan complete?
    const hSarapan = log.foods?.some(f => f.category === 'Sarapan');
    const hSiang = log.foods?.some(f => f.category === 'Makan Siang');
    const hMalam = log.foods?.some(f => f.category === 'Makan Malam');
    const wCount = [hSarapan, hSiang, hMalam].filter(Boolean).length;
    if (wCount === 3) xp += 20;

    if (log.additionalWorkouts && log.additionalWorkouts.length > 0) {
      xp += (log.additionalWorkouts.length * 15);
    }
  });

  // 2. Process Today's Progress (Actions-only)
  if (todayLog.weight) xp += 10; 
  if (todayLog.totalCalories > 0 && todayLog.totalCalories <= currentTargetCalories) {
    xp += 20;
  }
  if (todayLog.workoutCompleted) {
    xp += 50;
  }
  
  const hasSarapan = todayLog.foods.some(f => f.category === 'Sarapan');
  const hasSiang = todayLog.foods.some(f => f.category === 'Makan Siang');
  const hasMalam = todayLog.foods.some(f => f.category === 'Makan Malam');
  const windowCount = [hasSarapan, hasSiang, hasMalam].filter(Boolean).length;
  if (windowCount === 3) xp += 20;

  if (todayLog.additionalWorkouts && todayLog.additionalWorkouts.length > 0) {
    xp += (todayLog.additionalWorkouts.length * 15);
  }

  const xpThresholds = [0, 100, 250, 450, 750, 1150, 1650, 2450];
  let currentLevel = 1;
  let nextThreshold = 100;
  let currentLevelBase = 0;
  
  for (let i = 0; i < xpThresholds.length; i++) {
    if (xp >= xpThresholds[i]) {
      currentLevel = i + 1;
      currentLevelBase = xpThresholds[i];
      nextThreshold = xpThresholds[i + 1] || Infinity;
    }
  }

  const isMaxLevel = nextThreshold === Infinity;
  const levelMax = isMaxLevel ? 1 : nextThreshold - currentLevelBase;
  const currentLevelProgress = isMaxLevel ? 1 : xp - currentLevelBase;
  const xpProgressPercent = isMaxLevel ? 100 : (currentLevelProgress / levelMax) * 100;

  const titles = ["Fitness Rookie", "Sweat Warrior", "Consistent King", "Habit Master", "Fitness God", "FitTracker Legend", "Mountain Titan", "Apex Athlete"];
  const rankTitle = titles[Math.min(currentLevel - 1, titles.length - 1)];

  let weightProgress = 0;
  if (profile.startWeight && profile.targetWeight && displayWeight) {
    const totalToLose = profile.startWeight - profile.targetWeight;
    const lost = profile.startWeight - displayWeight;
    weightProgress = Math.max(0, Math.min(100, (lost / totalToLose) * 100));
  }

  // --- Chart Logic ---
  const chartLogs = [...logs].filter(l => l.weight).sort((a, b) => new Date(a.date) - new Date(b.date));
  let chartPoints = [];
  let chartPathD = '';
  let chartAreaD = '';
  
  if (chartLogs.length >= 2) {
    const w = 300;
    const h = 80;
    const padY = 15;
    const padX = 10;
    const weights = chartLogs.map(l => parseFloat(l.weight));
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1; // Cegah bagi nol

    chartPoints = chartLogs.map((l, i) => {
      const x = padX + (i / (chartLogs.length - 1)) * (w - padX * 2);
      const y = h - padY - ((parseFloat(l.weight) - minW) / range) * (h - padY * 2);
      return { x, y, weight: l.weight, date: l.date.substring(5) }; // Ambil MM-DD
    });

    chartPathD = `M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    chartAreaD = `${chartPathD} L ${chartPoints[chartPoints.length-1].x} ${h} L ${chartPoints[0].x} ${h} Z`;
  }

  // --- 3. Render Views ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Gamification Header */}
      <div className="glass-card rounded-2xl p-6 flex items-center space-x-6 relative overflow-hidden">
        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
          <IconTrophy />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <p className="flex items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
              <span className="mr-1"><IconStar /></span> Level {currentLevel}
            </p>
            <p className="text-xs font-bold text-primary uppercase">{isMaxLevel ? 'MAX LEVEL' : `${currentLevelProgress} / ${levelMax} XP`}</p>
          </div>
          <h2 className="text-xl font-bold tracking-tight leading-tight">{rankTitle}</h2>
          <div className="w-full bg-glass-border h-2.5 rounded-full mt-3 overflow-hidden shadow-inner">
            <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${xpProgressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="glass-card rounded-2xl p-6 shadow-md relative overflow-hidden border-t-4 border-t-primary">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">{todaySchedule.title}</h2>
              <p className="text-[10px] font-bold text-primary opacity-80 tracking-widest uppercase mt-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-sm">
              {getIconForWorkout(todaySchedule.workout)}
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Main Protocol</p>
            <p className="text-xl font-bold mt-1 text-text-main leading-tight">{todaySchedule.type} & {todaySchedule.workout}</p>
            <p className="text-sm text-text-secondary mt-2 font-medium line-clamp-2 leading-relaxed">{todaySchedule.desc}</p>
          </div>
        </div>
      </div>

      {/* Target & Progress Card */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/20 text-success rounded-xl"><IconTarget /></div>
            <h3 className="font-bold text-text-main tracking-tight">Health Journey</h3>
          </div>
          <button onClick={() => setActiveTab('settings')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg tracking-wider hover:bg-primary/20 transition-all active:scale-95">MANAGE</button>
        </div>

        {!profile.targetWeight ? (
          <div className="bg-bg-paper p-6 rounded-2xl border border-dashed border-primary/10 text-center space-y-4">
             <p className="text-sm text-text-secondary font-medium px-4">Kamu belum mengatur target berat badan dan profil kesehatan. Atur sekarang di menu Pengaturan.</p>
             <button 
               onClick={() => setActiveTab('settings')} 
               className="w-full py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all text-center"
             >
               ATUR SEKARANG
             </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Current Status</p>
                <p className="text-3xl font-bold text-text-main mt-1 tracking-tighter">{displayWeight} <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">kg</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Progress</p>
                <p className="text-xl font-bold mt-1 text-success tracking-tighter">
                  -{profile.startWeight && displayWeight ? Math.max(0, (profile.startWeight - displayWeight)).toFixed(1) : 0} kg
                </p>
              </div>
            </div>
            
            <div className="w-full bg-glass-border h-2.5 rounded-full overflow-hidden relative shadow-inner">
            <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${weightProgress}%` }}></div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">Weight Journey</h3>
            {chartLogs.length >= 2 ? (
              <div className="relative w-full h-36 bg-bg-paper/50 rounded-2xl p-4 border border-primary/10 shadow-inner group">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chartAreaD} fill="url(#weightGradient)" />
                  <path d={chartPathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {chartPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-bg-paper)" stroke="var(--color-primary)" strokeWidth="2" />
                  ))}
                </svg>
                <div className="flex justify-between mt-3 text-[10px] text-text-secondary font-bold tracking-widest">
                  <span>{chartPoints[0].date}</span>
                  <span>{chartPoints[chartPoints.length-1].date}</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-24 bg-bg-paper/50 rounded-2xl flex items-center justify-center border border-dashed border-primary/10">
                <p className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-widest leading-relaxed text-center px-4">Catat BB minimal 2 hari berbeda untuk melihat grafik trennya.</p>
              </div>
            )}
          </div>

            {/* Daily Update */}
            <div className="pt-6 border-t border-primary/10">
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Update Current Weight</label>
              <div className="flex space-x-3 items-center">
                <input 
                  type="number" 
                  value={todayLog.weight}
                  onChange={(e) => setTodayLog({...todayLog, weight: e.target.value})}
                  className="flex-1 h-14 px-5 font-bold text-primary text-xl"
                  placeholder={`${displayWeight}`}
                />
                <button className="h-14 px-8 btn-primary text-sm whitespace-nowrap" onClick={handleSaveLog}>
                  SAVE LOG
                </button>
              </div>
              {saveMessage && <p className="text-[10px] text-success font-bold mt-4 text-center uppercase tracking-widest">{saveMessage}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6 shadow-sm border-l-4 border-l-warning">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Total Calories</p>
          <p className={`text-2xl font-bold tracking-tighter ${todayLog.totalCalories > currentTargetCalories ? 'text-danger' : 'text-primary'}`}>
            {todayLog.totalCalories} <span className="text-[10px] font-bold text-text-secondary uppercase ml-1">/ {currentTargetCalories}</span>
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 shadow-sm border-l-4 border-l-success">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Budget Left</p>
          <p className={`text-2xl font-bold tracking-tighter ${Number(profile.dailyBudget) - todayLog.budgetSpent < 0 ? 'text-danger' : 'text-success'}`}>
            Rp {(Number(profile.dailyBudget) - todayLog.budgetSpent).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Today's Quests */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-5 flex items-center">
          TODAY'S QUESTS
        </h3>
        {(!profile.startWeight || workoutOptions.length === 0 || Object.keys(userSchedule).length === 0) ? (
          <div className="text-center py-10 px-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 scale-110">
                <IconStar />
              </div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-2">Setup Belum Lengkap</p>
              <p className="text-[10px] text-text-secondary font-bold leading-relaxed mb-6">Silakan selesaikan konfigurasi profil, olahraga, dan jadwal di menu Pengaturan.</p>
              <button 
                onClick={() => setActiveTab('settings')} 
                className="btn-primary px-8 h-12 text-[10px] uppercase font-black tracking-widest shadow-md"
              >
                KE PENGATURAN
              </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-paper/50 rounded-2xl border border-primary/10 hover:bg-bg-paper transition-all relative overflow-hidden group">
              {todayLog.weight && <div className="absolute inset-0 bg-success/5 z-0"></div>}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative z-10 ${todayLog.weight ? 'bg-success text-white' : 'bg-primary/10 text-primary'}`}>
                {todayLog.weight ? <IconCheck /> : <IconScale />}
              </div>
              <div className="flex-1 px-4 relative z-10">
                <span className={`text-sm font-bold tracking-tight ${todayLog.weight ? 'text-success' : 'text-text-main'}`}>Record Daily Weight</span>
              </div>
              <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all flex-shrink-0 relative z-10 ${todayLog.weight ? 'bg-success text-white shadow-sm' : 'bg-primary/10 text-primary'}`}>
                 <span className="mr-1.5 scale-75"><IconStar /></span> {todayLog.weight ? 'DONE' : '+10 XP'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-paper/50 rounded-2xl border border-primary/10 hover:bg-bg-paper transition-all relative overflow-hidden group">
              {windowCount === 3 && <div className="absolute inset-0 bg-success/5 z-0"></div>}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative z-10 ${windowCount === 3 ? 'bg-success text-white' : 'bg-primary/10 text-primary'}`}>
                {windowCount === 3 ? <IconCheck /> : <IconFood />}
              </div>
              <div className="flex-1 px-4 relative z-10">
                <span className={`text-sm font-bold tracking-tight ${windowCount === 3 ? 'text-success' : 'text-text-main'}`}>3 Jendela Makan ({windowCount}/3)</span>
                <p className="text-[9px] text-text-secondary font-bold uppercase mt-0.5">Pagi, Siang, Malam</p>
              </div>
              <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all flex-shrink-0 relative z-10 ${windowCount === 3 ? 'bg-success text-white shadow-sm' : 'bg-primary/10 text-primary'}`}>
                 <span className="mr-1.5 scale-75"><IconStar /></span> {windowCount === 3 ? 'DONE' : '+20 XP'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-paper/50 rounded-2xl border border-primary/10 hover:bg-bg-paper transition-all relative overflow-hidden group">
              {todayLog.workoutCompleted && <div className="absolute inset-0 bg-success/5 z-0"></div>}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative z-10 ${todayLog.workoutCompleted ? 'bg-success text-white' : 'bg-primary/10 text-primary'}`}>
                {todayLog.workoutCompleted ? <IconCheck /> : (workoutOptions.find(o => o.name === todaySchedule.workout)?.type === 'rest' ? <IconRest /> : getIconForWorkout(todaySchedule.workout))}
              </div>
              <div className="flex-1 px-4 relative z-10">
                <span className={`text-sm font-bold tracking-tight ${todayLog.workoutCompleted ? 'text-success' : 'text-text-main'}`}>
                  {workoutOptions.find(o => o.name === todaySchedule.workout)?.type === 'rest' ? 'Ambil Bonus Istirahat' : `Finish ${todaySchedule.workout}`}
                </span>
                {!todayLog.workoutCompleted && (workoutOptions.find(o => o.name === todaySchedule.workout)?.type === 'rest') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClaimRestXP(); }}
                    className="block mt-1 text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest hover:bg-primary/20"
                  >
                    Klaim Bonus XP
                  </button>
                )}
              </div>
              <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all flex-shrink-0 relative z-10 ${todayLog.workoutCompleted ? 'bg-[var(--color-success)] text-white shadow-sm' : 'bg-[var(--color-primary)]/10 text-primary'}`}>
                 <span className="mr-1.5 scale-75"><IconStar /></span> {todayLog.workoutCompleted ? 'DONE' : '+50 XP'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    const typeOptions = ['Normal Diet', 'Puasa', 'Intermittent Fasting'];

    return (
      <div className="space-y-6 animate-slide-up pb-24">
        <div className="flex flex-col space-y-4 px-1">
          <h2 className="text-2xl font-bold text-text-main tracking-tight">Pengaturan</h2>
          
          <div className="flex bg-bg-paper p-1 rounded-2xl border border-[var(--color-glass-border)] shadow-sm overflow-x-auto scrollbar-hide">
            {[
              { id: 'profil', label: 'Profil' },
              { id: 'aktivitas', label: 'Aktivitas' },
              { id: 'database', label: 'Database' },
              { id: 'panduan', label: 'Panduan' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex-1 min-w-[70px] px-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${settingsTab === tab.id ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-text-secondary font-bold'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {settingsTab === 'profil' && (
          <div className="glass-card rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-5">Target Utama</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">BB Awal (kg)</label>
                  <input type="number" value={profile.startWeight} onChange={e => setProfile({...profile, startWeight: e.target.value})} className="font-bold text-text-main" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">BB Target (kg)</label>
                  <input type="number" value={profile.targetWeight} onChange={e => setProfile({...profile, targetWeight: e.target.value})} className="font-bold text-text-main" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Tinggi (cm)</label>
                <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} className="font-bold text-text-main" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Usia (Thn)</label>
                <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="font-bold text-text-main" />
              </div>
            </div>
            <div className="space-y-5 pt-2 border-t border-[var(--color-glass-border)]">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Budget Makan (Rp)</label>
                <input type="number" value={profile.dailyBudget} onChange={e => setProfile({...profile, dailyBudget: e.target.value})} className="font-bold text-text-main" />
              </div>
              {currentTargetCalories === 0 && (
                <div className="flex bg-[var(--color-danger)]/5 p-4 rounded-2xl border border-[var(--color-danger)]/10 text-center animate-fade-in mb-4">
                  <p className="text-[10px] text-[var(--color-danger)] font-bold uppercase tracking-widest leading-relaxed">TARGET KALORI HARIAN KAMU: {currentTargetCalories} KCAL. PASTIKAN TERPENUHI ATAU SEDIKIT DI BAWAHNYA.</p>
                </div>
              )}
              {currentTargetCalories === 0 ? (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="w-full btn-primary h-14 text-sm font-black tracking-widest"
                >
                  BUAT TARGET SAYA
                </button>
              ) : (
                <button onClick={handleSaveProfile} className="w-full btn-primary h-14 text-sm font-black tracking-widest shadow-lg shadow-primary/20">
                  UPDATE PROFIL & TARGET
                </button>
              )}
            </div>
          </div>
        )}

        {settingsTab === 'aktivitas' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Jadwal Mingguan</h3>
                <p className="text-[10px] text-primary font-bold opacity-80">*Susun rutinitas olahraga dan pola diet kamu untuk seminggu ke depan</p>
              </div>
              <div className="space-y-4">
                {order.map(dayKey => {
                  const dayData = userSchedule[dayKey];
                  const isEditing = editingDay === dayKey;
                  if (isEditing) {
                    return (
                      <div key={dayKey} className="bg-bg-paper p-5 rounded-2xl border-2 border-primary space-y-5 animate-slide-up">
                        <h4 className="font-bold text-primary text-lg">{dayData.title}</h4>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Protokol Diet</label>
                            <select value={editFormData.type} onChange={e => setEditFormData({...editFormData, type: e.target.value})} className="font-bold text-text-main h-14 bg-bg-paper/50">
                              {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Aktivitas Fisik</label>
                            <select value={editFormData.workout} onChange={e => setEditFormData({...editFormData, workout: e.target.value})} className="font-bold text-text-main h-14 bg-bg-paper/50">
                              {workoutOptions.map(opt => {
                                const name = typeof opt === 'string' ? opt : opt.name;
                                return <option key={name} value={name}>{name}</option>;
                              })}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Catatan Tambahan</label>
                            <textarea value={editFormData.desc} onChange={e => setEditFormData({...editFormData, desc: e.target.value})} className="text-sm text-text-main leading-relaxed bg-bg-paper/50" rows="3" />
                          </div>
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button onClick={() => setEditingDay(null)} className="flex-1 py-3 bg-[var(--color-bg-main)] text-text-secondary font-bold rounded-xl text-xs uppercase tracking-widest">BATAL</button>
                          <button onClick={() => handleSaveSchedule(dayKey)} className="flex-1 btn-primary text-xs uppercase tracking-widest">UPDATE</button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={dayKey} className="group p-4 bg-bg-paper/50 rounded-2xl border border-[var(--color-glass-border)] flex justify-between items-center hover:bg-bg-paper transition-all">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{dayData.title}</p>
                        <div className="flex gap-2 mt-2">
                           <span className="text-[9px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-lg uppercase">{dayData.type}</span>
                           <span className="text-[9px] font-bold px-2 py-1 bg-success/10 text-success rounded-lg uppercase">{dayData.workout}</span>
                        </div>
                      </div>
                      <button onClick={() => { setEditingDay(dayKey); setEditFormData({ type: dayData.type, workout: dayData.workout, desc: dayData.desc }); }} className="p-3 hover:bg-primary/10 text-primary rounded-xl transition-all">
                        <IconEdit />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'database' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm space-y-5">
               <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Quick Add Favorites</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                  {quickAddMenu.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-primary/10 rounded-2xl">
                       <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Belum ada menu favorit</p>
                    </div>
                  ) : (
                    quickAddMenu.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-bg-paper rounded-xl border border-[var(--color-glass-border)]">
                        <div>
                          <p className="text-xs font-bold text-text-main">{item.name}</p>
                          <p className="text-[9px] text-text-secondary font-bold uppercase">{item.cal} kcal {item.price > 0 && `• Rp ${item.price.toLocaleString('id-ID')}`}</p>
                        </div>
                        <button onClick={() => { const newItems = quickAddMenu.filter((_, i) => i !== idx); handleSaveQuickMenu(newItems); }} className="p-2 text-danger hover:bg-danger/10 rounded-lg">
                          <IconTrash />
                        </button>
                      </div>
                    ))
                  )}
                </div>
               <div className="pt-3 border-t border-[var(--color-glass-border)] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                     <input type="text" placeholder="Nama Menu" className="text-xs" value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})} />
                     <input type="number" placeholder="Kcal" className="text-xs" value={customFood.cal} onChange={e => setCustomFood({...customFood, cal: e.target.value})} />
                  </div>
                  <button onClick={() => { if(!customFood.name || !customFood.cal) return; const newItem = { id: `custom_${Date.now()}`, name: customFood.name, cal: Number(customFood.cal), price: Number(customFood.price || 0) }; const customOnly = quickAddMenu.filter(m => !FOOD_DB.find(f => f.id === m.id)); handleSaveQuickMenu([...customOnly, newItem]); setCustomFood({ name: '', cal: '', price: '' }); }} className="w-full py-4 bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-black rounded-2xl text-[10px] uppercase tracking-widest border border-[var(--color-primary)]/20 shadow-sm active:scale-95 transition-all">
                    SIMPAN KE FAVORIT
                  </button>
               </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Opsi Olahraga</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {workoutOptions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-primary/10 rounded-2xl">
                     <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Belum ada opsi olahraga</p>
                  </div>
                ) : (
                  workoutOptions.map((opt, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-bg-paper rounded-xl border border-[var(--color-glass-border)]">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-main">{opt.name}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${opt.type === 'rest' ? 'text-success' : 'text-primary'}`}>{opt.type === 'active' ? 'Latihan' : 'Istirahat'}</span>
                      </div>
                      <button onClick={() => { const newOptions = workoutOptions.filter((_, i) => i !== idx); handleSaveWorkoutOptions(newOptions); }} className="p-1.5 text-danger hover:bg-danger/10 rounded-lg">
                        <IconTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Nama Aktivitas</label>
                    <input 
                      type="text" 
                      placeholder="Misal: Berenang, Yoga..." 
                      className="w-full text-xs h-14 bg-bg-paper/50" 
                      value={newActivity} 
                      onChange={e => setNewActivity(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Tipe Aktivitas</label>
                    <select 
                      value={newActivityType} 
                      onChange={e => setNewActivityType(e.target.value)} 
                      className="w-full text-[10px] font-bold text-text-main h-14 bg-bg-paper/50"
                    >
                      <option value="active">LATIHAN</option>
                      <option value="rest">RECOVERY</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => { if(!newActivity) return; handleSaveWorkoutOptions([...workoutOptions, { name: newActivity, type: newActivityType }]); setNewActivity(''); }} 
                  className="w-full py-5 btn-primary text-[10px] uppercase shadow-md font-black tracking-[0.2em]"
                >
                  TAMBAH AKTIVITAS
                </button>
              </div>
            </div>

            <div className="px-1 grid grid-cols-2 gap-3 pt-6">
               <button onClick={() => setModal({ isOpen: true, title: 'Wipe All Data?', message: 'Hapus JADWAL, GOAL, MENU CUSTOM, dan AKTIVITAS selamanya?', type: 'danger', onConfirm: handleResetData })} className="flex items-center justify-center py-4 bg-danger/5 text-danger font-black rounded-2xl border border-danger/20 text-[9px] uppercase tracking-widest active:scale-95 transition-all text-center">
                  <IconTrash />
                  <span className="ml-2">WIPE DATA</span>
               </button>
               <button onClick={handleLogout} className="flex items-center justify-center py-4 bg-bg-paper text-text-secondary font-black rounded-2xl border border-[var(--color-glass-border)] text-[9px] uppercase tracking-widest active:scale-95 transition-all text-center">
                  <IconGuide />
                  <span className="ml-2">Sign Out</span>
               </button>
            </div>
          </div>
        )}

        {settingsTab === 'panduan' && (
          <div className="glass-card rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-text-main tracking-tight">Tentang FitTracker</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">FitTracker adalah asisten perjalanan kesehatan Anda yang dirancang untuk memantau kalori, berat badan, serta aktivitas harian, dengan pendekatan gamifikasi.</p>

            <div className="space-y-4 pt-4 border-t border-[var(--color-glass-border)]">
               <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Sistem Level & XP</h4>
               
               <div className="space-y-3">
                 <div className="p-4 bg-bg-paper/50 rounded-2xl border border-[var(--color-glass-border)] shadow-sm">
                    <p className="text-xs font-bold text-text-main mb-3">Cara Mendapatkan XP:</p>
                    <ul className="text-[10px] text-text-secondary font-bold space-y-2 list-none">
                       <li className="flex justify-between items-center"><span className="flex items-center"><span className="text-success mr-2">✓</span>Catat BB Harian</span> <span className="text-success bg-success/10 px-2 py-0.5 rounded">+10 XP</span></li>
                       <li className="flex justify-between items-center"><span className="flex items-center"><span className="text-success mr-2">✓</span>Target Kalori Tercapai</span> <span className="text-success bg-success/10 px-2 py-0.5 rounded">+20 XP</span></li>
                       <li className="flex justify-between items-center"><span className="flex items-center"><span className="text-success mr-2">✓</span>Jendela Makan Lengkap (3x)</span> <span className="text-success bg-success/10 px-2 py-0.5 rounded">+20 XP</span></li>
                       <li className="flex justify-between items-center"><span className="flex items-center"><span className="text-success mr-2">✓</span>Latihan Utama Selesai</span> <span className="text-success bg-success/10 px-2 py-0.5 rounded">+50 XP</span></li>
                       <li className="flex justify-between items-center"><span className="flex items-center"><span className="text-success mr-2">✓</span>Latihan Tambahan Selesai</span> <span className="text-success bg-success/10 px-2 py-0.5 rounded">+15 XP / Latihan</span></li>
                    </ul>
                 </div>

                 <div className="p-4 bg-bg-paper/50 rounded-2xl border border-[var(--color-glass-border)] shadow-sm">
                    <p className="text-xs font-bold text-text-main mb-3">Jenjang Gelar (Rank):</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-text-secondary">
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 1: Fitness Rookie</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">0 - 99 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 2: Sweat Warrior</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">100 - 249 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 3: Consistent King</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">250 - 449 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 4: Habit Master</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">450 - 749 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 5: Fitness God</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">750 - 1149 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 6: FitTracker Legend</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">1150 - 1649 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-glass-border)] rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-text-main">Lv 7: Mountain Titan</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 mt-0.5">1650 - 2449 XP</span>
                       </div>
                       <div className="py-2 px-1 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 rounded-lg flex flex-col items-center justify-center text-center">
                         <span className="text-[var(--color-primary)] font-black">Lv 8+: Apex Athlete</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-primary)] mt-0.5">2450+ XP</span>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDiet = () => {
    if (!profile.startWeight || !profile.height) {
      return (
        <div className="space-y-6 animate-slide-up bg-bg-main min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-primary/10">
            <IconFood />
          </div>
          <h2 className="text-2xl font-black text-text-main uppercase tracking-tight mb-3">Menu Diet Kosong</h2>
          <p className="text-sm text-text-secondary font-bold leading-relaxed mb-10 max-w-[280px]">
            Kamu belum mengatur target kalori. Silakan isi data fisikmu di pengaturan untuk memulai.
          </p>
          <button 
            onClick={() => setActiveTab('settings')}
            className="btn-primary w-full h-16 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
          >
            ATUR PROFIL SEKARANG
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-slide-up pb-24">
      {/* Meal Window Selector */}
      <div className="glass-card rounded-2xl p-4 shadow-sm border-t-4 border-t-[var(--color-primary)]">
         <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Pilih Jendela Makan Anda</p>
         <div className="flex bg-[var(--color-bg-main)] p-1 rounded-2xl border border-[var(--color-glass-border)]">
            {['Sarapan', 'Siang', 'Malam', 'Camilan'].map(w => (
              <button
                key={w}
                onClick={() => setSelectedMealWindow(w === 'Siang' ? 'Makan Siang' : (w === 'Malam' ? 'Makan Malam' : w))}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-tight rounded-xl transition-all ${selectedMealWindow === (w === 'Siang' ? 'Makan Siang' : (w === 'Malam' ? 'Makan Malam' : w)) ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-text-secondary hover:text-primary'}`}
              >
                {w}
              </button>
            ))}
         </div>
         <button 
           onClick={handleAddFasting}
           className="w-full mt-3 py-2 bg-bg-paper border border-[var(--color-glass-border)] rounded-xl text-[9px] font-black uppercase tracking-[0.1em] text-text-secondary hover:text-primary transition-all active:scale-95"
         >
           Catat Puasa untuk {selectedMealWindow}
         </button>
      </div>

      {/* Quick Add Section */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-5">Quick Add Menu</h2>
        <div className="flex overflow-x-auto space-x-4 pb-3 no-scrollbar scroll-smooth">
          {quickAddMenu.map(food => (
            <button 
              key={food.id}
              onClick={() => handleAddFood(food)}
              className="flex-shrink-0 bg-bg-paper/50 hover:bg-primary/5 border border-[var(--color-glass-border)] p-4 rounded-2xl text-left transition-all active:scale-95 hover:border-primary/30 min-w-[160px]"
            >
              <p className="text-sm font-bold text-text-main tracking-tight leading-snug">{food.name}</p>
              <p className="text-[10px] font-bold text-text-secondary mt-1.5 uppercase tracking-wide">{food.cal} kcal • Rp {food.price.toLocaleString('id-ID')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Tambah Makan</h3>
            <p className="text-[10px] text-primary font-bold opacity-80">*Kelola menu cepat (Quick Add) di menu Pengaturan</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-[2] space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Nama Makanan</label>
              <input 
                type="text" placeholder="Misal: Nasi Goreng" value={customFood.name}
                onChange={e => setCustomFood({...customFood, name: e.target.value})}
                className="text-sm border-primary/10 bg-bg-paper/50 h-12"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Kcal</label>
              <input 
                type="number" placeholder="0" value={customFood.cal}
                onChange={e => setCustomFood({...customFood, cal: e.target.value})}
                className="text-sm border-primary/10 bg-bg-paper/50 h-12"
              />
            </div>
          </div>
          <div className="flex space-x-3 items-end">
            <div className="flex-[2] space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Harga (Rp)</label>
              <input 
                type="number" placeholder="5000" value={customFood.price}
                onChange={e => setCustomFood({...customFood, price: e.target.value})}
                className="text-sm border-primary/10 bg-bg-paper/50 h-12"
              />
            </div>
            <button onClick={handleAddCustomFood} className="flex-1 btn-primary h-12 text-xs transition-all active:scale-95">
              TAMBAH
            </button>
          </div>
        </div>
      </div>

      {/* Today's Log */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-text-main tracking-tight uppercase tracking-wider">INTAKE HARI INI</h2>
          <div className="text-right">
            <span className={`text-base font-bold ${todayLog.totalCalories > currentTargetCalories ? 'text-danger' : 'text-primary'}`}>
              {todayLog.totalCalories} <span className="text-xs text-text-secondary font-bold uppercase ml-1">/ {currentTargetCalories} kcal</span>
            </span>
          </div>
        </div>
        
        {todayLog.foods.length === 0 ? (
          <div className="text-center py-12 bg-bg-paper/30 rounded-2xl border border-dashed border-[var(--color-glass-border)]">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Belum ada catatan</p>
            <p className="text-[10px] text-text-secondary/60">Ayo catat apa yang kamu makan!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLog.foods.map(food => (
              <div key={food.logId} className="flex justify-between items-center bg-bg-paper p-3 rounded-xl border border-primary/10 group hover:shadow-md transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    {food.category && (
                      <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-md mr-1.5 whitespace-nowrap">
                        {food.category}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-text-main uppercase tracking-tight line-clamp-1">
                      {food.name}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-text-secondary uppercase mt-0.5">
                    {food.isFasting ? 'Fasting Window' : `${food.cal} kcal ${food.price > 0 ? `• Rp ${food.price.toLocaleString('id-ID')}` : ''}`}
                  </span>
                </div>
                <button onClick={() => handleRemoveFood(food.logId)} className="ml-4 p-2.5 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-all active:scale-90 shadow-sm border border-danger/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <button onClick={triggerSaveXP} className="w-full btn-primary h-14 text-sm font-bold active:scale-95 uppercase tracking-widest mt-6 flex items-center justify-center space-x-3 shadow-lg shadow-primary/20">
          <IconStar />
          <span>KLAIM XP & SIMPAN DIET</span>
        </button>
      </div>
    </div>
  );
};


  const renderWorkout = () => {
    if (workoutOptions.length === 0 || !todaySchedule.workout) {
      return (
        <div className="space-y-6 animate-slide-up bg-bg-main min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-primary/10">
            <IconDumbbell />
          </div>
          <h2 className="text-2xl font-black text-text-main uppercase tracking-tight mb-3">Aktivitas Belum Diatur</h2>
          <p className="text-sm text-text-secondary font-bold leading-relaxed mb-10 max-w-[280px]">
            Kamu belum menyusun opsi olahraga atau jadwal mingguan. Atur sekarang di menu pengaturan.
          </p>
          <button 
            onClick={() => {
              setActiveTab('settings');
              setSettingsTab('database');
            }}
            className="btn-primary w-full h-16 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
          >
            ATUR OLAHRAGA
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-slide-up pb-24">
        <div className="glass-card rounded-2xl p-8 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mt-24"></div>
          <div className="relative z-10">
            <div className="inline-flex p-5 bg-primary/10 text-primary rounded-2xl mb-5 shadow-sm border border-primary/10">
              {getIconForWorkout(todaySchedule.workout)}
            </div>
            <h2 className="text-2xl font-bold text-text-main tracking-tight leading-tight">{todaySchedule.workout}</h2>
            <p className="text-text-secondary text-sm mt-3 font-medium leading-relaxed max-w-xs mx-auto opacity-90">{todaySchedule.desc}</p>
          </div>
        </div>

      {workoutOptions.find(o => o.name === todaySchedule.workout)?.type === 'rest' ? (
        <div className="bg-success/5 rounded-2xl p-5 border border-success/10 text-center animate-fade-in shadow-sm">
          <p className="text-success text-xs font-bold uppercase tracking-[0.15em] leading-relaxed">Protokol Pemulihan. Fokus Recovery & Nutrisi Mikro.</p>
        </div>
      ) : null}

      {/* --- Bike to Work --- */}
      {todaySchedule.workout === 'Bike to Work' && (
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-5">Bike Analytics</h3>
          <div className="space-y-5">
            <div className="flex flex-col items-center justify-center p-6 bg-bg-paper/50 rounded-2xl border border-[var(--color-glass-border)] shadow-inner">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Durasi (Menit)</label>
              <input 
                type="number" 
                value={todayLog.bikeDuration}
                onChange={(e) => setTodayLog({...todayLog, bikeDuration: e.target.value})}
                className="w-32 bg-transparent border-primary/10 text-center text-4xl font-bold text-primary tracking-tighter"
                placeholder="0"
              />
            </div>
            {todayLog.bikeDuration && (
              <div className="bg-[var(--color-warning)]/5 p-5 rounded-2xl border border-[var(--color-warning)]/10 text-center animate-fade-in">
                <p className="text-[10px] text-[var(--color-warning)] font-bold uppercase tracking-widest mb-1">Estimasi Kalori Terbakar</p>
                <p className="text-3xl font-bold text-[var(--color-warning)] tracking-tighter">~{Number(todayLog.bikeDuration) * 8} <span className="text-sm">kcal</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Dumbbell --- */}
      {todaySchedule.workout === 'Latihan Dumbel' && (
        <div className="space-y-4">
          {DUMBBELL_EXERCISES.map(exercise => (
            <div key={exercise.id} className="glass-card rounded-2xl p-6 shadow-sm border border-[var(--color-glass-border)] transition-all hover:bg-bg-paper/30">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold text-text-main tracking-tight leading-snug">{exercise.name}</h3>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Target: {exercise.target}</p>
                </div>
              </div>
              
              <div className="space-y-2.5 mb-5">
                {(todayLog.dumbellSets[exercise.id] || []).map((set, idx) => (
                  <div key={set.setId} className="flex justify-between items-center bg-bg-paper/50 px-4 py-3 rounded-xl border border-[var(--color-glass-border)] animate-fade-in group">
                    <span className="text-sm font-bold text-text-main tracking-tight">Set {idx + 1}: <span className="text-primary">{set.kg}kg</span> x <span className="text-primary">{set.reps}</span> reps</span>
                    <button onClick={() => handleRemoveSet(exercise.id, set.setId)} className="text-[10px] text-danger font-bold uppercase tracking-widest bg-danger/5 px-2.5 py-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">Hapus</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <input 
                    type="number" placeholder="Kg" 
                    value={tempSet[`${exercise.id}_kg`] || ''}
                    onChange={e => setTempSet({...tempSet, [`${exercise.id}_kg`]: e.target.value})}
                    className="h-12 bg-bg-paper/50 rounded-xl text-sm text-center font-bold text-text-main"
                  />
                </div>
                <div className="col-span-1">
                  <input 
                    type="number" placeholder="Reps" 
                    value={tempSet[`${exercise.id}_reps`] || ''}
                    onChange={e => setTempSet({...tempSet, [`${exercise.id}_reps`]: e.target.value})}
                    className="h-12 bg-bg-paper/50 rounded-xl text-sm text-center font-bold text-text-main"
                  />
                </div>
                <button 
                  onClick={() => handleAddSet(exercise.id)}
                  className="col-span-2 h-12 btn-primary text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  + TAMBAH SET
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Checkbox */}
      {workoutOptions.find(o => o.name === todaySchedule.workout)?.type === 'active' && (
        <>
          {/* Generic Tracker for Custom Active Workouts */}
          {todaySchedule.workout !== 'Bike to Work' && todaySchedule.workout !== 'Latihan Dumbel' && (
            <div className="glass-card rounded-2xl p-6 shadow-sm mb-6 border border-primary/10">
               <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Laporan Latihan</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Durasi (Menit)</label>
                      <input 
                        type="number" placeholder="45" value={todayLog.bikeDuration}
                        onChange={e => setTodayLog({...todayLog, bikeDuration: e.target.value})}
                        className="text-sm bg-bg-paper/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Level Intensitas</label>
                      <select className="text-[10px] font-bold h-12 bg-bg-paper/50">
                        <option>RINGAN</option>
                        <option>MODERAT</option>
                        <option>TINGGI</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Catatan Latihan</label>
                    <textarea 
                      placeholder="Apa yang kamu rasakan?" 
                      value={todayLog.notes}
                      onChange={e => setTodayLog({...todayLog, notes: e.target.value})}
                      className="text-xs bg-bg-paper/50" rows="2"
                    />
                  </div>
               </div>
            </div>
          )}
          <button 
            onClick={() => setTodayLog({...todayLog, workoutCompleted: !todayLog.workoutCompleted})}
            className={`flex items-center space-x-4 p-5 glass-card shadow-sm rounded-2xl cursor-pointer active:scale-95 transition-all w-full border-2 ${todayLog.workoutCompleted ? 'border-success bg-success/5 shadow-success/10' : 'border-transparent'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${todayLog.workoutCompleted ? 'bg-success text-white' : 'bg-bg-main text-text-secondary'}`}>
              {todayLog.workoutCompleted ? <IconCheck /> : getIconForWorkout(todaySchedule.workout)}
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-text-main tracking-tight uppercase tracking-wider">{todayLog.workoutCompleted ? 'BERHASIL DISELESAIKAN' : 'Selesaikan Workout'}</span>
              <div className="flex items-center text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                <span className="mr-1.5"><IconStar /></span> {todayLog.workoutCompleted ? 'CLAIMED +50 XP' : 'DAPATKAN +50 XP'}
              </div>
            </div>
          </button>

        </>
      )}

      {/* Additional Workouts Section */}
      <div className="mt-8 border-t border-[var(--color-glass-border)] pt-8">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Aktivitas Tambahan Hari Ini</h3>
        
        {todayLog.additionalWorkouts && todayLog.additionalWorkouts.length > 0 && (
          <div className="space-y-3 mb-6">
            {todayLog.additionalWorkouts.map((aw, idx) => (
              <div key={idx} className="flex justify-between items-center bg-bg-paper p-4 rounded-2xl border border-[var(--color-glass-border)] shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    {getIconForWorkout(aw.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{aw.name}</p>
                    {aw.duration && <p className="text-[10px] text-text-secondary font-bold">{aw.duration} Menit</p>}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newAw = [...todayLog.additionalWorkouts];
                    newAw.splice(idx, 1);
                    setTodayLog({...todayLog, additionalWorkouts: newAw});
                  }}
                  className="text-danger p-2 bg-danger/10 rounded-xl"
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 shadow-sm border border-[var(--color-glass-border)]">
          <div className="flex flex-col space-y-4">
            <select 
              className="h-14 bg-bg-paper/50 rounded-xl px-4 text-sm font-bold text-text-main border-transparent outline-none focus:ring-2 focus:ring-primary/20"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
            >
              <option value="">-- Pilih Aktivitas --</option>
              {workoutOptions.filter(o => o.name !== todaySchedule.workout).map((opt, i) => (
                 <option key={i} value={opt.name}>{opt.name}</option>
              ))}
            </select>
            {newActivity && (
              <input 
                type="number"
                placeholder="Durasi (Menit)"
                className="h-14 bg-bg-paper/50 rounded-xl px-4 text-sm font-bold text-text-main border-transparent outline-none focus:ring-2 focus:ring-primary/20"
                id="newActivityDuration"
              />
            )}
            <button 
              onClick={() => {
                if(!newActivity) return;
                const durInput = document.getElementById('newActivityDuration');
                const dur = durInput ? durInput.value : '';
                setTodayLog({
                  ...todayLog, 
                  additionalWorkouts: [...(todayLog.additionalWorkouts || []), { name: newActivity, duration: dur, addedAt: Date.now() }]
                });
                setNewActivity('');
                if(durInput) durInput.value = '';
              }}
              className="btn-primary h-14 text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              + TAMBAH AKTIVITAS LAIN
            </button>
          </div>
        </div>

        <button onClick={triggerSaveXP} className="w-full btn-primary h-14 text-sm font-bold active:scale-95 uppercase tracking-widest mt-6 flex items-center justify-center space-x-3 shadow-lg shadow-primary/20">
          <IconStar />
          <span>KLAIM XP & SIMPAN LOG OLAH RAGA</span>
        </button>
      </div>
    </div>
    );
  };

  const renderHistory = () => {
    const getLocalYMD = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: startDay }, (_, i) => i);

    const logMap = {};
    logs.forEach(l => logMap[l.date] = l);

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Streak calculation
    let streak = 0;
    let d = new Date(today);
    while (true) {
      const dateStr = getLocalYMD(d);
      if (logMap[dateStr]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        if (dateStr === dateString && streak === 0) {
          d.setDate(d.getDate() - 1);
          const ydayStr = getLocalYMD(d);
          if(logMap[ydayStr]){
              streak++;
              d.setDate(d.getDate() - 1);
              continue;
          }
        }
        break;
      }
    }

    return (
      <div className="space-y-6 animate-slide-up pb-24">
        {/* Calendar Section */}
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-text-main tracking-tight uppercase tracking-wider">KALENDER LOG</h2>
            <div className="flex items-center space-x-2 bg-[var(--color-warning)]/10 px-4 py-2 rounded-xl border border-[var(--color-warning)]/20 shadow-sm animate-pulse">
              <IconFlame />
              <span className="font-bold text-[var(--color-warning)] text-[10px] tracking-widest uppercase">{streak} HARI STREAK</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 bg-bg-paper/50 p-2 rounded-2xl border border-[var(--color-glass-border)]">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-bg-paper/80 text-text-secondary rounded-xl transition-all active:scale-90"><IconChevronLeft /></button>
            <h3 className="font-bold text-text-main uppercase tracking-[0.15em] text-xs pb-0.5 border-b-2 border-primary/30">{monthNames[month]} {year}</h3>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-bg-paper/80 text-text-secondary rounded-xl transition-all active:scale-90"><IconChevronRight /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {blanksArray.map(b => <div key={`blank-${b}`} className="h-10 w-10"></div>)}
            {daysArray.map(day => {
              const currentCellDate = new Date(year, month, day);
              const dateStr = getLocalYMD(currentCellDate);
              const isToday = dateStr === dateString;
              const log = logMap[dateStr];
              
              let cellClasses = "h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all relative ";
              
              if (log) {
                if (log.workoutCompleted) {
                  cellClasses += "bg-[var(--color-primary)] text-white shadow-md ";
                } else {
                  cellClasses += "bg-[var(--color-secondary)] text-[var(--primary-dark)] border border-[var(--primary-dark)]/20 ";
                }
              } else {
                cellClasses += "text-[var(--color-text-text-main)] ";
              }

              if (isToday) {
                cellClasses += "ring-2 ring-[var(--color-primary)] ring-offset-2 ";
              }

              if (!log && !isToday) {
                if (currentCellDate > today) {
                  cellClasses += "opacity-20 ";
                } else {
                  cellClasses += "opacity-40 ";
                }
              }

              const isSelected = selectedHistoryDate === dateStr;
              if (isSelected) {
                cellClasses += "ring-2 ring-[var(--color-secondary)] ring-offset-2 ";
              }

              return (
                <div key={day} className="flex items-center justify-center p-1">
                  <div 
                    onClick={() => setSelectedHistoryDate(isSelected ? null : dateStr)}
                    className={cellClasses + " cursor-pointer hover:scale-110 active:scale-95"}
                  >
                    {day}
                    {log && log.totalCalories > 0 && (
                      <div className={`absolute -bottom-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-bg-paper)] shadow-sm ${log.totalCalories > calculateTargetCalories(log.weight || profile.startWeight, profile.height, profile.age) ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-success)]'}`}></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-[var(--color-glass-border)] grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-[var(--color-primary)] rounded-full"></div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Workout Done</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-[var(--color-secondary)] rounded-full"></div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Log Shared</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-[var(--color-success)] rounded-full ml-1.5"></div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Calorie Safe</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-[var(--color-danger)] rounded-full ml-1.5"></div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Over Budget</span>
            </div>
          </div>
        </div>

        {/* History Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] px-2 mb-2">
            RIWAYAT AKTIVITAS ({selectedHistoryDate || dateString})
          </h3>
          {logs.filter(l => l.date === (selectedHistoryDate || dateString)).length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl border border-[var(--color-glass-border)]">
              <p className="text-sm text-text-secondary font-medium">Belum ada riwayat tercatat untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {selectedHistoryDate && (
                <div className="flex justify-end px-2">
                  <button onClick={() => setSelectedHistoryDate(null)} className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all">
                    Reset Filter Kalender
                  </button>
                </div>
              )}
              {logs.filter(l => l.date === (selectedHistoryDate || dateString)).map((log) => {
                const targetVal = calculateTargetCalories(log.weight || profile.startWeight, profile.height, profile.age);
                const isUnderCal = log.totalCalories > 0 && log.totalCalories <= targetVal;
                return (
                  <div key={log.id} className="glass-card p-6 rounded-2xl space-y-5 relative overflow-hidden group hover:shadow-md transition-all border border-[var(--color-glass-border)]">
                    <div className="flex justify-between items-center border-b border-[var(--color-glass-border)] pb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${log.workoutCompleted ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-text-secondary'}`}>
                           {getIconForWorkout(log.scheduleWorkout)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em]">{log.dayName || 'Aktivitas'}</p>
                          <p className="font-bold text-text-main tracking-tight text-lg leading-none mt-1">
                            {(() => {
                              try {
                                const rawDate = log.date || log.id;
                                if (!rawDate) return '---';
                                const d = new Date(rawDate);
                                if (isNaN(d.getTime())) return rawDate;
                                return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                              } catch(e) {
                                return '---';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary tracking-tighter">
                          {log.weight || '-'} <span className="text-sm font-bold text-text-secondary">kg</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-bg-paper/50 p-4 rounded-xl border border-[var(--color-glass-border)] shadow-inner">
                        <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest mb-1.5">Kalori</p>
                        <p className={`font-bold tracking-tight text-xl ${isUnderCal ? 'text-success' : 'text-danger'}`}>{log.totalCalories || 0} <span className="text-[10px] opacity-70">kcal</span></p>
                      </div>
                      <div className="bg-bg-paper/50 p-4 rounded-xl border border-[var(--color-glass-border)] shadow-inner">
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Pengeluaran</p>
                        <p className="font-bold text-text-main tracking-tight text-xl">Rp {(log.budgetSpent || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm border ${log.workoutCompleted ? 'bg-success/5 text-success border-success/10' : 'bg-bg-paper text-text-secondary border-primary/10'}`}>
                        {log.workoutCompleted ? 'PROTOKOL SELESAI' : 'RECOVERY / BELUM'}
                      </div>
                      <div className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-bg-paper text-text-secondary border border-primary/10 truncate max-w-[150px]">
                        {log.scheduleWorkout || 'No Workout'}
                      </div>
                    </div>

                    {log.additionalWorkouts && log.additionalWorkouts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)]">
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-3">Aktivitas Tambahan</p>
                        <div className="flex flex-wrap gap-2">
                          {log.additionalWorkouts.map((aw, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-primary/5 px-3 py-2 rounded-xl border border-primary/10">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <div style={{ transform: 'scale(0.7)' }}>{getIconForWorkout(aw.name)}</div>
                              </div>
                              <span className="text-[10px] font-bold text-text-main">{aw.name} {aw.duration ? `(${aw.duration}m)` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };


  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setModal({
          isOpen: true,
          title: 'Login Gagal',
          message: 'Gagal login dengan Google. Pastikan koneksi internet stabil dan coba lagi.',
          type: 'danger'
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] font-sans text-text-main transition-colors duration-300 selection:bg-primary/20">
      <header className="bg-[var(--color-bg-paper)]/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-30 flex justify-between items-center border-b border-[var(--color-glass-border)] shadow-sm">
        <div className="animate-slide-down">
          <h1 className="text-2xl font-bold text-primary tracking-tighter leading-none">FitTracker</h1>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.25em] mt-1.5">{rankTitle} • LVL {currentLevel}</p>
        </div>
        {user && (
          <button 
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-3 p-1 rounded-2xl hover:bg-bg-paper transition-all active:scale-90"
          >
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
              alt="Profile" 
              className="w-10 h-10 rounded-xl border-2 border-primary/20 shadow-sm object-cover"
            />
          </button>
        )}
      </header>

      <main className="p-4 max-w-md mx-auto">
        {user === undefined ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)] mb-4"></div>
            <p className="text-[var(--text-text-secondary)] text-sm font-bold">Membuka database...</p>
          </div>
        ) : user === null ? (
          <div className="flex flex-col items-center justify-center py-20 animate-slide-up text-center px-8">
            <div className="w-32 h-32 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mb-10 shadow-xl shadow-primary/5 border border-primary/20">
               <IconTarget />
            </div>
            <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tighter">IT FitTracker</h2>
            <p className="text-text-secondary text-sm mb-12 max-w-[280px] font-medium leading-relaxed">Level up your health. Sync your protocols across all devices securely.</p>
            
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`flex items-center justify-center space-x-4 w-full max-w-xs py-5 px-8 rounded-2xl shadow-lg font-bold transition-all text-white uppercase tracking-widest text-xs ${isLoggingIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:shadow-primary/30 active:scale-95'}`}
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22px" height="22px" className="bg-white rounded-full p-1"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                  <span>Google Login</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'makan' && renderDiet()}
            {activeTab === 'olahraga' && renderWorkout()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-paper)] shadow-2xl z-40 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto h-20 border-t border-[var(--color-glass-border)] bg-bg-paper/30 backdrop-blur-xl rounded-t-[2rem]">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 my-1 px-4 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-primary' : 'text-text-secondary/50'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 shadow-sm' : ''}`}><IconHome /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </button>
          <button onClick={() => setActiveTab('makan')} className={`flex flex-col items-center space-y-1 my-1 px-4 transition-all duration-300 ${activeTab === 'makan' ? 'text-primary' : 'text-text-secondary/50'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'makan' ? 'bg-primary/10 shadow-sm' : ''}`}><IconFood /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Diet</span>
          </button>
          <button onClick={() => setActiveTab('olahraga')} className={`flex flex-col items-center space-y-1 my-1 px-4 transition-all duration-300 ${activeTab === 'olahraga' ? 'text-primary' : 'text-text-secondary/50'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'olahraga' ? 'bg-primary/10 shadow-sm' : ''}`}><IconDumbbell /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Fit</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center space-y-1 my-1 px-4 transition-all duration-300 ${activeTab === 'history' ? 'text-primary' : 'text-text-secondary/50'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-primary/10 shadow-sm' : ''}`}><IconHistory /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Log</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center space-y-1 my-1 px-4 transition-all duration-300 ${activeTab === 'settings' ? 'text-primary' : 'text-text-secondary/50'}`}>
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary/10 shadow-sm' : ''}`}><IconSettings /></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Set</span>
          </button>
        </div>
      </nav>      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 
          0% { opacity: 0; transform: scale(0.9) translateY(20px); } 
          100% { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Unified Modal Component */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-[var(--color-glass-border)] animate-pop-in">
            <div className={`p-8 text-center space-y-4 ${modal.type === 'danger' ? 'bg-[var(--color-danger)]/5' : 'bg-[var(--color-primary)]/5'}`}>
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg ${modal.type === 'danger' ? 'bg-[var(--color-danger)] text-white' : 'bg-[var(--color-primary)] text-white'}`}>
                {modal.type === 'danger' ? <IconTrash /> : <IconStar />}
              </div>
              <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase">{modal.title}</h3>
              <p className="text-text-secondary text-sm font-bold leading-relaxed px-2">{modal.message}</p>
            </div>
            <div className="p-6 bg-white flex flex-col space-y-3">
              {modal.onConfirm ? (
                <>
                  <button onClick={() => { modal.onConfirm(); setModal({...modal, isOpen: false}); }} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg active:scale-95 ${modal.type === 'danger' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'}`}>
                    KONFIRMASI
                  </button>
                  <button onClick={() => setModal({...modal, isOpen: false})} className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-text-secondary hover:bg-gray-100 transition-all">
                    BATAL
                  </button>
                </>
              ) : (
                <button onClick={() => setModal({...modal, isOpen: false})} className="w-full py-4 bg-[var(--color-primary)] rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg active:scale-95">
                  MENGERTI
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal for New/Reset Users */}
      {isNewUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-text-main/60 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-[3rem] p-10 shadow-3xl relative overflow-hidden animate-pop-in bg-white border-2 border-primary/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-success/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex p-5 bg-primary/10 text-primary rounded-[2rem] mb-8 shadow-inner">
                <IconStar />
              </div>
              <h2 className="text-3xl font-black text-text-main tracking-tighter leading-none mb-4 uppercase">Mulai Langkahmu!</h2>
              <p className="text-sm text-text-secondary font-bold leading-relaxed mb-8 px-2">
                Data kamu masih kosong. Untuk memulai, kamu <span className="text-primary font-black uppercase underline decoration-2 underline-offset-4">Wajib</span> mengisi setelan awal berikut:
              </p>
              
              <div className="space-y-3 text-left mb-10">
                <div className="flex items-center space-x-4 p-4 bg-bg-main/50 rounded-2xl border border-primary/5 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">1</div>
                  <div>
                    <span className="block text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Langkah Pertama</span>
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-tight">PROFIL & TARGET BB</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-bg-main/50 rounded-2xl border border-primary/5 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">2</div>
                  <div>
                    <span className="block text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Langkah Kedua</span>
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-tight">LIST OLAHRAGA KAMU</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-bg-main/50 rounded-2xl border border-primary/5 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">3</div>
                  <div>
                    <span className="block text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Langkah Ketiga</span>
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-tight">JADWAL MINGGUAN</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setActiveTab('settings');
                  setIsNewUser(false);
                }}
                className="w-full btn-primary h-16 text-xs font-black uppercase tracking-[0.25em] shadow-xl shadow-primary/30 active:scale-95 transition-all text-white flex items-center justify-center space-x-2"
              >
                <span>BUAT SETELAN SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}