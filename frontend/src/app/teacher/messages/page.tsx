'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { MessageSquare } from 'lucide-react';

export default function TeacherPage() {
  return (
    <PlaceholderPage
      title='Messages'
      description='Manage Messages'
      icon={MessageSquare}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

