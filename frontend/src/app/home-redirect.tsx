'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomeRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return null;
}
