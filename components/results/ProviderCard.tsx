"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Star, 
  Clock, 
  DollarSign, 
  Shield, 
  CreditCard,
  Navigation,
  Heart,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react"

interface Provider {
  _id: string
  name: string
  category: string
  address: string
  phone?: string
  website?: string
  email?: string
  rating: number
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
  showDistance = true,
  compact = false
}: ProviderCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-5 w-5 fill-yellow-400/50 text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)
    }

    return stars
  }

  const getAccessibilityBadges = () => {
    const badges = []
    
    if (provider.accepts_uninsured) {
      badges.push(
        <Badge key="uninsured" className="bg-blue-600 text-white hover:bg-blue-700 border-0 font-medium px-3 py-1">
          <Shield className="h-4 w-4 mr-2" />
          Accepts Uninsured
        </Badge>
      )
    }
    
    if (provider.medicaid) {
      badges.push(
        <Badge key="medicaid" className="bg-green-600 text-white hover:bg-green-700 border-0 font-medium px-3 py-1">
          <CreditCard className="h-4 w-4 mr-2" />
          Medicaid
        </Badge>
      )
    }
    
    if (provider.medicare) {
      badges.push(
        <Badge key="medicare" className="bg-green-600 text-white hover:bg-green-700 border-0 font-medium px-3 py-1">
          <CreditCard className="h-4 w-4 mr-2" />
          Medicare
        </Badge>
      )
    }
    
    if (!provider.ssn_required) {
      badges.push(
        <Badge key="no-ssn" className="bg-purple-600 text-white hover:bg-purple-700 border-0 font-medium px-3 py-1">
          <CheckCircle className="h-4 w-4 mr-2" />
          No SSN Required
        </Badge>
      )
    }
    
    if (provider.telehealth_available) {
      badges.push(
        <Badge key="telehealth" className="bg-indigo-600 text-white hover:bg-indigo-700 border-0 font-medium px-3 py-1">
          <Phone className="h-4 w-4 mr-2" />
          Telehealth
        </Badge>
      )
    }

    return badges
  }

  const getFreeServices = () => {
    return services.filter(service => service.is_free)
  }

  const getDiscountedServices = () => {
    return services.filter(service => service.is_discounted && !service.is_free)
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`
    }
    return `${distance.toFixed(1)} mi`
  }

  return (
    <Card className={`w-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group ${compact ? 'p-3' : 'p-6'}`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-6'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Provider Name and Category */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-foreground leading-tight`}>
                  {provider.name}
                </CardTitle>
                {showDistance && provider.distance && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 px-3 py-1 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                  {provider.category}
                </Badge>
                
                {/* Rating with larger stars */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(provider.rating)}
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    rating
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(provider)}
                className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={`${compact ? 'pt-0 space-y-4' : 'pt-0 space-y-6'}`}>
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
          <span className="text-base text-foreground leading-relaxed">{provider.address}</span>
        </div>

        {/* Prominent Accessibility Badges */}
        {!compact && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Accessibility & Coverage
            </h4>
            <div className="flex flex-wrap gap-2">
              {getAccessibilityBadges()}
            </div>
          </div>
        )}

        {/* Featured Service Highlight */}
        {topService && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                Featured Service
              </span>
            </div>
            <div className={`p-4 rounded-lg border-2 transition-all ${
              topService.is_free 
                ? 'bg-green-50 border-green-200' 
                : topService.is_discounted 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-foreground mb-1">
                    {topService.name}
                  </h5>
                  <p className="text-sm text-muted-foreground">{topService.category}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {topService.is_free && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700 border-0 text-sm font-bold px-3 py-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      FREE
                    </Badge>
                  )}
                  {topService.is_discounted && !topService.is_free && (
                    <Badge className="bg-orange-600 text-white hover:bg-orange-700 border-0 text-sm font-bold px-3 py-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      DISCOUNTED
                    </Badge>
                  )}
                </div>
              </div>
              
              {topService.description && (
                <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                  {topService.description}
                </p>
              )}
              
              {topService.price_info && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Pricing:</span>
                  <span className="text-muted-foreground">{topService.price_info}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Summary */}
        {services.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Services Available
            </h4>
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {services.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Services
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {getFreeServices().length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Free Services
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {getDiscountedServices().length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Discounted
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {provider.insurance_providers.length > 0 && !compact && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Insurance Accepted
            </h4>
            <div className="flex flex-wrap gap-2">
              {provider.insurance_providers.slice(0, 4).map((insurance) => (
                <Badge key={insurance} variant="outline" className="text-sm px-3 py-1">
                  {insurance}
                </Badge>
              ))}
              {provider.insurance_providers.length > 4 && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  +{provider.insurance_providers.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {provider.phone && (
              <Button
                size="lg"
                onClick={() => onCallProvider?.(provider)}
                className="h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => onGetDirections?.(provider)}
              className="h-12 text-base font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
          </div>
          
          {/* Secondary Actions */}
          {!compact && (
            <div className="flex gap-3">
              {provider.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVisitWebsite?.(provider)}
                  className="flex-1 text-sm hover:bg-muted"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
              
              {provider.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                  className="flex-1 text-sm hover:bg-muted"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Compact mode additional info */}
        {compact && (
          <div className="flex flex-wrap gap-2 mt-4">
            {getAccessibilityBadges().slice(0, 2)}
            {getAccessibilityBadges().length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{getAccessibilityBadges().length - 2} more benefits
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 