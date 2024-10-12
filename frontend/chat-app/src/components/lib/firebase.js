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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
