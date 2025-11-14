import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) => {
  return (
    <button {...props} className='flex space-x-2 items-center justify-center'>
      <span>{children}</span>
      {loading && <Spinner />}
    </button>
  );
};
