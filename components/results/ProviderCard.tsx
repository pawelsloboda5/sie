"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
MapPin,
Phone,
Globe,
Mail,
Star,
DollarSign,
Shield,
CreditCard,
Navigation,
Heart,
CheckCircle,
Info,
ExternalLink
} from "lucide-react"
import {
toggleFavoriteProvider,
isProviderFavorited,
type FavoriteProvider
} from "@/lib/voiceAgent"

interface Provider {
_id: string
name: string
category: string
address: string
phone?: string
website?: string
email?: string
rating?: number
accepts_uninsured: boolean
medicaid: boolean
medicare: boolean
ssn_required: boolean
telehealth_available: boolean
insurance_providers: string[]
distance?: number
searchScore?: number
}

interface Service {
_id: string
name: string
category: string
description: string
is_free: boolean
is_discounted: boolean
price_info: string
}

interface ProviderCardProps {
provider: Provider
services?: Service[]
topService?: Service | null
onGetDirections?: (provider: Provider) => void
onCallProvider?: (provider: Provider) => void
onVisitWebsite?: (provider: Provider) => void
onViewDetails?: (provider: Provider) => void
onScheduleWithAI?: (provider: Provider) => void
onFavoriteToggle?: (provider: Provider, isFavorited: boolean) => void
showDistance?: boolean
compact?: boolean
}

