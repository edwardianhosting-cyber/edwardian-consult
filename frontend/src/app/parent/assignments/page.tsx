'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { BookOpen } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Assignments'
      description='View Assignments'
      icon={BookOpen}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

