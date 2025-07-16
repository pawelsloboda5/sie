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
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Search Error Alert */}
        {searchError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5 max-w-2xl mx-auto">
            <AlertDescription className="text-sm">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Main Search Interface */}
        <div className="max-w-2xl mx-auto">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-background/80 backdrop-blur border rounded-xl shadow-lg">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search for care: 'free dental', 'mental health', 'urgent care'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8 py-3 h-12 border-0 bg-transparent text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {/* Search Suggestions Dropdown */}
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted/50 transition-colors"
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
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location: ZIP code, city, or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 pr-12 py-3 h-12 border-0 bg-transparent"
              />
              <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
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
            <Button 
              size="lg" 
              className="px-8 py-3 h-12 font-semibold shrink-0 bg-primary hover:bg-primary/90 transition-all"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Care
                </>
              )}
            </Button>
          </div>
          
          {/* Privacy Note */}
          <p className="text-sm text-muted-foreground mt-2 text-center">
            🔒 Completely private • 🆓 Always free • 🌍 No account required
          </p>
        </div>
      </div>
    </section>
  )
}