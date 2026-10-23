import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { loadAuth } from '../authStorage';

interface RequireLoginProps {
  children: ReactNode;
}

export default function RequireLogin({ children }: RequireLoginProps) {
  if (!loadAuth()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
