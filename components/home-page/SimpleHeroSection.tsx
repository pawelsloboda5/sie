"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, ChevronDown, Clock, FileText, Bot, Shield, Users, Stethoscope } from "lucide-react"
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
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)

  // Featured healthcare services from our 400+ categories database
  const featuredServices = [
    "free clinic near me",
    "mental health services", 
    "STD testing center",
    "dental clinic",
    "women's health clinic",
    "family planning center", 
    "community health center",
    "blood donation center",
    "HIV testing center",
    "urgent care center",
    "walk-in clinic",
    "pregnancy care center",
    "addiction treatment center",
    "crisis center support",
    "food bank assistance",
    "homeless shelter",
    "emergency care service",
    "abortion clinic",
    "birth center",
    "cancer treatment center",
    "diabetes center",
    "eye care center",
    "pain management clinic",
    "rehabilitation center",
    "weight loss service"
  ]

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

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % featuredServices.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [featuredServices.length])

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
      // Strip "I want" from the beginning for better search results
      const cleanQuery = searchQuery.replace(/^I want\s+/i, '').trim()
      const searchTerms = cleanQuery || searchQuery

      // Save original search to IndexedDB (with "I want" for history)
      await db.saveRecentSearch(searchQuery, location)

      // Redirect to app page with cleaned search parameters
      const params = new URLSearchParams()
      params.set('q', searchTerms)
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
        <div className="w-full max-w-none px-2 sm:px-4 space-y-8">
          {/* Search Bar - Conversational speech bubble design */}
          <div className="relative w-full">
            <div className="flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Main Search Input - Tall and conversational */}
              <div className="flex flex-col sm:flex-row min-h-[5rem] sm:min-h-[6rem]">
                <div className="flex-1 flex items-start min-w-0 p-6 sm:p-8">
                  <Search className="mt-2 mr-4 h-6 w-6 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <textarea
                      placeholder={`I want ${featuredServices[currentPlaceholder]}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                      className="w-full border-0 bg-transparent text-lg sm:text-xl focus:outline-none focus:ring-0 placeholder:text-gray-400 resize-none overflow-hidden min-h-[3rem] sm:min-h-[4rem] leading-relaxed"
                      rows={2}
                      style={{ 
                        lineHeight: '1.6',
                        fontFamily: 'inherit'
                      }}
                    />
                    
                    {/* Service categories showcase when empty */}
                    {!searchQuery && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Popular searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {featuredServices.slice(0, 8).map((service) => (
                            <button
                              key={service}
                              onClick={() => setSearchQuery(`I want ${service}`)}
                              className="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-600 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-300 px-3 py-1.5 rounded-full transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700"
                            >
                              <div className="w-1 h-1 bg-[#068282] rounded-full opacity-60"></div>
                              {service}
                            </button>
                          ))}
                        </div>
                        <div className="text-center pt-2">
                          <span className="text-xs text-gray-400">400+ healthcare services available</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Search suggestions dropdown */}
                  <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                      >
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`} />
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
                          <CommandGroup heading="Try asking for:">
                            {searchSuggestions.map((suggestion, index) => (
                              <CommandItem
                                key={`suggestion-${index}`}
                                onSelect={() => {
                                  setSearchQuery(`I want ${suggestion.toLowerCase()}`)
                                  setIsSearchOpen(false)
                                }}
                                className="cursor-pointer py-3 px-4 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                              >
                                <Search className="mr-3 h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">I want {suggestion.toLowerCase()}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Bottom section with location and search */}
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Location Input */}
                  <div className="flex-1 flex items-center px-6 sm:px-8 py-4 sm:py-5 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <Input
                      placeholder="Near me or enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 border-0 bg-transparent text-base focus:outline-none focus:ring-0 placeholder:text-gray-400 min-w-0"
                    />
                    <Button
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
                    >
                      {isGettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Search Button */}
                  <div className="p-4 sm:p-5">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-16 bg-[#068282] hover:bg-[#0f766e] text-white rounded-2xl font-semibold text-lg sm:text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin mr-3" />
                          <span className="hidden sm:inline">Finding care...</span>
                          <span className="sm:hidden">Finding...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-6 w-6 mr-3" />
                          <span>Find Care</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons - More focused */}
          <div className="flex items-center justify-center gap-3 flex-wrap max-w-4xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-sm px-4 py-2"
              onClick={() => setSearchQuery("I want free STI testing")}
            >
              Free STI Testing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-sm px-4 py-2"
              onClick={() => setSearchQuery("I want urgent care near me")}
            >
              Urgent Care
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-sm px-4 py-2"
              onClick={() => setSearchQuery("I want mental health services")}
            >
              Mental Health
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 hover:text-teal-900 transition-all duration-300 text-sm px-4 py-2"
              onClick={() => setSearchQuery("I want free dental care")}
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