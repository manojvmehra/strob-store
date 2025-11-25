import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Sun, Moon, Trash2, ChevronLeft, User, LogOut, Package, Settings } from 'lucide-react';
import { supabase } from './lib/supabaseClient'; 

// --- IMPORT DATA & COMPONENTS ---
// Make sure you have created these files as discussed!
import { PRODUCTS } from './data/products';
import TechCanvas from './components/TechCanvas';
import Marquee from './components/Marquee';
import CheckoutView from './components/CheckoutView';
import ProductView from './components/ProductView';

// --- DASHBOARD COMPONENT (NEW) ---
const DashboardView = ({ user, profile, orders }) => {
  return (
    <div className="min-h-screen pt-28 pb-12 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-6 mb-12">
           <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#FF4D4D] to-purple-600 p-[2px]">
              <div className="h-full w-full rounded-full bg-black overflow-hidden">
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white">
                      {profile?.full_name?.[0] || user?.email[0].toUpperCase()}
                   </div>
                 )}
              </div>
           </div>
           <div>
              <h1 className="font-mono-tech text-3xl font-bold uppercase">
                 Hi, {profile?.full_name || user?.email.split('@')[0]}
              </h1>
              <p className="font-mono-tech text-sm opacity-50">{user?.email}</p>
           </div>
        </div>

        <div className="grid gap-8">
           <div className="border p-6 rounded-md border-white/10 bg-white/5">
              <h2 className="font-mono-tech text-xl font-bold mb-6 flex items-center gap-2">
                 <Package className="h-5 w-5" /> ORDER HISTORY
              </h2>
              {orders.length > 0 ? (
                 <div className="space-y-4">
                    {orders.map(order => (
                       <div key={order.id} className="flex justify-between p-4 border border-white/10 bg-black/20 rounded">
                          <div>
                             <p className="font-bold text-sm">Order #{order.id.slice(0,8)}</p>
                             <p className="text-xs opacity-50">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="font-mono-tech text-[#FF4D4D]">${order.total_amount}</span>
                       </div>
                    ))}
                 </div>
              ) : (
                 <p className="opacity-40 font-mono-tech text-sm">No orders found yet.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function StrobStore() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cart, setCart] = useState([]);
  
  // --- AUTH & DATA STATE ---
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 1. Get Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
         handleUserSync(session.user);
         // Clear hash from URL after successful login to clean up
         if (window.location.hash && window.location.hash.includes('access_token')) {
            window.history.replaceState(null, null, window.location.pathname);
         }
      }
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
         handleUserSync(session.user);
      } else {
         setUser(null);
         setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SYNC USER TO DATABASE ---
  const handleUserSync = async (currentUser) => {
     setUser(currentUser);
     
     // Check if profile exists
     let { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

     if (!existingProfile) {
        // Create new profile if doesn't exist
        const { data: newProfile } = await supabase
           .from('profiles')
           .insert([{
              id: currentUser.id,
              email: currentUser.email,
              full_name: currentUser.user_metadata.full_name || currentUser.email.split('@')[0],
              avatar_url: currentUser.user_metadata.avatar_url
           }])
           .select()
           .single();
        setProfile(newProfile);
     } else {
        setProfile(existingProfile);
     }

     // Fetch Orders
     const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id);
     
     if (userOrders) setOrders(userOrders);
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://strob-store.vercel.app' 
      }
    });
    if (error) console.error('Login error:', error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
    setUser(null);
    setProfile(null);
  };

  // --- NAVIGATION ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const page = params.get('page');

      if (page === 'checkout') setView('checkout');
      else if (page === 'dashboard') setView('dashboard');
      else if (productId) {
        const product = PRODUCTS.find(p => p.id === parseInt(productId));
        if (product) { setSelectedProduct(product); setView('product'); }
      } else { setSelectedProduct(null); setView('home'); }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (viewName, param = null) => {
     let url = "/";
     if (viewName === 'product' && param) url = `?product=${param.id}`;
     if (viewName === 'checkout') url = `?page=checkout`;
     if (viewName === 'dashboard') url = `?page=dashboard`;
     
     window.history.pushState({}, "", url);
     if (viewName === 'product') setSelectedProduct(param);
     setView(viewName);
     window.scrollTo(0, 0);
  };

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const goHome = () => { if (view !== 'home') window.history.back(); };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-[#FF4D4D] selection:text-black ${
       isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'
    }`}>
      
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled ? (isDarkMode ? 'bg-[#0e0e10]/90 backdrop-blur-md border-white/10' : 'bg-[#f4f4f5]/90 border-black/10') : 'bg-transparent border-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={() => navigateTo('home')} className="flex cursor-pointer items-center gap-3">
            <div className={`h-4 w-4 ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
            <span className="font-mono-tech text-lg font-bold tracking-tight uppercase">StrobStore</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {['INDEX', 'PACKS', 'SYSTEM', 'LOGS'].map((link) => (
              <button key={link} onClick={() => navigateTo('home')} className={`font-mono-tech text-xs transition-colors hover:underline decoration-1 underline-offset-4 ${
                 isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}>
                {link}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}>
               {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <button onClick={() => navigateTo('checkout')} className={`relative p-2 rounded-full transition-colors group ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}>
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D4D] text-[10px] font-bold text-black">
                    {cart.length}
                  </span>
                )}
            </button>

            {/* --- AUTH AREA --- */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                 <button onClick={() => navigateTo('dashboard')} className="hidden md:flex flex-col items-end group">
                    <span className="font-mono-tech text-xs font-bold group-hover:text-[#FF4D4D] transition-colors">
                       {profile?.full_name || "USER"}
                    </span>
                 </button>
                 <button onClick={handleLogout} className="p-2 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="h-4 w-4" />
                 </button>
              </div>
            ) : (
              <button onClick={handleLogin} className={`flex items-center gap-2 font-mono-tech text-xs px-4 py-2 border transition-colors ${isDarkMode ? 'border-white/20 hover:bg-white hover:text-black' : 'border-black/20 hover:bg-black hover:text-white'}`}>
                 <User className="h-3 w-3" /> LOGIN
              </button>
            )}
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <>
          <section className={`relative pt-24 pb-12 overflow-hidden border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} style={{ minHeight: '60vh' }}>
            <TechCanvas isDarkMode={isDarkMode} />
            <div className="mx-auto max-w-7xl px-6 relative z-10 h-full flex flex-col justify-center">
               <div className="max-w-2xl">
                   <div className="font-mono-tech text-sm text-[#FF4D4D] mb-4 tracking-wider">/// SYSTEM_READY /// V.3.0.0</div>
                  <h1 className="font-mono-tech text-5xl sm:text-7xl font-black leading-none uppercase tracking-tighter" style={{ textShadow: isDarkMode ? '0 0 10px rgba(255,255,255,0.1)' : 'none' }}>
                    High_Performance <br />
                    <span className={isDarkMode ? 'text-white' : 'text-black'}>Digital Assets.</span>
                  </h1>
                  <p className={`mt-8 max-w-lg text-xl font-normal leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                    Premium prompts, systems, and design configurations. Engineered for maximum efficiency.
                  </p>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full px-6 pb-4 flex items-end justify-between z-10">
                 <h2 className={`font-mono-tech text-sm uppercase ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>Recent_Uploads</h2>
                 <div className={`h-px flex-1 mx-4 mb-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                 <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className={`font-mono-tech text-xs cursor-pointer hover:text-[#FF4D4D] transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>SCROLL >>> </button>
            </div>
          </section>
          <div className="mt-0"><Marquee items={PRODUCTS} onProductClick={(p) => navigateTo('product', p)} isDarkMode={isDarkMode} /></div>
          <section className="pt-8 pb-24 mx-auto max-w-7xl px-6">
             <div className={`mb-12 flex flex-wrap items-center gap-6 border-b pb-6 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h2 className="font-mono-tech text-2xl font-bold uppercase">System_Inventory</h2>
             </div>
             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCTS.map((product) => (
                  <div key={product.id} onClick={() => navigateTo('product', product)} className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${isDarkMode ? 'border-white/10 bg-white/5 hover:border-white' : 'border-black bg-white hover:border-black'}`}>
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img src={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-mono-tech text-lg font-bold uppercase group-hover:text-[#FF4D4D] transition-colors">{product.title}</h3>
                                <p className={`mt-1 font-mono-tech text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>REV. 1.0 // {product.id}00</p>
                            </div>
                            <span className="font-mono-tech text-lg font-bold">${product.price}</span>
                        </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </>
      ) : view === 'checkout' ? (
        <CheckoutView cart={cart} onRemove={removeFromCart} onViewProduct={(p) => navigateTo('product', p)} isDarkMode={isDarkMode} total={cartTotal} />
      ) : view === 'dashboard' ? (
        <DashboardView user={user} profile={profile} orders={orders} />
      ) : (
        <ProductView product={selectedProduct} onBack={goHome} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product', p)} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}