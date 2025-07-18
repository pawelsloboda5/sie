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
      <DialogContent className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] md:max-h-[90vh] p-0 m-2 md:m-4 lg:m-6 overflow-hidden">
        {/* Header Section */}
        <DialogHeader className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b bg-white/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight flex-1 min-w-0">
                  {provider.name}
                </DialogTitle>
                {showDistance && provider.distance && (
                  <Badge variant="outline" className="text-sm px-3 py-1.5 flex-shrink-0">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {formatDistance(provider.distance)}
                  </Badge>
                )}
              </div>
              
              <DialogDescription className="text-base sm:text-lg text-gray-600">
                {provider.category}
              </DialogDescription>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(provider.rating)}
                  <span className="text-sm sm:text-base text-gray-600 ml-2 font-medium">
                    ({provider.rating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 max-h-[calc(95vh-240px)] md:max-h-[calc(90vh-260px)]">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            
            {/* Contact Information Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Info className="h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50">
                    <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 mb-1">Address</p>
                      <p className="text-gray-600 text-sm leading-relaxed break-words">{provider.address}</p>
                    </div>
                  </div>
                  
                  {provider.phone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50">
                      <Phone className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 mb-1">Phone</p>
                        <a 
                          href={`tel:${provider.phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm font-medium"
                        >
                          {provider.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {provider.website && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50">
                      <Globe className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 mb-1">Website</p>
                        <a 
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors text-sm font-medium"
                        >
                          {provider.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {provider.email && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50">
                      <Mail className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 mb-1">Email</p>
                        <a 
                          href={`mailto:${provider.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors text-sm font-medium"
                        >
                          {provider.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Accessibility & Requirements Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-green-600" />
                Accessibility & Requirements
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  {provider.accepts_uninsured ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${provider.accepts_uninsured ? "text-green-700" : "text-red-600"}`}>
                    {provider.accepts_uninsured ? "Accepts Uninsured" : "Requires Insurance"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  {provider.medicaid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${provider.medicaid ? "text-green-700" : "text-red-600"}`}>
                    {provider.medicaid ? "Accepts Medicaid" : "No Medicaid"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  {provider.medicare ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${provider.medicare ? "text-green-700" : "text-red-600"}`}>
                    {provider.medicare ? "Accepts Medicare" : "No Medicare"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  {!provider.ssn_required ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${!provider.ssn_required ? "text-green-700" : "text-orange-600"}`}>
                    {!provider.ssn_required ? "No SSN Required" : "SSN Required"}
                  </span>
                </div>
              </div>
              
              {provider.telehealth_available && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-700">
                    Telehealth Services Available
                  </span>
                </div>
              )}
            </section>

            {/* Insurance Information */}
            {provider.insurance_providers.length > 0 && (
              <>
                <Separator className="my-8" />
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Insurance Accepted
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {provider.insurance_providers.map((insurance) => (
                      <Badge key={insurance} variant="outline" className="text-sm px-3 py-1.5 font-medium">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                </section>
              </>
            )}

            <Separator className="my-8" />

            {/* Services Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Heart className="h-5 w-5 text-red-500" />
                Services Offered
              </h3>
              
              {/* Free Services */}
              {getFreeServices().length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Free Services ({getFreeServices().length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {getFreeServices().map((service) => (
                      <div key={service._id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100/50 transition-colors">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h5 className="font-medium text-green-900 flex-1 leading-tight">{service.name}</h5>
                          <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0 font-medium">FREE</Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-2 font-medium">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-green-600 leading-relaxed">{service.description}</p>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {getDiscountedServices().map((service) => (
                      <div key={service._id} className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100/50 transition-colors">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h5 className="font-medium text-orange-900 flex-1 leading-tight">{service.name}</h5>
                          <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0 font-medium">DISCOUNTED</Badge>
                        </div>
                        <p className="text-sm text-orange-700 mb-2 font-medium">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-orange-600 mb-2 leading-relaxed">{service.description}</p>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {getRegularServices().map((service) => (
                      <div key={service._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100/50 transition-colors">
                        <h5 className="font-medium text-blue-900 mb-2 leading-tight">{service.name}</h5>
                        <p className="text-sm text-blue-700 mb-2 font-medium">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-blue-600 mb-2 leading-relaxed">{service.description}</p>
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
                <div className="text-center py-8">
                  <p className="text-gray-500 text-base">
                    No detailed service information available
                  </p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Action Buttons - Sticky Footer */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-t bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {provider.phone && (
              <Button
                onClick={() => handleAction('call')}
                className="w-full sm:flex-1 h-12 sm:h-14 text-base font-semibold shadow-sm hover:shadow-md transition-all"
                size="lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            )}
            
            <Button
              onClick={() => handleAction('directions')}
              variant="outline"
              className="w-full sm:flex-1 h-12 sm:h-14 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
              size="lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
            
            {provider.website && (
              <Button
                onClick={() => handleAction('website')}
                variant="outline"
                className="w-full sm:flex-1 h-12 sm:h-14 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
                size="lg"
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