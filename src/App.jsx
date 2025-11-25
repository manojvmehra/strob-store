import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Sun, Moon, Trash2, ChevronLeft, User, LogOut, Package } from 'lucide-react';
import { supabase } from './lib/supabaseClient'; 

// --- PRODUCT DATA ---
const PRODUCTS = [
  {
    id: 1,
    title: "CONTENT CREATOR BUNDLE",
    category: "PROMPT PACK",
    price: 49,
    image: "/images/creator-bundle.png",
    description: "The ultimate all-in-one bundle for creators. Includes 30,000+ animated elements, SFX, and presets to skyrocket your production value.",
    features: ["30,000+ ASSETS", "ANIMATED ELEMENTS", "SFX LIBRARY", "PREMIERE & AE"]
  },
  {
    id: 2,
    title: "RESIDENTIAL DESIGN GUIDE",
    category: "EBOOK",
    price: 24,
    image: "/images/design-guide.jpg",
    description: "A complete visual guide explaining the 'whys' behind residential design. Perfect for architects, students, and interior designers.",
    features: ["VISUAL DIAGRAMS", "FLOOR PLAN RULES", "PDF FORMAT", "PRINTABLE"]
  },
  {
    id: 3,
    title: "MOTION GRAPHICS V.10",
    category: "ASSET PACK",
    price: 39,
    image: "/images/motion-pack.png",
    description: "High-impact motion graphics pack for professional editors. Drag and drop overlays, transitions, and kinetic typography.",
    features: ["4K RESOLUTION", "ALPHA CHANNEL", "DRAG & DROP", "AFTER EFFECTS"]
  },
  {
    id: 4,
    title: "ULTIMATE STARTUP OS",
    category: "NOTION TEMPLATE",
    price: 29,
    image: "/images/notion-startup.png",
    description: "Launch your startup with clarity. A comprehensive Notion workspace containing 32+ templates for strategy, product, and marketing.",
    features: ["32 TEMPLATES", "PROJECT TRACKER", "CRM SYSTEM", "INVESTOR DECK"]
  },
  {
    id: 5,
    title: "STUDENT OS DASHBOARD",
    category: "NOTION TEMPLATE",
    price: 19,
    image: "/images/notion-student.png",
    description: "Plan, learn, and organize your studies. The all-in-one academic planner to track assignments, grades, and course schedules.",
    features: ["GRADE CALCULATOR", "ASSIGNMENT TRACKER", "MOBILE VIEW", "ACADEMIC CALENDAR"]
  },
  {
    id: 6,
    title: "FIGMA EMAIL UI KIT",
    category: "DESIGN ASSET",
    price: 35,
    image: "/images/figma-kit.jpg",
    description: "Design beautiful emails in Figma and export directly to your ESP. Includes responsive layouts and component libraries.",
    features: ["FIGMA AUTO LAYOUT", "RESPONSIVE COMPONENTS", "HTML EXPORT READY", "DARK MODE"]
  }
];

