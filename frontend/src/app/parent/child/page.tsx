'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { User } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Child Profile'
      description='View Child Profile'
      icon={User}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

