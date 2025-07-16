"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Heart, Menu, Phone, MapPin, HelpCircle, Globe } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">SieWell</h1>
              <p className="text-xs text-muted-foreground">Free & Low-Cost Healthcare</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center space-x-1">
                  <HelpCircle className="h-4 w-4" />
                  <span>Need Help?</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <div className="grid gap-1">
                      <h4 className="font-medium leading-none">Emergency</h4>
                      <p className="text-sm text-muted-foreground">
                        For life-threatening emergencies, call 911 immediately
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <NavigationMenuLink asChild>
                        <a 
                          href="tel:988"
                          className="flex items-center space-x-2 rounded-md p-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Crisis Hotline</div>
                            <div className="text-muted-foreground">988 - 24/7 Mental Health Support</div>
                          </div>
                        </a>
                      </NavigationMenuLink>
                    </div>
                    <div className="grid gap-1">
                      <NavigationMenuLink asChild>
                        <a 
                          href="#"
                          className="flex items-center space-x-2 rounded-md p-3 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <MapPin className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Find Emergency Room</div>
                            <div className="text-muted-foreground">Locate nearest emergency care</div>
                          </div>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Language Switcher */}
          <Select defaultValue="en">
            <SelectTrigger className="w-[120px]">
              <Globe className="h-4 w-4 mr-2" />
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

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">SieWell</h2>
                  <p className="text-sm text-muted-foreground">Free & Low-Cost Healthcare</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Need Help?
                  </h3>
                  <div className="space-y-2 ml-6">
                    <a 
                      href="tel:911"
                      className="block p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <div className="font-medium text-red-600">Emergency: 911</div>
                      <div className="text-muted-foreground">Life-threatening emergencies</div>
                    </a>
                    <a 
                      href="tel:988"
                      className="block p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <div className="font-medium">Crisis Hotline: 988</div>
                      <div className="text-muted-foreground">24/7 Mental Health Support</div>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Language
                  </h3>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
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
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}