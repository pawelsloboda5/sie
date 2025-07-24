"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, ChevronDown, Clock, FileText, Bot, Shield, Users, ArrowRight, Stethoscope } from "lucide-react"
import type { RecentSearch } from "@/lib/db"
import * as db from "@/lib/db"
import Link from "next/link"
import { reverseGeocode } from "@/lib/utils"

interface SimpleHeroSectionProps {
  showRecentSearches?: boolean
}

export function SimpleHeroSection({ showRecentSearches = true }: SimpleHeroSectionProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showAllCapabilities, setShowAllCapabilities] = useState(false)

  // Popular search suggestions
  const searchSuggestions = [
    "Free STI testing",
    "Urgent care near me", 
    "Dental clinic uninsured",
    "Mental health services",
    "Pregnancy testing",
    "Diabetes management",
    "Blood pressure check",
    "Vaccination clinic",
    "Free mammogram",
    "Women's health services",
    "Free birth control",
    "Pediatric care",
    "Eye exam",
    "Free prescription assistance",
    "HIV testing",
    "Substance abuse treatment"
  ]

  // Load recent searches on component mount
  useEffect(() => {
    if (showRecentSearches) {
      db.getRecentSearches(5).then(setRecentSearches).catch(console.error)
    }
  }, [showRecentSearches])

  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Convert coordinates to address
            const address = await reverseGeocode(latitude, longitude)
            setLocation(address)
            setIsGettingLocation(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            setIsGettingLocation(false)
            setSearchError("Unable to get your location. Please enter it manually.")
          }
        )
      } else {
        setIsGettingLocation(false)
        setSearchError("Geolocation is not supported by this browser.")
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      setIsGettingLocation(false)
      setSearchError("Error accessing location services.")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search query")
      return
    }

    // Prevent double execution
    if (isSearching) {
      return
    }

    setSearchError(null)
    setIsSearching(true)

    try {
      // Save search to IndexedDB
      await db.saveRecentSearch(searchQuery, location)

      // Redirect to app page with search parameters
      const params = new URLSearchParams()
      params.set('q', searchQuery)
      if (location) {
        params.set('location', location)
      }

      router.push(`/app?${params.toString()}`)
    } catch (error) {
      console.error('Error during search:', error)
      setSearchError('An error occurred while searching. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchQuery(search.query)
    if (search.location) {
      setLocation(search.location)
    }
  }

  const handleCapabilitySelect = (query: string) => {
    setSearchQuery(query)
    setActiveDropdown(null)
  }

  // Capability dropdowns based on our actual data extraction capabilities
  const capabilities = [
    {
      icon: FileText,
      text: "Find Free & Low-Cost Care",
      key: "free-resources",
      options: [
        "Free STI testing and sexual health",
        "Free dental care and cleanings", 
        "Free mammograms and women's health",
        "Free mental health counseling",
        "Free prescription assistance programs",
        "Free eye exams and vision care",
        "Free blood pressure and diabetes screening"
      ]
    },
    {
      icon: Bot,
      text: "Accessible Care Services", 
      key: "essential-care",
      options: [
        "Clinics that don't require Social Security Number",
        "Walk-in clinics accepting new patients",
        "Providers with Spanish-speaking staff",
        "Telehealth services available",
        "Sliding scale payment options",
        "Medicaid enrollment assistance"
      ]
    },
    {
      icon: Shield,
      text: "Insurance & Payment Options",
      key: "insurance",
      options: [
        "Accepts Medicaid patients",
        "Accepts Medicare patients", 
        "Providers for uninsured patients"

      ]
    }
  ]

  // Additional capabilities for "Explore More"
  const additionalCapabilities = [
    {
      icon: Stethoscope,
      text: "Specialty Care Services",
      key: "specialty",
      options: [
        "Cardiology specialists",
        "Limb Loss/Difference Care specialists",
        "Dental Services and oral health",
        "Orthopedic services",
        "Pediatric specialists",
        "Women's health specialists"
      ]
    },
    {
      icon: Users,
      text: "Accessibility Features",
      key: "accessibility",
      options: [
        "Wheelchair accessible facilities",
        "ASL interpretation services",
        "After-hours care availability",
        "Same-day appointments",
        "Extended hours clinics"
      ]
    }
  ]

  const displayedCapabilities = showAllCapabilities 
    ? [...capabilities, ...additionalCapabilities] 
    : capabilities

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" />
      
      <div className="container max-w-6xl mx-auto relative z-10 px-4">
        <div className="text-center space-y-16">
          
          {/* Brand and Logo */}
          <div className="space-y-8 flex flex-col items-center justify-center">
            <Link href="/" className="flex flex-col items-center gap-6 group">
              <div className="flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/logo_560x560.png"
                  alt="SIE Wellness Logo"
                  width={100}
                  height={100}
                  className="rounded-2xl"
                />
              </div>
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  SIE Wellness
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mt-4 font-light">
                  AI-Powered Healthcare Discovery
                </p>
              </div>
            </Link>
          </div>

        {/* Search Error Alert */}
        {searchError && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 max-w-2xl mx-auto rounded-2xl">
            <AlertDescription className="text-sm text-red-700 dark:text-red-400">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Main Search Interface */}
        <div className="w-full max-w-none px-2 sm:px-4 space-y-6">
          {/* Search Bar - Google-like design with full responsiveness */}
          <div className="relative w-full">
            <div className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[3.5rem]">
              {/* Search Input - Takes most space */}
              <div className="flex-1 flex items-center min-w-0">
                <Search className="ml-4 sm:ml-6 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
                <Input
                  placeholder="Search for healthcare services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-base sm:text-lg focus:outline-none focus:ring-0 px-3 sm:px-4 py-4 sm:py-6 placeholder:text-gray-400 min-w-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                
                {/* Search suggestions dropdown */}
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2 h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                      <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] sm:w-[500px] p-0 shadow-xl border-0 rounded-2xl" align="center">
                    <Command className="rounded-2xl">
                      <CommandList>
                        <CommandEmpty>No suggestions found.</CommandEmpty>
                        
                        {/* Recent Searches */}
                        {showRecentSearches && recentSearches.length > 0 && (
                          <CommandGroup heading="Recent Searches">
                            {recentSearches.map((search, index) => (
                              <CommandItem
                                key={`recent-${index}`}
                                onSelect={() => {
                                  handleRecentSearchClick(search)
                                  setIsSearchOpen(false)
                                }}
                                className="cursor-pointer py-3 px-4 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                              >
                                <Clock className="mr-3 h-4 w-4 text-gray-400" />
                                <div className="min-w-0">
                                  <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{search.query}</div>
                                  {search.location && (
                                    <div className="text-xs text-gray-500 truncate">{search.location}</div>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {/* Popular Searches */}
                        <CommandGroup heading="Popular Healthcare Searches">
                          {searchSuggestions.map((suggestion, index) => (
                            <CommandItem
                              key={`suggestion-${index}`}
                              onSelect={() => {
                                setSearchQuery(suggestion)
                                setIsSearchOpen(false)
                              }}
                              className="cursor-pointer py-3 px-4 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            >
                              <Search className="mr-3 h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{suggestion}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Location Input - Compact on mobile */}
              <div className="flex items-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 px-3 sm:px-4 min-w-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full sm:w-32 lg:w-40 border-0 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-0 placeholder:text-gray-400 py-3 sm:py-0 min-w-0"
                />
                <Button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-400" />
                  ) : (
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Search Button - Full width on mobile, compact on desktop */}
              <div className="p-2">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-[#068282] hover:bg-[#0f766e] text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-5xl mx-auto px-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              onClick={() => setSearchQuery("Free STI testing")}
            >
              Free STI Testing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              onClick={() => setSearchQuery("Urgent care near me")}
            >
              Urgent Care
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              onClick={() => setSearchQuery("Mental health services")}
            >
              Mental Health
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              onClick={() => setSearchQuery("Free dental care")}
            >
              Free Dental
            </Button>
          </div>

          {/* Capability Categories */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto transition-all duration-500 px-2`}>
            {displayedCapabilities.map((capability) => {
              const Icon = capability.icon
              return (
                <Popover 
                  key={capability.key} 
                  open={activeDropdown === capability.key} 
                  onOpenChange={(open) => setActiveDropdown(open ? capability.key : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-4 sm:p-6 text-left justify-start hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300 group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
                        <div className="p-2 sm:p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-all duration-300 flex-shrink-0">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#068282] dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#068282] dark:group-hover:text-teal-400 transition-colors duration-300 block leading-tight">
                            {capability.text}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#068282] dark:group-hover:text-teal-400 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] sm:w-80 p-0 shadow-xl border-0 rounded-2xl" align="start">
                    <div className="p-4 sm:p-6">
                      <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#068282] dark:text-teal-400" />
                        <span className="truncate">{capability.text}</span>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        {capability.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleCapabilitySelect(option)}
                            className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-[#068282] dark:hover:text-teal-400 rounded-xl transition-all duration-300"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        </div>

        {/* Explore More */}
        <div className="mt-12 text-center">
          <Button 
            variant="ghost" 
            className="text-gray-600 dark:text-gray-400 hover:text-[#068282] dark:hover:text-teal-400 text-sm transition-all duration-300 rounded-full px-6 py-3"
            onClick={() => setShowAllCapabilities(!showAllCapabilities)}
          >
            {showAllCapabilities ? 'Show Less' : 'Explore More Options'}
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${showAllCapabilities ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        </div>
      </div>
    </section>
  )
}