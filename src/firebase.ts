import { getApp, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyC6RcwG8NYx-OMMNTYl4cuiNTzhYRx0w8o',
  authDomain: 'zz-indie.firebaseapp.com',
  projectId: 'zz-indie',
  storageBucket: 'zz-indie.appspot.com',
  messagingSenderId: '389957839224',
  appId: '1:389957839224:web:26e89233188b1eab9fc08d',
}

initializeApp(firebaseConfig)

const app = getApp()

const auth = getAuth(app)
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
}

const db = getDatabase(app)
if (import.meta.env.DEV) {
  connectDatabaseEmulator(db, 'localhost', 9000)
}

const dbRef = (path?: string | undefined) => ref(db, path)
const dbSet = (path: string | undefined, value: unknown) => set(dbRef(path), value)

export default app
export { auth, signInAnonymously, db, dbRef, dbSet }
