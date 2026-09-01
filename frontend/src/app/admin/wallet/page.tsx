'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Wallet } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Wallet Records'
      description='Manage Wallet Records'
      icon={Wallet}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

