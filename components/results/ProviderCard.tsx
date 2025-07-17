"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      stars.push(<Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400/50 text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />)
    }

    return stars
  }

  const getAccessibilityBadges = () => {
    const badges = []
    
    if (provider.accepts_uninsured) {
      badges.push(
        <Badge key="uninsured" className="bg-blue-600 text-white hover:bg-blue-700 border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Accepts </span>Uninsured
        </Badge>
      )
    }
    
    if (provider.medicaid) {
      badges.push(
        <Badge key="medicaid" className="bg-green-600 text-white hover:bg-green-700 border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Medicaid
        </Badge>
      )
    }
    
    if (provider.medicare) {
      badges.push(
        <Badge key="medicare" className="bg-green-600 text-white hover:bg-green-700 border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Medicare
        </Badge>
      )
    }
    
    if (!provider.ssn_required) {
      badges.push(
        <Badge key="no-ssn" className="bg-purple-600 text-white hover:bg-purple-700 border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">No SSN</span><span className="sm:hidden">SSN</span>
        </Badge>
      )
    }
    
    if (provider.telehealth_available) {
      badges.push(
        <Badge key="telehealth" className="bg-indigo-600 text-white hover:bg-indigo-700 border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
    <Card className={`w-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-8'}`}>
      <CardHeader className={compact ? 'pb-3 sm:pb-4' : 'pb-4 sm:pb-8'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
            {/* Provider Name and Category */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <CardTitle className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-foreground leading-tight break-words`}>
                  {provider.name}
                </CardTitle>
                {showDistance && provider.distance && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium w-fit">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 font-medium w-fit">
                  {provider.category}
                </Badge>
                
                {/* Rating with responsive stars */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(provider.rating)}
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-foreground">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    rating
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(provider)}
                className="text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">Details</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={`${compact ? 'pt-0 space-y-4 sm:space-y-5' : 'pt-0 space-y-5 sm:space-y-8'}`}>
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-1 text-primary flex-shrink-0" />
          <span className="text-sm sm:text-base text-foreground leading-relaxed break-words">{provider.address}</span>
        </div>

        {/* Prominent Accessibility Badges */}
        {!compact && (
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
              Accessibility & Coverage
            </h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {getAccessibilityBadges()}
            </div>
          </div>
        )}

        {/* Featured Service Highlight */}
        {topService && (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                Featured Service
              </span>
            </div>
            <div className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
              topService.is_free 
                ? 'bg-green-50 border-green-200' 
                : topService.is_discounted 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-base sm:text-lg font-semibold text-foreground mb-1 break-words">
                    {topService.name}
                  </h5>
                  <p className="text-xs sm:text-sm text-muted-foreground">{topService.category}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {topService.is_free && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700 border-0 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      FREE
                    </Badge>
                  )}
                  {topService.is_discounted && !topService.is_free && (
                    <Badge className="bg-orange-600 text-white hover:bg-orange-700 border-0 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      DISC
                    </Badge>
                  )}
                </div>
              </div>
              
              {topService.description && (
                <p className="text-xs sm:text-sm text-foreground/80 mb-2 sm:mb-3 leading-relaxed">
                  {topService.description}
                </p>
              )}
              
              {topService.price_info && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="font-medium text-foreground">Pricing:</span>
                  <span className="text-muted-foreground break-words">{topService.price_info}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Summary */}
        {services.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
              Services Available
            </h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary mb-1">
                  {services.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide leading-tight">
                  Total<span className="hidden sm:inline"> Services</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                  {getFreeServices().length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide leading-tight">
                  Free<span className="hidden sm:inline"> Services</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">
                  {getDiscountedServices().length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide leading-tight">
                  <span className="hidden sm:inline">Discounted</span><span className="sm:hidden">Disc</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {provider.insurance_providers.length > 0 && !compact && (
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              Insurance Accepted
            </h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {provider.insurance_providers.slice(0, 4).map((insurance) => (
                <Badge key={insurance} variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                  {insurance}
                </Badge>
              ))}
              {provider.insurance_providers.length > 4 && (
                <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                  +{provider.insurance_providers.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator className="my-4 sm:my-6" />

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          {/* Primary Actions */}
          <div className={`grid gap-2 sm:gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {provider.phone && (
              <Button
                size="lg"
                onClick={() => onCallProvider?.(provider)}
                className="h-12 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Call Now
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => onGetDirections?.(provider)}
              className="h-12 sm:h-12 text-sm sm:text-base font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Navigation className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Get Directions
            </Button>
          </div>
          
          {/* Secondary Actions */}
          {!compact && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-3 py-3 sm:py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors rounded-md border border-transparent hover:bg-blue-50 min-h-[44px] sm:min-h-auto"
                  onClick={() => onVisitWebsite?.(provider)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              )}
              
              {provider.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                  className="flex-1 text-sm hover:bg-muted h-11 sm:h-auto"
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
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-4">
            {getAccessibilityBadges().slice(0, 2)}
            {getAccessibilityBadges().length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{getAccessibilityBadges().length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 