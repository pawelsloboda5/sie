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
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react'
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
loadSavedProviders()
restoreSession()
}, [])

useEffect(() => {
if (voiceAgentCallRequest && currentStep !== 'calling') {
saveVoiceAgentSession(voiceAgentCallRequest)
}
}, [voiceAgentCallRequest, currentStep])

const loadSavedProviders = () => {
try {
const favoriteProviders = getFavoriteProviders()
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
setPatientInfo(savedSession.patientInfo)
setProviderConfigs(savedSession.providerConfigurations)
setSelectedProviders(savedSession.callMetadata.selectedProviderIds)
setUserAvailability(savedSession.availability)
setVoiceAgentCallRequest(savedSession)
setHasRestoredSession(true)
}
} catch (error) {
console.error('Error restoring session:', error)
}
}

const createAndValidateCallRequest = (includeAvailabilityValidation = true) => {
const callRequest = createVoiceAgentCallRequest(
patientInfo,
providerConfigs,
userAvailability
)
const validation = validateVoiceAgentCallRequest(callRequest, includeAvailabilityValidation)
setValidationErrors(validation.errors)
if (validation.isValid) {
setVoiceAgentCallRequest(callRequest)
return callRequest
}
return null
}

const handleComplete = useCallback((results: CallResult[]) => {
console.log('All calls completed:', results)
console.log('Complete call request data:', voiceAgentCallRequest)
clearVoiceAgentSession()
// TODO: summary screen
}, [voiceAgentCallRequest])

return (
<div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,#E9E1FF_10%,transparent),radial-gradient(1000px_500px_at_90%_0%,#D9ECFF_10%,transparent)] dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,#2a1f4f_10%,transparent),radial-gradient(1000px_500px_at_90%_0%,#0f2648_10%,transparent)]">
<AppHeader />
<div className="container mx-auto px-4 py-8 sm:py-10">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/app">
          <Button variant="ghost" className="group hover:bg-white/60 dark:hover:bg-white/5 backdrop-blur border border-transparent hover:border-gray-200 dark:hover:border-white/10">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
            Back to Search
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-[0_10px_40px_-15px_rgba(24,39,75,0.2)] p-8 sm:p-10 mb-8">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(300px_150px_at_top_left,black,transparent)]">
          <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/20 to-sky-500/20 blur-2xl" />
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-sky-600 text-white flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-700 to-sky-700 dark:from-violet-300 dark:to-sky-300 bg-clip-text text-transparent">
              AI Voice Agent Scheduler
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Automatically call providers and secure appointments—hands-free.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Agent online and ready
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-3">
          <StepIndicator step={1} label="Select Providers" active={currentStep === 'select'} completed={currentStep !== 'select'} />
          <div className="h-[2px] w-14 sm:w-20 bg-gradient-to-r from-gray-300/80 to-gray-200/60 dark:from-white/15 dark:to-white/10" />
          <StepIndicator step={2} label="Set Availability" active={currentStep === 'availability'} completed={currentStep === 'calling'} />
          <div className="h-[2px] w-14 sm:w-20 bg-gradient-to-r from-gray-300/80 to-gray-200/60 dark:from-white/15 dark:to-white/10" />
          <StepIndicator step={3} label="AI Calls" active={currentStep === 'calling'} completed={false} />
        </div>
      </div>

      {/* Alerts */}
      {validationErrors.length > 0 && (
        <Alert className="mb-6 border-red-200/70 bg-red-50/70 dark:bg-red-500/10 dark:border-red-400/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Please fix the following:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasRestoredSession && (
        <Alert className="mb-6 border-blue-200/70 bg-blue-50/70 dark:bg-blue-500/10 dark:border-blue-400/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Previous session restored</div>
            <p className="text-sm mt-1">Continue where you left off—your selections are ready.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-[0_10px_40px_-15px_rgba(24,39,75,0.2)] p-6 sm:p-8 backdrop-blur">
        {currentStep === 'select' && (
          <ProviderSelector
            savedProviders={savedProviders}
            selectedProviders={selectedProviders}
            onSelectionChange={setSelectedProviders}
            onProviderConfigChange={setProviderConfigs}
            onPatientInfoChange={setPatientInfo}
            onNext={() => {
              const callRequest = createAndValidateCallRequest(false)
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
<div
className={[
'w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all',
'shadow-[0_8px_20px_-10px_rgba(99,102,241,0.6)]',
active
? 'bg-gradient-to-br from-violet-600 to-sky-600 text-white scale-105'
: completed
? 'bg-emerald-500 text-white'
: 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200'
].join(' ')}
>
{completed ? '✓' : step}
</div>
<span
className={[
'mt-2 text-xs sm:text-sm font-medium',
active ? 'text-violet-700 dark:text-violet-300' : completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
].join(' ')}
>
{label}
</span>
</div>
)
}