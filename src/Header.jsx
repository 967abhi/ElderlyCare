import { useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle for mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle for sign in / login dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between">
          {/* Logo Section */}
          <div className="flex space-x-4">
            <div>
              <a
                href="#"
                className="flex items-center py-5 px-2 text-black hover:text-gray-900"
              >
                {/* Placeholder for the logo */}
                {/* <div className="h-8 w-44 bg-gray-300 rounded-md" /> */}
                <p className=" text-black font-medium text-[24px] font-Poppins hover:text-gray-900 focus:outline-none">
                  ElderlyCare
                </p>
              </a>
            </div>
          </div>

          {/* Primary Nav for desktop */}
          {/* <div className="hidden md:flex items-center space-x-1 ">
            <ul className="flex flex-row gap-20 justify-center text-center">
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                Home
              </li>
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                About
              </li>
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                Contact
              </li>
            </ul>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="  font-medium text-[24px]  hover:text-gray-900 focus:outline-none w-32 h-10 bg-[#0c376f] text-white font-Poppins text-xl rounded-md"
              >
                Sign up
              </button>
             
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-Poppins"
                  >
                    Sign up as <br /> User
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-Poppins"
                  >
                    Sign up as Caretaker
                  </a>
                </div>
              )}
            </div>
          </div> */}
          <div className="hidden md:flex items-center space-x-1">
            <ul className="flex flex-row gap-20 justify-center text-center pr-20">
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                Home
              </li>
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                About
              </li>
              <li className="text-black font-medium text-[16px] font-Poppins hover:text-gray-900 focus:outline-none">
                Contact
              </li>
            </ul>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="font-medium text-[24px] hover:text-gray-900 focus:outline-none w-32 h-10 bg-[#0c376f] text-white font-Poppins text-xl rounded-md"
              >
                Sign up
              </button>
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-Poppins"
                  >
                    Sign up as <br /> User
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-Poppins"
                  >
                    Sign up as Caretaker
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger menu button for mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="mobile-menu-button">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            <a
              href="#"
              className="block py-2 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Sign in / log in
            </a>
            {/* Nested Dropdown for mobile */}
            <div className="ml-4 space-y-1">
              <a
                href="#"
                className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Login as User
              </a>
              <a
                href="#"
                className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Login as Caretaker
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
