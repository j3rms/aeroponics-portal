"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Higher-Order Component for authentication
const withAuth = (WrappedComponent) => {
  return function AuthComponent(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Check authentication via session cookie (no Authorization header needed)
          const response = await fetch('/apis/getCurrentUser', {
            credentials: 'include', // Important: include cookies in the request
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setUser(result.data);
              setIsAuthenticated(true);
            } else {
              router.push('/login');
            }
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
            <p className="text-gray-600 text-lg font-medium">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} user={user} isAuthenticated={isAuthenticated} />;
  };
};

export default withAuth;
