'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { CreditCard } from 'lucide-react';

export default function ParentPage() {
  return (
    <PlaceholderPage
      title='Payment History'
      description='View Payment History'
      icon={CreditCard}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

