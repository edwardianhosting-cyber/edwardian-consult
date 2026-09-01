'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

export default function TeacherPage() {
  return (
    <PlaceholderPage
      title='My Profile'
      description='Manage My Profile'
      icon={Users}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

