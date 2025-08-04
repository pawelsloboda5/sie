import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Clock, Calendar as CalendarIcon, X, Plus, Trash2 } from 'lucide-react'
import { type AvailabilitySlot } from '@/lib/voiceAgent'

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
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [currentDateTimeRanges, setCurrentDateTimeRanges] = useState<Array<{start: string, end: string}>>([{start: '9:00', end: '17:00'}])

  // Common time slots for quick selection
  const quickTimeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  // Day names for display
  const getDayOfWeek = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Handle calendar date selection (multiple dates)
  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates)
      // Update availability slots for new dates
      updateAvailabilityForDates(dates)
    }
  }

  // Update availability slots when dates change
  const updateAvailabilityForDates = (dates: Date[]) => {
    const newSlots: AvailabilitySlot[] = dates.map(date => {
      // Check if we already have availability for this date
      const existingSlot = availabilitySlots.find(
        slot => slot.date.toDateString() === date.toDateString()
      )
      
      if (existingSlot) {
        return existingSlot
      }
      
      // Create new slot with default time ranges
      return {
        date: new Date(date),
        dayOfWeek: getDayOfWeek(date),
        timeSlots: [],
        timeRanges: [...currentDateTimeRanges]
      }
    })
    
    setAvailabilitySlots(newSlots)
  }

  // Add a quick time slot to selected dates
  const addQuickTimeToSelectedDates = (time: string) => {
    if (selectedDates.length === 0) return
    
    const updatedSlots = availabilitySlots.map(slot => {
      if (selectedDates.some(date => date.toDateString() === slot.date.toDateString())) {
        if (!slot.timeSlots.includes(time)) {
          return {
            ...slot,
            timeSlots: [...slot.timeSlots, time]
          }
        }
      }
      return slot
    })
    
    setAvailabilitySlots(updatedSlots)
  }

  // Remove a time slot from a specific date
  const removeTimeSlot = (slotIndex: number, timeSlot: string) => {
    const updatedSlots = [...availabilitySlots]
    updatedSlots[slotIndex].timeSlots = updatedSlots[slotIndex].timeSlots.filter(t => t !== timeSlot)
    setAvailabilitySlots(updatedSlots)
  }

  // Update time range for a specific date
  const updateTimeRange = (slotIndex: number, rangeIndex: number, field: 'start' | 'end', value: string) => {
    const updatedSlots = [...availabilitySlots]
    if (!updatedSlots[slotIndex].timeRanges) {
      updatedSlots[slotIndex].timeRanges = []
    }
    updatedSlots[slotIndex].timeRanges![rangeIndex] = {
      ...updatedSlots[slotIndex].timeRanges![rangeIndex],
      [field]: value
    }
    setAvailabilitySlots(updatedSlots)
  }

  // Add a new time range to a specific date
  const addTimeRange = (slotIndex: number) => {
    const updatedSlots = [...availabilitySlots]
    if (!updatedSlots[slotIndex].timeRanges) {
      updatedSlots[slotIndex].timeRanges = []
    }
    updatedSlots[slotIndex].timeRanges!.push({start: '9:00', end: '17:00'})
    setAvailabilitySlots(updatedSlots)
  }

  // Remove a time range from a specific date
  const removeTimeRange = (slotIndex: number, rangeIndex: number) => {
    const updatedSlots = [...availabilitySlots]
    if (updatedSlots[slotIndex].timeRanges) {
      updatedSlots[slotIndex].timeRanges!.splice(rangeIndex, 1)
    }
    setAvailabilitySlots(updatedSlots)
  }

  // Remove a date completely
  const removeDate = (dateToRemove: Date) => {
    const newSelectedDates = selectedDates.filter(date => date.toDateString() !== dateToRemove.toDateString())
    const newSlots = availabilitySlots.filter(slot => slot.date.toDateString() !== dateToRemove.toDateString())
    
    setSelectedDates(newSelectedDates)
    setAvailabilitySlots(newSlots)
  }

  const handleNext = () => {
    // Filter out slots with no time preferences
    const validSlots = availabilitySlots.filter(slot => 
      slot.timeSlots.length > 0 || (slot.timeRanges && slot.timeRanges.length > 0)
    )
    
    console.log('Availability data being sent:', validSlots)
    onAvailabilitySet(validSlots)
    onNext()
  }

  const isFormValid = () => {
    return availabilitySlots.some(slot => 
      slot.timeSlots.length > 0 || (slot.timeRanges && slot.timeRanges.length > 0)
    )
  }

  // Get minimum date (today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Your Availability</h2>
        <p className="text-gray-600">Choose when you're available for appointments</p>
      </div>

      {/* Calendar Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Available Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Click multiple dates to add them to your availability
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              disabled={(date) => date < today}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Time Selection */}
      {selectedDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Time Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add common time slots to all selected dates
            </p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {quickTimeSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => addQuickTimeToSelectedDates(time)}
                  className="text-sm hover:bg-blue-50"
                  size="sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Date Configuration */}
      {availabilitySlots.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configure Each Date</h3>
          
          {availabilitySlots.map((slot, slotIndex) => (
            <Card key={slot.date.toISOString()}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {slot.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDate(slot.date)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quick Time Slots */}
                {slot.timeSlots.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Specific Times</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {slot.timeSlots.map((timeSlot) => (
                        <Badge
                          key={timeSlot}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800"
                        >
                          {timeSlot}
                          <button
                            onClick={() => removeTimeSlot(slotIndex, timeSlot)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Time Ranges */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">Time Ranges</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeRange(slotIndex)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Range
                    </Button>
                  </div>
                  
                  {slot.timeRanges?.map((range, rangeIndex) => (
                    <div key={rangeIndex} className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={range.start}
                          onChange={(e) => updateTimeRange(slotIndex, rangeIndex, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={range.end}
                          onChange={(e) => updateTimeRange(slotIndex, rangeIndex, 'end', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      {slot.timeRanges && slot.timeRanges.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeRange(slotIndex, rangeIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {isFormValid() && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-2">Availability Summary</h3>
            <p className="text-sm text-green-700">
              You have configured availability for {availabilitySlots.filter(slot => 
                slot.timeSlots.length > 0 || (slot.timeRanges && slot.timeRanges.length > 0)
              ).length} date(s). 
              The AI agent will use this information when scheduling appointments.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isFormValid()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          size="lg"
        >
          Start AI Calls
        </Button>
      </div>
    </div>
  )
} 