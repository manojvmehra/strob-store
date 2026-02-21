import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out, forcing app load (12s)");
                setLoading(false);
            }
        }, 12000); // 12 Seconds should be plenty even for slow connections or project wakes

        // Listen for changes
        // NOTE: Supabase onAuthStateChange fires with the current session immediately on subscription.
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                await handleUserSync(session.user, mounted);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const handleUserSync = async (currentUser, mounted) => {
        if (!mounted) return;

        try {
            setUser(currentUser);
            // OPTIMIZATION: Set loading to false as soon as we have the user
            // This allows the app to render while we fetch the profile in the background.
            setLoading(false);

            // Get or Create Profile (Background)
            let userProfile = await authService.getProfile(currentUser.id);

            if (!userProfile) {
                userProfile = await authService.createProfile(currentUser);
            }

            if (mounted) setProfile(userProfile);
        } catch (err) {
            console.error("User sync error:", err);
            if (mounted) setLoading(false);
        }
    };

    const signInWithGoogle = async () => authService.loginWithGoogle();
    const signInWithEmail = async (email, password) => authService.login(email, password);
    const signUpWithEmail = async (email, password, fullName) => authService.register(email, password, fullName);
    const signOut = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setProfile(null);
        }
    };

    const value = {
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-white font-mono">
                <div className="text-center">
                    <div className="mb-4 text-[#FF4D4D] animate-pulse">/// SYSTEM_INITIALIZING ///</div>
                    <div className="text-xs opacity-50">ESTABLISHING SECURE SESSION...</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

