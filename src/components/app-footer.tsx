'use client'

import Link from 'next/link'

export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export function AppFooter({ links }: { links: NavLink[] }) {
  return (
    <footer className="bg-white/70 backdrop-blur border-t border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="
          flex flex-col gap-6
          md:flex-row md:items-center md:justify-between md:gap-4
        ">
          
          {/* Brand */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <img src="/logo.png" alt="LazorKit" className="w-6 h-6" />
            <span className="font-semibold text-slate-900">
              LazorKit
            </span>
          </div>

          {/* Links */}
          <nav className="flex justify-center">
            <ul className="
              flex flex-wrap justify-center gap-x-6 gap-y-3
              text-sm
            ">
              {links.map(({ label, href, external }) => (
                <li key={href}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-[#7857FF] transition-colors"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="text-slate-600 hover:text-[#7857FF] transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Meta */}
          <div className="text-xs text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} LazorKit · Devnet
          </div>

        </div>
      </div>
    </footer>
  )
}
