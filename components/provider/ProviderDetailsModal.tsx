"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
AlertCircle,
Info,
X
} from "lucide-react"

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

interface ProviderDetailsModalProps {
provider: Provider | null
services: Service[]
isOpen: boolean
onClose: () => void
onGetDirections?: (provider: Provider) => void
onCallProvider?: (provider: Provider) => void
onVisitWebsite?: (provider: Provider) => void
showDistance?: boolean
}

export function ProviderDetailsModal({
provider,
services,
isOpen,
onClose,
onGetDirections,
onCallProvider,
onVisitWebsite,
showDistance = true
}: ProviderDetailsModalProps) {
if (!provider) return null

const renderStars = (rating: number | null | undefined) => {
const r = rating || 0
return Array.from({ length: 5 }).map((_, i) => (
<Star
key={i}
className={`h-4 w-4 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
/>
))
}

const formatDistance = (distance: number) => {
if (distance < 1) return `${(distance * 5280).toFixed(0)} ft`
return `${distance.toFixed(1)} mi`
}

const freeServices = services.filter(s => s.is_free)
const discountedServices = services.filter(s => s.is_discounted && !s.is_free)
const regularServices = services.filter(s => !s.is_free && !s.is_discounted)

const handleAction = (action: "call" | "directions" | "website") => {
if (action === "call") onCallProvider?.(provider)
if (action === "directions") onGetDirections?.(provider)
if (action === "website") onVisitWebsite?.(provider)
}

return (
<Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] p-0 overflow-hidden border-0 bg-white/90 backdrop-blur rounded-2xl">
{/* Header */}
<DialogHeader className="px-5 sm:px-7 pt-6 pb-4 border-b bg-gradient-to-b from-white/70 to-white/30">
<div className="flex items-start justify-between gap-4">
<div className="min-w-0">
<DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 truncate">
{provider.name}
</DialogTitle>
<DialogDescription className="mt-1 text-gray-600">
{provider.category}
</DialogDescription>
<div className="mt-2 flex items-center gap-2">
<div className="flex items-center gap-0.5">{renderStars(provider.rating)}</div>
<span className="text-sm text-gray-600 font-medium">
{(provider.rating || 0).toFixed(1)}
</span>
{showDistance && provider.distance != null && (
<>
<span className="text-gray-300">•</span>
<Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
<MapPin className="h-3.5 w-3.5 mr-1" />
{formatDistance(provider.distance)}
</Badge>
</>
)}
</div>
</div>
</div>
</DialogHeader>
    {/* Scrollable body */}
    <ScrollArea className="max-h-[calc(92vh-160px)]">
      <div className="px-5 sm:px-7 py-6 space-y-8">
        {/* Contact and quick info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardRow
            icon={<MapPin className="h-5 w-5 text-emerald-600" />}
            title="Address"
            content={<span className="text-sm text-gray-700 break-words">{provider.address}</span>}
          />
          {provider.phone && (
            <CardRow
              icon={<Phone className="h-5 w-5 text-emerald-600" />}
              title="Phone"
              content={
                <a href={`tel:${provider.phone}`} className="text-sm font-medium text-emerald-700 hover:underline">
                  {provider.phone}
                </a>
              }
            />
          )}
          {provider.website && (
            <CardRow
              icon={<Globe className="h-5 w-5 text-emerald-600" />}
              title="Website"
              content={
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-700 hover:underline break-all"
                >
                  {provider.website.replace(/^https?:\/\//, "")}
                </a>
              }
            />
          )}
          {provider.email && (
            <CardRow
              icon={<Mail className="h-5 w-5 text-emerald-600" />}
              title="Email"
              content={
                <a href={`mailto:${provider.email}`} className="text-sm font-medium text-emerald-700 hover:underline break-all">
                  {provider.email}
                </a>
              }
            />
          )}
        </section>

        <Separator />

        {/* Accessibility */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Accessibility & Requirements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Pill
              ok={provider.accepts_uninsured}
              okLabel="Accepts Uninsured"
              noLabel="Requires Insurance"
            />
            <Pill ok={provider.medicaid} okLabel="Accepts Medicaid" noLabel="No Medicaid" />
            <Pill ok={provider.medicare} okLabel="Accepts Medicare" noLabel="No Medicare" />
            <Pill
              ok={!provider.ssn_required}
              okLabel="No SSN Required"
              noLabel="SSN Required"
              warn={!provider.ssn_required ? false : true}
            />
          </div>

          {provider.telehealth_available && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <CheckCircle className="h-4 w-4" />
              Telehealth available
            </div>
          )}
        </section>

        {/* Insurance */}
        {provider.insurance_providers.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Insurance Accepted
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.insurance_providers.map((ins) => (
                  <Badge key={ins} variant="outline" className="rounded-full text-xs px-3 py-1">
                    {ins}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        )}

        <Separator />

        {/* Services */}
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Services Offered
          </h3>

          {freeServices.length > 0 && (
            <ServiceGroup
              title={`Free Services (${freeServices.length})`}
              color="green"
              items={freeServices}
            />
          )}

          {discountedServices.length > 0 && (
            <ServiceGroup
              title={`Discounted Services (${discountedServices.length})`}
              color="orange"
              items={discountedServices}
            />
          )}

          {regularServices.length > 0 && (
            <ServiceGroup
              title={`Other Services (${regularServices.length})`}
              color="blue"
              items={regularServices}
            />
          )}

          {services.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No detailed service information available.
            </div>
          )}
        </section>
      </div>
    </ScrollArea>

    {/* Footer actions */}
    <div className="px-5 sm:px-7 py-4 border-t bg-white/90 backdrop-blur">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {provider.phone && (
          <Button
            onClick={() => handleAction("call")}
            className="h-11 rounded-xl font-semibold shadow-sm hover:shadow"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Now
          </Button>
        )}
        <Button
          onClick={() => handleAction("directions")}
          variant="outline"
          className="h-11 rounded-xl font-semibold border-2"
        >
          <Navigation className="h-5 w-5 mr-2" />
          Get Directions
        </Button>
        {provider.website && (
          <Button
            onClick={() => handleAction("website")}
            variant="outline"
            className="h-11 rounded-xl font-semibold border-2"
          >
            <Globe className="h-5 w-5 mr-2" />
            Visit Website
          </Button>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>
)
}

/* Subcomponents */

function CardRow({
icon,
title,
content
}: {
icon: React.ReactNode
title: string
content: React.ReactNode
}) {
return (
<div className="rounded-xl border border-gray-200 bg-white/70 p-3">
<div className="flex items-start gap-3">
<div className="shrink-0">{icon}</div>
<div className="min-w-0">
<p className="text-sm font-semibold text-gray-900">{title}</p>
<div className="mt-0.5">{content}</div>
</div>
</div>
</div>
)
}

function Pill({
ok,
okLabel,
noLabel,
warn
}: {
ok: boolean
okLabel: string
noLabel: string
warn?: boolean
}) {
if (ok) {
return (
<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
<CheckCircle className="h-4 w-4 text-emerald-600" />
<span className="text-sm font-medium text-emerald-700">{okLabel}</span>
</div>
)
}
return (
<div
className={[
"flex items-center gap-2 rounded-xl px-3 py-2 border",
warn
? "border-amber-200 bg-amber-50 text-amber-700"
: "border-rose-200 bg-rose-50 text-rose-700"
].join(" ")}
>
{warn ? <AlertCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
<span className="text-sm font-medium">{noLabel}</span>
</div>
)
}

function ServiceGroup({
title,
color,
items
}: {
title: string
color: "green" | "orange" | "blue"
items: Service[]
}) {
const palette = {
green: {
bg: "bg-emerald-50",
border: "border-emerald-200",
title: "text-emerald-800",
chip: "bg-emerald-100 text-emerald-800"
},
orange: {
bg: "bg-orange-50",
border: "border-orange-200",
title: "text-orange-800",
chip: "bg-orange-100 text-orange-800"
},
blue: {
bg: "bg-blue-50",
border: "border-blue-200",
title: "text-blue-800",
chip: "bg-blue-100 text-blue-800"
}
}[color]

return (
  <div className="space-y-3">
    <h4 className={`text-sm font-semibold ${palette.title}`}>{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((s) => (
        <div
          key={s._id}
          className={`rounded-xl ${palette.bg} ${palette.border} border p-4 transition-colors hover:bg-white`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">{s.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.category}</div>
            </div>
            {(s.is_free || s.is_discounted) && (
              <Badge className={`${palette.chip} text-[10px] px-2 py-0.5`}>
                {s.is_free ? "FREE" : "DISCOUNTED"}
              </Badge>
            )}
          </div>
          {s.description && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              {s.description}
            </p>
          )}
          {s.price_info && (
            <p className="mt-2 text-xs text-gray-600">
              Pricing: <span className="font-medium">{s.price_info}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)
}