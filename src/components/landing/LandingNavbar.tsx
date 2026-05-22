'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-neutral-200/80 py-0'
          : 'bg-transparent py-1'
      )}
    >
      <div className="page-container">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-600/20 group-hover:scale-[1.02] transition-transform">
              <span className="text-white font-bold text-sm tracking-tight">TI</span>
            </div>
            <div className="leading-tight">
              <span className={cn(
                'block font-bold text-[15px] tracking-tight transition-colors',
                scrolled ? 'text-neutral-900' : 'text-white'
              )}>
                TelIntern
              </span>
              <span className={cn(
                'hidden sm:block text-[11px] font-medium transition-colors',
                scrolled ? 'text-neutral-500' : 'text-white/65'
              )}>
                Absensi Magang Telkom
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  setMenuOpen(false);
                }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600'
                  : 'text-white hover:text-white/90'
              )}
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-md shadow-primary-600/25 hover:bg-primary-500 transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              scrolled ? 'text-neutral-700 hover:bg-neutral-100' : 'text-white hover:bg-white/10'
            )}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
          <nav className="page-container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  setMenuOpen(false);
                }}
                className="px-4 py-3 rounded-xl text-neutral-700 font-medium hover:bg-neutral-50"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-neutral-100" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-neutral-800 font-semibold hover:bg-neutral-50"
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="mx-1 mt-1 py-3.5 rounded-xl bg-primary-600 text-white text-center font-semibold hover:bg-primary-500"
            >
              Daftar Gratis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
