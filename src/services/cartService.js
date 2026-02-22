import { supabase } from '../lib/supabaseClient';

const GUEST_CART_KEY = 'strob_guest_cart';
const USER_CART_CACHE_KEY = 'strob_user_cart_cache';

export const cartService = {
    // --- LOCAL (GUEST) CART ---

    getGuestCart() {
        try {
            const stored = localStorage.getItem(GUEST_CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error reading guest cart", e);
            return [];
        }
    },

    saveGuestCart(cart) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    },

    clearGuestCart() {
        localStorage.removeItem(GUEST_CART_KEY);
    },

    addToGuestCart(product) {
        const cart = this.getGuestCart();
        // Better: Add unique ID/timestamp to valid 'items' in a cart context
        const newItem = { ...product, cartItemId: Date.now() + Math.random() };
        const newCart = [...cart, newItem];
        this.saveGuestCart(newCart);
        return newCart;
    },

    removeFromGuestCart(index) {
        const cart = this.getGuestCart();
        const newCart = cart.filter((_, i) => i !== index);
        this.saveGuestCart(newCart);
        return newCart;
    },

    // --- USER CART CACHE ---

    getUserCartCache() {
        try {
            const stored = localStorage.getItem(USER_CART_CACHE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error reading user cart cache", e);
            return [];
        }
    },

    saveUserCartCache(cart) {
        localStorage.setItem(USER_CART_CACHE_KEY, JSON.stringify(cart));
    },

    clearUserCartCache() {
        localStorage.removeItem(USER_CART_CACHE_KEY);
    },

    // --- HELPERS ---

    async withTimeout(promise, timeoutMs = 8000) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), timeoutMs))
        ]);
    },

    // --- REMOTE (USER) CART ---

    async getUserCart(userId) {
        try {
            // 1. Get Cart ID
            const { data: cartData, error: cartError } = await this.withTimeout(
                supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', userId)
                    .single()
            );

            if (cartError && cartError.code !== 'PGRST116') {
                return this.getUserCartCache(); // Return cache if error
            }

            if (!cartData) {
                this.saveUserCartCache([]);
                return [];
            }

            // 2. Get Items
            const { data: items, error: itemsError } = await this.withTimeout(
                supabase
                    .from('cart_items')
                    .select('*')
                    .eq('cart_id', cartData.id)
            );

            if (itemsError) {
                return this.getUserCartCache(); // Return cache if error
            }

            // 3. Transform back to product shape provided by metadata
            const finalCart = items.map(item => ({
                ...item.metadata,
                cartItemId: item.id // Keep DB ID for deletions
            }));

            // OPTIMIZATION: Update cache
            this.saveUserCartCache(finalCart);

            return finalCart;
        } catch (e) {
            return this.getUserCartCache(); // Return cache on timeout/exception
        }
    },

    async addToUserCart(userId, product) {
        // 1. Ensure Cart Exists
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!cart) {
            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert([{ user_id: userId }])
                .select()
                .single();

            if (createError) throw createError;
            cart = newCart;
        }

        // 2. Check if Item Exists (Upsert Logic)
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', product.id)
            .single();

        if (existingItem) {
            // Update Quantity
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + 1 })
                .eq('id', existingItem.id);

            if (updateError) throw updateError;
        } else {
            // Insert New
            const { error: itemError } = await supabase
                .from('cart_items')
                .insert([{
                    cart_id: cart.id,
                    product_id: product.id,
                    quantity: 1,
                    metadata: product // Store full product snapshot
                }]);

            if (itemError) throw itemError;
        }

        return this.getUserCart(userId);
    },

    async removeFromUserCart(userId, cartItemId) {
        if (!cartItemId) return this.getUserCart(userId);

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);

        if (error) {
            console.error("Error removing item:", error);
            throw error;
        }

        return this.getUserCart(userId);
    },

    // --- SYNC ---

    /**
     * Merges guest cart into user cart.
     * Call this on successful login.
     */
    async mergeGuestCart(userId) {
        const guestCart = this.getGuestCart();
        if (guestCart.length === 0) return;

        try {
            // 1. Get/Create User Cart
            let { data: cart } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (!cart) {
                const { data: newCart, error } = await supabase
                    .from('carts')
                    .insert([{ user_id: userId }])
                    .select()
                    .single();
                if (error) throw error;
                cart = newCart;
            }

            // 2. Process Items
            for (const item of guestCart) {
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('cart_id', cart.id)
                    .eq('product_id', item.id)
                    .single();

                if (existing) {
                    await supabase
                        .from('cart_items')
                        .update({ quantity: existing.quantity + 1 })
                        .eq('id', existing.id);
                } else {
                    await supabase
                        .from('cart_items')
                        .insert([{
                            cart_id: cart.id,
                            product_id: item.id,
                            quantity: 1,
                            metadata: item
                        }]);
                }
            }

            // 3. Clear Guest Cart and return fresh user cart to update cache
            this.clearGuestCart();
            await this.getUserCart(userId);
        } catch (err) {
            console.error("Merge failed:", err);
            this.clearGuestCart();
        }
    }
};
