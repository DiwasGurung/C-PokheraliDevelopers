

import { useState, useEffect } from "react"
import { X, BellRing } from "lucide-react"

export default function UserAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fixed announcement design (same as admin view for consistency)
  const fixedDesign = {
    bgColor: "#F0F9FF", // light blue background
    textColor: "#0C4A6E", // dark blue text
    borderColor: "#BAE6FD", // light blue border
  }

  // Fetch active announcements on component mount
  useEffect(() => {
    fetchActiveAnnouncements()

    // Load dismissed announcements from localStorage
    const savedDismissed = localStorage.getItem("dismissedAnnouncements")
    if (savedDismissed) {
      setDismissedAnnouncements(JSON.parse(savedDismissed))
    }
  }, [])

  const fetchActiveAnnouncements = async () => {
    try {
      setLoading(true)

      // This endpoint should return only active announcements
      const response = await fetch("https://localhost:7126/api/Announcements/active")

      if (!response.ok) {
        throw new Error("Failed to fetch announcements")
      }

      const data = await response.json()
      setAnnouncements(data)
    } catch (err) {
      console.error("Error fetching announcements:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const dismissAnnouncement = (id) => {
    const updatedDismissed = [...dismissedAnnouncements, id]
    setDismissedAnnouncements(updatedDismissed)

    // Save to localStorage so dismissals persist
    localStorage.setItem("dismissedAnnouncements", JSON.stringify(updatedDismissed))

    // Move to next announcement if available
    if (currentIndex < filteredAnnouncements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Reset to first if we dismissed the last one
    }
  }

  // Filter out announcements that have been dismissed
  const filteredAnnouncements = announcements.filter(
    (announcement) => !dismissedAnnouncements.includes(announcement.id),
  )

  // If loading, no announcements, or all dismissed, don't render anything
  if (loading || filteredAnnouncements.length === 0) {
    return null
  }

  // Get the current announcement to display
  const currentAnnouncement = filteredAnnouncements[currentIndex]

  return (
    <div
      className="w-full px-4 py-3 mb-4"
      style={{
        backgroundColor: fixedDesign.bgColor,
        color: fixedDesign.textColor,
        borderBottom: `1px solid ${fixedDesign.borderColor}`,
      }}
    >
      <div className="container mx-auto flex items-start gap-3">
        <BellRing className="h-5 w-5 flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          <p className="font-medium">{currentAnnouncement.title}</p>
          <p className="text-sm mt-1 opacity-90">{currentAnnouncement.content}</p>
        </div>

        <div className="flex items-center gap-2">
          {filteredAnnouncements.length > 1 && (
            <div className="text-xs">
              {currentIndex + 1} of {filteredAnnouncements.length}
            </div>
          )}

          <button
            onClick={() => dismissAnnouncement(currentAnnouncement.id)}
            className="p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
