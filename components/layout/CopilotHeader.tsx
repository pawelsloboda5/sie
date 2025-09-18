"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Settings, X, MapPin, RotateCcw, Menu, Home, Search, HelpCircle, Bot } from "lucide-react"
import { useRouter } from "next/navigation"

export function CopilotHeader() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationDisplay, setLocationDisplay] = useState<string | null>(null)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem('sie:copilot:location')
      if (raw) {
        const loc = JSON.parse(raw) as { display?: string; city?: string; state?: string }
        const disp = loc.display || (loc.city ? `${loc.city}${loc.state ? ", " + loc.state : ''}` : '')
        setLocationDisplay(disp || null)
        setLocationInput(disp || '')
      } else {
        setLocationDisplay(null)
        setLocationInput('')
      }
    } catch {
      setLocationDisplay(null)
      setLocationInput('')
    }
  }, [open])

  useEffect(() => { setMounted(true) }, [])

  const saveLocation = (location: { latitude: number; longitude: number; city?: string; state?: string; display?: string }) => {
    try { window.localStorage.setItem('sie:copilot:location', JSON.stringify(location)) } catch {}
    const disp = location.display || (location.city ? `${location.city}${location.state ? ", " + location.state : ''}` : '')
    setLocationDisplay(disp || null)
  }

  const handleLocationSubmit = async () => {
    const input = (locationInput || '').trim()
    if (!input) return
    setIsGettingLocation(true)
    try {
      const res = await fetch(`/api/geo/forward?q=${encodeURIComponent(input)}&country=us`)
      const data = await res.json()
      if (data && data.ok && data.latitude && data.longitude) {
        saveLocation({ latitude: data.latitude, longitude: data.longitude, city: data.city, state: data.state, display: input })
        setShowLocationForm(false)
      } else {
        alert('Could not find that location. Please try again.')
      }
    } catch {
      alert('Error finding location. Please try again.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleAutoLocation = async () => {
    setIsGettingLocation(true)
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser')
        return
      }
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const display = data.display || `${data.city || 'Unknown'}, ${data.state || 'Unknown'}`
          saveLocation({ latitude, longitude, city: data.city, state: data.state, display })
          setLocationInput(display || '')
          setShowLocationForm(false)
        } catch {
          saveLocation({ latitude, longitude, display: 'Current Location' })
          setLocationInput('Current Location')
          setShowLocationForm(false)
        } finally {
          setIsGettingLocation(false)
        }
      }, () => {
        alert('Unable to get your location. Please enter city and state manually.')
        setIsGettingLocation(false)
      }, { timeout: 10000 })
    } catch {
      setIsGettingLocation(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-[#068282]/15 via-[#068282]/8 to-transparent backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Chat settings"
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all"
          >
            <Settings className="h-5 w-5 text-[#068282] dark:text-teal-400" />
          </button>
          <span className="text-lg font-semibold text-[#068282] dark:text-teal-400">SieAI</span>
        </div>
        
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          <Menu className="h-5 w-5 text-[#068282] dark:text-teal-400" />
        </button>
      </div>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-5/6 max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-0">
            <div className="h-full w-full p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Chat settings</div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Your Location</span>
                </div>
              {!showLocationForm && (
                <>
                  <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">{locationDisplay || 'Not set'}</div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setShowLocationForm(true)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#068282] to-emerald-600 text-white text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all"
                    >
                      Change location
                    </button>
                    <button
                      onClick={() => {
                        try {
                          localStorage.removeItem('sie:copilot:conversation')
                          localStorage.removeItem('sie:copilot:state')
                          localStorage.removeItem('sie:copilot:providers')
                        } catch {}
                        window.location.href = '/copilot'
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset conversation
                    </button>
                  </div>
                </>
              )}

              {showLocationForm && (
                <div className="mt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Enter city, state or use auto detect</div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleLocationSubmit() }}
                      placeholder="San Francisco, CA"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#068282]/30 focus:border-[#068282]/50 transition-all"
                      disabled={isGettingLocation}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleLocationSubmit}
                        disabled={!locationInput.trim() || isGettingLocation}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#068282] to-emerald-600 text-white text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Set Location
                      </button>
                      <button
                        onClick={handleAutoLocation}
                        disabled={isGettingLocation}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isGettingLocation ? 'Getting…' : 'Auto Detect'}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowLocationForm(false)}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </aside>
        </div>, document.body
      )}
      
      {mounted && menuOpen && createPortal(
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-5/6 max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-0">
            <div className="h-full w-full p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-semibold bg-gradient-to-r from-[#068282] to-emerald-600 bg-clip-text text-transparent">Navigation</div>
                <button onClick={() => setMenuOpen(false)} aria-label="Close" className="p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => { router.push('/'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <Home className="h-5 w-5 text-[#068282]" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  onClick={() => { router.push('/copilot'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#068282]/10 to-emerald-600/10 border border-teal-200/50 dark:border-teal-900/40 hover:from-[#068282]/20 hover:to-emerald-600/20 transition-all"
                >
                  <Bot className="h-5 w-5 text-[#068282]" />
                  <span className="font-medium">SieAI Copilot</span>
                </button>
                <button
                  onClick={() => { router.push('/providers'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <Search className="h-5 w-5 text-[#068282]" />
                  <span className="font-medium">Search</span>
                </button>
                <button
                  onClick={() => { router.push('/resources/faq'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <HelpCircle className="h-5 w-5 text-[#068282]" />
                  <span className="font-medium">FAQ</span>
                </button>
              </nav>
            </div>
          </aside>
        </div>, document.body
      )}
    </header>
  )
}


