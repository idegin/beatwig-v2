import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, arrayUnion, arrayRemove } from "@firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Movie, TVShow } from "@/lib/tmdb";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_URL,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const dbCollectionName = {
    MESSAGES: 'messages',
    USERS: 'users',
    WATCHED_MOVIE: 'watched_movies',
    FILM_BOOKMARK: 'film_bookmarks',
    WATCHLIST: 'watchlist',
}

export type WatchlistItem = {
    users_ids: string[];
    id: number;
    media_type: "movie" | "tv";
} & (Movie | TVShow);

/**
 * Get the currently logged in user
 * @returns Promise with the current user or null if not logged in
 */
export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

/**
 * Clean item data before saving to the database
 * Removes large nested objects like videos, reviews, and recommendations
 */
const cleanItemForStorage = (item: any): any => {
    // Clone the item to avoid mutating the original
    const cleanedItem = { ...item };
    
    // Remove large nested objects
    const fieldsToRemove = [
        'videos',
        'reviews',
        'recommendations',
        'images',
        'credits',
        'keywords',
        'similar',
        'seasons',
        'episodes',
    ];
    
    fieldsToRemove.forEach(field => {
        if (field in cleanedItem) {
            delete cleanedItem[field];
        }
    });
    
    return cleanedItem;
};

/**
 * Add a movie or TV show to a user's watchlist
 * @param item - The movie or TV show to add to watchlist
 * @param mediaType - "movie" or "tv"
 * @returns Promise with success status and message
 */
export const addToWatchlist = async (
    item: Movie | TVShow, 
    mediaType: "movie" | "tv"
): Promise<{ success: boolean; message: string }> => {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return { success: false, message: "User not logged in" };
        }
        
        const userId = currentUser.uid;
        const watchlistRef = collection(db, dbCollectionName.WATCHLIST);
        const itemId = item.id.toString();
        const docRef = doc(watchlistRef, itemId);
        
        // Check if the item already exists in the watchlist collection
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            // Item exists, check if user already has it in their watchlist
            const data = docSnap.data() as WatchlistItem;
            if (data.users_ids.includes(userId)) {
                return { success: true, message: "Item already in your watchlist" };
            }
            
            // Add user to the existing watchlist item
            await updateDoc(docRef, {
                users_ids: arrayUnion(userId)
            });
            return { success: true, message: "Added to your watchlist" };
        } else {
            // Clean the item data before storing (remove videos, reviews, recommendations, etc.)
            const cleanedItem = cleanItemForStorage(item);
            
            // Create a new watchlist item with this user
            const watchlistItem: WatchlistItem = {
                ...cleanedItem,
                media_type: mediaType,
                users_ids: [userId],
            };
            
            await setDoc(docRef, watchlistItem);
            return { success: true, message: "Added to your watchlist" };
        }
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return { success: false, message: "Failed to add to watchlist" };
    }
};

/**
 * Remove a movie or TV show from a user's watchlist
 * @param itemId - The ID of the movie or TV show to remove
 * @returns Promise with success status and message
 */
export const removeFromWatchlist = async (
    itemId: number | string
): Promise<{ success: boolean; message: string }> => {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return { success: false, message: "User not logged in" };
        }
        
        const userId = currentUser.uid;
        const watchlistRef = collection(db, dbCollectionName.WATCHLIST);
        const docRef = doc(watchlistRef, itemId.toString());
        
        // Check if the item exists in the watchlist collection
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return { success: false, message: "Item not found in watchlist" };
        }
        
        const data = docSnap.data() as WatchlistItem;
        
        if (!data.users_ids.includes(userId)) {
            return { success: false, message: "Item not in your watchlist" };
        }
        
        // Remove user from the watchlist item
        await updateDoc(docRef, {
            users_ids: arrayRemove(userId)
        });
        
        // Optionally: If no users remain, you could delete the document
        // This depends on your design requirements
        const updatedDoc = await getDoc(docRef);
        const updatedData = updatedDoc.data() as WatchlistItem;
        
        if (updatedData.users_ids.length === 0) {
            await setDoc(docRef, { ...updatedData, deletedAt: new Date() });
        }
        
        return { success: true, message: "Removed from your watchlist" };
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return { success: false, message: "Failed to remove from watchlist" };
    }
};

/**
 * Get the user's watchlist
 * @returns Promise with the user's watchlist items
 */
export const getUserWatchlist = async (): Promise<WatchlistItem[]> => {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return [];
        }
        
        const userId = currentUser.uid;
        const watchlistRef = collection(db, dbCollectionName.WATCHLIST);
        
        // Query for all watchlist items that contain the current user's ID
        const q = query(watchlistRef, where("users_ids", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        
        const watchlistItems: WatchlistItem[] = [];
        
        querySnapshot.forEach((doc) => {
            watchlistItems.push(doc.data() as WatchlistItem);
        });
        
        return watchlistItems;
    } catch (error) {
        console.error("Error getting watchlist:", error);
        return [];
    }
};

/**
 * Check if an item is in the user's watchlist
 * @param itemId - The ID of the movie or TV show to check
 * @returns Promise with boolean indicating if the item is in the watchlist
 */
export const isInWatchlist = async (itemId: number | string): Promise<boolean> => {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return false;
        }
        
        const userId = currentUser.uid;
        const watchlistRef = collection(db, dbCollectionName.WATCHLIST);
        const docRef = doc(watchlistRef, itemId.toString());
        
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return false;
        }
        
        const data = docSnap.data() as WatchlistItem;
        return data.users_ids.includes(userId);
    } catch (error) {
        console.error("Error checking watchlist:", error);
        return false;
    }
};
