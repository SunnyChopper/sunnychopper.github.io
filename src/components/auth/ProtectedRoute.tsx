import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/Auth';
import Loader from '@/components/molecules/Loader';
import { ROUTES } from '@/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Render:', {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    pathname: location.pathname,
    loginRoute: ROUTES.admin.login,
  });

  if (loading) {
    console.log('[ProtectedRoute] Showing loader (loading=true)');
    return <Loader isLoading={true} />;
  }

  if (!user) {
    if (location.pathname !== ROUTES.admin.login) {
      console.log('[ProtectedRoute] No user and not on login page, redirecting to login');
      return <Navigate to={ROUTES.admin.login} replace />;
    }
    console.log('[ProtectedRoute] No user but already on login page, returning null');
    return null;
  }

  console.log('[ProtectedRoute] User authenticated, rendering children');
  return <>{children}</>;
};
