'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { GraduationCap } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Courses'
      description='Manage Courses'
      icon={GraduationCap}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

