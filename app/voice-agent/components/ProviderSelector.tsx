import { FavoriteProvider } from '@/lib/voiceAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Check, Heart, Shield, CreditCard } from 'lucide-react'

interface ProviderSelectorProps {
  savedProviders: FavoriteProvider[]
  selectedProviders: string[]
  onSelectionChange: (providers: string[]) => void
  onNext: () => void
}

export default function ProviderSelector({
  savedProviders,
  selectedProviders,
  onSelectionChange,
  onNext
}: ProviderSelectorProps) {
  const handleToggle = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onSelectionChange(selectedProviders.filter(id => id !== providerId))
    } else {
      onSelectionChange([...selectedProviders, providerId])
    }
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Providers to Call</h2>
        <p className="text-gray-600">Choose healthcare providers for automated appointment scheduling</p>
      </div>

      <div className="grid gap-4">
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
          savedProviders.map((provider) => (
          <Card 
            key={provider._id}
            className={`cursor-pointer transition-all ${
              selectedProviders.includes(provider._id) 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleToggle(provider._id)}
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
                <Checkbox
                  checked={selectedProviders.includes(provider._id)}
                  onCheckedChange={() => handleToggle(provider._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          ))
        )}
      </div>

      <div className="flex justify-end mt-8">
        <Button 
          onClick={onNext}
          disabled={selectedProviders.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Continue to Availability
        </Button>
      </div>
    </div>
  )
} 