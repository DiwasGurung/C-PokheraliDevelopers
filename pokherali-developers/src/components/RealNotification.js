import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Package, AlertTriangle, CheckCircle } from 'lucide-react';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const connectionRef = useRef(null);
  const notificationsRef = useRef(null);

  // Handle clicks outside of the notifications panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) && 
          showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Connect to WebSocket server for real-time notifications
  useEffect(() => {
    // In a real implementation, this would use a WebSocket library 
    // or SignalR connection to receive notifications
    const connectToNotifications = () => {
      console.log("Connecting to notification service...");
      
      // Simulating connection to WebSocket server
      setTimeout(() => {
        setConnected(true);
        console.log("Connected to notification service");
        
        // Simulate receiving notifications periodically
        const simulateNotification = () => {
          const notificationTypes = ['order_completed', 'order_processed', 'book_popular'];
          const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          let notificationData;
          
          switch (randomType) {
            case 'order_completed':
              notificationData = {
                id: Date.now(),
                type: 'order_completed',
                title: 'New Order Completed',
                message: `Order #ORD-${Math.floor(1000 + Math.random() * 9000)} has been completed with ${Math.floor(1 + Math.random() * 5)} books.`,
                timestamp: new Date(),
                read: false
              };
              break;
            case 'order_processed':
              notificationData = {
                id: Date.now(),
                type: 'order_processed',
                title: 'Order Processed',
                message: `Staff member has processed order #ORD-${Math.floor(1000 + Math.random() * 9000)}.`,
                timestamp: new Date(),
                read: false
              };
              break;
            case 'book_popular':
              const bookTitles = [
                'The Great Adventure',
                'Mystery of the Blue Lake',
                'Science of Everything',
                'Hidden Treasures',
                'Lost in the Forest'
              ];
              const randomBook = bookTitles[Math.floor(Math.random() * bookTitles.length)];
              
              notificationData = {
                id: Date.now(),
                type: 'book_popular',
                title: 'Book Gaining Popularity',
                message: `"${randomBook}" is trending today with multiple purchases.`,
                timestamp: new Date(),
                read: false
              };
              break;
            default:
              return;
          }
          
          // Add the notification to the list
          setNotifications(prev => [notificationData, ...prev.slice(0, 19)]); // Keep only the 20 most recent
          setUnreadCount(prev => prev + 1);
          
          // Display browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(notificationData.title, {
              body: notificationData.message,
              icon: '/favicon.ico'
            });
          }
        };
        
        // For demo purposes, simulate a notification every 30 seconds
        const intervalId = setInterval(simulateNotification, 30000);
        
        // Simulate an initial notification after 5 seconds
        setTimeout(simulateNotification, 5000);
        
        // Cleanup on unmount
        return () => {
          clearInterval(intervalId);
          setConnected(false);
          console.log("Disconnected from notification service");
        };
      }, 2000);
    };
    
    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Connect to notification service
    connectToNotifications();
    
    return () => {
      // Cleanup connection on component unmount
      if (connectionRef.current) {
        connectionRef.current.close();
      }
    };
  }, []);
  
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      // Mark all as read when opening
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Adjust unread count if needed
    const wasUnread = notifications.find(n => n.id === id && !n.read);
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_completed':
        return <Package size={20} className="text-blue-500" />;
      case 'order_processed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'book_popular':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={notificationsRef}>
      <button 
        className="relative p-2 text-gray-600 hover:text-purple-600 focus:outline-none"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={clearAllNotifications}
                className="text-xs text-gray-500 hover:text-gray-700"
                disabled={notifications.length === 0}
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
            {!connected && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse">Connecting to notification service...</div>
              </div>
            )}
            
            {connected && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell size={40} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            )}
            
            {connected && notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? '' : 'bg-purple-50'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;