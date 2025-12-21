import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'bottom' }) => { // ✅ تغيير الافتراضي إلى 'bottom'
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800',
    bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800',
    left: 'absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800',
    right: 'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800',
  };

  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className={`absolute ${positionClasses[position]} hidden group-hover:block z-50`}>
        <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-xl relative">
          {text}
          <div className={arrowClasses[position]}></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;