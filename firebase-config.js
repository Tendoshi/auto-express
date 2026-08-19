// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOWL2B0e1-juCYl-JibcAS41S13fcFcC8",
  authDomain: "auto-express-4ddc6.firebaseapp.com",
  projectId: "auto-express-4ddc6",
  storageBucket: "auto-express-4ddc6.firebasestorage.app",
  messagingSenderId: "848162847160",
  appId: "1:848162847160:web:a778cab6fd507902afb74d",
  measurementId: "G-7RQPWTR5XV"
};

// Initialisation de Firebase & Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();