export function ProviderCard({
provider,
services = [],
topService = null,
onGetDirections,
onCallProvider,
onVisitWebsite,
onViewDetails,
onScheduleWithAI,
onFavoriteToggle,
showDistance = true,
compact = false
}: ProviderCardProps) {
const [isDesktop, setIsDesktop] = useState(false)
const [isFavorited, setIsFavorited] = useState(false)

useEffect(() => {
const check = () => setIsDesktop(window.innerWidth >= 1024)
check()
window.addEventListener("resize", check)
return () => window.removeEventListener("resize", check)
}, [])

useEffect(() => {
setIsFavorited(isProviderFavorited(provider._id))
}, [provider._id])

const handleFavoriteToggle = () => {
const favoriteProvider: FavoriteProvider = {
_id: provider._id,
name: provider.name,
address: provider.address,
phone: provider.phone,
category: provider.category,
savedAt: new Date(),
filters: {
freeServicesOnly: false,
acceptsMedicaid: provider.medicaid,
acceptsMedicare: provider.medicare,
acceptsUninsured: provider.accepts_uninsured,
noSSNRequired: !provider.ssn_required,
telehealthAvailable: provider.telehealth_available
}
}
const next = toggleFavoriteProvider(favoriteProvider)
setIsFavorited(next)
onFavoriteToggle?.(provider, next)
}

const dist = provider.distance != null
? provider.distance < 1
? `${(provider.distance * 5280).toFixed(0)} ft`
: `${provider.distance.toFixed(1)} mi`
: undefined

const freeCount = services.filter(s => s.is_free).length
const discCount = services.filter(s => s.is_discounted && !s.is_free).length

const renderStars = (rating?: number | null) => {
const r = rating || 0
return Array.from({ length: 5 }).map((_, i) => (
<Star
key={i}
className={`h-4 w-4 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
/>
))
}

const badges = () => {
const arr: React.ReactElement[] = []
if (provider.accepts_uninsured) {
arr.push(
<Badge key="uninsured" className="bg-indigo-600 text-white border-0">Uninsured</Badge>
)
}
if (!provider.ssn_required) {
arr.push(<Badge key="ssn" className="bg-violet-600 text-white border-0">No SSN</Badge>)
}
if (provider.telehealth_available) {
arr.push(<Badge key="tele" className="bg-sky-600 text-white border-0">Telehealth</Badge>)
}
if (provider.medicaid) {
arr.push(<Badge key="medicaid" className="bg-emerald-600 text-white border-0">Medicaid</Badge>)
}
if (provider.medicare) {
arr.push(<Badge key="medicare" className="bg-emerald-600 text-white border-0">Medicare</Badge>)
}
return arr
}

// LIST VIEW (compact): ultra-minimal, clean
if (compact) {
return (
<div className="w-full rounded-2xl border border-gray-200 bg-white/90 hover:bg-white shadow-sm hover:shadow-md transition-all p-4">
<div className="flex flex-col lg:flex-row lg:items-start lg:gap-6 gap-3">
{/* Left: Identity */}
<div className="flex-1 min-w-0">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<div className="flex items-center gap-2 mb-1">
<Badge variant="outline" className="text-xs">{provider.category}</Badge>
{showDistance && dist && (
<Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
<MapPin className="h-3 w-3 mr-1" />
{dist}
</Badge>
)}
</div>
<h3 className="font-semibold text-lg leading-snug truncate">{provider.name}</h3>
<div className="flex items-center gap-1 mt-1">
{renderStars(provider.rating)}
<span className="text-sm font-medium ml-1">{(provider.rating || 0).toFixed(1)}</span>
</div>
<div className="flex items-start gap-2 mt-2 text-sm text-gray-700">
<MapPin className="h-4 w-4 mt-0.5 text-emerald-600" />
<span className="line-clamp-1">{provider.address}</span>
</div>
{topService && (
<div className={`mt-3 rounded-xl border p-3 ${topService.is_free ? "bg-emerald-50 border-emerald-200" : topService.is_discounted ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
<div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-gray-600">
<Heart className="h-3 w-3 text-emerald-700" />
Featured
{topService.is_free && <Badge className="bg-emerald-600 text-white px-2 py-0.5">FREE</Badge>}
{topService.is_discounted && !topService.is_free && <Badge className="bg-orange-600 text-white px-2 py-0.5">DISCOUNT</Badge>}
</div>
<div className="mt-1 text-sm font-medium">{topService.name}</div>
{topService.description && <div className="text-xs text-gray-600 line-clamp-2">{topService.description}</div>}
</div>
)}
</div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className="h-12 w-12 rounded-full"
              aria-label="Toggle favorite"
            >
              <Heart className={`h-6 w-6 ${isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Meta and actions */}
      <div className="lg:w-[360px] flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">{badges()}</div>

        {services.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center border rounded-lg p-2">
            <Stat label="Total" value={services.length} color="text-gray-900" />
            <Stat label="Free" value={freeCount} color="text-emerald-600" />
            <Stat label="Discounted" value={discCount} color="text-orange-600" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {provider.phone && (
            <Button className="h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onCallProvider?.(provider)}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          <Button className="h-10 rounded-lg" variant="outline" onClick={() => onGetDirections?.(provider)}>
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          <Button className="h-10 rounded-lg" variant="ghost" onClick={() => onViewDetails?.(provider)}>
            <Info className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>

        {onScheduleWithAI && (
          <Button className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95" onClick={() => onScheduleWithAI(provider)}>
            <Phone className="h-4 w-4 mr-2" />
            Schedule with AI
          </Button>
        )}

        {provider.website && (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onVisitWebsite?.(provider)}
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  </div>
)
}

// CARD VIEW: compact, modern, airy
return (
<Card className="w-full border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
<CardContent className="p-5">
{/* Header */}
<div className="flex items-start justify-between gap-4">
<div className="min-w-0">
<div className="flex items-center gap-2 mb-1">
<Badge variant="outline" className="text-xs">{provider.category}</Badge>
{showDistance && dist && (
<Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
<MapPin className="h-3 w-3 mr-1" />
{dist}
</Badge>
)}
</div>
<h3 className="text-xl font-semibold leading-tight break-words">{provider.name}</h3>
<div className="flex items-center gap-1 mt-1">
{renderStars(provider.rating)}
<span className="text-sm font-medium ml-1">{(provider.rating || 0).toFixed(1)} rating</span>
</div>
</div>
<div className="flex flex-col items-end gap-2">
<Button variant="ghost" size="icon" onClick={handleFavoriteToggle} className="h-12 w-12 rounded-full" aria-label="Toggle favorite" >
<Heart className={`h-6 w-6 ${isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
</Button>
<Button variant="outline" size="sm" onClick={() => onViewDetails?.(provider)} className="rounded-lg h-8 px-3">
<Info className="h-4 w-4 mr-1" />
Details
</Button>
</div>
</div>
    {/* Address */}
    <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
      <MapPin className="h-4 w-4 mt-0.5 text-emerald-600" />
      <span className="break-words">{provider.address}</span>
    </div>

    {/* Badges */}
    <div className="mt-3 flex flex-wrap gap-2">{badges()}</div>

    {/* Featured service */}
    {topService && (
      <div className={`mt-4 rounded-xl border p-4 ${topService.is_free ? "bg-emerald-50 border-emerald-200" : topService.is_discounted ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-gray-600">
          <Heart className="h-3 w-3 text-emerald-700" />
          Featured Service
          {topService.is_free && <Badge className="bg-emerald-600 text-white px-2 py-0.5">FREE</Badge>}
          {topService.is_discounted && !topService.is_free && <Badge className="bg-orange-600 text-white px-2 py-0.5">DISCOUNT</Badge>}
        </div>
        <div className="mt-1 text-sm font-medium">{topService.name}</div>
        <div className="text-xs text-gray-600">{topService.category}</div>
        {topService.description && <div className="text-sm text-gray-700 mt-1">{topService.description}</div>}
      </div>
    )}

    {/* Services summary */}
    {services.length > 0 && (
      <div className="mt-4 grid grid-cols-3 gap-3 text-center rounded-xl border p-3">
        <Stat label="Total" value={services.length} color="text-gray-900" />
        <Stat label="Free" value={freeCount} color="text-emerald-600" />
        <Stat label="Discounted" value={discCount} color="text-orange-600" />
      </div>
    )}

    {/* Insurance */}
    {provider.insurance_providers.length > 0 && (
      <div className="mt-4">
        <div className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
          Insurance Accepted
        </div>
        <div className="flex flex-wrap gap-2">
          {provider.insurance_providers.slice(0, 6).map((insurance) => (
            <Badge key={insurance} variant="outline" className="text-xs">
              {insurance}
            </Badge>
          ))}
          {provider.insurance_providers.length > 6 && (
            <Badge variant="outline" className="text-xs">+{provider.insurance_providers.length - 6} more</Badge>
          )}
        </div>
      </div>
    )}

    <Separator className="my-4" />

    {/* Actions */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {provider.phone && (
        <Button className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onCallProvider?.(provider)}>
          <Phone className="h-4 w-4 mr-2" />
          Call Now
        </Button>
      )}
      <Button className="h-11 rounded-xl" variant="outline" onClick={() => onGetDirections?.(provider)}>
        <Navigation className="h-4 w-4 mr-2" />
        Get Directions
      </Button>
    </div>

    {onScheduleWithAI && (
      <Button
        className="mt-3 w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95"
        onClick={() => onScheduleWithAI(provider)}
      >
        <Phone className="h-4 w-4 mr-2" />
        Schedule with AI Voice Agent
      </Button>
    )}

    <div className="mt-3 flex gap-3">
      {provider.website && (
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onVisitWebsite?.(provider)}
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {provider.email && (
        <button
          onClick={() => window.open(`mailto:${provider.email}`, "_self")}
          className="text-sm text-gray-700 hover:underline inline-flex items-center gap-1"
        >
          <Mail className="h-4 w-4" /> Email
        </button>
      )}
    </div>
  </CardContent>
</Card>
)
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
return (
<div>
<div className={`text-xl font-bold ${color}`}>{value}</div>
<div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
</div>
)
}