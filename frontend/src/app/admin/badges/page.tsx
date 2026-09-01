'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Medal } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Badges'
      description='Manage Badges'
      icon={Medal}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

