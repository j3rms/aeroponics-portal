export default function Footer() {
    return (
      <footer className="bg-red-800 text-white py-6 px-4 w-full">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {/* Copyright Section */}
          <div className="w-full md:w-auto text-center md:text-left mb-4 md:mb-0">
            <p className="text-xs md:text-sm">
              Copyright 2025 &copy; All Rights Reserved.
            </p>
          </div>
  
          {/* Footer Links */}
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <ul className="flex gap-4 text-xs md:text-sm list-none">
              <li>
                <a href="#" className="hover:text-white transition duration-200">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition duration-200">Terms of Use</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    );
  }
  