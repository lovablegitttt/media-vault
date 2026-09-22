import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9Iw05ez-LxTJYICIBMcANoZMzer-mOz8",
  authDomain: "camelaibot.firebaseapp.com",
  projectId: "camelaibot",
  storageBucket: "camelaibot.firebasestorage.app",
  messagingSenderId: "548067957514",
  appId: "1:548067957514:web:8f2cd0ca56322fc34f78f3",
  measurementId: "G-K0EQJV3Z8C",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const authPersistence = setPersistence(auth, browserLocalPersistence);
