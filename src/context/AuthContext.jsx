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
                console.warn("Auth check timed out, forcing app load");
                setLoading(false);
            }
        }, 5000);

        const initAuth = async () => {
            try {
                // 1. Get Session
                const session = await authService.getSession();
                if (session?.user) {
                    await handleUserSync(session.user, mounted);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (err) {
                console.error("Auth init failed:", err);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for changes
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            console.log("AUTH CHANGE:", event);
            if (session?.user) {
                await handleUserSync(session.user, mounted);
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
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

            // Get or Create Profile
            let userProfile = await authService.getProfile(currentUser.id);

            if (!userProfile) {
                userProfile = await authService.createProfile(currentUser);
            }

            if (mounted) setProfile(userProfile);
        } catch (err) {
            console.error("User sync error:", err);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const signInWithGoogle = async () => authService.loginWithGoogle();
    const signInWithEmail = async (email, password) => authService.login(email, password);
    const signUpWithEmail = async (email, password, fullName) => authService.register(email, password, fullName);
    const signOut = async () => authService.logout();

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

