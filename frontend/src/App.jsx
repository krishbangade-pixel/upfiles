import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DriveProvider, useDrive } from './context/DriveContext';
import { Layout } from './components/layout/Layout';
import { Drive } from './pages/Drive';
import { Shared } from './pages/Shared';
import { Recent } from './pages/Recent';
import { Starred } from './pages/Starred';
import { Trash } from './pages/Trash';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { session, authUser, authLoading } = useDrive();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  if (!session && !authUser && !location.pathname.startsWith('/share/')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Guard (Redirects away from Login/Register if already logged in)
const PublicRoute = ({ children }) => {
  const { session, authUser, authLoading } = useDrive();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (session || authUser) {
    return <Navigate to="/drive" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <DriveProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Application Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/drive" replace />} />
            <Route path="drive" element={<Drive />} />
            <Route path="shared" element={<Shared />} />
            <Route path="share/:token" element={<Shared />} />
            <Route path="recent" element={<Recent />} />
            <Route path="starred" element={<Starred />} />
            <Route path="trash" element={<Trash />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/drive" replace />} />
        </Routes>
      </DriveProvider>
    </BrowserRouter>
  );
}
