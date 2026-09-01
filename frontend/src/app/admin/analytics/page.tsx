'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Analytics'
      description='Manage Analytics'
      icon={BarChart3}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

