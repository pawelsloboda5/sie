"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isCopilot = pathname?.startsWith('/copilot')
  const [copilotLocationDisplay, setCopilotLocationDisplay] = useState<string | null>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!isMobileMenuOpen) return
    try {
      const raw = localStorage.getItem('sie:copilot:location')
      if (raw) {
        const loc = JSON.parse(raw) as { display?: string; city?: string; state?: string }
        const disp = loc.display || (loc.city ? `${loc.city}${loc.state ? ", " + loc.state : ''}` : '')
        setCopilotLocationDisplay(disp || null)
      } else {
        setCopilotLocationDisplay(null)
      }
    } catch {
      setCopilotLocationDisplay(null)
    }
  }, [isMobileMenuOpen, isCopilot])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80" onClick={closeMobileMenu}>
          <Image
            src="/logo_560x560.png"
            alt="SIE Wellness"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className={isCopilot ? "text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent" : "text-xl font-bold text-gray-900 dark:text-gray-100"}>
            {isCopilot ? 'AI Healthcare Copilot BETA' : 'SIE Wellness'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            Search
          </Link>
          <Link
            href="/providers"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            Providers
          </Link>
          <Link
            href="/resources/faq"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/copilot"
            className="text-sm font-medium text-white bg-[#068282] hover:bg-[#0f766e] px-3 py-1.5 rounded-lg transition-colors"
          >
            AI Copilot
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="container px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              href="/app"
              onClick={closeMobileMenu}
              className="block py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Search
            </Link>
            <Link
              href="/providers"
              onClick={closeMobileMenu}
              className="block py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Providers
            </Link>
            <Link
              href="/resources/faq"
              onClick={closeMobileMenu}
              className="block py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              FAQ
            </Link>
            {isCopilot ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                <div className="px-4 pt-3">
                  <Link
                    href="/copilot"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 text-base font-medium text-white bg-[#068282] hover:bg-[#0f766e] rounded-lg transition-colors"
                  >
                    AI Copilot
                  </Link>
                </div>
                <div className="px-4 pt-2 pb-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Location: <span className="font-normal text-gray-600 dark:text-gray-300">{copilotLocationDisplay || 'Not set'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <button
                      onClick={() => {
                        try {
                          if (window.location.pathname.startsWith('/copilot')) {
                            window.location.hash = 'new-location'
                            try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
                            try { window.dispatchEvent(new CustomEvent('sie:copilot:open-location')) } catch {}
                          } else {
                            window.location.href = '/copilot#new-location'
                          }
                        } finally {
                          closeMobileMenu()
                        }
                      }}
                      className="w-full px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      New Location
                    </button>
                    <button
                      onClick={() => {
                        try {
                          localStorage.removeItem('sie:copilot:conversation')
                          localStorage.removeItem('sie:copilot:state')
                          localStorage.removeItem('sie:copilot:providers')
                        } catch {}
                        window.location.href = '/copilot'
                      }}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Reset Conversation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/copilot"
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-base font-medium text-white bg-[#068282] hover:bg-[#0f766e] rounded-lg transition-colors"
              >
                AI Copilot
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
