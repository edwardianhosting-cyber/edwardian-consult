'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function TeacherPage() {
  return (
    <PlaceholderPage
      title='Performance'
      description='Manage Performance'
      icon={BarChart3}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

