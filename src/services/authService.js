import { supabase } from '../lib/supabaseClient';

export const authService = {
    // --- SESSION MANAGEMENT ---

    /**
     * Get the current active session from local storage/memory
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    /**
     * Listen for auth changes (LOGIN, SIGN_OUT, TOKEN_REFRESHED)
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // --- LOGIN / REGISTER ---

    /**
     * Login with Email and Password
     * @param {string} email 
     * @param {string} password 
     * @param {boolean} rememberMe - If false, we could technically adjust session persistence, 
     * but standard Supabase (handled by gotrue-js) defaults to persisting in localStorage.
     * To implement "Remember Me", we can toggle persistence methods.
     */
    async login(email, password, rememberMe = true) {
        // Note: Supabase JS Client persists session by default.
        // If we wanted to supports "Don't Remember Me", we would set persistence to SESSION (memory/temp)
        // before logging in.

        // For now, we'll keep the standard flow but we could add that logic here.
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    async loginWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async register(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                } // Supabase sends email verification by default
            }
        });

        if (error) throw error;
        return data;
    },

    async logout() {
        try {
            // Attempt Supabase sign out with a small timeout to prevent hanging
            const { error } = await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SignOut Timed Out')), 2000))
            ]);

            if (error) throw error;
        } catch (err) {
            console.warn("Supabase signOut issue (forcing local clear):", err);
        } finally {
            // Force clear ALL Supabase tokens and app state
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.startsWith('strob_')) {
                    localStorage.removeItem(key);
                }
            });
            // Also clear our specific guest cart if we want to be thorough, 
            // though typically we might want to keep it? 
            // The requirement says "Logout must completely clear session". 
            // Let's clear guest cart key too just in case it confuses state.
            localStorage.removeItem('strob_guest_cart');
        }
    },

    async resetPasswordForEmail(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        return data;
    },

    // --- HELPERS ---

    /**
     * Helper to prevent infinite hangs on Supabase calls
     */
    async withTimeout(promise, timeoutMs = 8000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), timeoutMs))
        ]);
    },

    // --- PROFILE MANAGEMENT ---

    async getProfile(userId) {
        try {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
            );

            if (error) return null;
            return data;
        } catch (e) {
            return null;
        }
    },

    async createProfile(user) {
        try {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        avatar_url: user.user_metadata?.avatar_url,
                        updated_at: new Date()
                    }])
                    .select()
                    .single()
            );

            if (error) throw error;
            return data;
        } catch (e) {
            throw e;
        }
    }
};
