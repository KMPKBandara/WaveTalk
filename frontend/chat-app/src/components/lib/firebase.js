import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "wavetalk-final-e47f8.firebaseapp.com",
  projectId: "wavetalk-final-e47f8",
  storageBucket: "wavetalk-final-e47f8.firebasestorage.app",
  messagingSenderId: "957587262898",
  appId: "1:957587262898:web:09fbcf427605124c8de8ab",
  measurementId: "G-BTCTZNCGX8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
