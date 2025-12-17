import React from 'react';

interface CardProps {
  children: React.ReactNode;
  span?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, span = '1', className = '' }) => {
  const colSpanClass = `lg:col-span-${span}`;
  return (
    <div 
      className={`${colSpanClass} bg-[var(--card-background)] backdrop-blur-sm border border-[var(--border-color-accent)] rounded-2xl p-4 sm:p-6 shadow-lg shadow-[var(--shadow-color-accent)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;