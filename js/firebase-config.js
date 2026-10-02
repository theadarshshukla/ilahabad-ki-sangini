const firebaseConfig = {
  apiKey: "AIzaSyDMY_JfNRMLfuMuQT_jXwU_nPjXHIZzAVI",
  authDomain: "folio-697ca.firebaseapp.com",
  projectId: "folio-697ca",
  storageBucket: "folio-697ca.firebasestorage.app",
  messagingSenderId: "419130519268",
  appId: "1:419130519268:web:c3eda5d6abcf9e508f06f1",
  measurementId: "G-RGPC8GQ8Q2"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}