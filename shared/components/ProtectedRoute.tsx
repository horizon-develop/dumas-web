import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = () => {
      try {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        setIsValid(!!(user?.role && allowedRoles.includes(user.role)));
      } catch (error) {
        setIsValid(false);
      }
    };

    verifyAuth();
    window.addEventListener('auth-login', verifyAuth);
    window.addEventListener('auth-logout', verifyAuth);

    return () => {
      window.removeEventListener('auth-login', verifyAuth);
      window.removeEventListener('auth-logout', verifyAuth);
    };
  }, [allowedRoles]);

  if (isValid === null) return null;

  return isValid ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;