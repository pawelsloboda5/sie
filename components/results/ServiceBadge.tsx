"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  DollarSign, 
  Percent,  
  Heart, 
  Shield, 
  Stethoscope,
  Eye,
  Brain,
  Baby,
  Pill,
  Activity,
  UserCheck
} from "lucide-react"

interface Service {
  _id: string
  name: string
  category: string
  description: string
  is_free: boolean
  is_discounted: boolean
  price_info: string
}

interface ServiceBadgeProps {
  service: Service
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "compact"
}

export function ServiceBadge({ 
  service, 
  showTooltip = true, 
  size = "md",
  variant = "default" 
}: ServiceBadgeProps) {
  const getCategoryIcon = (category: string) => {
    const iconClass = size === "sm" ? "h-3 w-3" : "h-4 w-4"
    
    switch (category.toLowerCase()) {
      case 'preventive care':
        return <Shield className={iconClass} />
      case 'urgent care':
        return <Activity className={iconClass} />
      case 'mental health':
        return <Brain className={iconClass} />
      case 'dental care':
        return <UserCheck className={iconClass} />
      case 'vision care':
        return <Eye className={iconClass} />
      case 'women\'s health':
        return <Heart className={iconClass} />
      case 'pediatric care':
        return <Baby className={iconClass} />
      case 'pharmacy services':
        return <Pill className={iconClass} />
      case 'diagnostic services':
        return <Stethoscope className={iconClass} />
      default:
        return <Stethoscope className={iconClass} />
    }
  }

  const getBadgeStyles = () => {
    if (service.is_free) {
      return {
        className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
        icon: <DollarSign className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
        label: "FREE"
      }
    }
    
    if (service.is_discounted) {
      return {
        className: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300",
        icon: <Percent className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
        label: "DISCOUNTED"
      }
    }
    
    return {
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
      icon: getCategoryIcon(service.category),
      label: null
    }
  }

  const { className, icon, label } = getBadgeStyles()
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  }

  const BadgeContent = () => (
    <Badge 
      variant="secondary" 
      className={`${className} ${sizeClasses[size]} flex items-center gap-1 transition-colors duration-200`}
    >
      {icon}
      <span className="font-medium">
        {variant === "compact" ? (label || service.name.substring(0, 15) + "...") : service.name}
      </span>
      {label && variant === "default" && (
        <span className="ml-1 text-xs font-bold opacity-75">
          {label}
        </span>
      )}
    </Badge>
  )

  if (!showTooltip) {
    return <BadgeContent />
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <BadgeContent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(service.category)}
              <span className="font-semibold">{service.name}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Category:</strong> {service.category}
            </div>
            
            {service.description && (
              <div className="text-sm text-gray-600">
                <strong>Description:</strong> {service.description}
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-1">
              {service.is_free && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  FREE
                </Badge>
              )}
              {service.is_discounted && !service.is_free && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  <Percent className="h-3 w-3 mr-1" />
                  DISCOUNTED
                </Badge>
              )}
            </div>
            
            {service.price_info && (
              <div className="text-sm text-gray-600 pt-1 border-t">
                <strong>Pricing:</strong> {service.price_info}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Utility component for displaying multiple services
interface ServiceBadgeListProps {
  services: Service[]
  maxDisplay?: number
  showTooltips?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "compact"
}

export function ServiceBadgeList({ 
  services, 
  maxDisplay = 3, 
  showTooltips = true, 
  size = "sm",
  variant = "compact"
}: ServiceBadgeListProps) {
  const displayedServices = services.slice(0, maxDisplay)
  const remainingCount = services.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-1">
      {displayedServices.map((service) => (
        <ServiceBadge 
          key={service._id} 
          service={service} 
          showTooltip={showTooltips}
          size={size}
          variant={variant}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
} 