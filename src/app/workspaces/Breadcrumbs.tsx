'use client';

import Link from 'next/link';

export default function Breadcrumbs({
  segments,
}: {
  segments: { name: string; id: string }[];
}) {
  return (
    <nav aria-label='breadcrumb'>
      <ol className='flex'>
        <li>
          <Link href='/'>Home</Link>
        </li>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const href =
            '/' +
            segments
              .slice(0, i + 1)
              .map((s) => s.id)
              .join('/');
          return (
            <li key={href} className='flex items-center'>
              <span className='mx-1'>/</span>
              {isLast ? <span>{seg.name}</span> : <a href={href}>{seg.name}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
