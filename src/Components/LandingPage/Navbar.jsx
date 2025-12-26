import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // You can also use Heroicons or any SVG
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()
  return (
    <nav className="bg-white px-6 py-4 shadow-sm flex justify-between items-center relative z-50">
      {/* Logo */}
      <div className="flex items-center text-3xl">
        <span className="font-bold text-gray-900">
         ⚡ Mentor<span className="text-blue-600">Mate</span>
        </span>
      </div>

      {/* Hamburger Icon (Mobile) */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Nav Links (Desktop) */}
    <ul className="hidden md:flex space-x-8 text-gray-600 text-m font-medium">
  <li className="relative hover:text-blue-600 cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">
    How It Works
  </li>
  <li className="relative hover:text-blue-600 cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">
    Features
  </li>
  <li className="relative hover:text-blue-600 cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">
    For Mentors
  </li>
  <li className="relative hover:text-blue-600 cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">
    Resources
  </li>
</ul>

      {/* Action Buttons (Desktop) */}
      <div className="hidden md:flex space-x-3">
        <button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-md text-sm hover:bg-blue-50 transition" onClick={()=>navigate('/signup')}>
          Sign In
        </button>
        <button onClick={()=>navigate('/login')} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white px-6 py-4 flex flex-col space-y-4 md:hidden shadow-md">
          {['How It Works', 'Features', 'For Mentors', 'Resources'].map((item) => (
            <span key={item} className="text-gray-700 font-medium hover:text-blue-600 cursor-pointer">
              {item}
            </span>
          ))}
          <hr />
          <button onClick={()=>navigate('/signup')} className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition">
            Sign In
          </button>
          <button onClick={()=>navigate('/login')} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
