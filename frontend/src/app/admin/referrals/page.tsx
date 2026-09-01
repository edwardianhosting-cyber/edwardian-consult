'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Referrals'
      description='Manage Referrals'
      icon={Users}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

