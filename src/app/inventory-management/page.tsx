import React from 'react';
import AppLayout from '@/components/AppLayout';
import InventoryManagementContent from './components/InventoryManagementContent';

export default function InventoryManagementPage() {
  return (
    <AppLayout>
      <InventoryManagementContent />
    </AppLayout>
  );
}