'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { CreditCard } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='ID Cards'
      description='Manage ID Cards'
      icon={CreditCard}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

