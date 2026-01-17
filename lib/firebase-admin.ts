import { initializeApp, getApps, cert, ServiceAccount, App } from "firebase-admin/app"
import { getAuth, Auth } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

const serviceAccount: ServiceAccount | null = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? (() => {
      try {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error)
        return null
      }
    })()
  : null

const isFirebaseAdminConfigured = Boolean(serviceAccount)

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.warn("[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
} else if (!serviceAccount) {
  console.error("[Firebase Admin] Failed to parse service account credentials")
}

if (isFirebaseAdminConfigured && serviceAccount) {
  try {
    if (getApps().length === 0) {
      console.log("[Firebase Admin] Initializing Firebase Admin SDK...")
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      })
      console.log("[Firebase Admin] Firebase Admin SDK initialized successfully")
    } else {
      console.log("[Firebase Admin] Using existing Firebase Admin app")
      adminApp = getApps()[0]
    }
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
    console.log("[Firebase Admin] Auth and Firestore instances ready")
  } catch (error) {
    console.error("[Firebase Admin] Failed to initialize Firebase Admin:", error)
    adminApp = null
    adminAuth = null
    adminDb = null
  }
} else {
  console.warn("[Firebase Admin] Skipping initialization - configuration missing")
}

export { adminApp, adminAuth, adminDb, isFirebaseAdminConfigured }
