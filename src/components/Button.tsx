import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  loading,
  children,
}: {
  loading?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <button className='flex space-x-2 items-center justify-center'>
      <span>{children}</span>
      {loading && <Spinner />}
    </button>
  );
};
