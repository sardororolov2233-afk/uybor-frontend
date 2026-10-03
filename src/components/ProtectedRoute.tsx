import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../api/auth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
