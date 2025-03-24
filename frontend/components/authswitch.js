import Link from 'next/link';


function AuthSwitch({ currentPage }) {
  return (
    <div>
      {currentPage === 'register' ? (
        <span>Sign Up</span>
      ) : (
        <Link href="/register" className="text-blue-500">
          Sign Up
        </Link>
      )}
      {currentPage === 'login' ? (
        <span>Sign In</span>
      ) : (
        <Link href="/login" className="text-blue-500">
          Sign In
        </Link>
      )}
    </div>
  );
}


export default AuthSwitch;
