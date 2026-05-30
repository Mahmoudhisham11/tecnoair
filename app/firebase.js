import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKiAjYEkQdgkdK31-5oeQ97TTQo5Bo-Iw",
  authDomain: "smartcoffe-b2c5e.firebaseapp.com",
  projectId: "smartcoffe-b2c5e",
  storageBucket: "smartcoffe-b2c5e.firebasestorage.app",
  messagingSenderId: "1014648266797",
  appId: "1:1014648266797:web:374e025080819bf9c958a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
};
