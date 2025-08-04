import { Phone, Shield, Calendar, CheckCircle } from 'lucide-react'

type AgentCallState = 
  | 'idle'
  | 'initializing'
  | 'dialing'
  | 'connected'
  | 'conversation'
  | 'completed'
  | 'failed'

interface CallProgressProps {
  currentState: AgentCallState
}

export default function CallProgress({ currentState }: CallProgressProps) {
  const steps = [
    { id: 'dialing', label: 'Connecting', icon: Phone },
    { id: 'verifying-filters', label: 'Verifying Filters', icon: Shield },
    { id: 'verifying-service', label: 'Confirming Service', icon: CheckCircle },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  ]

  const getStepStatus = (stepId: string) => {
    if (currentState === 'failed') return 'failed'
    
    // Map conversation states to progress steps
    switch (currentState) {
      case 'initializing':
      case 'dialing':
        return stepId === 'dialing' ? 'active' : 'pending'
      case 'connected':
        if (stepId === 'dialing') return 'completed'
        return stepId === 'verifying-filters' ? 'active' : 'pending'
      case 'conversation':
        if (stepId === 'dialing') return 'completed'
        if (stepId === 'verifying-filters') return 'completed'
        if (stepId === 'verifying-service') return 'active'
        return stepId === 'scheduling' ? 'pending' : 'pending'
      case 'completed':
        return 'completed'
      default:
        return 'pending'
    }
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id)
        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                    status === 'failed' ? 'bg-red-500 text-white' :
                    'bg-gray-200 text-gray-400'}
                `}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className={`
                text-xs mt-2 font-medium
                ${status === 'active' ? 'text-blue-600' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'failed' ? 'text-red-600' :
                  'text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-1 mx-2 transition-all
                ${status === 'completed' ? 'bg-green-500' :
                  status === 'active' ? 'bg-blue-200' :
                  'bg-gray-200'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
} 