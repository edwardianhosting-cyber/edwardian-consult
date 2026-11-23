'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  BookOpen,
  GraduationCap,
  Book,
  Users,
  Newspaper,
  Phone,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: BookOpen },
  { href: '/programs', label: 'Programs', icon: GraduationCap },
  { href: '/subjects', label: 'Subjects', icon: Book },
  { href: '/courses', label: 'Courses', icon: Book },
  { href: '/jamb', label: 'JAMB Prep', icon: Book },
  { href: '/team', label: 'Our Team', icon: Users },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/contact', label: 'Contact', icon: Phone },
];

// Primary links shown directly in the floating pill on desktop so it never overflows
const primaryDesktopLinks = navLinks.slice(0, 6);
const secondaryDesktopLinks = navLinks.slice(6);

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname() || '/';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isAnySecondaryActive = secondaryDesktopLinks.some((link) => isActive(link.href));

  return (
    <>
      {/* Floating overlay — offset from top & sides so hero background peeks around all 4 edges */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="mx-auto max-w-[1320px] pointer-events-auto">
          <nav
            className="bg-gradient-to-b from-primary-900/40 to-primary-900/20 backdrop-blur-2xl border border-white/30 rounded-[3rem] shadow-2xl shadow-black/30 border-t-white/40"
            aria-label="Main navigation"
          >
            <div className="flex justify-between items-center h-16 lg:h-[72px]">
              {/* Left Zone — Logo */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-white/40">
                    <img
                      src="/logo.png"
                      alt="Edwardian Educational Consult"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-bold font-heading text-white tracking-tight text-sm sm:text-base">
                      EDWARDIAN
                    </span>
                    <span className="text-[9px] sm:text-[10px] tracking-widest text-primary-300 uppercase mt-0.5">
                      Educational Consult
                    </span>
                  </div>
                </Link>
              </div>

              {/* Center Zone — Navigation Links */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
                {primaryDesktopLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3.5 py-2 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all shrink-0 ${
                        active
                          ? 'bg-primary-700 text-accent-400 shadow-sm border border-primary-600/80'
                          : 'text-primary-200 hover:text-white hover:bg-primary-800/60'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Compact "More" dropdown for the remaining 4 links */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                      isAnySecondaryActive || moreOpen
                        ? 'bg-primary-700 text-accent-400 border border-primary-600/80'
                        : 'text-primary-200 hover:text-white hover:bg-primary-800/60'
                    }`}
                  >
                    More
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        moreOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {moreOpen && (
                    <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-primary-900/95 backdrop-blur-md border border-primary-700 shadow-xl py-2 z-50">
                      {secondaryDesktopLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? 'bg-primary-700/80 text-accent-400'
                                : 'text-primary-200 hover:text-white hover:bg-primary-800/60'
                            }`}
                          >
                            <Icon className="h-4 w-4 text-primary-400" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Zone — Actions */}
              <div className="hidden lg:flex items-center gap-3 shrink-0">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs xl:text-sm font-semibold text-primary-200 hover:text-white transition-colors shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent-500 text-primary-900 text-xs xl:text-sm font-bold rounded-full hover:bg-accent-400 transition-all shadow-md shrink-0"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-full text-primary-200 hover:bg-primary-800/60 hover:text-white transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-primary-900 shadow-2xl transform transition-transform duration-300 border-l border-primary-700 flex flex-col justify-between overflow-y-auto lg:hidden"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary-700/60">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center border border-primary-600 overflow-hidden">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold font-heading text-white text-sm">EDWARDIAN</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-primary-300 hover:bg-primary-800/50 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-700 text-accent-400'
                      : 'text-primary-300 hover:text-white hover:bg-primary-800/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-accent-400' : 'text-primary-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-3 border-t border-primary-700/40">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary-200 border border-primary-600/60 rounded-full hover:bg-primary-800/50 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-accent-500 text-primary-900 text-sm font-bold rounded-full hover:bg-accent-400 transition-colors shadow-lg"
            onClick={() => setIsOpen(false)}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}