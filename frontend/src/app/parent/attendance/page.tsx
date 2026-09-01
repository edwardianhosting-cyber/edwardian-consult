'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Calendar } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Attendance'
      description='View Attendance'
      icon={Calendar}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

