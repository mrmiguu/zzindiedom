import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth'
import { getDatabase, connectDatabaseEmulator, ref as dbRef, set as dbSet } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyC6RcwG8NYx-OMMNTYl4cuiNTzhYRx0w8o',
  authDomain: 'zz-indie.firebaseapp.com',
  projectId: 'zz-indie',
  storageBucket: 'zz-indie.appspot.com',
  messagingSenderId: '389957839224',
  appId: '1:389957839224:web:26e89233188b1eab9fc08d',
}

const app = initializeApp(firebaseConfig)

const auth = getAuth()
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
}

const db = getDatabase()
if (import.meta.env.DEV) {
  connectDatabaseEmulator(db, 'localhost', 9000)
}

export default app
export { auth, signInAnonymously, db, dbRef, dbSet }
