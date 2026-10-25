import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { loadAuth } from '../authStorage';

interface RequireLoginProps {
  children: ReactNode;
  ownerOnly?: boolean;
}

export default function RequireLogin({ children, ownerOnly = false }: RequireLoginProps) {
  const auth = loadAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (ownerOnly && auth.role !== 'Owner') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
