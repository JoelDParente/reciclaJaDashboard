// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxZldoBQHRfUG0XUOsTsYPzt07XiGmG_A",
  authDomain: "recicla-ja-2b9b5.firebaseapp.com",
  projectId: "recicla-ja-2b9b5",
  storageBucket: "recicla-ja-2b9b5.firebasestorage.app",
  messagingSenderId: "529656385123",
  appId: "1:529656385123:web:f27d33602a89c8ee947256",
  measurementId: "G-Z3TX6V5RJC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth sempre pode ser usado
export const auth = getAuth(app);

// Analytics só no browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };