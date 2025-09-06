// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAJ65cUmONuv6ZPZbEkCB5L8pz2iFfSItM",
  authDomain: "project-b1f3b.firebaseapp.com",
  projectId: "project-b1f3b",
  storageBucket: "project-b1f3b.appspot.com",
  messagingSenderId: "550365990366",
  appId: "1:550365990366:web:d07d3f56b666c28ff0214f",
  measurementId: "G-ESVZJHT0JJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

export { app, auth, analytics };
