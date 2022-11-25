import { getApp, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase, ref, set, push, onValue, onChildAdded } from 'firebase/database'

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

const getCurrentUserID = () => auth.currentUser?.uid

const dbRef = (path?: string | undefined) => ref(db, path)
const dbSet = <T = unknown>(path: string | undefined, value: T) => set(dbRef(path), value)
const dbPush = <T = unknown>(path: string | undefined, value: T) => push(dbRef(path), value)

const dbListen = <T = unknown>(path: string | undefined, callback: (t: T) => void) =>
  onValue(dbRef(path), snapshot => callback(snapshot.val()))

const dbAdded = <T = unknown>(path: string | undefined, callback: (t: T) => void) =>
  onChildAdded(dbRef(path), data => callback(data.val()))

export default app
export { auth, signInAnonymously, getCurrentUserID, db, dbRef, dbSet, dbPush, dbListen, dbAdded }
