'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { TrendingUp } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Academic Progress'
      description='View Academic Progress'
      icon={TrendingUp}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

