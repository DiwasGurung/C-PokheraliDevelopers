import { useState, useEffect } from "react";
import axios from "axios";

// Function to create an axios instance for API calls
export const createApiClient = () => {
  const api = axios.create({
    baseURL: 'https://localhost:7126/api',
    withCredentials: true // Important for sending cookies with requests
  });
  
  return api;
};

// Simple hook to get the current user from localStorage
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
};