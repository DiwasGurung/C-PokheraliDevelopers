
import { useState, useEffect } from "react"
import { PlusCircle, Edit, Trash2, AlertCircle, Calendar, BellRing, X } from "lucide-react"

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)

  // Fixed announcement design
  const fixedDesign = {
    bgColor: "#F0F9FF", // light blue background
    textColor: "#0C4A6E", // dark blue text
    borderColor: "#BAE6FD", // light blue border
  }

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const user = localStorage.getItem("user")

      if (!user) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("https://localhost:7126/api/Announcements/admin")

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const user = localStorage.getItem("user")

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Format dates for API
      const startDate = new Date(formData.startDate).toISOString()
      const endDate = new Date(formData.endDate).toISOString()

      const announcementData = {
        title: formData.title,
        content: formData.content,
        startDate,
        endDate,
        isActive: formData.isActive,
        // No design or color information sent to backend
      }

      // If editing, include the ID and use PUT
      if (editingAnnouncement) {
        announcementData.id = editingAnnouncement.id

        const response = await fetch(`https://localhost:7126/api/Announcements/${editingAnnouncement.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(announcementData),
        })

        if (!response.ok) {
          throw new Error("Failed to update announcement")
        }
      } else {
        // Creating a new announcement
        const response = await fetch("https://localhost:7126/api/Announcements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(announcementData),
        })

        if (!response.ok) {
          throw new Error("Failed to create announcement")
        }
      }

      // Refresh the list
      fetchAnnouncements()

      // Reset form and close modal
      resetForm()
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error saving announcement:", err)
      setError(err.message)
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)

    // Format dates for form inputs (YYYY-MM-DD)
    const startDate = new Date(announcement.startDate).toISOString().split("T")[0]
    const endDate = new Date(announcement.endDate).toISOString().split("T")[0]

    setFormData({
      title: announcement.title,
      content: announcement.content,
      startDate,
      endDate,
      isActive: announcement.isActive,
    })

    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`https://localhost:7126/api/Announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete announcement")
      }

      // Refresh the list
      fetchAnnouncements()
    } catch (err) {
      console.error("Error deleting announcement:", err)
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      startDate: "",
      endDate: "",
      isActive: true,
    })
    setEditingAnnouncement(null)
  }

  const handleAddNew = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Check if an announcement is active (current date is between start and end dates)
  const isAnnouncementActive = (announcement) => {
    const now = new Date()
    const startDate = new Date(announcement.startDate)
    const endDate = new Date(announcement.endDate)

    return announcement.isActive && now >= startDate && now <= endDate
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full border rounded-lg p-4 space-y-4">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Banner Announcements</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle size={18} />
          <span>Add Announcement</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="border rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">No announcements found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first announcement to display important messages to users.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <PlusCircle size={16} />
              <span>Create Announcement</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border rounded-lg shadow-sm overflow-hidden ${
                isAnnouncementActive(announcement) ? "border-green-500" : ""
              }`}
            >
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium">{announcement.title}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      isAnnouncementActive(announcement) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isAnnouncementActive(announcement) ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-gray-600">{announcement.content}</p>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-gray-500">
                      {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <p className="text-sm font-medium mb-2">Banner Preview</p>
                  <div
                    className="p-4 rounded-md border flex items-start gap-3"
                    style={{
                      backgroundColor: fixedDesign.bgColor,
                      color: fixedDesign.textColor,
                      borderColor: fixedDesign.borderColor,
                    }}
                  >
                    <BellRing className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm mt-1 opacity-90">{announcement.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing announcements */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
              <p className="text-gray-500 mb-4">
                Create or modify banner announcements to display important messages to users.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={200}
                      placeholder="Enter announcement title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      placeholder="Enter announcement content"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="border rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium mb-2">Banner Preview</p>
                    <div
                      className="p-4 rounded-md border flex items-start gap-3"
                      style={{
                        backgroundColor: fixedDesign.bgColor,
                        color: fixedDesign.textColor,
                        borderColor: fixedDesign.borderColor,
                      }}
                    >
                      <BellRing className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{formData.title || "Announcement Title"}</p>
                        <p className="text-sm mt-1 opacity-90">
                          {formData.content || "Announcement content goes here."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    {editingAnnouncement ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
