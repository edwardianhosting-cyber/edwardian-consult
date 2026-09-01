'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Shield } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='My Profile'
      description='View My Profile'
      icon={Shield}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

