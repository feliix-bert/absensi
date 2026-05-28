import Link from 'next/link';

const LINKS = [
  { label: 'Masuk', href: '/login' },
  { label: 'Daftar', href: '/signup' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
];

const BRAND_VALUES = [
  { dot: 'bg-primary-500', text: 'Terverifikasi GPS' },
  { dot: 'bg-success-500', text: 'Data Aman' },
  { dot: 'bg-secondary-400', text: 'Akses 24/7' },
];

export function LandingFooter() {
  return (
    <footer className="relative" style={{ background: 'linear-gradient(180deg, #061828 0%, #040F1A 100%)' }}>

      {/* Top accent rule — thin but bold brand red */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-700 via-primary-500 to-primary-700" aria-hidden />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      {/* Thin rule separating CTA from footer content */}
      <div className="h-px bg-white/[0.05]" />

      <div className="page-container py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

          {/* Brand mark + values */}
          <div>
            <Link href="/" className="flex items-center gap-3.5 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-600 border border-primary-500/40 flex items-center justify-center shrink-0
                group-hover:bg-primary-500 group-hover:scale-105 transition-all duration-300 shadow-md shadow-primary-900/30">
                <span className="text-white font-bold text-[13px] tracking-tight">TI</span>
              </div>
              <div>
                <p className="text-white font-semibold text-[1rem] leading-tight group-hover:text-primary-100 transition-colors duration-300">
                  TelIntern
                </p>
                <p className="text-white/30 text-[0.8125rem] mt-0.5">
                  Smart Internship Attendance
                </p>
              </div>
            </Link>

            {/* Brand value pills */}
            <div className="flex flex-wrap gap-2">
              {BRAND_VALUES.map((v) => (
                <div key={v.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04]">
                  <div className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
                  <span className="text-[11px] font-medium text-white/35">{v.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4" aria-label="Footer navigation">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.9375rem] font-medium text-white/35 hover:text-white transition-colors duration-300 hover:text-primary-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

        </div>

        {/* Bottom rule + copyright */}
        <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.8125rem] text-white/25">
            © 2026 Telkom Indonesia. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-[0.8125rem] text-white/20">
            <span>Privasi</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Ketentuan</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
