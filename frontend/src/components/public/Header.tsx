'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-[#2C2015] text-white py-2 px-4 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="flex items-center gap-2 text-white/70">
              <Phone className="h-3 w-3" />
              +234 800 000 0000
            </span>
            <span className="flex items-center gap-2 text-white/70">
              <Mail className="h-3 w-3" />
              info@edwardianeducationalconsult.com.ng
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <MapPin className="h-3 w-3" />
            Lagos, Nigeria
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg'
            : 'bg-black/30 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden transition-colors">
                <img src="/logo.png" alt="Edwardian Educational Consult" className="h-full w-full object-contain" />
              </div>
              <div className="hidden xs:block">
                <span className={`text-base sm:text-lg lg:text-2xl font-bold font-heading transition-colors leading-tight ${
                  isScrolled ? 'text-[#2C2015]' : 'text-white'
                }`}>EDWARDIAN</span>
                <span className={`block text-[8px] sm:text-[9px] lg:text-xs -mt-0.5 tracking-wider transition-colors ${
                  isScrolled ? 'text-[#8B6F47]' : 'text-white/70'
                }`}>EDUCATIONAL CONSULT LTD</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    isScrolled
                      ? 'text-[#2C2015] hover:text-[#D4A054] hover:bg-[#F5DEB3]/30'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login?mode=parent"
                className={`px-5 py-2.5 font-semibold rounded-lg transition-colors text-sm ${
                  isScrolled
                    ? 'text-green-700 border border-green-700/20 hover:bg-green-50'
                    : 'text-green-100 border border-green-100/30 hover:bg-green-900/20'
                }`}
              >
                Parent Portal
              </Link>
              <Link
                href="/login"
                className={`px-5 py-2.5 font-semibold rounded-lg transition-colors text-sm ${
                  isScrolled
                    ? 'text-[#2C2015] border border-[#2C2015]/20 hover:bg-[#F5DEB3]/30'
                    : 'text-white border border-white/30 hover:bg-white/10'
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-[#FFD700] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#e6c200] transition-colors text-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-[#2C2015] hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Full screen overlay style */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100 px-4 py-6 space-y-1 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3.5 text-[#2C2015] font-medium hover:text-[#D4A054] hover:bg-[#F5DEB3]/20 rounded-xl transition-colors text-base"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
              <Link
                href="/login?mode=parent"
                className="block px-4 py-3.5 text-green-700 font-semibold border border-green-700/20 rounded-xl text-center text-base"
                onClick={() => setIsOpen(false)}
              >
                Parent Portal
              </Link>
              <Link
                href="/login"
                className="block px-4 py-3.5 text-[#2C2015] font-semibold border border-[#2C2015]/20 rounded-xl text-center text-base"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block px-4 py-3.5 bg-[#FFD700] text-[#1a1a1a] font-bold rounded-xl text-center text-base"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
