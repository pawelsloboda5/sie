import {
  type FavoriteProvider,
  type DatabaseService,
  type PatientInfo,
  type ProviderSelectionData
  } from '@/lib/voiceAgent'
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
  const services = await getServicesForProviders(providerIds)
  setServicesByProvider(services)
  } catch (error) {
  console.error('Error fetching services from localStorage:', error)
  setServicesByProvider({})
  } finally {
  setIsLoadingServices(false)
  }
  }
  
  const handleToggle = (providerId: string) => {
  if (selectedProviders.includes(providerId)) {
  const newSelected = selectedProviders.filter(id => id !== providerId)
  const newConfigs = providerConfigs.filter(config => config.providerId !== providerId)
  onSelectionChange(newSelected)
  setProviderConfigs(newConfigs)
  onProviderConfigChange(newConfigs)
  } else {
  const newSelected = [...selectedProviders, providerId]
  const provider = savedProviders.find(p => p._id === providerId)
  if (provider) {
  const defaultConfig: ProviderSelectionData = {
  providerId,
  providerName: provider.name,
  providerAddress: provider.address,
  providerPhone: provider.phone,
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
  if (provider.filters.acceptsUninsured) {
  badges.push(
  <Badge key="uninsured" variant="secondary" className="bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200">
  <Shield className="h-3 w-3 mr-1" />
  Accepts Uninsured
  </Badge>
  )
  }
  if (provider.filters.noSSNRequired) {
  badges.push(
  <Badge key="no-ssn" variant="secondary" className="bg-violet-100 text-violet-800 border border-violet-200">
  <Check className="h-3 w-3 mr-1" />
  No SSN Required
  </Badge>
  )
  }
  if (provider.filters.acceptsMedicaid) {
  badges.push(
  <Badge key="medicaid" variant="secondary" className="bg-sky-100 text-sky-800 border border-sky-200">
  <CreditCard className="h-3 w-3 mr-1" />
  Accepts Medicaid
  </Badge>
  )
  }
  if (provider.filters.acceptsMedicare) {
  badges.push(
  <Badge key="medicare" variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
  <CreditCard className="h-3 w-3 mr-1" />
  Accepts Medicare
  </Badge>
  )
  }
  if (provider.filters.freeServicesOnly) {
  badges.push(
  <Badge key="free" variant="secondary" className="bg-emerald-100 text-emerald-800 border border-emerald-200">
  <Check className="h-3 w-3 mr-1" />
  Free Services Only
  </Badge>
  )
  }
  if (provider.filters.telehealthAvailable) {
  badges.push(
  <Badge key="telehealth" variant="secondary" className="bg-indigo-100 text-indigo-800 border border-indigo-200">
  <Phone className="h-3 w-3 mr-1" />
  Telehealth Available
  </Badge>
  )
  }
  return badges
  }
  
  return (
  <div className="space-y-8">
  <div className="text-center mb-2">
  <h2 className="text-2xl font-semibold tracking-tight">Configure AI Voice Agent</h2>
  <p className="text-gray-600 dark:text-gray-300">Set up patient info, select providers, and choose what to verify during calls.</p>
  </div>
    {/* Patient */}
    <Card className="border-blue-200/60 bg-gradient-to-b from-blue-50/60 to-white/80 dark:from-blue-900/10 dark:to-white/5 backdrop-blur">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
        <User className="h-5 w-5" />
        Patient Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={patientInfo.firstName}
            onChange={(e) => handlePatientInfoChange('firstName', e.target.value)}
            className="border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            value={patientInfo.lastName}
            onChange={(e) => handlePatientInfoChange('lastName', e.target.value)}
            className="border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-blue-800/80 dark:text-blue-200 mt-3">
        This information will be used by the AI agent when calling providers on your behalf.
      </p>
    </CardContent>
  </Card>

  <Separator className="bg-gray-200/70 dark:bg-white/10" />

  {/* Providers */}
  <div>
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Settings className="h-5 w-5" />
      Healthcare Providers
    </h3>

    <div className="grid gap-6">
      {savedProviders.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
          <Heart className="h-14 w-14 mx-auto mb-4 text-pink-400" />
          <h3 className="text-xl font-semibold mb-2">No Favorite Providers yet</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Go back to the search page and click the heart on providers to add them here. Only providers with valid database IDs can be called by the AI.
          </p>
        </div>
      ) : (
        savedProviders.map((provider) => {
          const isSelected = selectedProviders.includes(provider._id)
          const config = getProviderConfig(provider._id)
          const availableServices = servicesByProvider[provider._id] || []

          return (
            <Card
              key={provider._id}
              className={[
                'transition-all rounded-2xl overflow-hidden',
                isSelected
                  ? 'ring-2 ring-blue-500/80 shadow-[0_18px_45px_-20px_rgba(37,99,235,0.45)] border-blue-200'
                  : 'hover:shadow-md border-gray-200/70 dark:border-white/10'
              ].join(' ')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{provider.address}</span>
                    </div>
                    {provider.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{provider.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="p-2 rounded-lg border border-gray-200/70 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <Checkbox checked={isSelected} onCheckedChange={() => handleToggle(provider._id)} />
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs border border-blue-200">
                        SELECTED
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {getFilterBadges(provider)}
                    </div>

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

                    {provider.category && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Category:</span> {provider.category}
                      </div>
                    )}
                  </div>

                  {isSelected && config && (
                    <div className="border-t pt-4 space-y-6">
                      {/* Services */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Services to Verify
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Select which services you want the AI to ask about:
                        </p>
                        {isLoadingServices ? (
                          <div className="text-sm text-gray-500 py-4">Loading services...</div>
                        ) : availableServices.length === 0 ? (
                          <div className="text-sm text-gray-500 py-4 bg-gray-50 dark:bg-white/5 rounded-md p-3">
                            No services found for this provider. Services will be loaded from your recent searches.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                            {availableServices.map((service) => (
                              <div key={service._id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-white/5">
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
                                    className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer leading-tight"
                                  >
                                    {service.name}
                                  </Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">{service.category}</span>
                                    {service.is_free && (
                                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0 border border-emerald-200">FREE</Badge>
                                    )}
                                    {service.is_discounted && (
                                      <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0 border border-blue-200">DISCOUNTED</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Policies */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Policies to Verify
                        </h4>
                        <p className="text-xs text-gray-600">
                          Select which policies you want the AI to confirm:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            { key: 'freeServicesOnly', label: 'Free services available', icon: Check },
                            { key: 'acceptsMedicaid', label: 'Accepts Medicaid', icon: CreditCard },
                            { key: 'acceptsMedicare', label: 'Accepts Medicare', icon: CreditCard },
                            { key: 'acceptsUninsured', label: 'Accepts uninsured patients', icon: Shield },
                            { key: 'noSSNRequired', label: 'No Social Security Number required', icon: Check },
                            { key: 'telehealthAvailable', label: 'Telehealth services available', icon: Phone }
                          ].map(({ key, label, icon: Icon }) => (
                            <label key={key} htmlFor={`filter-${provider._id}-${key}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
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
                              <Icon className="h-3.5 w-3.5 text-gray-500" />
                              <span className="text-sm">{label}</span>
                            </label>
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

  <div className="sticky bottom-4 flex justify-end mt-8">
    <div className="flex flex-col items-end space-y-2 w-full sm:w-auto">
      {!isFormValid() && selectedProviders.length > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Please fill in patient information and configure at least one service or policy for each selected provider.
        </p>
      )}
      <Button
        onClick={onNext}
        disabled={!isFormValid()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl shadow-[0_12px_24px_-10px_rgba(37,99,235,0.6)]"
        size="lg"
      >
        Continue to Availability
      </Button>
    </div>
  </div>
</div>
)
}