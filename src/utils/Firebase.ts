import { getFirestore } from '@firebase/firestore'
import { initializeApp } from '@firebase/app'
import { getAuth } from '@firebase/auth'
import { getStorage } from '@firebase/storage'
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGEING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID
}

export const app = initializeApp(config)
export const auth = getAuth(app)

export const db = getFirestore(app)
export const storage = getStorage(app)
