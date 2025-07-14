"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, MapPin, Clock, DollarSign, Shield, Phone, Stethoscope } from "lucide-react"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Quick filter options
  const quickFilters = [
    { id: "free", label: "Free Services", icon: DollarSign, color: "bg-green-100 text-green-800 hover:bg-green-200" },
    { id: "uninsured", label: "Accepts Uninsured", icon: Shield, color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    { id: "urgent", label: "Urgent Care", icon: Clock, color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
    { id: "telehealth", label: "Telehealth", icon: Phone, color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
    { id: "clinic", label: "Community Health", icon: Stethoscope, color: "bg-teal-100 text-teal-800 hover:bg-teal-200" },
  ]

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Sample search suggestions
  const searchSuggestions = [
    "Free STI testing",
    "Urgent care near me",
    "Dental clinic uninsured",
    "Mental health services",
    "Pregnancy testing",
    "Diabetes management",
    "Blood pressure check",
    "Vaccination clinic"
  ]

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
          }
        )
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      setIsGettingLocation(false)
    }
  }

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Free & Low-Cost Healthcare Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover accessible healthcare services in your area, regardless of insurance status. 
            Search by service, condition, or location to find the care you need.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for services (e.g., 'free STI testing', 'urgent care', 'dental clinic')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg h-14 bg-background border-2 border-border focus:border-primary"
                    onFocus={() => setIsSearchOpen(true)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>No suggestions found.</CommandEmpty>
                    <CommandGroup heading="Popular Searches">
                      {searchSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => {
                            setSearchQuery(suggestion)
                            setIsSearchOpen(false)
                          }}
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
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your location (city, state, or zip code)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 bg-background border-2 border-border focus:border-primary"
              />
            </div>
            <Button
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="px-4 h-12 border-2"
            >
              {isGettingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">
                {isGettingLocation ? "Getting..." : "Use My Location"}
              </span>
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">Quick Filters:</p>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              const isSelected = selectedFilters.includes(filter.id)
              return (
                <Badge
                  key={filter.id}
                  variant={isSelected ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-200 px-3 py-2 text-sm ${
                    isSelected 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : filter.color
                  }`}
                  onClick={() => toggleFilter(filter.id)}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {filter.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Search Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg h-14 bg-primary hover:bg-primary/90"
            onClick={() => {
              // TODO: Implement search functionality
              console.log("Search:", { searchQuery, location, selectedFilters })
            }}
          >
            <Search className="mr-2 h-5 w-5" />
            Find Healthcare Services
          </Button>
        </div>

        {/* Selected Filters Display */}
        {selectedFilters.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedFilters.map((filterId) => {
                const filter = quickFilters.find(f => f.id === filterId)
                if (!filter) return null
                const Icon = filter.icon
                return (
                  <Badge
                    key={filterId}
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {filter.label}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 