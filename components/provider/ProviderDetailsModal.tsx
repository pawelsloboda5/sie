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

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`
    }
    return `${distance.toFixed(1)} mi`
  }

  const getFreeServices = () => services.filter(service => service.is_free)
  const getDiscountedServices = () => services.filter(service => service.is_discounted && !service.is_free)
  const getRegularServices = () => services.filter(service => !service.is_free && !service.is_discounted)

  const handleAction = (action: string) => {
    switch (action) {
      case 'call':
        onCallProvider?.(provider)
        break
      case 'directions':
        onGetDirections?.(provider)
        break
      case 'website':
        onVisitWebsite?.(provider)
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {provider.name}
                </DialogTitle>
                {showDistance && provider.distance && (
                  <Badge variant="outline" className="text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
              </div>
              
              <DialogDescription className="text-lg text-gray-600 mb-3">
                {provider.category}
              </DialogDescription>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(provider.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({provider.rating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 pt-0 space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{provider.address}</p>
                    </div>
                  </div>
                  
                  {provider.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">{provider.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {provider.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a 
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors"
                        >
                          {provider.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {provider.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">{provider.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Accessibility Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Accessibility & Requirements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {provider.accepts_uninsured ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={provider.accepts_uninsured ? "text-green-700" : "text-red-600"}>
                      {provider.accepts_uninsured ? "Accepts Uninsured" : "Requires Insurance"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {provider.medicaid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={provider.medicaid ? "text-green-700" : "text-red-600"}>
                      {provider.medicaid ? "Accepts Medicaid" : "No Medicaid"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {provider.medicare ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={provider.medicare ? "text-green-700" : "text-red-600"}>
                      {provider.medicare ? "Accepts Medicare" : "No Medicare"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {!provider.ssn_required ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    <span className={!provider.ssn_required ? "text-green-700" : "text-orange-600"}>
                      {!provider.ssn_required ? "No SSN Required" : "SSN Required"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {provider.telehealth_available ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={provider.telehealth_available ? "text-green-700" : "text-red-600"}>
                      {provider.telehealth_available ? "Telehealth Available" : "In-Person Only"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Insurance Information */}
            {provider.insurance_providers.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Insurance Accepted
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {provider.insurance_providers.map((insurance) => (
                      <Badge key={insurance} variant="outline" className="text-sm">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Services Offered
              </h3>
              
              {/* Free Services */}
              {getFreeServices().length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Free Services ({getFreeServices().length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getFreeServices().map((service) => (
                      <div key={service._id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-green-900">{service.name}</h5>
                          <Badge className="bg-green-100 text-green-800 text-xs">FREE</Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-1">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-green-600">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discounted Services */}
              {getDiscountedServices().length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Discounted Services ({getDiscountedServices().length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getDiscountedServices().map((service) => (
                      <div key={service._id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-orange-900">{service.name}</h5>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">DISCOUNTED</Badge>
                        </div>
                        <p className="text-sm text-orange-700 mb-1">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-orange-600 mb-2">{service.description}</p>
                        )}
                        {service.price_info && (
                          <p className="text-sm font-medium text-orange-700">
                            Pricing: {service.price_info}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Services */}
              {getRegularServices().length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Other Services ({getRegularServices().length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRegularServices().map((service) => (
                      <div key={service._id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-1">{service.name}</h5>
                        <p className="text-sm text-blue-700 mb-1">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-blue-600 mb-2">{service.description}</p>
                        )}
                        {service.price_info && (
                          <p className="text-sm font-medium text-blue-700">
                            Pricing: {service.price_info}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {services.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No detailed service information available
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-6 pt-0 border-t">
          <div className="flex gap-3">
            {provider.phone && (
              <Button
                onClick={() => handleAction('call')}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            )}
            
            <Button
              onClick={() => handleAction('directions')}
              variant="outline"
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            
            {provider.website && (
              <Button
                onClick={() => handleAction('website')}
                variant="outline"
                className="flex-1"
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 