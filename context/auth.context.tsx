import { createContext, useContext, useEffect, useState } from 'react';
import {
    Auth,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    UserCredential
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

type AuthContextType = {
    auth: Auth;
    user: User | null;
    loading: boolean;
    error: Error | null;
    googleSignIn: () => Promise<UserCredential>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

type AuthProviderProps = {
    children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const auth = getAuth(app);
    const googleAuthProvider = new GoogleAuthProvider();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        }, (error) => {
            setError(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const googleSignIn = async () => {
        try {
            return await signInWithPopup(auth, googleAuthProvider);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        auth,
        user,
        loading,
        error,
        googleSignIn,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};