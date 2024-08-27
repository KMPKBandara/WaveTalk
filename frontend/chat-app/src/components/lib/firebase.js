import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "wavetalk-30a02.firebaseapp.com",
  projectId: "wavetalk-30a02",
  storageBucket: "wavetalk-30a02.appspot.com",
  messagingSenderId: "426479814843",
  appId: "1:426479814843:web:d81346ddc6f24693d6c19e",
  measurementId: "G-6WPYLFVNMR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
