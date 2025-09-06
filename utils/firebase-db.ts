import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJ65cUmONuv6ZPZbEkCB5L8pz2iFfSItM",
  authDomain: "project-b1f3b.firebaseapp.com",
  projectId: "project-b1f3b",
  storageBucket: "project-b1f3b.appspot.com",
  messagingSenderId: "550365990366",
  appId: "1:550365990366:web:d07d3f56b666c28ff0214f",
  measurementId: "G-ESVZJHT0JJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc };
