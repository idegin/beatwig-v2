"use client"

import * as React from "react"
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase"
import { getOrCreateUser, FirestoreUser } from "@/lib/firestore/users"
import { ServerUser } from "@/lib/server-auth"

interface AuthState {
    user: User | null
    firestoreUser: FirestoreUser | null
    serverUser: ServerUser | null
    loading: boolean
    error: string | null
}

interface AuthContextType {
    authState: AuthState
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    isConfigured: boolean
    isAuthenticated: boolean
}

interface AuthProviderProps {
    children: React.ReactNode
    initialServerUser?: ServerUser | null
}

const initialState: AuthState = {
    user: null,
    firestoreUser: null,
    serverUser: null,
    loading: true,
    error: null,
}

const AuthContext = React.createContext<AuthContextType | null>(null)

async function syncAuthCookie(user: User | null): Promise<void> {
    if (user) {
        try {
            const token = await user.getIdToken()
            await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            })
        } catch (error) {
            console.error("Failed to sync auth cookie:", error)
        }
    } else {
        try {
            await fetch("/api/auth/signout", {
                method: "POST",
            })
        } catch (error) {
            console.error("Failed to clear auth cookie:", error)
        }
    }
}

export function AuthProvider({ children, initialServerUser }: AuthProviderProps) {
    const router = useRouter()
    const [authState, setAuthState] = React.useState<AuthState>({
        ...initialState,
        serverUser: initialServerUser || null,
        loading: !initialServerUser,
    })

    React.useEffect(() => {
        if (!isFirebaseConfigured || !auth) {
            setAuthState({
                user: null,
                firestoreUser: null,
                serverUser: null,
                loading: false,
                error: null,
            })
            return
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user: User | null) => {
                await syncAuthCookie(user)

                if (user) {
                    try {
                        const firestoreUser = await getOrCreateUser(user)
                        setAuthState({
                            user,
                            firestoreUser,
                            serverUser: {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                            },
                            loading: false,
                            error: null,
                        })
                    } catch (error) {
                        console.error("Error syncing user with Firestore:", error)
                        setAuthState({
                            user,
                            firestoreUser: null,
                            serverUser: {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                            },
                            loading: false,
                            error: null,
                        })
                    }
                } else {
                    setAuthState({
                        user: null,
                        firestoreUser: null,
                        serverUser: null,
                        loading: false,
                        error: null,
                    })
                }
            },
            (error: Error) => {
                setAuthState({
                    user: null,
                    firestoreUser: null,
                    serverUser: null,
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
            const result = await signInWithPopup(auth, googleProvider)
            const token = await result.user.getIdToken()
            
            await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            })

            console.log("[Auth] User signed in successfully")
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
            await fetch("/api/auth/signout", { method: "POST" })
            await firebaseSignOut(auth)
            router.push("/")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to sign out"
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }))
            throw error
        }
    }, [router])

    const isAuthenticated = Boolean(authState.user || authState.serverUser)

    return (
        <AuthContext.Provider value={{ authState, signInWithGoogle, signOut, isConfigured: isFirebaseConfigured, isAuthenticated }}>
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
