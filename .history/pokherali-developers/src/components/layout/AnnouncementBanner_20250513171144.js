import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/api';

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActiveAnnouncement();
  }, []);

  const loadActiveAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getActiveAnnouncement();
      setAnnouncement(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  if (loading || error || !announcement) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <span className="font-semibold">{announcement.message}</span>
          {announcement.link && (
            <a
              href={announcement.link}
              className="ml-2 underline hover:text-blue-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner; 