import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../molecules/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // TODO: Remove this temporary bypass once backend API is implemented
  // Currently allowing access to admin pages without authentication for mocked data
  const BYPASS_AUTH = true;

  if (BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (loading) {
    return <Loader isLoading={true} />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
