import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB319n2zEUlaskJ6WW9Zj7ED9kxb1NSDFk",
  authDomain: "smart-travel-companion-30916.firebaseapp.com",
  projectId: "smart-travel-companion-30916",
  storageBucket: "smart-travel-companion-30916.firebasestorage.app",
  messagingSenderId: "754722992811",
  appId: "1:754722992811:web:c4966e73b99be425c87dee",
  measurementId: "G-SF30TZCPYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

export { auth, googleProvider, facebookProvider, twitterProvider };
