'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { ClipboardList } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='CBT Management'
      description='Manage CBT Management'
      icon={ClipboardList}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

