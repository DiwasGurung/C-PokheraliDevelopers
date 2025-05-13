import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    bgColor: "#f3f4f6",
    textColor: "#1f2937",
    startDate: "",
    endDate: "",
    isActive: true
  });
  
  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('https://localhost:7126/api/Announcements/admin', {
        `
        
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Format dates for API
      const startDate = new Date(formData.startDate).toISOString();
      const endDate = new Date(formData.endDate).toISOString();
      
      const announcementData = {
        ...formData,
        startDate,
        endDate
      };
      
      // If editing, include the ID and use PUT
      if (editingAnnouncement) {
        announcementData.id = editingAnnouncement.id;
        
        const response = await fetch(`https://localhost:7126/api/Announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(announcementData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update announcement');
        }
      } else {
        // Creating a new announcement
        const response = await fetch('https://localhost:7126/api/Announcements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(announcementData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create announcement');
        }
      }
      
      // Refresh the list
      fetchAnnouncements();
      
      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(err.message);
    }
  };
  
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    
    // Format dates for form inputs (YYYY-MM-DD)
    const startDate = new Date(announcement.startDate).toISOString().split('T')[0];
    const endDate = new Date(announcement.endDate).toISOString().split('T')[0];
    
    setFormData({
      title: announcement.title,
      content: announcement.content,
      bgColor: announcement.bgColor,
      textColor: announcement.textColor,
      startDate,
      endDate,
      isActive: announcement.isActive
    });
    
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`https://localhost:7126/api/Announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }
      
      // Refresh the list
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError(err.message);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      bgColor: "#f3f4f6",
      textColor: "#1f2937",
      startDate: "",
      endDate: "",
      isActive: true
    });
    setEditingAnnouncement(null);
  };
  
  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };
  
  // Check if an announcement is active (current date is between start and end dates)
  const isAnnouncementActive = (announcement) => {
    const now = new Date();
    const startDate = new Date(announcement.startDate);
    const endDate = new Date(announcement.endDate);
    
    return announcement.isActive && now >= startDate && now <= endDate;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Banner Announcements</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusCircle size={18} />
          <span>Add Announcement</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {announcements.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No announcements have been created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border rounded-lg overflow-hidden ${
                isAnnouncementActive(announcement) ? 'border-green-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-inherit">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                    isAnnouncementActive(announcement) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isAnnouncementActive(announcement) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-4">{announcement.content}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Duration:</p>
                    <p>{formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Colors:</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: announcement.bgColor }}
                        title="Background Color"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: announcement.textColor }}
                        title="Text Color"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="border-t border-inherit p-4">
                <p className="text-sm text-gray-600 mb-2">Banner Preview:</p>
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: announcement.bgColor,
                    color: announcement.textColor 
                  }}
                >
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm">{announcement.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for adding/editing announcements */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <Trash2 size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={3}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      id="bgColor"
                      name="bgColor"
                      value={formData.bgColor}
                      onChange={handleInputChange}
                      className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      id="textColor"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                </div>
                
                {/* Preview */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Banner Preview:</p>
                  <div 
                    className="p-3 rounded"
                    style={{ 
                      backgroundColor: formData.bgColor,
                      color: formData.textColor 
                    }}
                  >
                    <p className="font-medium">{formData.title || "Announcement Title"}</p>
                    <p className="text-sm">{formData.content || "Announcement content goes here."}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingAnnouncement ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}