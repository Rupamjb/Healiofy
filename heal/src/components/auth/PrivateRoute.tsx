import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If it's a protected route and user is not authenticated, save the path
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', location.pathname);
    }
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    // Redirect to home page with a query parameter indicating login is required
    return <Navigate to={`/?login=required&from=${location.pathname}`} replace />;
  }

  return <>{children}</>;
}; 