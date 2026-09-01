'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { BookOpen } from 'lucide-react';

export default function TeacherPage() {
  return (
    <PlaceholderPage
      title='Courses'
      description='Manage Courses'
      icon={BookOpen}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

