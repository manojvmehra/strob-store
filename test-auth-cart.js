
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmnurlgkyrumdkvihhwd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbnVybGdreXJ1bWRrdmloaHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTY4NjAsImV4cCI6MjA3OTI3Mjg2MH0.ZL92YMK63alncXcujZqhE4umOzz3AsGmmrvy4L0Le3w'

const supabase = createClient(supabaseUrl, supabaseKey)

const TEST_EMAIL = 'test_cart_user_99@context.com';
const TEST_PASSWORD = 'Password123!';

async function runTest() {
    console.log("--- STARTING CART FLOW TEST ---");
    console.log("Email:", TEST_EMAIL);

    // 1. Sign Up / Sign In
    console.log("\n1. Authentication...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });

    if (authError) {
        // If user already exists, try sign in
        if (authError.message.includes("User already registered") || authError.status === 400) { // 400 can be other things but let's try login
            console.log("Sign up failed (maybe exists), trying login...");
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

            if (loginError) {
                console.error("Login Failed:", loginError);
                return;
            }
            if (loginData.user) {
                console.log("Logged in User ID:", loginData.user.id);
                await testCart(loginData.user);
            }
        } else {
            console.error("Auth Signup Failed:", authError);
            return;
        }
    } else if (authData.user) {
        console.log("Signed Up User ID:", authData.user.id);
        await testCart(authData.user);
    }
}

async function testCart(user) {
    // 2. Create Cart
    console.log("\n2. Creating Cart...");
    // Check if cart exists first
    let { data: cart } = await supabase.from('carts').select('*').eq('user_id', user.id).single();

    if (!cart) {
        console.log("Cart not found, creating...");
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert([{ user_id: user.id }])
            .select()
            .single();

        if (createError) {
            console.error("Create Cart Failed (Likely RLS):", createError);
            return;
        }
        cart = newCart;
    }
    console.log("Cart ID:", cart.id);

    // 3. Add Item
    console.log("\n3. Adding Item to Cart...");
    const { data: item, error: itemError } = await supabase
        .from('cart_items')
        .insert([{
            cart_id: cart.id,
            product_id: 1,
            quantity: 1,
            metadata: { title: "Test Product", price: 100 }
        }])
        .select()
        .single();

    if (itemError) {
        console.error("Add Item Failed (Possible RLS or FK issue):", itemError);
    } else {
        console.log("Item Added:", item);
    }

    // 4. Fetch Cart Items
    console.log("\n4. Fetching Cart Items...");
    const { data: items, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);

    if (fetchError) console.error("Fetch Failed:", fetchError);
    else console.log("Cart Items:", items);

    // 5. Cleanup (optional)
    console.log("\n5. Cleaning up...");
    if (item) {
        await supabase.from('cart_items').delete().eq('id', item.id);
        console.log("Item deleted.");
    }

    console.log("\n--- TEST COMPLETE ---");
}

runTest();
