'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState, useRef } from 'react'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { href: '/expenses', label: 'Expenses', icon: <Receipt size={15} /> },
  { href: '/budgets', label: 'Budget', icon: <Wallet size={15} /> },
  { href: '/ai-coach', label: 'AI Coach', icon: <Sparkles size={15} /> },
]

export default function Navbar({ userInitials, userEmail, userName, userAvatarUrl }: {
  userInitials: string
  userEmail?: string
  userName?: string
  userAvatarUrl?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const Avatar = ({ size }: { size: number }) => (
    <div
      className="rounded-full bg-blue-500 flex items-center justify-center text-white font-medium overflow-hidden shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {userAvatarUrl ? (
        <Image
          src={userAvatarUrl}
          alt="Profile"
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        userInitials
      )}
    </div>
  )

  return (
    <>
      <nav className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 shadow-sm'
          : 'bg-transparent border-b border-transparent h-16'
      }`}>

        {/* Logo */}
        <Link href="/dashboard" className="relative flex items-center" style={{ height: scrolled ? '28px' : '32px', transition: 'height 0.3s' }}>
          <Image
            src="/images/logo-2-whi.png"
            alt="PennyPilot"
            width={120}
            height={30}
            loading="eager"
            style={{ width: 'auto', height: scrolled ? '28px' : '32px', transition: 'all 0.3s', opacity: scrolled ? 0 : 1, position: 'absolute', top: 0, left: 0 }}
            className="object-contain"
          />
          <Image
            src="/images/logo-1-col.png"
            alt="PennyPilot"
            width={120}
            height={30}
            style={{ width: 'auto', height: scrolled ? '28px' : '32px', transition: 'all 0.3s', opacity: scrolled ? 1 : 0, position: 'relative' }}
            className="object-contain"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? scrolled ? 'text-slate-900 font-medium' : 'text-white font-medium'
                  : scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop Avatar + Dropdown */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:ring-2 hover:ring-blue-400 rounded-full transition-all"
            >
              <Avatar size={36} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-64 bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-4 border-b border-[#334155]">
                  <div className="flex items-center gap-3">
                    <Avatar size={42} />
                    <div className="overflow-hidden">
                      <div className="text-white text-sm font-medium truncate">{userName || 'User'}</div>
                      <div className="text-slate-400 text-xs truncate">{userEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {navLinks.map(link => (
                    <Link key={link.href} href={link.href} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-[#334155] transition-colors text-sm">
                      <span className="text-slate-400">{link.icon}</span> {link.label}
                    </Link>
                  ))}
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-[#334155] transition-colors text-sm">
                    <User size={15} className="text-slate-400" /> Profile Settings
                  </Link>
                </div>

                <div className="border-t border-[#334155] py-2">
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm w-full text-left">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-1"
          >
            {mobileMenuOpen
              ? <X size={22} className={scrolled ? 'text-slate-800' : 'text-white'} />
              : <Menu size={22} className={scrolled ? 'text-slate-800' : 'text-white'} />
            }
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0f172a] z-40 px-6 py-6 flex flex-col gap-2">
          {/* User info */}
          <div className="flex items-center gap-3 pb-4 mb-2 border-b border-[#334155]">
            <Avatar size={44} />
            <div>
              <div className="text-white text-sm font-medium">{userName || 'User'}</div>
              <div className="text-slate-400 text-xs">{userEmail}</div>
            </div>
          </div>

          {/* Nav links */}
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-blue-500/10 text-blue-400 font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-[#1e293b]'
              }`}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}

          <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">
            <User size={15} /> Profile Settings
          </Link>

          <div className="mt-auto pt-4 border-t border-[#334155]">
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}