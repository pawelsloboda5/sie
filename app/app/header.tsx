"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

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
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            SIE Wellness
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
            href="/providers"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            Providers
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
              href="/providers"
              onClick={closeMobileMenu}
              className="block py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Providers
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
