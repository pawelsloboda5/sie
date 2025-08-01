import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar as CalendarIcon, X } from 'lucide-react'
import { AvailabilitySlot } from '../page'

interface AvailabilityPickerProps {
  onAvailabilitySet: (slots: AvailabilitySlot[]) => void
  onBack: () => void
  onNext: () => void
}

export default function AvailabilityPicker({
  onAvailabilitySet,
  onBack,
  onNext
}: AvailabilityPickerProps) {
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([])

  // Mock time slots for now
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]

  const handleNext = () => {
    onAvailabilitySet(selectedSlots)
    onNext()
  }

  // Temporary simplified implementation
  const addTimeSlot = (time: string) => {
    const today = new Date()
    const existingSlot = selectedSlots.find(
      slot => slot.date.toDateString() === today.toDateString()
    )

    if (existingSlot) {
      if (!existingSlot.timeSlots.includes(time)) {
        existingSlot.timeSlots.push(time)
        setSelectedSlots([...selectedSlots])
      }
    } else {
      setSelectedSlots([
        ...selectedSlots,
        { date: today, timeSlots: [time] }
      ])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Your Availability</h2>
        <p className="text-gray-600">Choose when you're available for appointments</p>
      </div>

      {/* Simplified time slot picker */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Quick Time Selection
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Select times when you're available (we'll try multiple days)
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedSlots.some(s => s.timeSlots.includes(time)) ? 'default' : 'outline'}
              onClick={() => addTimeSlot(time)}
              className="text-sm"
            >
              {time}
            </Button>
          ))}
        </div>
      </Card>

      {/* Selected slots display */}
      {selectedSlots.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Your Selected Times</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSlots.flatMap(slot => 
              slot.timeSlots.map(time => (
                <Badge
                  key={time}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {time}
                </Badge>
              ))
            )}
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={selectedSlots.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Start AI Calls
        </Button>
      </div>
    </div>
  )
} 