// --- SMOOTH CONTOUR CANVAS ---
const ContourCanvas = ({ isDarkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    let mouse = { x: -1000, y: -1000 }; 

    const lines = [];
    const gap = 30; 
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initLines();
    };

    const initLines = () => {
      lines.length = 0;
      for (let y = 0; y < canvas.height + gap; y += gap) {
        lines.push({
          baseY: y,
          amplitude: 15 + Math.random() * 15,
          speed: 0.002 + Math.random() * 0.002,
          frequency: 0.005 + Math.random() * 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5;

      lines.forEach(line => {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 10) {
          let y = line.baseY + Math.sin(x * line.frequency + time * line.speed + line.phase) * line.amplitude;
          
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 200;

          if (dist < interactionRadius) {
            const force = (interactionRadius - dist) / interactionRadius;
            y += Math.sin(force * Math.PI) * (mouse.y > line.baseY ? -40 : 40); 
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      time += 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="absolute top-0 right-0 w-full md:w-2/3 h-full pointer-events-auto opacity-60" />;
};

const Marquee = ({ items, onProductClick, isDarkMode }) => {
  return (
    <div className={`relative w-full overflow-hidden py-12 border-y ${
      isDarkMode ? 'bg-[#0e0e10] border-white/10' : 'bg-[#f4f4f5] border-black/10'
    }`}>
      <div className={`absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r to-transparent pointer-events-none ${
        isDarkMode ? 'from-[#0e0e10]' : 'from-[#f4f4f5]'
      }`} />
      <div className={`absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l to-transparent pointer-events-none ${
        isDarkMode ? 'from-[#0e0e10]' : 'from-[#f4f4f5]'
      }`} />
      
      <div className="flex w-max animate-marquee gap-6 hover:pause">
        {[...items, ...items, ...items].map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            onClick={() => onProductClick(item)}
            className={`group relative h-80 w-72 flex-shrink-0 cursor-pointer overflow-hidden border transition-all hover:scale-[1.02] rounded-md ${
              isDarkMode 
                ? 'border-white/10 bg-white/5 hover:border-white' 
                : 'border-black bg-white shadow-sm'
            }`}
          >
            <div className="h-full w-full relative">
               <img 
                 src={item.image} 
                 alt={item.title}
                 className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
               />
            </div>
            <div className={`absolute top-3 right-3 px-2 py-1 border backdrop-blur-md ${
              isDarkMode ? 'bg-black/80 border-white/20 text-white' : 'bg-white/90 border-black/10 text-black'
            }`}>
              <span className="font-mono-tech text-xs font-bold">${item.price}</span>
            </div>
            <div className={`absolute bottom-0 left-0 w-full backdrop-blur-md p-3 border-t ${
               isDarkMode 
                 ? 'bg-black/90 border-white/10' 
                 : 'bg-white/95 border-black/5'
            }`}>
              <h3 className={`font-mono-tech text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckoutView = ({ cart, onRemove, onViewProduct, isDarkMode, total }) => {
  return (
    <div className={`min-h-screen pt-28 pb-12 px-6 ${isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'}`}>
      <div className="mx-auto max-w-7xl">
        <h1 className="font-mono-tech text-3xl font-bold uppercase mb-12">Your Cart ({cart.length})</h1>
        
        {cart.length === 0 ? (
          <div className={`p-12 border text-center border-dashed ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
            <p className="font-mono-tech opacity-50">YOUR CART IS EMPTY</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className={`flex gap-4 p-4 border rounded-md ${
                   isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'
                }`}>
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-800 rounded-sm overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                         <h3 className="font-mono-tech font-bold text-sm">{item.title}</h3>
                         <p className="font-mono-tech text-xs opacity-50 mt-1">{item.category}</p>
                      </div>
                      <span className="font-mono-tech font-bold">${item.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                       <button 
                         onClick={() => onRemove(index)}
                         className="flex items-center gap-1 text-xs font-mono-tech text-red-500 hover:text-red-400"
                       >
                         <Trash2 className="h-3 w-3" /> REMOVE
                       </button>
                       <button 
                         onClick={() => onViewProduct(item)}
                         className="flex items-center gap-1 text-xs font-mono-tech opacity-50 hover:opacity-100"
                       >
                         VIEW DETAILS
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-32 h-fit">
               <div className={`border p-6 rounded-md ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}>
                  <h2 className="font-mono-tech text-lg font-bold border-b pb-4 mb-4 border-dashed opacity-50">SUMMARY</h2>
                  
                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between font-mono-tech text-sm">
                        <span className="opacity-60">Subtotal</span>
                        <span>${total}</span>
                     </div>
                     <div className="flex justify-between font-mono-tech text-sm">
                        <span className="opacity-60">Taxes</span>
                        <span>$0.00</span>
                     </div>
                  </div>

                  <div className="flex justify-between font-mono-tech text-xl font-bold border-t pt-4 mb-8">
                     <span>TOTAL</span>
                     <span>${total}</span>
                  </div>

                  <button className="w-full btn-industrial bg-[#FF4D4D] hover:bg-[#ff3333] text-black py-4 font-bold text-sm">
                     PROCEED TO CHECKOUT
                  </button>
                  <p className="text-center text-[10px] font-mono-tech opacity-40 mt-4">SECURE CHECKOUT POWERED BY STRIPE</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DASHBOARD VIEW ---
const DashboardView = ({ user, profile, orders }) => {
  return (
    <div className={`min-h-screen pt-28 pb-12 px-6`}>
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

const ProductView = ({ product, onBack, onAddToCart, onProductClick, isDarkMode }) => {
  if (!product) return null;

  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className={`min-h-screen pt-28 pb-12 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <button 
          onClick={onBack}
          className={`font-mono-tech group mb-8 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors ${
             isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
          }`}
        >
          <ChevronLeft className="h-3 w-3" />
          BACK
        </button>

        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className={`relative w-full max-w-md aspect-[3/4] overflow-hidden border ${
               isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'
            }`}>
              <img 
                src={product.image} 
                alt={product.title} 
                className="h-full w-full object-cover"
              />
              <div className={`absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div>
              <div className={`absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <div className={`border p-8 ${
               isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <span className={`font-mono-tech px-2 py-0.5 text-xs font-bold uppercase ${
                   isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  {product.category}
                </span>
                <div className={`font-mono-tech text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                  ID: {product.id}_ASSET
                </div>
              </div>

              <h1 className="font-mono-tech text-3xl font-bold uppercase leading-tight">{product.title}</h1>
              
              <div className={`mt-6 flex items-baseline gap-4 border-b pb-6 ${
                 isDarkMode ? 'border-white/10' : 'border-black/10'
              }`}>
                <span className="font-mono-tech text-4xl font-bold">${product.price}</span>
                <span className={`font-mono-tech text-sm uppercase ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                   One-time payment
                </span>
              </div>

              <p className={`mt-6 text-base leading-relaxed font-light ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {product.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-4">
                {product.features.map((feat, i) => (
                  <div key={i} className={`flex items-center gap-3 text-xs font-mono-tech ${
                     isDarkMode ? 'text-white/80' : 'text-black/80'
                  }`}>
                    <div className={`h-1.5 w-1.5 ${isDarkMode ? 'bg-white/40' : 'bg-black/40'}`}></div>
                    {feat}
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                <button 
                  onClick={() => onAddToCart(product)}
                  className="btn-industrial flex w-full items-center justify-center gap-3 bg-[#FF4D4D] hover:bg-[#ff3333] px-8 py-4 text-sm text-black transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
            <div className={`flex items-center gap-4 mb-8 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h2 className="font-mono-tech text-xl font-bold uppercase">Deploy_Other_Systems</h2>
                <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {relatedProducts.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => onProductClick(item)}
                        className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${
                            isDarkMode 
                            ? 'border-white/10 bg-white/5 hover:border-white' 
                            : 'border-black bg-white'
                        }`}
                    >
                        <div className="aspect-[4/3] w-full overflow-hidden relative">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
         handleUserSync(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         handleUserSync(session.user);
      } else {
         setUser(null);
         setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSync = async (currentUser) => {
     setUser(currentUser);
     
     let { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

     if (!existingProfile) {
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
        redirectTo: '[https://strob-store.vercel.app](https://strob-store.vercel.app)' 
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
        scrolled 
          ? (isDarkMode ? 'bg-[#0e0e10]/90 backdrop-blur-md border-white/10' : 'bg-[#f4f4f5]/90 backdrop-blur-md border-black/10') 
          : 'bg-transparent border-transparent'
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
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
               }`}>
               {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <button onClick={() => navigateTo('checkout')} className={`relative p-2 rounded-full transition-colors group ${
                  isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
               }`}>
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D4D] text-[10px] font-bold text-black">
                    {cart.length}
                  </span>
                )}
            </button>

            {/* --- AUTH BUTTON --- */}
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
              <button 
                onClick={handleLogin} 
                className={`flex items-center gap-2 font-mono-tech text-xs px-4 py-2 border transition-colors ${
                   isDarkMode 
                     ? 'border-white/20 hover:bg-white hover:text-black' 
                     : 'border-black/20 hover:bg-black hover:text-white'
                }`}
              >
                 <User className="h-3 w-3" /> LOGIN
              </button>
            )}
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <>
          <section className={`relative pt-24 pb-12 overflow-hidden border-b ${
             isDarkMode ? 'border-white/5' : 'border-black/5'
          }`} style={{ minHeight: '60vh' }}>
            
            {/* Interactive Canvas Background */}
            <ContourCanvas isDarkMode={isDarkMode} />

            <div className="mx-auto max-w-7xl px-6 relative z-10 h-full flex flex-col justify-center">
               <div className="max-w-2xl">
                   <div className="font-mono-tech text-sm text-[#FF4D4D] mb-4 tracking-wider">
                      /// SYSTEM_READY /// V.3.0.0
                   </div>
                  <h1 className="font-mono-tech text-5xl sm:text-7xl font-black leading-none uppercase tracking-tighter" style={{ textShadow: isDarkMode ? '0 0 10px rgba(255,255,255,0.1)' : 'none' }}>
                    High_Performance <br />
                    <span className={isDarkMode ? 'text-white' : 'text-black'}>Digital Assets.</span>
                  </h1>
                  <p className={`mt-8 max-w-lg text-xl font-normal leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                    Premium prompts, systems, and design configurations. 
                    Engineered for maximum efficiency.
                  </p>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full px-6 pb-4 flex items-end justify-between z-10">
                 <h2 className={`font-mono-tech text-sm uppercase ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>Recent_Uploads</h2>
                 <div className={`h-px flex-1 mx-4 mb-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                 <button 
                   onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                   className={`font-mono-tech text-xs cursor-pointer hover:text-[#FF4D4D] transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}
                 >
                   SCROLL >>>
                 </button>
            </div>
          </section>

          <div className="mt-0">
             <Marquee items={PRODUCTS} onProductClick={handleProductClick} isDarkMode={isDarkMode} />
          </div>

          <section className="pt-8 pb-24 mx-auto max-w-7xl px-6">
             <div className={`mb-12 flex flex-wrap items-center gap-6 border-b pb-6 ${
                isDarkMode ? 'border-white/10' : 'border-black/10'
             }`}>
                <h2 className="font-mono-tech text-2xl font-bold uppercase">System_Inventory</h2>
             </div>

             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCTS.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => navigateTo('product', product)}
                    className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${
                       isDarkMode 
                         ? 'border-white/10 bg-white/5 hover:border-white' 
                         : 'border-black bg-white hover:border-black'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img 
                           src={product.image} 
                           alt={product.title} 
                           className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-mono-tech text-lg font-bold uppercase group-hover:text-[#FF4D4D] transition-colors">{product.title}</h3>
                                <p className={`mt-1 font-mono-tech text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                                   REV. 1.0 // {product.id}00
                                </p>
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
        <CheckoutView 
          cart={cart} 
          onRemove={removeFromCart} 
          onViewProduct={(p) => navigateTo('product', p)}
          isDarkMode={isDarkMode}
          total={cartTotal}
        />
      ) : view === 'dashboard' ? (
        <DashboardView user={user} profile={profile} orders={orders} />
      ) : (
        <ProductView 
          product={selectedProduct} 
          onBack={goHome} 
          onAddToCart={addToCart}
          onProductClick={(p) => navigateTo('product', p)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}