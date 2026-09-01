'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Newspaper } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Announcements'
      description='Manage Announcements'
      icon={Newspaper}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

