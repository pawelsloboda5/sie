"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
Search,
MapPin,
Loader2,
ChevronDown,
Clock,
FileText,
Bot,
Shield,
Users,
Stethoscope
} from "lucide-react"
import type { RecentSearch } from "@/lib/db"
import * as db from "@/lib/db"
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

const featuredServices = [
"free clinic near me",
"mental health services",
"STD testing center",
"dental clinic",
"women's health clinic",
"family planning center",
"community health center",
"blood donation center",
"urgent care center",
"pregnancy care center",
"addiction treatment",
"diabetes screening",
"vision exam",
"low-cost prescriptions"
]

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

useEffect(() => {
const id = setInterval(() => {
setCurrentPlaceholder((p) => (p + 1) % featuredServices.length)
}, 3200)
return () => clearInterval(id)
}, [featuredServices.length])

useEffect(() => {
if (showRecentSearches) {
db.getRecentSearches(6).then(setRecentSearches).catch(console.error)
}
}, [showRecentSearches])

const handleGetLocation = async () => {
setIsGettingLocation(true)
setSearchError(null)
try {
if ("geolocation" in navigator) {
navigator.geolocation.getCurrentPosition(
async (pos) => {
const { latitude, longitude } = pos.coords
const address = await reverseGeocode(latitude, longitude)
setLocation(address)
setIsGettingLocation(false)
},
() => {
setIsGettingLocation(false)
setSearchError("Unable to get your location. Please enter it manually.")
}
)
} else {
setIsGettingLocation(false)
setSearchError("Geolocation is not supported by this browser.")
}
} catch {
setIsGettingLocation(false)
setSearchError("Error accessing location services.")
}
}

const handleSearch = async () => {
if (!searchQuery.trim()) {
setSearchError("Please enter what you’re looking for")
return
}
if (isSearching) return
setIsSearching(true)
setSearchError(null)
try {
  const cleanQuery = searchQuery.replace(/^I want\s+/i, "").trim()
  const terms = cleanQuery || searchQuery

  await db.saveRecentSearch(searchQuery, location)

  const params = new URLSearchParams()
  params.set("q", terms)
  if (location) params.set("location", location)
  router.push(`/app?${params.toString()}`)
} catch (e) {
  console.error(e)
  setSearchError("Something went wrong. Please try again.")
} finally {
  setIsSearching(false)
}
}

const handleRecentSearchClick = (s: RecentSearch) => {
setSearchQuery(s.query)
if (s.location) setLocation(s.location)
setIsSearchOpen(false)
}

const handleCapabilitySelect = (query: string) => {
setSearchQuery(query)
setActiveDropdown(null)
}

const capabilities = [
{
icon: FileText,
text: "Find Free & Low‑Cost Care",
key: "free-resources",
subtext: "No‑cost healthcare services and screenings",
options: [
"Free STI testing and sexual health",
"Free dental care and cleanings",
"Free mammograms and women's health",
"Free mental health counseling",
"Free prescription assistance",
"Free eye exams and vision care"
]
},
{
icon: Bot,
text: "Accessible Care Services",
key: "essential-care",
subtext: "Barrier‑free care for everyone",
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
subtext: "Coverage‑based care matching",
options: ["Accepts Medicaid patients", "Accepts Medicare patients", "Providers for uninsured patients"]
}
]

const additionalCapabilities = [
{
icon: Stethoscope,
text: "Specialty Care Services",
key: "specialty",
subtext: "Expert care for specific conditions",
options: ["Cardiology specialists", "Orthopedic services", "Pediatric specialists", "Women's health specialists"]
},
{
icon: Users,
text: "Accessibility Features",
key: "accessibility",
subtext: "Inclusive care environments",
options: [
"Wheelchair accessible facilities",
"ASL interpretation services",
"Same‑day appointments",
"After‑hours care availability"
]
}
]

const displayedCapabilities = showAllCapabilities ? [...capabilities, ...additionalCapabilities] : capabilities

