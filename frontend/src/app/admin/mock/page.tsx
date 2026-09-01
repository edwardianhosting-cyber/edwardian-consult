'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Calendar } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Mock Exams'
      description='Manage Mock Exams'
      icon={Calendar}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

