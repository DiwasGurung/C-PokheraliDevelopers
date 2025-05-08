import { useState } from "react";
import Login from "../pages/LoginPage";
import Register from "../pages/RegisterPage";

export default function AuthContainer({ onAuthSuccess }) {
  const [view, setView] = useState("login"); // 'login' or 'register'

  const switchToLogin = () => setView("login");
  const switchToRegister = () => setView("register");

  const handleLoginSuccess = (data) => {
    // Handle successful login
    onAuthSuccess(data);
  };

  const handleRegisterSuccess = (data) => {
    // Can either auto-login or just show a success message
    console.log("Registration successful", data);
    // For simplicity, we'll switch to login view
    switchToLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          BookStore App
        </h1>
        {view === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            switchToRegister={switchToRegister}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            switchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
}