'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { School } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Institutions'
      description='Manage Institutions'
      icon={School}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

