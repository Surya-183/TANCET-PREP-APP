// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import "./amplifyConfig"; // Initializes Amplify/Auth

// Import modular auth functions from Amplify v6+
import { getCurrentUser, signOut as authSignOut } from "@aws-amplify/auth";

// --- Import All Your Page Components ---
import HomePage from "./components/HomePage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import TopicPage from "./components/TopicPage";
import TestConfigForm from "./components/TestConfigForm";
import CustomTestForm from "./components/CustomTestForm";
import TestScreen from "./components/TestScreen";
import ResultsScreen from "./components/ResultsScreen";
import AdminDashboard from "./components/AdminDashboard";
import AdminCreateTestForm from "./components/AdminCreateTestForm";
import AdminResultsView from "./components/AdminResultsView";


// AppWrapper keeps BrowserRouter at the top level
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const handleSignOutClick = async () => {
    try {
      console.log('Signing out user...');
      await authSignOut({ global: true });
      setUser(null);
      sessionStorage.clear();
      localStorage.removeItem('amplify-signin-with-hostedUI');
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  // On app start, check if a user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('Current user found:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.log('No authenticated user found');
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  // Show a loading screen while checking authentication status
  if (checkingAuth) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <main className="app-main">
        <Routes>
        {/* --- Public Routes (Sign In / Sign Up) --- */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/home" replace />
            ) : (
              <SignInPage
                onSwitchToSignUp={() => (window.location.href = "/signup")}
                onLoginSuccess={(u) => setUser(u)}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={<SignUpPage onSwitchToSignIn={() => (window.location.href = "/")} />}
        />

        {/* --- Protected Routes (Require Login) --- */}
        <Route path="/home" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><HomePage /></ProtectedRoute>} />
        <Route path="/topic/:topicName" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><TopicPage /></ProtectedRoute>} />
        <Route path="/custom-test" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><CustomTestForm /></ProtectedRoute>} />
        <Route path="/configure/:topicName/:subtopic" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><TestConfigForm /></ProtectedRoute>} />
        <Route path="/test/:testId" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><TestScreen /></ProtectedRoute>} />
        <Route path="/results/:resultId" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><ResultsScreen /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><AdminCreateTestForm /></ProtectedRoute>} />
        <Route path="/admin/results/:testId" element={<ProtectedRoute user={user} onSignOut={handleSignOutClick}><AdminResultsView /></ProtectedRoute>} />

        {/* Fallback route to redirect any unknown URL */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ user, children, onSignOut }) {
  if (!user) {
    console.log('No authenticated user, redirecting to sign-in');
    return <Navigate to="/" replace />;
  }
  
  if (user && user.signInUserSession === null) {
    console.log('User not confirmed, redirecting to sign-in');
    return <Navigate to="/" replace />;
  }
  
  return React.isValidElement(children) ? React.cloneElement(children, { onSignOut }) : children;
}

export default AppWrapper;

