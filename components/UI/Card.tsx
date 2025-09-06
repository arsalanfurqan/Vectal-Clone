import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const baseStyles = 'rounded-xl p-5 text-white';
  const variants = {
    default: 'bg-[#232323]',
    elevated: 'bg-[#232323]',
    bordered: 'bg-[#232323]',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick} style={{border: 'none', boxShadow: 'none', outline: 'none'}}>
      {children}
    </div>
  );
};

export default Card; 