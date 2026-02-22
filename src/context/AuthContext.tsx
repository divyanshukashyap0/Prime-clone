import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Profile {
    id: string;
    name: string;
    avatarColor: string;
    maturityRating: string;
    pin?: string;
    preferences: {
        autoplay: boolean;
        previews: boolean;
        defaultQuality?: string;
    };
}

interface HistoryItem {
    movieId: string;
    progress: number;
    duration: number;
    episodeId?: string;
    updatedAt: string;
}

interface UserRating {
    movieId: string;
    rating: number;
    updatedAt: string;
}

interface SubscriptionDetails {
    planName: string;
    billingCycle: 'monthly' | 'yearly' | 'none';
    amount: number;
    nextRenewal: string;
}

interface UserPreferences {
    watchlist: string[];
    likes: string[];
    dislikes: string[];
    downloads: string[];
    profiles: Profile[];
    activeProfileId: string | null;
    history: HistoryItem[];
    ratings: UserRating[];
    subscription: SubscriptionDetails;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    preferences: UserPreferences;
    activeProfile: Profile | null;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    toggleWatchlist: (movieId: string) => Promise<void>;
    toggleLike: (movieId: string) => Promise<void>;
    toggleDislike: (movieId: string) => Promise<void>;
    toggleDownload: (movieId: string) => Promise<void>;
    addProfile: (profile: Omit<Profile, "id">) => Promise<void>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
    switchProfile: (profileId: string) => Promise<void>;
    updateAccount: (data: { displayName?: string; email?: string }) => Promise<void>;
    updateProgress: (movieId: string, progress: number, duration: number, episodeId?: string) => Promise<void>;
    rateContent: (movieId: string, rating: number) => Promise<void>;
    updateSubscription: (subscription: SubscriptionDetails) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
    watchlist: [],
    likes: [],
    dislikes: [],
    downloads: [],
    profiles: [],
    activeProfileId: null,
    history: [],
    ratings: [],
    subscription: {
        planName: 'Free',
        billingCycle: 'none',
        amount: 0,
        nextRenewal: ''
    }
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    preferences: defaultPreferences,
    activeProfile: null,
    logout: async () => { },
    loginWithGoogle: async () => { },
    toggleWatchlist: async () => { },
    toggleLike: async () => { },
    toggleDislike: async () => { },
    toggleDownload: async () => { },
    addProfile: async () => { },
    updateProfile: async () => { },
    deleteProfile: async () => { },
    switchProfile: async () => { },
    updateAccount: async () => { },
    updateProgress: async () => { },
    rateContent: async () => { },
    updateSubscription: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

