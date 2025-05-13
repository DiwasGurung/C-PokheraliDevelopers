import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => {
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch active announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://localhost:7126/api/Announcements');
        
        // Filter out dismissed announcements
        const filteredAnnouncements = response.data.filter(
          announcement => !dismissedAnnouncements.includes(announcement.id)
        );
        
        setAnnouncements(filteredAnnouncements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
    
    // Auto-rotate announcements every 5 seconds if there are multiple
    const rotationInterval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        // Only rotate if we have multiple announcements
        if (announcements.length > 1) {
          return (prevIndex + 1) % announcements.length;
        }
        return prevIndex;
      });
    }, 5000);
    
    return () => clearInterval(rotationInterval);
  }, [dismissedAnnouncements]);

  // Handle dismissing an announcement
  const dismissAnnouncement = (id) => {
    const updatedDismissed = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(updatedDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(updatedDismissed));
    
    // Remove the announcement from the current list
    setAnnouncements(announcements.filter(a => a.id !== id));
    
    // Adjust the current index if needed
    if (currentIndex >= announcements.length - 1) {
      setCurrentIndex(0);
    }
  };

  // If there are no announcements to show, don't render anything
  if (loading || announcements.length === 0 || error) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className="relative px-4 py-3"
      style={{
        backgroundColor: currentAnnouncement.bgColor || '#f3f4f6',
        color: currentAnnouncement.textColor || '#1f2937'
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center sm:text-left">
          <div className="font-medium">{currentAnnouncement.title}</div>
          <div className="text-sm mt-1">{currentAnnouncement.content}</div>
        </div>
        <button
          onClick={() => dismissAnnouncement(currentAnnouncement.id)}
          className="ml-4 p-1 opacity-70 hover:opacity-100 transition-opacity rounded-full"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Pagination indicators for multiple announcements */}
      {announcements.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-current opacity-100 scale-125' 
                  : 'bg-current opacity-40'
              }`}
              aria-label={`View announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}