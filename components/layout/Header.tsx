'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Globe } from 'lucide-react';

export function Header() {
const [isOpen, setIsOpen] = useState(false);

return (
<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
<div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
{/* Logo */}
<Link href="/" className="flex items-center space-x-3 group">
<div className="flex h-8 w-8 items-center justify-center transition-transform group-hover:scale-105">
<Image src="/logo_560x560.png" alt="SIE Wellness Logo" width={32} height={32} className="rounded-lg" />
</div>
<div className="hidden sm:block">
<h1 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-foreground/90 transition-colors">
SIE Wellness
</h1>
<p className="text-xs text-muted-foreground">AI-Powered Healthcare Discovery</p>
</div>
</Link>
    {/* Desktop Nav */}
    <div className="hidden md:flex items-center gap-3">
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/providers" className="text-muted-foreground hover:text-foreground transition-colors">
          Providers
        </Link>
        <Link href="#who-we-help" className="text-muted-foreground hover:text-foreground transition-colors">
          Who We Help
        </Link>
      </nav>

      {/* Language */}
      <Select defaultValue="en">
        <SelectTrigger className="w-[120px] h-9 text-sm border-border/50">
          <Globe className="h-3.5 w-3.5 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>

      {/* Launch App (high-contrast) */}
      <Button
        asChild
        className="h-9 px-4 text-sm font-semibold rounded-full bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
      >
        <Link href="/app">Launch App</Link>
      </Button>
    </div>

    {/* Mobile */}
    <div className="flex items-center space-x-2 md:hidden">
      {/* Mobile Launch */}
      <Button
        asChild
        size="sm"
        className="h-8 px-3 text-xs rounded-full bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
      >
        <Link href="/app">Launch</Link>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px] p-0">
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center space-x-2 p-6 border-b border-border/40">
              <div className="flex h-8 w-8 items-center justify-center">
                <Image
                  src="/logo_560x560.png"
                  alt="SIE Wellness Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold">SIE Wellness</SheetTitle>
                <p className="text-xs text-muted-foreground">Healthcare Discovery</p>
              </div>
            </div>

            {/* Drawer Nav */}
            <nav className="flex-1 p-6 space-y-1">
              <Link
                href="/providers"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Providers
              </Link>
              <Link
                href="#who-we-help"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Who We Help
              </Link>
            </nav>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-border/40 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Language
                </label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full h-9 text-sm">
                    <Globe className="h-3.5 w-3.5 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                asChild
                className="w-full h-9 text-sm font-semibold rounded-full bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
              >
                <Link href="/app" onClick={() => setIsOpen(false)}>
                  Launch App
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</header>
);
}