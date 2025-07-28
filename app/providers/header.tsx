import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function ProvidersHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
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

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#068282] dark:hover:text-teal-400 transition-colors"
          >
            Home
          </Link>
          <Button asChild>
            <Link
              href="/app"
              className="bg-[#068282] hover:bg-[#0f766e] text-white px-6 py-2 rounded-lg transition-all duration-300"
            >
              Launch App
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
