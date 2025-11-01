export default function AuthButtons() {
  return (
    <div className='flex gap-4'>
      <a href='/api/auth/login'>Login</a>
      <a href='/api/auth/logout'>Logout</a>
    </div>
  );
}
