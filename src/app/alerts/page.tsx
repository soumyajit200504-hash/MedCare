import React from 'react';
import AppLayout from '@/components/AppLayout';
import AlertsPageContent from './components/AlertsPageContent';
import AlertsRightSidebar from './components/AlertsRightSidebar';

export default function AlertsPage() {
  return (
    <AppLayout rightSidebar={<AlertsRightSidebar />}>
      <AlertsPageContent />
    </AppLayout>
  );
}