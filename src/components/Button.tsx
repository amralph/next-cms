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
      className={`flex space-x-2 items-center justify-center ${
        loading ? 'disabled' : ''
      } ${className}`}
    >
      <span>{children}</span>
      {loading && <Spinner />}
    </button>
  );
};
