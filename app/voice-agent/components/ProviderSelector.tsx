import { FavoriteProvider } from '@/lib/voiceAgent'
import { getServicesForProviders } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Phone, MapPin, Check, Heart, Shield, CreditCard, User, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

interface DatabaseService {
  _id: string
  name: string
  category: string
  description?: string
  is_free: boolean
  is_discounted: boolean
  price_info?: string
}

export interface PatientInfo {
  firstName: string
  lastName: string
}

export interface ProviderSelectionData {
  providerId: string
  selectedServices: DatabaseService[]
  verifyFilters: {
    freeServicesOnly: boolean
    acceptsMedicaid: boolean
    acceptsMedicare: boolean
    acceptsUninsured: boolean
    noSSNRequired: boolean
    telehealthAvailable: boolean
  }
}

interface ProviderSelectorProps {
  savedProviders: FavoriteProvider[]
  selectedProviders: string[]
  onSelectionChange: (providers: string[]) => void
  onProviderConfigChange: (providerData: ProviderSelectionData[]) => void
  onPatientInfoChange: (patientInfo: PatientInfo) => void
  onNext: () => void
}

export default function ProviderSelector({
  savedProviders,
  selectedProviders,
  onSelectionChange,
  onProviderConfigChange,
  onPatientInfoChange,
  onNext
}: ProviderSelectorProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({ firstName: '', lastName: '' })
  const [providerConfigs, setProviderConfigs] = useState<ProviderSelectionData[]>([])
  const [servicesByProvider, setServicesByProvider] = useState<Record<string, DatabaseService[]>>({})
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  // Fetch services when providers are selected
  useEffect(() => {
    if (selectedProviders.length > 0) {
      fetchServicesForProviders(selectedProviders)
    } else {
      setServicesByProvider({})
    }
  }, [selectedProviders])

  const fetchServicesForProviders = async (providerIds: string[]) => {
    setIsLoadingServices(true)
    try {
      console.log('Fetching services from localStorage for providers:', providerIds)
      const services = await getServicesForProviders(providerIds)
      setServicesByProvider(services)
      console.log('Retrieved services:', services)
    } catch (error) {
      console.error('Error fetching services from localStorage:', error)
      setServicesByProvider({})
    } finally {
      setIsLoadingServices(false)
    }
  }

  const handleToggle = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      // Remove provider
      const newSelected = selectedProviders.filter(id => id !== providerId)
      const newConfigs = providerConfigs.filter(config => config.providerId !== providerId)
      
      onSelectionChange(newSelected)
      setProviderConfigs(newConfigs)
      onProviderConfigChange(newConfigs)
    } else {
      // Add provider with default config
      const newSelected = [...selectedProviders, providerId]
      const provider = savedProviders.find(p => p._id === providerId)
      
      if (provider) {
        const defaultConfig: ProviderSelectionData = {
          providerId,
          selectedServices: [],
          verifyFilters: {
            freeServicesOnly: provider.filters.freeServicesOnly,
            acceptsMedicaid: provider.filters.acceptsMedicaid,
            acceptsMedicare: provider.filters.acceptsMedicare,
            acceptsUninsured: provider.filters.acceptsUninsured,
            noSSNRequired: provider.filters.noSSNRequired,
            telehealthAvailable: provider.filters.telehealthAvailable
          }
        }
        
        const newConfigs = [...providerConfigs, defaultConfig]
        
        onSelectionChange(newSelected)
        setProviderConfigs(newConfigs)
        onProviderConfigChange(newConfigs)
      }
    }
  }

  const updateProviderConfig = (providerId: string, updates: Partial<ProviderSelectionData>) => {
    const newConfigs = providerConfigs.map(config => 
      config.providerId === providerId 
        ? { ...config, ...updates }
        : config
    )
    setProviderConfigs(newConfigs)
    onProviderConfigChange(newConfigs)
  }

  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    const newPatientInfo = { ...patientInfo, [field]: value }
    setPatientInfo(newPatientInfo)
    onPatientInfoChange(newPatientInfo)
  }

  const getProviderConfig = (providerId: string): ProviderSelectionData | undefined => {
    return providerConfigs.find(config => config.providerId === providerId)
  }

  const isFormValid = () => {
    const hasSelectedProviders = selectedProviders.length > 0
    const hasPatientInfo = patientInfo.firstName.trim() && patientInfo.lastName.trim()
    const hasValidConfigs = selectedProviders.every(providerId => {
      const config = getProviderConfig(providerId)
      return config && (config.selectedServices.length > 0 || Object.values(config.verifyFilters).some(Boolean))
    })
    
    return hasSelectedProviders && hasPatientInfo && hasValidConfigs
  }

  const getFilterBadges = (provider: FavoriteProvider) => {
    const badges = []
    
    if (provider.filters.freeServicesOnly) {
      badges.push(
        <Badge key="free" variant="secondary" className="bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" />
          Free Services Only
        </Badge>
      )
    }
    
    if (provider.filters.acceptsMedicaid) {
      badges.push(
        <Badge key="medicaid" variant="secondary" className="bg-blue-100 text-blue-800">
          <CreditCard className="h-3 w-3 mr-1" />
          Accepts Medicaid
        </Badge>
      )
    }
    
    if (provider.filters.acceptsMedicare) {
      badges.push(
        <Badge key="medicare" variant="secondary" className="bg-blue-100 text-blue-800">
          <CreditCard className="h-3 w-3 mr-1" />
          Accepts Medicare
        </Badge>
      )
    }
    
    if (provider.filters.acceptsUninsured) {
      badges.push(
        <Badge key="uninsured" variant="secondary" className="bg-purple-100 text-purple-800">
          <Shield className="h-3 w-3 mr-1" />
          Accepts Uninsured
        </Badge>
      )
    }
    
    if (provider.filters.noSSNRequired) {
      badges.push(
        <Badge key="no-ssn" variant="secondary" className="bg-purple-100 text-purple-800">
          <Check className="h-3 w-3 mr-1" />
          No SSN Required
        </Badge>
      )
    }
    
    if (provider.filters.telehealthAvailable) {
      badges.push(
        <Badge key="telehealth" variant="secondary" className="bg-indigo-100 text-indigo-800">
          <Phone className="h-3 w-3 mr-1" />
          Telehealth Available
        </Badge>
      )
    }
    
    return badges
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Configure AI Voice Agent</h2>
        <p className="text-gray-600">Set up patient information, select providers, and configure what to verify during calls</p>
      </div>

      {/* Patient Information Section */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={patientInfo.firstName}
                onChange={(e) => handlePatientInfoChange('firstName', e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                value={patientInfo.lastName}
                onChange={(e) => handlePatientInfoChange('lastName', e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-3">
            This information will be used by the AI agent when calling providers on your behalf.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Provider Selection Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Healthcare Providers
        </h3>

        <div className="grid gap-6">
          {savedProviders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No Valid Favorite Providers</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">
                  Go back to the search page and click the heart icon on providers you'd like to use with the AI voice agent.
                </p>
                <p className="text-sm text-orange-600 max-w-md mx-auto">
                  Note: Only providers with valid database IDs can be used for AI calling.
                </p>
              </div>
            </div>
          ) : (
            savedProviders.map((provider) => {
              const isSelected = selectedProviders.includes(provider._id)
              const config = getProviderConfig(provider._id)
              const availableServices = servicesByProvider[provider._id] || []
              
              return (
                <Card 
                  key={provider._id}
                  className={`transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 shadow-lg border-blue-200' 
                      : 'hover:shadow-md border-gray-200'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.address}</span>
                        </div>
                        {provider.phone && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{provider.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(provider._id)}
                        />
                        {isSelected && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            SELECTED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Provider Info */}
                      <div className="space-y-3">
                        {/* Filter Badges */}
                        <div className="flex flex-wrap gap-2">
                          {getFilterBadges(provider)}
                        </div>
                        
                        {/* Favorited Date */}
                        <div className="bg-pink-50 border border-pink-200 rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-4 w-4 text-pink-600" />
                            <span className="text-xs font-bold text-pink-900 uppercase tracking-wide">
                              Favorited Provider
                            </span>
                          </div>
                          <p className="text-sm font-medium text-pink-900">
                            Added: {new Date(provider.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Category */}
                        {provider.category && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {provider.category}
                          </div>
                        )}
                      </div>

                      {/* Configuration Options - Only show when selected */}
                      {isSelected && config && (
                        <div className="border-t pt-4 space-y-4">
                          {/* Service Selection */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Services to Verify
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              Select which services you want the AI to ask about:
                            </p>
                            {isLoadingServices ? (
                              <div className="text-sm text-gray-500 py-4">Loading services...</div>
                            ) : availableServices.length === 0 ? (
                              <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-md p-3">
                                No services found for this provider. Services will be loaded from your recent searches.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                {availableServices.map((service) => (
                                  <div key={service._id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                                    <Checkbox
                                      id={`service-${provider._id}-${service._id}`}
                                      checked={config.selectedServices.some(s => s._id === service._id)}
                                      onCheckedChange={(checked) => {
                                        const newServices = checked
                                          ? [...config.selectedServices, service]
                                          : config.selectedServices.filter(s => s._id !== service._id)
                                        updateProviderConfig(provider._id, { selectedServices: newServices })
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label 
                                        htmlFor={`service-${provider._id}-${service._id}`} 
                                        className="text-xs font-medium text-gray-900 cursor-pointer leading-tight"
                                      >
                                        {service.name}
                                      </Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-600">{service.category}</span>
                                        {service.is_free && (
                                          <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">FREE</Badge>
                                        )}
                                        {service.is_discounted && (
                                          <Badge className="bg-blue-100 text-blue-800 text-xs px-1 py-0">DISCOUNTED</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Filter Verification Options */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Policies to Verify
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              Select which policies you want the AI to confirm:
                            </p>
                            <div className="space-y-2">
                              {[
                                { key: 'freeServicesOnly', label: 'Free services available', icon: Check },
                                { key: 'acceptsMedicaid', label: 'Accepts Medicaid', icon: CreditCard },
                                { key: 'acceptsMedicare', label: 'Accepts Medicare', icon: CreditCard },
                                { key: 'acceptsUninsured', label: 'Accepts uninsured patients', icon: Shield },
                                { key: 'noSSNRequired', label: 'No Social Security Number required', icon: Check },
                                { key: 'telehealthAvailable', label: 'Telehealth services available', icon: Phone }
                              ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`filter-${provider._id}-${key}`}
                                    checked={config.verifyFilters[key as keyof typeof config.verifyFilters]}
                                    onCheckedChange={(checked) => {
                                      updateProviderConfig(provider._id, {
                                        verifyFilters: {
                                          ...config.verifyFilters,
                                          [key]: checked
                                        }
                                      })
                                    }}
                                  />
                                  <Icon className="h-3 w-3 text-gray-500" />
                                  <Label 
                                    htmlFor={`filter-${provider._id}-${key}`} 
                                    className="text-sm text-gray-700 cursor-pointer"
                                  >
                                    {label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <div className="flex flex-col items-end space-y-2">
          {!isFormValid() && selectedProviders.length > 0 && (
            <p className="text-sm text-amber-600">
              Please fill in patient information and configure at least one service or policy for each selected provider.
            </p>
          )}
          <Button 
            onClick={onNext}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            size="lg"
          >
            Continue to Availability
          </Button>
        </div>
      </div>
    </div>
  )
} 