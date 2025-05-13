import React, { useState, useEffect } from "react";
import { InfoIcon, XCircle } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
          <XCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      
      {announcements.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <InfoIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">There are no active announcements at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="border rounded-lg overflow-hidden shadow-sm"
              style={{
                borderColor: announcement.bgColor || '#f3f4f6'
              }}
            >
              <div 
                className="p-4"
                style={{
                  backgroundColor: announcement.bgColor || '#f3f4f6',
                  color: announcement.textColor || '#1f2937'
                }}
              >
                <h2 className="text-xl font-semibold">{announcement.title}</h2>
              </div>
              
              <div className="p-4">
                <p className="text-gray-800 mb-4">{announcement.content}</p>
                <div className="text-sm text-gray-600">
                  <p>Posted: {formatDate(announcement.startDate)}</p>
                  {announcement.endDate && (
                    <p>Valid until: {formatDate(announcement.endDate)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}