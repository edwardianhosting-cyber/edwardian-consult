'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Study Materials'
      description='Manage Study Materials'
      icon={FileText}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

