import React from 'react';

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
               <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className={`absolute top-3 right-3 px-2 py-1 border backdrop-blur-md ${
              isDarkMode ? 'bg-black/80 border-white/20 text-white' : 'bg-white/90 border-black/10 text-black'
            }`}>
              <span className="font-mono-tech text-xs font-bold">${item.price}</span>
            </div>
            <div className={`absolute bottom-0 left-0 w-full backdrop-blur-md p-3 border-t ${
               isDarkMode ? 'bg-black/90 border-white/10' : 'bg-white/95 border-black/5'
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

export default Marquee;