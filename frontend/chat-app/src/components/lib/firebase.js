import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatt-6c943.firebaseapp.com",
  projectId: "chatt-6c943",
  storageBucket: "chatt-6c943.appspot.com",
  messagingSenderId: "339382732146",
  appId: "1:339382732146:web:d83e20f41decec2b69c9eb",
  measurementId: "G-C0P7ETCTFC"
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);
// Initialize Firebase Analytics service for tracking user behavior and metrics
const analytics = getAnalytics(app);

export const auth = getAuth() // Firebase Authentication
export const db = getFirestore() // Firestore database
export const storage = getStorage() // Firebase Storage for file uploads
