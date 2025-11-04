'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // remove empty strings

  return (
    <nav>
      <ol className='flex space-x-2'>
        <li>
          <Link href='/'>Home</Link>
        </li>
        {segments.map((seg, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/');
          const isLast = i === segments.length - 1;
          return (
            <li key={href}>
              <span className='mx-1'>/</span>
              {isLast ? <span>{seg}</span> : <Link href={href}>{seg}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