    const activeProfile = preferences.profiles.find(p => p.id === preferences.activeProfileId) || null;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user doc for admin check and preferences
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setIsAdmin(data.role === "admin");
                    setPreferences({
                        watchlist: data.watchlist || [],
                        likes: data.likes || [],
                        dislikes: data.dislikes || [],
                        downloads: data.downloads || [],
                        profiles: data.profiles || [],
                        activeProfileId: data.activeProfileId || (data.profiles?.[0]?.id || null),
                        history: data.history || [],
                        ratings: data.ratings || [],
                        subscription: data.subscription || defaultPreferences.subscription
                    });
                } else {
                    // Fallback check for demo purposes
                    setIsAdmin(
                        user.email?.endsWith("@admin.com") ||
                        user.email === "divyanshu00884466@gmail.com" ||
                        false
                    );
                    setPreferences(defaultPreferences);
                }
            } else {
                setIsAdmin(false);
                setPreferences(defaultPreferences);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await auth.signOut();
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const updatePreferences = async (newPrefs: UserPreferences) => {
        if (!user) return;
        setPreferences(newPrefs);
        try {
            const { setDoc, doc } = await import("firebase/firestore");
            await setDoc(doc(db, "users", user.uid), {
                ...newPrefs,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    const toggleWatchlist = async (movieId: string) => {
        const newWatchlist = preferences.watchlist.includes(movieId)
            ? preferences.watchlist.filter(id => id !== movieId)
            : [...preferences.watchlist, movieId];
        await updatePreferences({ ...preferences, watchlist: newWatchlist });
    };

    const toggleLike = async (movieId: string) => {
        const isLiked = preferences.likes.includes(movieId);
        const newLikes = isLiked
            ? preferences.likes.filter(id => id !== movieId)
            : [...preferences.likes, movieId];

        const newDislikes = preferences.dislikes.filter(id => id !== movieId);
        await updatePreferences({ ...preferences, likes: newLikes, dislikes: newDislikes });
    };

    const toggleDislike = async (movieId: string) => {
        const isDisliked = preferences.dislikes.includes(movieId);
        const newDislikes = isDisliked
            ? preferences.dislikes.filter(id => id !== movieId)
            : [...preferences.dislikes, movieId];

        const newLikes = preferences.likes.filter(id => id !== movieId);
        await updatePreferences({ ...preferences, dislikes: newDislikes, likes: newLikes });
    };

    const toggleDownload = async (movieId: string) => {
        if (!preferences.downloads.includes(movieId)) {
            const newDownloads = [...preferences.downloads, movieId];
            await updatePreferences({ ...preferences, downloads: newDownloads });
        }
    };

    const addProfile = async (profileData: Omit<Profile, "id">) => {
        const newProfile: Profile = {
            ...profileData,
            id: Math.random().toString(36).substring(7)
        };
        const newProfiles = [...preferences.profiles, newProfile];
        await updatePreferences({
            ...preferences,
            profiles: newProfiles,
            activeProfileId: preferences.activeProfileId || newProfile.id
        });
    };

    const updateProfile = async (updatedProfile: Profile) => {
        const newProfiles = preferences.profiles.map(p =>
            p.id === updatedProfile.id ? updatedProfile : p
        );
        await updatePreferences({ ...preferences, profiles: newProfiles });
    };

    const deleteProfile = async (profileId: string) => {
        const newProfiles = preferences.profiles.filter(p => p.id !== profileId);
        const newActiveId = preferences.activeProfileId === profileId
            ? (newProfiles[0]?.id || null)
            : preferences.activeProfileId;
        await updatePreferences({ ...preferences, profiles: newProfiles, activeProfileId: newActiveId });
    };

    const switchProfile = async (profileId: string) => {
        await updatePreferences({ ...preferences, activeProfileId: profileId });
    };

    const updateAccount = async (data: { displayName?: string, email?: string }) => {
        if (!user) return;
        const { updateProfile: fireUpdateProfile, updateEmail } = await import("firebase/auth");

        if (data.displayName) {
            await fireUpdateProfile(user, { displayName: data.displayName });
        }
        if (data.email) {
            await updateEmail(user, data.email);
        }
        // Force refresh user state
        setUser({ ...user });
    };

    const updateProgress = async (movieId: string, progress: number, duration: number, episodeId?: string) => {
        const newHistory = [...preferences.history];
        const existingIdx = newHistory.findIndex(h => h.movieId === movieId && h.episodeId === episodeId);

        const item: HistoryItem = {
            movieId,
            progress,
            duration,
            episodeId,
            updatedAt: new Date().toISOString()
        };

        if (existingIdx !== -1) {
            newHistory[existingIdx] = item;
        } else {
            newHistory.unshift(item);
        }

        // Limit history to last 50 items
        await updatePreferences({ ...preferences, history: newHistory.slice(0, 50) });
    };

    const rateContent = async (movieId: string, rating: number) => {
        const newRatings = [...preferences.ratings];
        const existingIdx = newRatings.findIndex(r => r.movieId === movieId);

        const ratingItem: UserRating = {
            movieId,
            rating,
            updatedAt: new Date().toISOString()
        };

        if (existingIdx !== -1) {
            newRatings[existingIdx] = ratingItem;
        } else {
            newRatings.push(ratingItem);
        }

        await updatePreferences({ ...preferences, ratings: newRatings });
    };

    const updateSubscription = async (subscription: SubscriptionDetails) => {
        await updatePreferences({ ...preferences, subscription });
    };

    return (
        <AuthContext.Provider value={{
            user, loading, isAdmin, preferences, activeProfile,
            logout, loginWithGoogle,
            toggleWatchlist, toggleLike, toggleDislike, toggleDownload,
            addProfile, updateProfile, deleteProfile, switchProfile, updateAccount,
            updateProgress, rateContent, updateSubscription
        }}>
            {children}
        </AuthContext.Provider>
    );
};
