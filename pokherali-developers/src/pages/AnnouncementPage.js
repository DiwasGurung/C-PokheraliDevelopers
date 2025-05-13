import React, { useState, useEffect } from "react";
import { InfoIcon, XCircle, Bell, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import axios from "axios";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://localhost:7126/api/Announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get time ago string
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  // Check if an announcement is new (less than 3 days old)
  const isNewAnnouncement = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffInDays < 3;
  };

  // Check if an announcement is expiring soon (less than 3 days until end date)
  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const endDate = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 && diffInDays < 3;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <Loader2 size={40} className="animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6 flex items-start shadow-sm">
          <AlertCircle size={24} className="mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Error Loading Announcements</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-8">
          <Bell size={28} className="text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
        </div>
        
        {announcements.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <InfoIcon size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Announcements</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no active announcements at this time. Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => {
              // Default colors if none provided
              const bgColor = announcement.bgColor || '#f0f9ff';
              const textColor = announcement.textColor || '#0c4a6e';
              const isNew = isNewAnnouncement(announcement.startDate);
              const isExpiring = isExpiringSoon(announcement.endDate);
              
              return (
                <div
                  key={announcement.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md"
                >
                  <div 
                    className="p-5 relative"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold pr-16">{announcement.title}</h2>
                      <div className="flex space-x-2">
                        {isNew && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                        {isExpiring && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-700 mb-5 leading-relaxed">{announcement.content}</p>
                    
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1.5" />
                        <span>Posted: {getTimeAgo(announcement.startDate)}</span>
                      </div>
                      
                      {announcement.endDate && (
                        <div className="flex items-center mt-2 sm:mt-0">
                          <span className={`${isExpiring ? 'text-amber-600 font-medium' : ''}`}>
                            Valid until: {formatDate(announcement.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}