import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../utils/auth';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Debug: Log authentication state
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);
  console.log('ProtectedRoute - current path:', location.pathname);

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Authentication and role check passed, rendering children');
  return <>{children}</>;
}