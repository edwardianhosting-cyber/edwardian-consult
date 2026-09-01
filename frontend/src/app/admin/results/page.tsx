'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Award } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Results'
      description='Manage Results'
      icon={Award}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

