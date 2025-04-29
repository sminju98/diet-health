import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBFppO0zv_yYYkL2BHED66xCvRwJh8RbHI",
  authDomain: "medifit-770f5.firebaseapp.com",
  databaseURL: "https://medifit-770f5-default-rtdb.firebaseio.com",
  projectId: "medifit-770f5",
  storageBucket: "medifit-770f5.firebasestorage.app",
  messagingSenderId: "445684804720",
  appId: "1:445684804720:web:46acd0b6d238695401d8b5",
  measurementId: "G-XPP9LQHW2X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 