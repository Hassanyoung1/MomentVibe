import Link from 'next/link';

function AuthSwitch (currentPage){
  return(
    <div className="flex gap-4">
      <Link href="/login">
        <a className={currentPage === "login" 
        ? "bg-blue-500 text-white font-bold px-4 py-2 rounded" 
        : "bg-gray-300 text-gray-700 px-4 py-2 rounded"}>
        Sign In
        </a>
      </Link>

      <Link href="/register">
        <a className= {currentPage === "register" ?
          "bg-blue-500 text-white font-bold px-4 py-2 rounded"
          : "bg-gray-300 text-gray-700 px-4 py-2 rounded"}>
        </a>  
      </Link>
    </div>
  )
}

export default AuthSwitch;