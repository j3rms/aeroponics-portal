import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <nav className="text-red-800 py-3 px-4 flex items-center justify-between flex-wrap fixed top-0 left-0 w-full bg-white z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <a className="font-bold font-sans text-2xl tracking-tight ml-2">C a s e a h o l i c</a>
          <img
            src="/assets/meee.png" 
            alt="Your Face"
            className="w-10 h-10 object-cover"
          />
        </div>

        <div className="flex items-center space-x-4 flex-wrap mt-2 md:mt-0">
          <Link className="text-md px-4 py-2 rounded-full hover:animate-bounce font-bold" href="/">Home</Link>
          <Link className="text-md px-4 py-2 rounded-full hover:animate-bounce font-bold" href="/products">Products</Link>
          <Link className="text-md px-4 py-2 rounded-full hover:animate-bounce font-bold" href="/login">Login</Link>
        </div>
      </nav>
      
      <div className="border-t-2 border-red-800"></div>
    </>
  );
}
