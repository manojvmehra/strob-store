import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { PRODUCTS } from '../data/products'; // Importing the data

const ProductView = ({ product, onBack, onAddToCart, onProductClick, isDarkMode }) => {
  if (!product) return null;
  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className={`min-h-screen pt-28 pb-12 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e0e10] text-white' : 'bg-[#f4f4f5] text-black'
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <button onClick={onBack} className={`font-mono-tech group mb-8 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors ${
             isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
          }`}>
          <ChevronLeft className="h-3 w-3" /> BACK
        </button>

        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className={`relative w-full max-w-md aspect-[3/4] overflow-hidden border ${
               isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'
            }`}>
              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
              <div className={`absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div>
              <div className={`absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <div className={`border p-8 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white shadow-sm'}`}>
              <div className="flex items-center justify-between mb-6">
                <span className={`font-mono-tech px-2 py-0.5 text-xs font-bold uppercase ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{product.category}</span>
                <div className={`font-mono-tech text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>ID: {product.id}_ASSET</div>
              </div>
              <h1 className="font-mono-tech text-3xl font-bold uppercase leading-tight">{product.title}</h1>
              <div className={`mt-6 flex items-baseline gap-4 border-b pb-6 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <span className="font-mono-tech text-4xl font-bold">${product.price}</span>
                <span className={`font-mono-tech text-sm uppercase ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>One-time payment</span>
              </div>
              <p className={`mt-6 text-base leading-relaxed font-light ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{product.description}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-4">
                {product.features.map((feat, i) => (
                  <div key={i} className={`flex items-center gap-3 text-xs font-mono-tech ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                    <div className={`h-1.5 w-1.5 ${isDarkMode ? 'bg-white/40' : 'bg-black/40'}`}></div>
                    {feat}
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                <button onClick={() => onAddToCart(product)} className="btn-industrial flex w-full items-center justify-center gap-3 bg-[#FF4D4D] hover:bg-[#ff3333] px-8 py-4 text-sm text-black transition-all active:scale-95 shadow-lg shadow-red-500/20">
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
                    <div key={item.id} onClick={() => onProductClick(item)} className={`group cursor-pointer border p-0 transition-colors duration-300 rounded-md overflow-hidden ${isDarkMode ? 'border-white/10 bg-white/5 hover:border-white' : 'border-black bg-white'}`}>
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

export default ProductView;