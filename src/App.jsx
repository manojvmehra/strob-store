import React, { useState, useEffect } from 'react';
import { ShoppingCart, Sun, Moon, LogOut, Package, ChevronLeft, User, ChevronRight, Star } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- IMPORT DATA & COMPONENTS ---
import { PRODUCTS } from './data/products';
import TechCanvas from './components/TechCanvas';
import Marquee from './components/Marquee';
import CheckoutView from './components/CheckoutView';
import Login from './components/Login';
import { CartProvider, useCart } from './context/CartContext';

// --- DASHBOARD COMPONENT ---
const DashboardView = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id);
        if (data) setOrders(data);
      };
      fetchOrders();
    }
  }, [user]);

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
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="font-mono-tech text-3xl font-bold uppercase">
              Hi, {profile?.full_name || user?.email?.split('@')[0]}
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
                      <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
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

// --- REVIEWS COMPONENT ---
const ReviewsSection = ({ isDarkMode }) => {
  const reviews = [
    { id: 1, user: "Alex D.", rating: 5, comment: "Absolutely game-changing assets. Saved me hours of work.", date: "2 days ago" },
    { id: 2, user: "Sarah K.", rating: 5, comment: "The quality is unmatched. Highly recommend for any serious creator.", date: "1 week ago" },
    { id: 3, user: "Mike R.", rating: 4, comment: "Great pack, though I wish there were a few more color variations.", date: "2 weeks ago" }
  ];

  return (
    <div className={`mt-16 border-t pt-12 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
      <h3 className="font-mono-tech text-xl font-bold uppercase mb-8">User_Reviews</h3>
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className={`p-6 rounded-md border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {review.user[0]}
                </div>
                <span className="font-bold text-sm">{review.user}</span>
              </div>
              <span className="text-xs opacity-50">{review.date}</span>
            </div>
            <div className="flex text-[#FF4D4D] mb-2">
              {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </div>
            <p className="text-sm opacity-80 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PRODUCT VIEW ---
const ProductView = ({ product, onBack, onAddToCart, onProductClick, isDarkMode }) => {
  if (!product) return null;
  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);
  const galleryImages = [product.image, product.image, product.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className={`min-h-screen pt-24 pb-12 transition-colors duration-300 ${isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 border rounded-xl overflow-hidden ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white shadow-sm'}`}>
          <div className="lg:col-span-7 relative bg-black/5 h-[500px] lg:h-[600px] flex items-center justify-center p-8 group">
            <img src={galleryImages[currentImageIndex]} alt={product.title} className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500" />
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"><ChevronRight className="h-6 w-6" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, idx) => (
                <div key={idx} className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-[#FF4D4D] w-4' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-8 flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <span className={`font-mono-tech px-2 py-0.5 text-xs font-bold uppercase ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{product.category}</span>
                <div className={`font-mono-tech text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>ID: {product.id}_ASSET</div>
              </div>
              <h1 className="font-mono-tech text-4xl lg:text-5xl font-bold uppercase leading-none tracking-tight mb-6">{product.title}</h1>
              <div className="flex items-center gap-2 mb-8">
                <div className="flex text-[#FF4D4D]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="text-xs opacity-50">(24 Reviews)</span>
              </div>
              <p className={`text-lg leading-relaxed font-light mb-8 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{product.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-10">
                {product.features.map((feat, i) => (
                  <div key={i} className={`flex items-center gap-3 text-xs font-mono-tech ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-[#FF4D4D]' : 'bg-black'}`}></div>
                    {feat}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-8 mt-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono-tech text-sm opacity-50">TOTAL PRICE</span>
                <span className="font-mono-tech text-4xl font-bold">${product.price}</span>
              </div>
              <button onClick={() => onAddToCart(product)} className="btn-industrial w-full flex items-center justify-center gap-3 bg-[#FF4D4D] hover:bg-[#ff3333] py-5 text-sm text-black font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20">ADD TO CART</button>
            </div>
          </div>
        </div>
        <ReviewsSection isDarkMode={isDarkMode} />
        <div className="mt-32">
          <div className={`flex items-center gap-4 mb-8 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
            <h2 className="font-mono-tech text-xl font-bold uppercase">Deploy_Other_Systems</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((item) => (
              <div key={item.id} onClick={() => onProductClick(item)} className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${isDarkMode ? 'border-white/10 bg-white/5 hover:border-white' : 'border-black bg-white hover:border-black'}`}>
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-mono-tech text-sm font-bold uppercase group-hover:text-[#FF4D4D] transition-colors line-clamp-1">{item.title}</h3>
                    </div>
                    <span className="font-mono-tech text-sm font-bold">${item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



// ... (other imports remain)

// --- DASHBOARD COMPONENT ---
// ... (DashboardView remains same)

// ... (ReviewsSection remains same)

// ... (ProductView remains same)

function StrobStoreContent() {
  const { user, profile, signOut } = useAuth();
  const { cart, addToCart, removeFromCart, total: cartTotal } = useCart();
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
      else if (page === 'auth') setView('auth');
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
    if (viewName === 'auth') url = `?page=auth`;

    window.history.pushState({}, "", url);
    if (viewName === 'product') setSelectedProduct(param);
    setView(viewName);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product) => {
    // NOTE: Original logic forced login. New requirements say Guest Cart is allowed.
    // So we just add to cart. Auth is optional.
    addToCart(product);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const goHome = () => { if (view !== 'home') window.history.back(); };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    await signOut();
    console.log("SignOut completed, reloading");
    window.location.href = '/';
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-[#FF4D4D] selection:text-black ${isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'}`}>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${scrolled ? (isDarkMode ? 'bg-[#0e0e10]/90 backdrop-blur-md border-white/10' : 'bg-[#f4f4f5]/90 border-black/10') : 'bg-transparent border-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={() => navigateTo('home')} className="flex cursor-pointer items-center gap-3">
            <div className={`h-4 w-4 ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
            <span className="font-mono-tech text-lg font-bold tracking-tight uppercase">StrobStore</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {['INDEX', 'PACKS', 'SYSTEM', 'LOGS'].map((link) => (
              <button key={link} onClick={() => navigateTo('home')} className={`font-mono-tech text-xs transition-colors hover:underline decoration-1 underline-offset-4 ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
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
              <button onClick={() => navigateTo('auth')} className={`flex items-center gap-2 font-mono-tech text-xs px-4 py-2 border transition-colors ${isDarkMode ? 'border-white/20 hover:bg-white hover:text-black' : 'border-black/20 hover:bg-black hover:text-white'}`}>
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
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className={`font-mono-tech text-xs cursor-pointer hover:text-[#FF4D4D] transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>SCROLL {">>>"} </button>
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
        <DashboardView />
      ) : view === 'auth' ? (
        <Login onLoginSuccess={() => navigateTo('home')} isDarkMode={isDarkMode} />
      ) : (
        <ProductView product={selectedProduct} onBack={goHome} onAddToCart={handleAddToCart} onProductClick={(p) => navigateTo('product', p)} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StrobStoreContent />
      </CartProvider>
    </AuthProvider>
  );
}