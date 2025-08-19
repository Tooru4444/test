// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA3uLvJj1lEMe4Ngmc-uFCVkbMs0gMavhs",
  authDomain: "rec-it-96dc9.firebaseapp.com",
  projectId: "rec-it-96dc9",
  storageBucket: "rec-it-96dc9.firebasestorage.app",
  messagingSenderId: "540406972956",
  appId: "1:540406972956:web:6ec2e8b2a07a95213fd5d9",
  measurementId: "G-L4GLZ8G4D1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
