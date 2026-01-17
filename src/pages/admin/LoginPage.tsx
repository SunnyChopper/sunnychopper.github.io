import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/Auth';
import Button from '../../components/atoms/Button';
import { ROUTES } from '../../routes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialCheckComplete = useRef(false);

  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[LoginPage] Component mounted');
    return () => {
      console.log('[LoginPage] Component unmounting');
    };
  }, []);

  // Track when initial auth check completes
  useEffect(() => {
    if (!loading && !initialCheckComplete.current) {
      initialCheckComplete.current = true;
      console.log('[LoginPage] Initial auth check completed');
    }
  }, [loading]);

  // Redirect authenticated users to dashboard immediately
  // This prevents the form from being shown and prevents form submission
  useEffect(() => {
    console.log('[LoginPage] useEffect triggered:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
    });

    if (!loading && user) {
      console.log('[LoginPage] User is authenticated, redirecting to dashboard');
      navigate(ROUTES.admin.dashboard, { replace: true });
    }
  }, [user, loading, navigate]);

  // Show nothing during initial auth check or if user is authenticated (redirecting)
  // Don't hide during sign-in attempts (when initialCheckComplete is true)
  if ((loading && !initialCheckComplete.current) || (!loading && user)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent form submission if user is already authenticated
    if (user) {
      console.log('[LoginPage] Form submitted but user is already authenticated, redirecting');
      navigate(ROUTES.admin.dashboard, { replace: true });
      return;
    }

    setLocalError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Only navigate if sign in was successful
      // The auth context will update the user state, which will trigger the redirect in useEffect
      // Don't navigate immediately to avoid race conditions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      // If user is already signed in, redirect instead of showing error
      if (
        errorMessage.includes('already signed in') ||
        errorMessage.includes('already a signed in')
      ) {
        console.log('[LoginPage] User already signed in, redirecting to dashboard');
        navigate(ROUTES.admin.dashboard, { replace: true });
        return;
      }

      setLocalError(errorMessage);
      console.error('[LoginPage] Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to access your Growth System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {localError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {localError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
