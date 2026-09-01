'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { MessageSquare } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Email Campaigns'
      description='Manage Email Campaigns'
      icon={MessageSquare}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

