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
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'TEACHER' || user.role === 'TUTOR') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'PARENT_VIEW') {
        router.push('/parent/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, loading, router]);

  return null;
}
