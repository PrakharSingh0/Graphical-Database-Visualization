
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

let app = null
let auth = null

const firebaseConfig = {
  apiKey: "AIzaSyCL5tN9jL_b_e2u1JqDO1MmqDrMIe6_S4I",
  authDomain: "gnn-prototype.firebaseapp.com",
  projectId: "gnn-prototype",
  storageBucket: "gnn-prototype.firebasestorage.app",
  messagingSenderId: "701917652520",
  appId: "1:701917652520:web:49706b767b6b1fb311371d",
  measurementId: "G-4E635QFNN0"
}

export function initFirebase() {
  if (app && auth) return
  try {
    app = initializeApp(firebaseConfig)
    try { getAnalytics(app) } catch (e) { }
    auth = getAuth(app)
  } catch (err) {
    console.warn('Firebase init failed, using stub auth:', err)
    auth = {
      onAuthStateChanged: (cb) => { try { cb(null) } catch (e) {} ; return () => {} }
    }
  }
}

export { auth, onAuthStateChanged }

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(getAuth(), provider)
}

export const emailSignIn = (email, password) =>
  signInWithEmailAndPassword(getAuth(), email, password)

export const emailSignUp = (email, password) =>
  createUserWithEmailAndPassword(getAuth(), email, password)

export const signUserOut = () => signOut(getAuth())

