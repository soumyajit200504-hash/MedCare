'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { medicines as initialMedicines, type Medicine } from '@/data/mockInventory';

interface InventoryContextValue {
  medicines: Medicine[];
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
  deleteMedicines: (ids: string[]) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  const addMedicine = useCallback((medicine: Medicine) => {
    setMedicines((prev) => [medicine, ...prev]);
  }, []);

  const updateMedicine = useCallback((medicine: Medicine) => {
    setMedicines((prev) => prev.map((m) => (m.id === medicine.id ? medicine : m)));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const deleteMedicines = useCallback((ids: string[]) => {
    setMedicines((prev) => prev.filter((m) => !ids.includes(m.id)));
  }, []);

  return (
    <InventoryContext.Provider value={{ medicines, addMedicine, updateMedicine, deleteMedicine, deleteMedicines }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
