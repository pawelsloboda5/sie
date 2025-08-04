'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getFavoriteProviders, 
  type FavoriteProvider,
  type PatientInfo,
  type ProviderSelectionData,
  type AvailabilitySlot,
  type VoiceAgentCallRequest,
  type CallResult,
  createVoiceAgentCallRequest,
  validateVoiceAgentCallRequest,
  saveVoiceAgentSession,
  getVoiceAgentSession,
  clearVoiceAgentSession
} from '@/lib/voiceAgent'
import { AppHeader } from '../app/header'
import ProviderSelector from './components/ProviderSelector'
import AvailabilityPicker from './components/AvailabilityPicker'
import AgentCallSimulator from './components/AgentCallSimulator'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function VoiceAgentPage() {
  const [savedProviders, setSavedProviders] = useState<FavoriteProvider[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [providerConfigs, setProviderConfigs] = useState<ProviderSelectionData[]>([])
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({ firstName: '', lastName: '' })
  const [userAvailability, setUserAvailability] = useState<AvailabilitySlot[]>([])
  const [isCallActive, setIsCallActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<'select' | 'availability' | 'calling'>('select')
  const [voiceAgentCallRequest, setVoiceAgentCallRequest] = useState<VoiceAgentCallRequest | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasRestoredSession, setHasRestoredSession] = useState(false)

  useEffect(() => {
    // Load saved providers from localStorage on mount
    loadSavedProviders()
    // Try to restore previous session
    restoreSession()
  }, [])

  // Auto-save session data whenever it changes
  useEffect(() => {
    if (voiceAgentCallRequest && currentStep !== 'calling') {
      saveVoiceAgentSession(voiceAgentCallRequest)
    }
  }, [voiceAgentCallRequest, currentStep])

  const loadSavedProviders = () => {
    try {
      const favoriteProviders = getFavoriteProviders()
      
      // Filter out any providers without valid MongoDB ObjectIds
      const validProviders = favoriteProviders.filter(provider => {
        const isValidId = provider._id && 
                         typeof provider._id === 'string' && 
                         provider._id.length === 24 && 
                         /^[0-9a-fA-F]{24}$/.test(provider._id)
        
        if (!isValidId) {
          console.warn('Filtering out provider with invalid ObjectId:', provider.name, provider._id)
          return false
        }
        
        return true
      })
      
      console.log(`Loaded ${validProviders.length} valid favorite providers out of ${favoriteProviders.length} total`)
      setSavedProviders(validProviders)
    } catch (error) {
      console.error('Error loading favorite providers:', error)
      setSavedProviders([])
    }
  }

  const restoreSession = () => {
    try {
      const savedSession = getVoiceAgentSession()
      if (savedSession && !hasRestoredSession) {
        console.log('Restoring previous voice agent session:', savedSession.requestId)
        
        // Restore all the individual state pieces
        setPatientInfo(savedSession.patientInfo)
        setProviderConfigs(savedSession.providerConfigurations)
        setSelectedProviders(savedSession.callMetadata.selectedProviderIds)
        setUserAvailability(savedSession.availability)
        setVoiceAgentCallRequest(savedSession)
        setHasRestoredSession(true)
        
        console.log('Session restored successfully')
      }
    } catch (error) {
      console.error('Error restoring session:', error)
    }
  }

  const createAndValidateCallRequest = () => {
    const callRequest = createVoiceAgentCallRequest(
      patientInfo,
      providerConfigs,
      userAvailability
    )
    
    const validation = validateVoiceAgentCallRequest(callRequest)
    setValidationErrors(validation.errors)
    
    if (validation.isValid) {
      setVoiceAgentCallRequest(callRequest)
      return callRequest
    }
    
    return null
  }

  const handleComplete = useCallback((results: CallResult[]) => {
    // Handle completion of all calls
    console.log('All calls completed:', results)
    console.log('Complete call request data:', voiceAgentCallRequest)
    
    // Clear the session since calls are complete
    clearVoiceAgentSession()
    
    // TODO: Show summary screen with results
  }, [voiceAgentCallRequest])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/app">
          <Button variant="ghost" className="mb-6 hover:bg-white/50 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Voice Agent Scheduler
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Let our AI assistant call healthcare providers to schedule your appointments automatically
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              AI Agent Online & Ready
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <StepIndicator 
                step={1} 
                label="Select Providers" 
                active={currentStep === 'select'} 
                completed={currentStep !== 'select'} 
              />
              <div className="w-16 h-0.5 bg-gray-300" />
              <StepIndicator 
                step={2} 
                label="Set Availability" 
                active={currentStep === 'availability'} 
                completed={currentStep === 'calling'} 
              />
              <div className="w-16 h-0.5 bg-gray-300" />
              <StepIndicator 
                step={3} 
                label="AI Calls" 
                active={currentStep === 'calling'} 
                completed={false} 
              />
            </div>
          </div>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Please fix the following issues:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Session Restore Notice */}
          {hasRestoredSession && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Previous session restored</div>
                <p className="text-sm mt-1">Your previous configuration has been restored. You can continue where you left off.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            {currentStep === 'select' && (
              <ProviderSelector
                savedProviders={savedProviders}
                selectedProviders={selectedProviders}
                onSelectionChange={setSelectedProviders}
                onProviderConfigChange={setProviderConfigs}
                onPatientInfoChange={setPatientInfo}
                onNext={() => {
                  const callRequest = createAndValidateCallRequest()
                  if (callRequest) {
                    setCurrentStep('availability')
                  }
                }}
              />
            )}
            
            {currentStep === 'availability' && (
              <AvailabilityPicker
                onAvailabilitySet={setUserAvailability}
                onBack={() => setCurrentStep('select')}
                onNext={() => {
                  const callRequest = createAndValidateCallRequest()
                  if (callRequest) {
                    console.log('Starting voice agent calls with complete data:', callRequest)
                    setCurrentStep('calling')
                    setIsCallActive(true)
                  }
                }}
              />
            )}
            
            {currentStep === 'calling' && voiceAgentCallRequest && (
              <AgentCallSimulator
                callRequest={voiceAgentCallRequest}
                onComplete={handleComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for step indicators
function StepIndicator({ 
  step, 
  label, 
  active, 
  completed 
}: { 
  step: number
  label: string
  active: boolean
  completed: boolean 
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
        ${active ? 'bg-blue-600 text-white scale-110 shadow-lg' : 
          completed ? 'bg-green-500 text-white' : 
          'bg-gray-200 text-gray-600'}
      `}>
        {completed ? '✓' : step}
      </div>
      <span className={`
        mt-2 text-sm font-medium transition-colors
        ${active ? 'text-blue-600' : completed ? 'text-green-600' : 'text-gray-500'}
      `}>
        {label}
      </span>
    </div>
  )
} 