import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAvKhxWkZpulXsmllrbaOyMRvJis_2cY8Y",
  authDomain: "ggame-eb4f0.firebaseapp.com",
  projectId: "ggame-eb4f0",
  storageBucket: "ggame-eb4f0.appspot.com",
  messagingSenderId: "117242279459",
  appId: "1:117242279459:web:47e31ebec02278af82e396",
  measurementId: "G-KRZSSZKSSF"
};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

// Firestore 인스턴스와 Auth 인스턴스를 내보냅니다.
export { db, auth };
