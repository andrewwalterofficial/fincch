// firebase.js

const firebase = require('firebase/app'); // First import
require('firebase/storage'); // Second import


const firebaseConfig = {
    apiKey: "AIzaSyB636MLFQ5gKYC5TADiIeUjypx6zFfahcU",
  authDomain: "clama-jr9j.firebaseapp.com",
  projectId: "clama-jr9j",
  storageBucket: "clama-jr9j.appspot.com",
  messagingSenderId: "317396319650",
  appId: "1:317396319650:web:6e2e3ba1eb17823dc646fb",
  measurementId: "G-W4P2YP56QG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

module.exports = {
    firebase
};
