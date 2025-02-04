// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "medexplorer-10c83.firebaseapp.com",
  databaseURL: "https://medexplorer-10c83-default-rtdb.firebaseio.com",
  projectId: "medexplorer-10c83",
  storageBucket: "medexplorer-10c83.appspot.com",
  messagingSenderId: "753080716791",
  appId: "1:753080716791:web:4f4950b3765851afb232f2",
  measurementId: "G-XKDDHGGFHE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()