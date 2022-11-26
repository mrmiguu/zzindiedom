import { getApp, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {
  connectDatabaseEmulator,
  getDatabase,
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  set,
} from 'firebase/database'

const { hostname } = location

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
  connectAuthEmulator(auth, `http://${hostname}:9099`, { disableWarnings: true })
}

const db = getDatabase(app)
if (import.meta.env.DEV) {
  connectDatabaseEmulator(db, `${hostname}`, 9000)
}

const getCurrentUserID = () => auth.currentUser?.uid

const dbRef = (path?: string | undefined) => ref(db, path)

const dbSet = <T = unknown>(path: string | undefined, value: T) => set(dbRef(path), value)
const dbOnlineOnlySet = <T = unknown>(path: string | undefined, value: T) => {
  dbSet(path, value)
  onDisconnect(dbRef(path)).remove()
}

const dbPush = <T = unknown>(path: string | undefined, value: T) => push(dbRef(path), value)
const dbOnlineOnlyPush = <T = unknown>(path: string | undefined, value: T) => {
  onDisconnect(dbPush(path, value)).remove()
}

const dbListen = <T = unknown>(path: string | undefined, callback: (t: T) => void) =>
  onValue(dbRef(path), snapshot => callback(snapshot.val()))

const dbAdded = <T = unknown>(path: string | undefined, callback: (t: T) => void) =>
  onChildAdded(dbRef(path), data => callback(data.val()))

onAuthStateChanged(auth, user => {
  if (!user) return

  const { uid } = user

  const dbOnlineRef = dbRef(`online/${uid}`)
  // const dbLastOnlineRef = dbRef(`last_online/${uid}`)
  const dbConnectedRef = dbRef('.info/connected')

  onValue(dbConnectedRef, snap => {
    if (snap.val() === true) {
      set(dbOnlineRef, true)
      onDisconnect(dbOnlineRef).remove()
      // onDisconnect(dbLastOnlineRef).set(serverTimestamp())
    }
  })
})

export default app
export {
  auth,
  signInAnonymously,
  getCurrentUserID,
  db,
  dbRef,
  dbOnlineOnlySet,
  dbOnlineOnlyPush,
  dbPush,
  dbListen,
  dbAdded,
  onDisconnect,
}
