import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../molecules/Loader';
import { ROUTES } from '../../routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader isLoading={true} />;
  }

  if (!user) {
    return <Navigate to={ROUTES.admin.login} replace />;
  }

  return <>{children}</>;
};
