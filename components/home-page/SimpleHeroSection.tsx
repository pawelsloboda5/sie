"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, ChevronDown, Clock, FileText, Bot, Shield, Users, ArrowRight, Calculator, User, Stethoscope, HeartHandshake } from "lucide-react"
import type { RecentSearch } from "@/lib/db"
import * as db from "@/lib/db"
import Link from "next/link"

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
          (position) => {
            setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
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
      text: "Find Free Healthcare Resources",
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
      text: "Ask for Quick Facts", 
      key: "quick-facts",
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
      text: "Verify Insurance Coverage",
      key: "insurance",
      options: [
        "Accepts Medicaid patients",
        "Accepts Medicare patients", 
        "Providers for uninsured patients",
        "Community health center coverage",
        "Charity care programs available"
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
        "Dermatology clinics",
        "Orthopedic services",
        "Pediatric specialists",
        "Women's health specialists"
      ]
    },
    {
      icon: HeartHandshake,
      text: "Community Programs",
      key: "community",
      options: [
        "WIC enrollment assistance",
        "SNAP benefits help",
        "Food bank locations",
        "Patient navigator services",
        "Transportation assistance"
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
    <section className="relative flex flex-col items-center justify-center min-h-[50vh] px-4 py-8 bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Logo and Company Name */}
      <div className="flex flex-col items-center mb-16">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-primary/90">
            <span className="text-primary-foreground text-xl font-bold">♥</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">SIE Wellness</h1>
          </div>
        </Link>
      </div>

      {/* Search Error Alert */}
      {searchError && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/5 max-w-2xl mx-auto">
          <AlertDescription className="text-sm">{searchError}</AlertDescription>
        </Alert>
      )}

      {/* Main Search Interface */}
      <div className="w-full max-w-4xl">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex items-center bg-background/80 backdrop-blur border rounded-full shadow-xl hover:shadow-2xl transition-shadow">
            {/* Search Input with dropdown trigger */}
            <div className="flex-1 relative">
              <div className="flex items-center">
                <Search className="ml-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Ask a healthcare question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-base rounded-l-full focus:ring-0 focus:border-0 pl-3 pr-2 py-4 h-14"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2 h-8 w-8 p-0 hover:bg-muted/50 rounded-full flex-shrink-0"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0" align="start">
                    <Command>
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
                                className="cursor-pointer"
                              >
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div>{search.query}</div>
                                  {search.location && (
                                    <div className="text-xs text-muted-foreground">{search.location}</div>
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
                              className="cursor-pointer"
                            >
                              <Search className="mr-2 h-4 w-4" />
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Location Input */}
            <div className="flex-1 relative border-l border-border/50">
              <div className="flex items-center">
                <MapPin className="ml-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="ZIP code, city, or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 border-0 bg-transparent rounded-none focus:ring-0 focus:border-0 pl-3 pr-2 py-4 h-14"
                />
                <Button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  variant="ghost"
                  size="sm"
                  className="mr-2 h-8 w-8 p-0 hover:bg-muted/50 rounded-full flex-shrink-0"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Search Button */}
            <Button 
              size="lg" 
              className="px-8 py-4 h-14 font-semibold rounded-r-full bg-primary hover:bg-primary/90 transition-all flex-shrink-0"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Minimalistic Capability Buttons */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-w-4xl mx-auto transition-all duration-300 ${showAllCapabilities ? 'grid-cols-2 md:grid-cols-3' : ''}`}>
          {displayedCapabilities.map((capability, index) => {
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
                    className="h-auto p-3 text-left justify-start hover:bg-muted/50 transition-colors group relative text-wrap"
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {capability.text}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-2">
                    <div className="text-sm font-medium text-foreground mb-2 px-2 py-1">
                      {capability.text}
                    </div>
                    <div className="space-y-1">
                      {capability.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleCapabilitySelect(option)}
                          className="w-full text-left px-2 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded transition-colors"
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
      <div className="mt-8">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground text-sm"
          onClick={() => setShowAllCapabilities(!showAllCapabilities)}
        >
          {showAllCapabilities ? 'Show Less' : 'Explore More Capabilities'}
          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAllCapabilities ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </section>
  )
}