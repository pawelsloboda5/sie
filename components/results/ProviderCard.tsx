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
  Info
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
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  const getAccessibilityBadges = () => {
    const badges = []
    
    if (provider.accepts_uninsured) {
      badges.push(
        <Badge key="uninsured" variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Accepts Uninsured
        </Badge>
      )
    }
    
    if (provider.medicaid) {
      badges.push(
        <Badge key="medicaid" variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CreditCard className="h-3 w-3 mr-1" />
          Medicaid
        </Badge>
      )
    }
    
    if (provider.medicare) {
      badges.push(
        <Badge key="medicare" variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CreditCard className="h-3 w-3 mr-1" />
          Medicare
        </Badge>
      )
    }
    
    if (!provider.ssn_required) {
      badges.push(
        <Badge key="no-ssn" variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          No SSN Required
        </Badge>
      )
    }
    
    if (provider.telehealth_available) {
      badges.push(
        <Badge key="telehealth" variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
          <Phone className="h-3 w-3 mr-1" />
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
    <Card className={`w-full hover:shadow-lg transition-shadow duration-200 ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>
                {provider.name}
              </CardTitle>
              {showDistance && provider.distance && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formatDistance(provider.distance)}
                </Badge>
              )}
            </div>
            
            <CardDescription className="text-sm text-gray-600 mb-2">
              {provider.category}
            </CardDescription>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {renderStars(provider.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  ({provider.rating.toFixed(1)})
                </span>
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(provider)}
                className="text-xs"
              >
                <Info className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : 'pt-0 space-y-4'}>
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{provider.address}</span>
        </div>

        {/* Accessibility Badges */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {getAccessibilityBadges()}
          </div>
        )}

              {/* Top Service Highlight */}
      {topService && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Featured Service
              </span>
            </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h6 className="font-medium text-sm text-gray-900">{topService.name}</h6>
                <p className="text-xs text-gray-600">{topService.category}</p>
              </div>
              <div className="flex items-center gap-1">
                {topService.is_free && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    FREE
                </Badge>
                )}
                {topService.is_discounted && !topService.is_free && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    DISCOUNTED
                </Badge>
              )}
              </div>
            </div>
            {topService.description && (
              <p className="text-xs text-gray-700 line-clamp-2">{topService.description}</p>
            )}
            </div>
          </div>
        )}

      {/* Additional Services Summary */}
      {services.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              {services.length} Total Services
              </span>
            {getFreeServices().length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {getFreeServices().length} Free
                </Badge>
            )}
            {getDiscountedServices().length > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                {getDiscountedServices().length} Discounted
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {provider.insurance_providers.length > 0 && !compact && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Insurance Accepted
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {provider.insurance_providers.slice(0, 3).map((insurance) => (
                <Badge key={insurance} variant="outline" className="text-xs">
                  {insurance}
                </Badge>
              ))}
              {provider.insurance_providers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.insurance_providers.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {!compact && <Separator />}

        {/* Action Buttons */}
        <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-row'}`}>
          {provider.phone && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onCallProvider?.(provider)}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGetDirections?.(provider)}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          
          {provider.website && !compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVisitWebsite?.(provider)}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              Website
            </Button>
          )}
        </div>

        {/* Compact mode additional info */}
        {compact && (
          <div className="flex flex-wrap gap-1 mt-2">
            {getAccessibilityBadges().slice(0, 2)}
            {getAccessibilityBadges().length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{getAccessibilityBadges().length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 