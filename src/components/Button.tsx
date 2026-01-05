import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  loading,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) => {
  return (
    <button
      {...props}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 rounded-lg px-4 py-2 font-semibold transition-all duration-200
    ${
      loading
        ? 'bg-blue-500/50 text-white cursor-not-allowed'
        : 'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600'
    } 
    ${className}`}
    >
      <span>{children}</span>
      {loading && <Spinner />}
    </button>
  );
};
