// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const omenaiFirebaseConfig = {
  apiKey: "AIzaSyCQj_JmjFwz0OBSsTWPN9kPykfMACKcluY",
  authDomain: "omenai-storage-test.firebaseapp.com",
  projectId: "omenai-storage-test",
  storageBucket: "omenai-storage-test.firebasestorage.app",
  messagingSenderId: "988036158337",
  appId: "1:988036158337:web:1cf92ca84409fc79aa4e80",
  measurementId: "G-HT0LXKEXYQ",
};

// Initialize Firebase
const app = initializeApp(omenaiFirebaseConfig);
export const storage = getStorage(app);