return (
<section className="relative bg-brand-radials">
<div className="container min-h-[82vh] flex flex-col items-center justify-center py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
{/* Brand */}
<div className="text-center mb-8">
<Link href="/" className="inline-flex items-center gap-4">
<Image src="/logo_560x560.png" alt="SIE Wellness Logo" width={96} height={96} className="rounded-xl" />
<div className="text-left hidden sm:block">
<h1 className="text-display-md">SIE Wellness</h1>
</div>
</Link>
</div>
    {/* Error */}
    {searchError && (
      <Alert className="mb-4 w-full max-w-5xl rounded-xl border-red-200 bg-red-50">
        <AlertDescription className="text-sm text-red-700">{searchError}</AlertDescription>
      </Alert>
    )}

    {/* Search shell */}
    <div className="w-full max-w-6xl">
      <div className="glass rounded-2xl card-shadow-lg hover:card-shadow-xl transition-medium overflow-hidden">
        {/* Query row */}
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <Search className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <textarea
              aria-label="What care do you need?"
              placeholder={`I want ${featuredServices[currentPlaceholder]}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              rows={2}
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-lg sm:text-xl leading-relaxed resize-none"
            />
            {!searchQuery && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">Popular searches</div>
                <div className="flex flex-wrap gap-2">
                  {featuredServices.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchQuery(`I want ${s}`)}
                      className="rounded-full px-3 py-1.5 text-xs border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 transition-smooth"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 rounded-full hover:bg-gray-100 h-9 w-9"
                aria-label="Show suggestions"
              >
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isSearchOpen ? "rotate-180" : ""}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[92vw] sm:w-[520px] p-0 rounded-xl border-0 card-shadow-lg">
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions</CommandEmpty>
                  {showRecentSearches && recentSearches.length > 0 && (
                    <CommandGroup heading="Recent">
                      {recentSearches.map((r, i) => (
                        <CommandItem key={`r-${i}`} onSelect={() => handleRecentSearchClick(r)} className="py-3">
                          <Clock className="mr-3 h-4 w-4 text-gray-400" />
                          <div className="min-w-0">
                            <div className="text-sm text-foreground truncate">{r.query}</div>
                            {r.location && <div className="text-xs text-muted-foreground truncate">{r.location}</div>}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Try asking">
                    {searchSuggestions.map((s, i) => (
                      <CommandItem
                        key={`s-${i}`}
                        onSelect={() => {
                          setSearchQuery(`I want ${s.toLowerCase()}`)
                          setIsSearchOpen(false)
                        }}
                        className="py-3"
                      >
                        <Search className="mr-3 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-foreground truncate">I want {s.toLowerCase()}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Location + CTA */}
        <div className="flex flex-col sm:flex-row items-stretch">
          <div className="flex-1 flex items-center gap-3 px-5 sm:px-6 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <Input
              placeholder="Near me or enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-0"
            />
            <Button
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              aria-label="Use my location"
            >
              {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <MapPin className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>

          <div className="p-5 sm:p-6">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-16 rounded-xl font-semibold text-base sm:text-lg text-white bg-gradient-to-r from-violet-700 to-blue-600 hover:from-violet-800 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  Finding care...
                </>
              ) : (
                <>
                  <Search className="h-6 w-6 mr-3" />
                  Find Care
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Quick chips */}
    <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
      {["Free STI Testing", "Urgent Care", "Mental Health", "Free Dental"].map((chip) => (
        <Button
          key={chip}
          variant="outline"
          size="sm"
          className="rounded-full border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
          onClick={() => setSearchQuery(`I want ${chip.toLowerCase()}`)}
        >
          {chip}
        </Button>
      ))}
    </div>

    {/* Capabilities */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
      {displayedCapabilities.map((cap) => {
        const Icon = cap.icon
        const open = activeDropdown === cap.key
        return (
          <Popover key={cap.key} open={open} onOpenChange={(o) => setActiveDropdown(o ? cap.key : null)}>
            <PopoverTrigger asChild>
              <button
                className="text-left rounded-2xl glass p-5 hover-border-primary hover:shadow-md transition-medium"
                aria-expanded={open}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{cap.text}</div>
                    <div className="text-xs text-muted-foreground">{cap.subtext}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[92vw] sm:w-[420px] p-0 rounded-xl border-0 card-shadow-lg" align="start">
              <div className="p-3">
                {cap.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleCapabilitySelect(opt)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm transition-smooth"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )
      })}
    </div>

    {/* Explore more */}
    <div className="mt-6">
      <Button
        variant="ghost"
        className="rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => setShowAllCapabilities((v) => !v)}
      >
        {showAllCapabilities ? "Show Less" : "Explore More Options"}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAllCapabilities ? "rotate-180" : ""}`} />
      </Button>
    </div>
  </div>
</section>
)
}