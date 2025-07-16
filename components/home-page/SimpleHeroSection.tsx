"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, ChevronDown, Clock } from "lucide-react"
import type { RecentSearch } from "@/lib/db"
import * as db from "@/lib/db"

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

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Find Free & Low-Cost Healthcare Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Discover accessible healthcare services in your area, regardless of insurance status. 
            Search by service, condition, or location to find the care you need.
          </p>
        </div>

        {/* Search Error Alert */}
        {searchError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5 max-w-2xl mx-auto">
            <AlertDescription className="text-sm">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Main Search Interface */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search for services (e.g., 'free STI testing', 'urgent care')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-4 text-lg h-14 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {/* Search Suggestions Dropdown */}
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
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

            {/* Location Input */}
            <div className="lg:col-span-4 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 pr-16 py-4 text-lg h-14 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 hover:bg-muted"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isGettingLocation ? "Getting location..." : "Use my location"}
                </span>
              </Button>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all"
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
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}