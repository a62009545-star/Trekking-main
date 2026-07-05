import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
    { name: 'Terms & Conditions', path: '/termsandconditions' },
  ];

  return (
    <nav className="bg-[#0a1628] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Matrika Tours & Travels"
              className="w-10 h-10 rounded-full object-cover object-center flex-shrink-0"
            />
            <div className="leading-tight">
              <p className="font-bold text-sm text-white">Matrika Tours</p>
              <p className="text-xs text-yellow-400">& Travels</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-400' : 'text-gray-300'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/packages"
              className="bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-semibold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Explore Trips
            </Link>
            <Link
              to="/gallery"
              className="border border-yellow-500 hover:bg-yellow-500 hover:text-[#0a1628] text-yellow-400 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Watch Gallery
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0d1f3c] px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-yellow-500 text-[#0a1628]'
                  : 'text-gray-300 hover:text-yellow-400'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              to="/packages"
              onClick={() => setIsOpen(false)}
              className="flex-1 text-center bg-yellow-500 hover:bg-yellow-400 text-[#0a1628] font-semibold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Explore Trips
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className="flex-1 text-center border border-yellow-500 text-yellow-400 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Gallery
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;