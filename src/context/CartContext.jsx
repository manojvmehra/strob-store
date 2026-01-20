import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Load Cart on Mount or User Change
    useEffect(() => {
        let mounted = true;

        const loadCart = async () => {
            if (authLoading) return; // Wait for auth to settle

            try {
                if (user) {
                    // --- LOGGED IN ---
                    // 1. Merge any existing guest cart first (if we just logged in)
                    await cartService.mergeGuestCart(user.id);
                    // 2. Fetch remote cart
                    const userCart = await cartService.getUserCart(user.id);
                    if (mounted) setCart(userCart);
                } else {
                    // --- GUEST ---
                    const guestCart = cartService.getGuestCart();
                    if (mounted) setCart(guestCart);
                }
            } catch (err) {
                console.error("Failed to load cart:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadCart();

        return () => { mounted = false; };
    }, [user, authLoading]);

    // 2. Cart Actions
    const addToCart = async (product) => {
        // Optimistic Update can be tricky with IDs, so we'll just await for now or use temp IDs.
        // For simplicity:
        try {
            if (user) {
                const newCart = await cartService.addToUserCart(user.id, product);
                setCart(newCart);
                // alert("Added to account cart!"); // Optional debug success
            } else {
                const newCart = cartService.addToGuestCart(product);
                setCart(newCart);
            }
        } catch (err) {
            console.error("Add to cart failed:", err);
            alert(`Failed to add to cart: ${err.message || "Unknown error"}. Check console for details.`);
        }
    };

    const removeFromCart = async (indexOrId) => {
        // NOTE: Our simple guest cart used index. Our DB cart uses ID.
        // We need to handle both or standardize.
        // The App.jsx passed `index` for remove.

        try {
            if (user) {
                // For user, the 'indexOrId' passed from existing UI might be an index if we didn't update the UI?
                // Actually, existing App.jsx `removeFromCart = (index) => ...`
                // We should update the UI to pass the Item ID if possible, 
                // BUT to be safe with existing UI code, we can lookup by index if needed, 
                // OR we just assume we will update UI to pass the item object or ID.

                // Strategy: Update components to pass the item. 
                // Fallback: If it's a number (index), use that to find the ID.
                let itemId;
                if (typeof indexOrId === 'number') {
                    itemId = cart[indexOrId]?.cartItemId;
                } else {
                    itemId = indexOrId;
                }

                if (!itemId) {
                    console.error("Cannot remove: Item ID not found");
                    return;
                }
                const newCart = await cartService.removeFromUserCart(user.id, itemId);
                setCart(newCart);
            } else {
                // Guest: currently uses index
                // But our service `removeFromGuestCart` takes an index.
                // Let's assume indexOrId is index for guest.
                let index = indexOrId;
                if (typeof indexOrId !== 'number') {
                    // If UI passes an ID, we have to find index?
                    // Guest cart items don't strictly have IDs in our simple implementation unless we added them.
                    // We added `cartItemId` in the service!
                    index = cart.findIndex(i => i.cartItemId === indexOrId);
                }

                if (index === -1) return;

                const newCart = cartService.removeFromGuestCart(index);
                setCart(newCart);
            }
        } catch (err) {
            console.error("Remove from cart failed:", err);
        }
    };

    const clearCart = () => {
        // Mostly for logout?
        setCart([]);
    };

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, total, loading }}>
            {children}
        </CartContext.Provider>
    );
};
