import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, glass = true, className = '', ...props }) => {
  return (
    <div className={`card ${glass ? 'card-glass' : 'card-solid'} ${className}`} {...props}>
      {children}
    </div>
  );
};
