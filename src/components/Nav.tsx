'use client';

import { signOut } from '@/app/signin/actions';
import { Button } from './Button';
import { useUser } from '@/providers/UserProvider';

export default function Nav() {
  const { user } = useUser();

  return (
    <nav className='bg-[#1F2937] p-4 flex justify-end space-x-4'>
      {!user && <a href='/signin'>Sign in</a>}
      {!user && <a href='/signup'>Sign up</a>}
      {user && (
        <div className='flex space-x-2 items-center'>
          <p>Welcome {user.email}!</p>
          <Button onClick={signOut}>Logout</Button>
        </div>
      )}
    </nav>
  );
}
