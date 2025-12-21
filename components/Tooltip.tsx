import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'bottom' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
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
      <div className={`absolute ${positionClasses[position]} hidden group-hover:block z-50 pointer-events-none`}>
        
      </div>
    </div>
  );
};

export default Tooltip;