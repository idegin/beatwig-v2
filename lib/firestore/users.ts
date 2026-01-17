import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentData
} from "firebase/firestore"
import { User } from "firebase/auth"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { FIREBASE_COLLECTIONS } from "@/app/constants"

export interface FirestoreUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

export async function getUser(uid: string): Promise<FirestoreUser | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
      }
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function createUser(firebaseUser: User): Promise<FirestoreUser | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, firebaseUser.uid)
    
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }

    await setDoc(userRef, userData)

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return
  }

  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user last login:", error)
  }
}

export async function getOrCreateUser(firebaseUser: User): Promise<FirestoreUser | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return null
  }

  try {
    const existingUser = await getUser(firebaseUser.uid)

    if (existingUser) {
      await updateUserLastLogin(firebaseUser.uid)
      return existingUser
    }

    return await createUser(firebaseUser)
  } catch (error) {
    console.error("Error in getOrCreateUser:", error)
    return null
  }
}

export async function updateUserProfile(
  uid: string, 
  updates: Partial<Pick<FirestoreUser, "displayName" | "photoURL">>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firestore is not configured")
    return
  }

  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
  }
}
