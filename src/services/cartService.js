import { supabase } from '../lib/supabaseClient';

const GUEST_CART_KEY = 'strob_guest_cart';

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
        // Check if exists? For now simplest version: plain push or no dupes?
        // User code was just [...cart, product] so we will mimic that, but better to prevent simple dupes if desired.
        // Assuming simple append for now to match current behavior.

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

    // --- REMOTE (USER) CART ---

    async getUserCart(userId) {
        // 1. Get Cart ID
        const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (cartError && cartError.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('Error fetching user cart:', cartError);
            return [];
        }

        if (!cartData) {
            return []; // No cart yet
        }

        // 2. Get Items
        const { data: items, error: itemsError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartData.id);

        if (itemsError) {
            console.error('Error fetching cart items:', itemsError);
            return [];
        }

        // 3. Transform back to product shape provided by metadata
        // We assume we stored the product snapshot in metadata
        return items.map(item => ({
            ...item.metadata,
            cartItemId: item.id // Keep DB ID for deletions
        }));
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

        // 2. Add Item
        const { error: itemError } = await supabase
            .from('cart_items')
            .insert([{
                cart_id: cart.id,
                product_id: product.id,
                quantity: 1,
                metadata: product // Store full product snapshot
            }]);

        if (itemError) throw itemError;

        return this.getUserCart(userId);
    },

    async removeFromUserCart(userId, cartItemId) {
        // We need to delete by the cart_items.id
        // But first validation is good.

        // Assuming cartItemId is the UUID from DB
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);

        if (error) throw error;

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

        // 2. Insert all guest items
        const itemsToInsert = guestCart.map(p => ({
            cart_id: cart.id,
            product_id: p.id,
            quantity: 1,
            metadata: p
        }));

        if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert(itemsToInsert);

            if (insertError) {
                console.error("Failed to merge cart:", insertError);
                // Might not want to clear guest cart if failed? 
                // For now, we proceed to clear to avoid infinite retry loops on client for bad data.
            }
        }

        // 3. Clear Guest Cart
        this.clearGuestCart();
    }
};
