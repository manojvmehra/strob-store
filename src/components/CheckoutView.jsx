import React from 'react';
import { Trash2 } from 'lucide-react';

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
                       <button onClick={() => onRemove(index)} className="flex items-center gap-1 text-xs font-mono-tech text-red-500 hover:text-red-400">
                         <Trash2 className="h-3 w-3" /> REMOVE
                       </button>
                       <button onClick={() => onViewProduct(item)} className="flex items-center gap-1 text-xs font-mono-tech opacity-50 hover:opacity-100">
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

export default CheckoutView;