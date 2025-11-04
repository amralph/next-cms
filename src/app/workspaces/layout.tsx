import Breadcrumbs from './Breadcrumbs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <Breadcrumbs />
        {children}
      </body>
    </html>
  );
}
