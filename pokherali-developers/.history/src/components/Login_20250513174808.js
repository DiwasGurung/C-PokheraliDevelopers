import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const Login = () => {
  // Get context with optional chaining
  const userContext = useContext(UserContext);
  const setUser = userContext?.setUser;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('https://localhost:7126/api/Auth/login', {
        email,
        password
      });
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update user context if available
        if (setUser) {
          setUser(userData);
        }
        
        // Check if user has Admin role and redirect accordingly
        if (userData.roles && userData.roles.includes('Admin')) {
          // Redirect to admin dashboard
          navigate('/admin');
        } else {
          // Redirect to regular user homepage
          navigate('/');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? 
                err.response.data : 
                'Login failed. Please check your credentials.');
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <a href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
            Register
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;