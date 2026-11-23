'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'TEACHER':
      case 'TUTOR':
        router.push('/teacher/dashboard');
        break;
      case 'PARENT_VIEW':
        router.push('/parent/dashboard');
        break;
      default:
        router.push('/student/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}
