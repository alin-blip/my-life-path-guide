
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, subscribed, subscriptionLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const location = useLocation();

  if (loading || subscriptionLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow admins to bypass subscription requirements
  if (!subscribed && !isAdmin) {
    return <Navigate to="/pricing" state={{ from: location, reason: 'membership_required' }} replace />;
  }

  return <>{children}</>;
};
