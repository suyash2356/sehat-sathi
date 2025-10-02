'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "studio-3647433909-7d478",
  "appId": "1:727846991895:web:af274c045f6f8f26a6c452",
  "apiKey": "AIzaSyA0Vex5Jc8fkocH0Odh-GbGMZQgfr27t-E",
  "authDomain": "studio-3647433909-7d478.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "727846991895",
  "storageBucket": "studio-3647433909-7d478.appspot.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
