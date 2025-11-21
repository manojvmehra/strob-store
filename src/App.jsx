import React, { useState, useEffect } from 'react';
import { ShoppingCart, Sun, Moon } from 'lucide-react';

// Import our new components
import { PRODUCTS } from './data/products';
import TechCanvas from './components/TechCanvas';
import Marquee from './components/Marquee';
import CheckoutView from './components/CheckoutView';
import ProductView from './components/ProductView';

export default function StrobStore() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const isCheckout = params.get('page') === 'checkout';

      if (isCheckout) {
        setView('checkout');
      } else if (productId) {
        const product = PRODUCTS.find(p => p.id === parseInt(productId));
        if (product) {
          setSelectedProduct(product);
          setView('product');
        }
      } else {
        setSelectedProduct(null);
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleProductClick = (product) => {
    window.history.pushState({ id: product.id }, "", `?product=${product.id}`);
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const openCheckout = () => {
    window.history.pushState({ page: 'checkout' }, "", `?page=checkout`);
    setView('checkout');
    window.scrollTo(0, 0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const goHome = () => {
    if (view !== 'home') {
       window.history.back(); 
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
          <div onClick={() => { window.history.pushState({}, "", "/"); setView('home'); }} className="flex cursor-pointer items-center gap-3">
            <div className={`h-4 w-4 ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
            <span className="font-mono-tech text-lg font-bold tracking-tight uppercase">StrobStore</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {['INDEX', 'PACKS', 'SYSTEM', 'LOGS'].map((link) => (
              <button key={link} onClick={() => { window.history.pushState({}, "", "/"); setView('home'); }} className={`font-mono-tech text-xs transition-colors hover:underline decoration-1 underline-offset-4 ${
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
            
            <button onClick={openCheckout} className={`relative p-2 rounded-full transition-colors group ${
                  isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
               }`}>
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D4D] text-[10px] font-bold text-black">
                    {cart.length}
                  </span>
                )}
            </button>
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <>
          <section className={`relative pt-24 pb-12 overflow-hidden border-b ${
             isDarkMode ? 'border-white/5' : 'border-black/5'
          }`} style={{ minHeight: '60vh' }}>
            <TechCanvas isDarkMode={isDarkMode} />
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
                 <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className={`font-mono-tech text-xs cursor-pointer hover:text-[#FF4D4D] transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
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
                    onClick={() => handleProductClick(product)}
                    className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${
                       isDarkMode 
                         ? 'border-white/10 bg-white/5 hover:border-white' 
                         : 'border-black bg-white hover:border-black'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img src={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
          onViewProduct={handleProductClick}
          isDarkMode={isDarkMode}
          total={cartTotal}
        />
      ) : (
        <ProductView 
          product={selectedProduct} 
          onBack={goHome} 
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}