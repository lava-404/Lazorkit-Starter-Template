/**
 * Application Header Component
 */

'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from './app-button'
import {
  Menu,
  X,
  BookOpen,
  Github,
  ExternalLink,
  Twitter,
  Send,
} from 'lucide-react'
import { ConnectButton } from '@/lazorkit-components/connect-button'

const ICON_MAP = {
  docs: BookOpen,
  github: Github,
  example: ExternalLink,
  twitter: Twitter,
  telegram: Send,
} as const

type NavLink = {
  label: string
  href: string
  external?: boolean
  icon: keyof typeof ICON_MAP
} 


export function AppHeader({ links = [] }: { links: NavLink[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="LazorKit" className="w-7 h-7" />
          <span className="text-lg">LazorKit Starter Template</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
            {links.map(({ label, href, external, icon }) => {
            const Icon = ICON_MAP[icon]

            return (
              <a
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 text-slate-900 hover:text-[#7857FF] transition-colors"
              >
                <Icon className="w-4 h-4 stroke-current" />
                {label}
              </a>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Profile / Wallet button replaces Get Started */}
          <ConnectButton />
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      {showMenu && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 flex flex-col gap-3">
          <div className="px-4 py-4 flex flex-col gap-3">
          {links.map(({ label, href, external }) => (
  <a
    key={href}
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    onClick={() => setShowMenu(false)}
    className="block text-sm text-slate-900 hover:text-[#7857FF] transition-colors"
  >
    {label}
  </a>
))}

  <div className="pt-3 border-t">
    <ConnectButton />
  </div>
</div>

            <div className="pt-3 border-t">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ---------- helpers ---------- */

function NavItem({
  icon: Icon,
  label,
  href,
}: {
  icon: any
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-slate-900 hover:text-[#7857FF] transition-colors"
    >
      <Icon className="w-4 h-4 stroke-current" />
      {label}
    </a>
  )
}

function MobileNavItem({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-sm text-slate-900 hover:text-[#7857FF] transition-colors"
    >
      {label}
    </a>
  )
}
