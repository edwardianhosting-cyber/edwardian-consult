'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Documents'
      description='Manage Documents'
      icon={FileText}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

