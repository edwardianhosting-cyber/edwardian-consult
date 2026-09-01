'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Trophy } from 'lucide-react';

export default function AdminPage() {
  return (
    <PlaceholderPage
      title='Leaderboard'
      description='Manage Leaderboard'
      icon={Trophy}
      features={['Feature 1', 'Feature 2', 'Feature 3']}
    />
  );
}

