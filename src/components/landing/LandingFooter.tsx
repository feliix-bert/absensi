import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-secondary-900 text-white py-12">
      <div className="page-container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="font-bold text-sm">TI</span>
            </div>
            <div>
              <p className="font-semibold">TelIntern</p>
              <p className="text-secondary-300 text-sm mt-0.5">
                Smart Internship Attendance System
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-secondary-300">
            <Link href="/login" className="hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Daftar
            </Link>
            <a href="#fitur" className="hover:text-white transition-colors">
              Fitur
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-secondary-400 text-sm text-center md:text-left">
          © 2025 Telkom Indonesia. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
