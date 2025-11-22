'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AnnouncementBarProps {
  message: string
}

export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hidden = localStorage.getItem('hideAnnouncement')
    if (!hidden) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('hideAnnouncement', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="bg-coral-500 text-white h-[45px] flex items-center justify-center px-4 relative">
      <p className="text-sm font-medium text-center pr-8">{message}</p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-coral-600 rounded transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
