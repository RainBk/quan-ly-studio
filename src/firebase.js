// File: src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- Dán mã cấu hình của bạn vào giữa đây ---
const firebaseConfig = {
  // Thay thế bằng mã thật của bạn từ console.firebase.google.com
  apiKey: "AIzaSyD-THAY-MA-CUA-BAN-VAO-DAY",
  authDomain: "studio-du-an.firebaseapp.com",
  projectId: "studio-du-an",
  storageBucket: "studio-du-an.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
// -------------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);