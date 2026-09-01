'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Target } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Performance'
      description='Manage Performance'
      icon={Target}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

