'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Audit Logs'
      description='Manage Audit Logs'
      icon={Shield}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

