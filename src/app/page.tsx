import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardContent from './components/DashboardContent';
import DashboardRightSidebar from './components/DashboardRightSidebar';

export default function DashboardPage() {
  return (
    <AppLayout rightSidebar={<DashboardRightSidebar />}>
      <DashboardContent />
    </AppLayout>
  );
}