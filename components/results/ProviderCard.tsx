"use client"

import React, { useState, useEffect } from "react"
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
import { 
  toggleFavoriteProvider, 
  isProviderFavorited, 
  type FavoriteProvider 
} from '@/lib/voiceAgent'

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
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
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
        freeServicesOnly: false, // This would be determined by services
        acceptsMedicaid: provider.medicaid,
        acceptsMedicare: provider.medicare,
        acceptsUninsured: provider.accepts_uninsured,
        noSSNRequired: !provider.ssn_required,
        telehealthAvailable: provider.telehealth_available
      }
    }

    const newFavoriteStatus = toggleFavoriteProvider(favoriteProvider)
    setIsFavorited(newFavoriteStatus)
    onFavoriteToggle?.(provider, newFavoriteStatus)
  }

  const renderStars = (rating: number | null | undefined) => {
    const stars = []
    const safeRating = rating || 0
    const fullStars = Math.floor(safeRating)
    const hasHalfStar = safeRating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400/50 text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(safeRating)
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

  // Mobile Compact List View Layout
  if (compact && !isDesktop) {
    return (
      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl mb-4 p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header with Name and Distance */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2 mb-2">
              {provider.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {provider.category}
              </Badge>
              {showDistance && provider.distance && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                  {formatDistance(provider.distance)}
                </Badge>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(provider.rating)}
              </div>
              <span className="text-base font-semibold text-foreground">
                {(provider.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className="flex-shrink-0 h-10 w-10 p-0 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isFavorited 
                  ? 'fill-pink-500 text-pink-500' 
                  : 'text-gray-400 hover:text-pink-500'
              }`} 
            />
          </Button>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
          <span className="text-sm text-foreground leading-relaxed">{provider.address}</span>
        </div>

        {/* Service Summary */}
        {services.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">
                  {services.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {getFreeServices().length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Free
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">
                  {getDiscountedServices().length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Discounted
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Service */}
        {topService && (
          <div className={`p-4 rounded-xl mb-4 border-2 ${
            topService.is_free 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : topService.is_discounted 
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' 
              : 'bg-primary/5 border-primary/20'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">
                    Featured
                  </span>
                  {topService.is_free && (
                    <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                      FREE
                    </Badge>
                  )}
                  {topService.is_discounted && !topService.is_free && (
                    <Badge className="bg-orange-600 text-white text-xs px-2 py-1">
                      DISCOUNTED
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-base text-foreground mb-1 line-clamp-2">
                  {topService.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {topService.category}
                </p>
                {topService.description && (
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {topService.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Badges */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {getAccessibilityBadges()}
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="space-y-3">
          {/* Primary Action Row */}
          <div className="grid grid-cols-2 gap-3">
            {provider.phone && (
              <Button
                size="lg"
                onClick={() => onCallProvider?.(provider)}
                className="h-14 text-base font-semibold bg-[#068282] hover:bg-[#0f766e] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => onGetDirections?.(provider)}
              className="h-14 text-base font-semibold border-2 border-[#068282] text-[#068282] hover:bg-[#068282] hover:text-white rounded-xl transition-all"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Directions
            </Button>
          </div>

          {/* Secondary Action Row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="ghost"
              onClick={() => onViewDetails?.(provider)}
              className="h-12 text-base font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {provider.website ? (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 text-base font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                onClick={() => onVisitWebsite?.(provider)}
              >
                <Globe className="h-4 w-4 mr-2" />
                Website
              </a>
            ) : (
              <Button
                size="lg"
                variant="ghost"
                disabled
                className="h-12 text-base font-medium border border-gray-200 dark:border-gray-700 rounded-xl opacity-50"
              >
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Button>
            )}
          </div>
          
          {/* AI Schedule Button - Mobile */}
          {onScheduleWithAI && (
            <Button
              size="lg"
              variant="default"
              onClick={() => onScheduleWithAI(provider)}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="h-5 w-5 mr-2 animate-pulse" />
              Schedule with AI Voice Agent
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Desktop List View Layout
  if (compact && isDesktop) {
    return (
      <div className="w-full border border-border rounded-lg mb-4 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 bg-card">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Provider Info - 4 columns */}
          <div className="col-span-4 space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-xl text-foreground leading-tight">
                  {provider.name}
                </h3>
                {showDistance && provider.distance && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 px-3 py-1 text-sm font-medium flex-shrink-0">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
              </div>
              
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium mb-3">
                {provider.category}
              </Badge>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {(provider.rating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">rating</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground leading-relaxed">{provider.address}</span>
            </div>
          </div>

          {/* Services & Featured Service - 4 columns */}
          <div className="col-span-4 space-y-4">
            {/* Service Summary */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Services Available
              </h4>
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {services.length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {getFreeServices().length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Free
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

            {/* Featured Service */}
            {topService && (
              <div className={`p-4 rounded-lg border-2 ${
                topService.is_free 
                  ? 'bg-green-50 border-green-200' 
                  : topService.is_discounted 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-primary/5 border-primary/20'
              }`}>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Featured Service
                      </span>
                    </div>
                    <h5 className="text-lg font-semibold text-foreground mb-1">
                      {topService.name}
                    </h5>
                    <p className="text-sm text-muted-foreground">{topService.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {topService.is_free && (
                      <Badge className="bg-green-600 text-white hover:bg-green-700 border-0 text-sm font-bold px-3 py-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        FREE
                      </Badge>
                    )}
                    {topService.is_discounted && !topService.is_free && (
                      <Badge className="bg-orange-600 text-white hover:bg-orange-700 border-0 text-sm font-bold px-3 py-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        DISC
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
            )}
          </div>

          {/* Accessibility & Actions - 4 columns */}
          <div className="col-span-4 space-y-4">
            {/* Accessibility Badges */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Accessibility & Coverage
              </h4>
              <div className="flex flex-wrap gap-2">
                {getAccessibilityBadges()}
              </div>
            </div>

            {/* Insurance Information */}
            {provider.insurance_providers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Insurance Accepted
                </h4>
                <div className="flex flex-wrap gap-2">
                  {provider.insurance_providers.slice(0, 3).map((insurance) => (
                    <Badge key={insurance} variant="outline" className="text-sm px-3 py-1">
                      {insurance}
                    </Badge>
                  ))}
                  {provider.insurance_providers.length > 3 && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      +{provider.insurance_providers.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid gap-3">
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

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => onViewDetails?.(provider)}
                  className="h-12 text-base font-semibold border-2 border-border hover:bg-muted transition-colors"
                >
                  <Info className="h-5 w-5 mr-2" />
                  View Details
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3 pt-2">
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center px-4 py-3 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors rounded-md border border-transparent hover:bg-blue-50"
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
                    onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                    className="flex-1 text-sm hover:bg-muted h-12"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Desktop Card View Layout
  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
      <CardHeader className="p-4 sm:p-6 lg:p-8 pb-3 sm:pb-4 lg:pb-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4 lg:gap-6">
          <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
            {/* Provider Name and Category */}
            <div>
              <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3 lg:gap-4">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground leading-tight break-words flex-1">
                    {provider.name}
                  </CardTitle>
                  {showDistance && provider.distance && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-base font-medium flex-shrink-0">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-1.5 lg:mr-2" />
                      {formatDistance(provider.distance)}
                    </Badge>
                  )}
                </div>
                
                <Badge variant="outline" className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 font-medium w-fit">
                  {provider.category}
                </Badge>
              </div>
              
              {/* Rating with responsive stars */}
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                  {(provider.rating || 0).toFixed(1)}
                </span>
                <span className="text-sm sm:text-base text-muted-foreground">
                  rating
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className="h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 p-0 hover:bg-pink-50 dark:hover:bg-pink-900/20"
            >
              <Heart 
                className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors ${
                  isFavorited 
                    ? 'fill-pink-500 text-pink-500' 
                    : 'text-gray-400 hover:text-pink-500'
                }`} 
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(provider)}
              className="text-xs sm:text-sm lg:text-base hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6"
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-1.5 lg:mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Address */}
        <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mt-0.5 sm:mt-1 text-primary flex-shrink-0" />
          <span className="text-sm sm:text-base text-foreground leading-relaxed break-words">{provider.address}</span>
        </div>

        {/* Prominent Accessibility Badges */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground uppercase tracking-wide">
            Accessibility & Coverage
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
            {getAccessibilityBadges()}
          </div>
        </div>

        {/* Featured Service Highlight */}
        {topService && (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
              <span className="text-xs sm:text-sm lg:text-base font-semibold text-primary uppercase tracking-wide">
                Featured Service
              </span>
            </div>
            <div className={`p-3 sm:p-4 lg:p-6 rounded-lg border-2 transition-all ${
              topService.is_free 
                ? 'bg-green-50 border-green-200' 
                : topService.is_discounted 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4 gap-2 sm:gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                  <h5 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-1 sm:mb-1.5 lg:mb-2 break-words">
                    {topService.name}
                  </h5>
                  <p className="text-sm sm:text-base text-muted-foreground">{topService.category}</p>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
                  {topService.is_free && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700 border-0 text-xs sm:text-sm lg:text-base font-bold px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-1.5 lg:mr-2" />
                      FREE
                    </Badge>
                  )}
                  {topService.is_discounted && !topService.is_free && (
                    <Badge className="bg-orange-600 text-white hover:bg-orange-700 border-0 text-xs sm:text-sm lg:text-base font-bold px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-1.5 lg:mr-2" />
                      DISC
                    </Badge>
                  )}
                </div>
              </div>
              
              {topService.description && (
                <p className="text-sm sm:text-base text-foreground/80 mb-2 sm:mb-3 lg:mb-4 leading-relaxed">
                  {topService.description}
                </p>
              )}
              
              {topService.price_info && (
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-sm sm:text-base">
                  <span className="font-medium text-foreground">Pricing:</span>
                  <span className="text-muted-foreground break-words">{topService.price_info}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Summary */}
        {services.length > 0 && (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground uppercase tracking-wide">
              Services Available
            </h4>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-1.5 lg:mb-2">
                  {services.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide leading-tight">
                  Total Services
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-1.5 lg:mb-2">
                  {getFreeServices().length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide leading-tight">
                  Free Services
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-1.5 lg:mb-2">
                  {getDiscountedServices().length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide leading-tight">
                  Discounted
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {provider.insurance_providers.length > 0 && (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground uppercase tracking-wide flex items-center gap-2 sm:gap-2.5 lg:gap-3">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
              Insurance Accepted
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
              {provider.insurance_providers.slice(0, 6).map((insurance) => (
                <Badge key={insurance} variant="outline" className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2">
                  {insurance}
                </Badge>
              ))}
              {provider.insurance_providers.length > 6 && (
                <Badge variant="outline" className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2">
                  +{provider.insurance_providers.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator className="my-4 sm:my-6 lg:my-8" />

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Primary Actions */}
          <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2">
            {provider.phone && (
              <Button
                size="lg"
                onClick={() => onCallProvider?.(provider)}
                className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-2.5 lg:mr-3" />
                Call Now
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => onGetDirections?.(provider)}
              className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Navigation className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-2.5 lg:mr-3" />
              Get Directions
            </Button>
          </div>
          
          {/* AI Schedule Action */}
          {onScheduleWithAI && (
            <Button
              size="lg"
              variant="default"
              onClick={() => onScheduleWithAI(provider)}
              className="w-full h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-2.5 lg:mr-3 animate-pulse" />
              Schedule with AI Voice Agent
            </Button>
          )}
          
          {/* Secondary Actions */}
          <div className="flex gap-2 sm:gap-3 lg:gap-4">
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 sm:py-3.5 lg:py-4 text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline transition-colors rounded-md border border-transparent hover:bg-blue-50 min-h-[48px] sm:min-h-[52px] lg:min-h-[56px]"
                onClick={() => onVisitWebsite?.(provider)}
              >
                <Globe className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2 sm:mr-2.5 lg:mr-3" />
                <span className="hidden sm:inline">Visit Website</span>
                <span className="sm:hidden">Website</span>
                <ExternalLink className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4 ml-1.5 sm:ml-2 lg:ml-3" />
              </a>
            )}
            
            {provider.email && (
              <Button
                variant="ghost"
                onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                className="flex-1 text-sm sm:text-base hover:bg-muted h-12 sm:h-13 lg:h-14"
              >
                <Mail className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2 sm:mr-2.5 lg:mr-3" />
                <span className="hidden sm:inline">Send Email</span>
                <span className="sm:hidden">Email</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 