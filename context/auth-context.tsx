"use client"

import * as React from "react"
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase"
import { getOrCreateUser, FirestoreUser } from "@/lib/firestore/users"

interface AuthState {
    user: User | null
    firestoreUser: FirestoreUser | null
    loading: boolean
    error: string | null
}

interface AuthContextType {
    authState: AuthState
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    isConfigured: boolean
}

const initialState: AuthState = {
    user: null,
    firestoreUser: null,
    loading: true,
    error: null,
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = React.useState<AuthState>(initialState)

    React.useEffect(() => {
        if (!isFirebaseConfigured || !auth) {
            setAuthState({
                user: null,
                firestoreUser: null,
                loading: false,
                error: null,
            })
            return
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user: User | null) => {
                if (user) {
                    try {
                        const firestoreUser = await getOrCreateUser(user)
                        setAuthState({
                            user,
                            firestoreUser,
                            loading: false,
                            error: null,
                        })
                    } catch (error) {
                        console.error("Error syncing user with Firestore:", error)
                        setAuthState({
                            user,
                            firestoreUser: null,
                            loading: false,
                            error: null,
                        })
                    }
                } else {
                    setAuthState({
                        user: null,
                        firestoreUser: null,
                        loading: false,
                        error: null,
                    })
                }
            },
            (error: Error) => {
                setAuthState({
                    user: null,
                    firestoreUser: null,
                    loading: false,
                    error: error.message,
                })
            }
        )

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = React.useCallback(async () => {
        if (!isFirebaseConfigured || !auth || !googleProvider) {
            throw new Error("Firebase is not configured")
        }

        setAuthState((prev) => ({ ...prev, loading: true, error: null }))
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to sign in"
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }))
            throw error
        }
    }, [])

    const signOut = React.useCallback(async () => {
        if (!isFirebaseConfigured || !auth) {
            throw new Error("Firebase is not configured")
        }

        setAuthState((prev) => ({ ...prev, loading: true, error: null }))
        try {
            await firebaseSignOut(auth)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to sign out"
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }))
            throw error
        }
    }, [])

    return (
        <AuthContext.Provider value={{ authState, signInWithGoogle, signOut, isConfigured: isFirebaseConfigured }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
