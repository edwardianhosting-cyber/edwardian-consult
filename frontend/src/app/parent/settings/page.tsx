'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Settings } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Settings'
      description='View Settings'
      icon={Settings}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

