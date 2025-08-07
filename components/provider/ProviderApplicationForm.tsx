"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
  fullName: string
  email: string
  phone: string
  profession: string
  otherProfession: string
  location: string
  additionalInfo: string
}

interface ProviderApplicationFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
  className?: string
}

export function ProviderApplicationForm({ onSubmit, className = "" }: ProviderApplicationFormProps) {
  const [selectedProfession, setSelectedProfession] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    profession: "",
    otherProfession: "",
    location: "",
    additionalInfo: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default submission to Google Sheets
        const response = await fetch('/api/provider-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to submit application')
        }
        
        // Reset form on success
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          profession: "",
          otherProfession: "",
          location: "",
          additionalInfo: ""
        })
        setSelectedProfession("")
        
        alert('Application submitted successfully! We will contact you soon.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          className="h-12"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="h-12"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="h-12"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Professional Role</Label>
        <Select
          value={selectedProfession}
          onValueChange={(value) => {
            setSelectedProfession(value)
            handleInputChange("profession", value)
          }}
          required
          disabled={isSubmitting}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Medical Doctor">Medical Doctor</SelectItem>
            <SelectItem value="Dentist">Dentist</SelectItem>
            <SelectItem value="Dental Technician">Dental Technician</SelectItem>
            <SelectItem value="Nurse Practitioner">Nurse Practitioner</SelectItem>
            <SelectItem value="Lab Technician">Lab Technician</SelectItem>
            <SelectItem value="Physician Assistant">Physician Assistant</SelectItem>
            <SelectItem value="Gynecologist">Gynecologist</SelectItem>
            <SelectItem value="Licensed Therapist">Licensed Therapist</SelectItem>
            <SelectItem value="Other">Other (please specify)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProfession === "Other" && (
        <div className="space-y-2">
          <Label htmlFor="otherProfession">Please specify your profession</Label>
          <Input
            id="otherProfession"
            name="otherProfession"
            type="text"
            required={selectedProfession === "Other"}
            value={formData.otherProfession}
            onChange={(e) => handleInputChange("otherProfession", e.target.value)}
            placeholder="Please specify your profession"
            className="h-12"
            disabled={isSubmitting}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="location">Preferred Service Area</Label>
        <Select
          value={formData.location}
          onValueChange={(value) => handleInputChange("location", value)}
          required
          disabled={isSubmitting}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Atlanta Metro">Atlanta Metropolitan Area</SelectItem>
            <SelectItem value="Twin Cities">Twin Cities of Minnesota</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInfo">Additional Information / Comments</Label>
        <Textarea
          id="additionalInfo"
          name="additionalInfo"
          rows={4}
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
          placeholder="Share any details about your practice, availability, or interests"
          className="resize-none"
          disabled={isSubmitting}
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 bg-[#068282] hover:bg-[#0f766e] text-white transition-all duration-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}