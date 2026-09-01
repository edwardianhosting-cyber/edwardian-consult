'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Bell } from 'lucide-react';

export default function TeacherPage() {
  return (
    <PlaceholderPage
      title='Announcements'
      description='Manage Announcements'
      icon={Bell}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

