'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { BookOpen } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Programs'
      description='Manage Programs'
      icon={BookOpen}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

