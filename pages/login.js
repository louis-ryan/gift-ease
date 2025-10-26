import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Login() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      // Direct browser redirect to avoid CORS issues
      window.location.href = '/api/auth/login';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <div>Redirecting...</div>;
  }

  return <div>Redirecting to login...</div>;
}
