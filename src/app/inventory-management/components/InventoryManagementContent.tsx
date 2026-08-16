'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Download,
  RefreshCw,
  Package,
  X,
} from 'lucide-react';
import {
  isRowCritical,
  getDaysUntilExpiry,
  type Medicine,
  type MedicineCategory,
} from '@/data/mockInventory';
import { useInventory } from '@/context/InventoryContext';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

const ALL_CATEGORIES: MedicineCategory[] = [
  'Antibiotics',
  'Analgesics',
  'Antiviral',
  'Cardiovascular',
  'Vitamins',
  'Vaccines',
  'Antifungal',
  'Antihistamine',
];

type SortKey = keyof Pick<
  Medicine,
  'name' | 'category' | 'currentStock' | 'dailyDemand' | 'threshold' | 'expiryDate'
>;

const computeStatus = (stock: number, threshold: number): Medicine['status'] => {
  if (stock === 0) return 'Out of Stock';
  if (stock < threshold * 0.5) return 'Critical';
  if (stock < threshold) return 'Low Stock';
  return 'In Stock';
};

const EMPTY_FORM = {
  name: '',
  batchNo: '',
  productNo: '',
  category: 'Antibiotics' as MedicineCategory,
  currentStock: 0,
  dailyDemand: 1,
  threshold: 10,
  mfgDate: '',
  expiryDate: '',
  unit: 'Tablets',
  supplier: '',
};

export default function InventoryManagementContent() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, deleteMedicines } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MedicineCategory>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    return medicines
      .filter((m) => {
        const matchSearch =
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.batchNo.toLowerCase().includes(search.toLowerCase()) ||
          m.productNo.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'All' || m.category === categoryFilter;
        const matchStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [medicines, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleRow = (id: string) => {
    setSelectedRows((s) => s.includes(id) ? s.filter((r) => r !== id) : [...s, id]);
  };

  const toggleAll = () => {
    if (selectedRows.length === paginated.length) setSelectedRows([]);
    else setSelectedRows(paginated.map((m) => m.id));
  };

  const handleDelete = (id: string) => {
    deleteMedicine(id);
    setDeleteTarget(null);
    toast.success('Medicine record deleted');
  };

  const handleBulkDelete = () => {
    deleteMedicines(selectedRows);
    toast.success(`${selectedRows.length} records deleted`);
    setSelectedRows([]);
  };

  const handleExport = () => {
    toast.success('Inventory exported as CSV');
  };

  const handleAddMedicine = (form: typeof EMPTY_FORM) => {
    const newMedicine: Medicine = {
      ...form,
      id: `med-${Date.now()}`,
      status: computeStatus(Number(form.currentStock), Number(form.threshold)),
    };
    addMedicine(newMedicine);
    setShowAddModal(false);
    toast.success(`${form.name} added to inventory`);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp size={8} className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/40'} />
      <ChevronDown size={8} className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/40'} />
    </span>
  );

  const coverageDays = (m: Medicine) =>
    m.currentStock > 0 ? Math.floor(m.currentStock / m.dailyDemand) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {medicines.length} medicines · {medicines.filter(isRowCritical).length} require attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-all duration-150 active:scale-95"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-[#1D4ED8] transition-all duration-150 active:scale-95"
          >
            <Plus size={13} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-foreground', bg: 'bg-secondary' },
          {
            label: 'In Stock',
            value: medicines.filter((m) => m.status === 'In Stock').length,
            color: 'text-success',
            bg: 'bg-[#F0FDF4]',
          },
          {
            label: 'Low / Critical',
            value: medicines.filter((m) => m.status === 'Low Stock' || m.status === 'Critical').length,
            color: 'text-warning',
            bg: 'bg-[#FFFBEB]',
          },
          {
            label: 'Out of Stock',
            value: medicines.filter((m) => m.status === 'Out of Stock').length,
            color: 'text-danger',
            bg: 'bg-[#FEF2F2]',
          },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className={`card ${stat.bg} px-4 py-3 flex items-center gap-3`}>
            <div>
              <p className={`text-xl font-bold font-tabular ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, batch, or product no..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as any); setCurrentPage(1); }}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={`cat-opt-${c}`} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="text-xs rounded-lg border border-border bg-background px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical">Critical</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <button
          onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); setCurrentPage(1); }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={12} />
          Reset
        </button>

        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border"
                    aria-label="Select all rows"
                  />
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Batch No.</th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Product No.</th>
                <th
                  className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  Medicine Name <SortIcon col="name" />
                </th>
                <th
                  className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('category')}
                >
                  Category <SortIcon col="category" />
                </th>
                <th
                  className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('currentStock')}
                >
                  Stock <SortIcon col="currentStock" />
                </th>
                <th
                  className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('dailyDemand')}
                >
                  Daily Demand <SortIcon col="dailyDemand" />
                </th>
                <th
                  className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('threshold')}
                >
                  Threshold <SortIcon col="threshold" />
                </th>
                <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">
                  Coverage
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Mfg Date</th>
                <th
                  className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('expiryDate')}
                >
                  Expiry Date <SortIcon col="expiryDate" />
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={32} className="text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No medicines found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((med, i) => {
                  const critical = isRowCritical(med);
                  const daysToExpiry = getDaysUntilExpiry(med.expiryDate);
                  const expiryWarn = daysToExpiry <= 30 && daysToExpiry >= 0;
                  const isSelected = selectedRows.includes(med.id);
                  const coverage = coverageDays(med);
                  return (
                    <tr
                      key={`inv-row-${med.id}`}
                      className={`border-b border-border last:border-0 group transition-colors ${
                        isSelected
                          ? 'bg-secondary/50'
                          : critical
                          ? 'row-critical'
                          : i % 2 === 0
                          ? 'bg-white' : 'bg-muted/20'
                      } hover:bg-[#EFF6FF]`}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(med.id)}
                          className="rounded border-border"
                          aria-label={`Select ${med.name}`}
                        />
                      </td>
                      <td className="px-3 py-2.5 font-tabular text-muted-foreground whitespace-nowrap">{med.batchNo}</td>
                      <td className="px-3 py-2.5 font-tabular text-muted-foreground whitespace-nowrap">{med.productNo}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{med.name}</td>
                      <td className="px-3 py-2.5">
                        <span className="badge-info text-[10px]">{med.category}</span>
                      </td>
                      <td className={`px-3 py-2.5 text-right font-tabular font-semibold ${med.currentStock < med.threshold ? 'text-danger' : 'text-foreground'}`}>
                        {med.currentStock}
                      </td>
                      <td className="px-3 py-2.5 text-right font-tabular text-foreground">{med.dailyDemand}</td>
                      <td className="px-3 py-2.5 text-right font-tabular text-muted-foreground">{med.threshold}</td>
                      <td className={`px-3 py-2.5 text-right font-tabular font-semibold ${coverage <= 3 ? 'text-danger' : coverage <= 7 ? 'text-warning' : 'text-success'}`}>
                        {coverage}d
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap font-tabular">{med.mfgDate}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap font-tabular ${expiryWarn ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
                        {med.expiryDate}
                        {expiryWarn && daysToExpiry >= 0 && (
                          <span className="ml-1 text-[9px]">({daysToExpiry}d)</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={med.status} size="sm" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => setEditTarget(med)}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                            title="Edit medicine record"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(med.id)}
                            className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-muted-foreground hover:text-danger transition-colors"
                            title="Delete medicine record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}–
            {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} medicines
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={`page-${page}`}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl card shadow-xl border-primary/20 bg-card animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold text-foreground">{selectedRows.length} selected</span>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger text-white hover:bg-[#B91C1C] transition-all duration-150 active:scale-95"
          >
            <Trash2 size={12} />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedRows([])}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                <Trash2 size={18} className="text-danger" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Delete Medicine Record</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this medicine record from the inventory database?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted text-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-danger text-white hover:bg-[#B91C1C] transition-all duration-150 active:scale-95"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditMedicineModal
          medicine={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            updateMedicine(updated);
            setEditTarget(null);
            toast.success(`${updated.name} updated successfully`);
          }}
        />
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <AddMedicineModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMedicine}
        />
      )}
    </div>
  );
}

function AddMedicineModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (form: typeof EMPTY_FORM) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (!form.batchNo.trim()) newErrors.batchNo = 'Required';
    if (!form.productNo.trim()) newErrors.productNo = 'Required';
    if (!form.mfgDate) newErrors.mfgDate = 'Required';
    if (!form.expiryDate) newErrors.expiryDate = 'Required';
    if (!form.supplier.trim()) newErrors.supplier = 'Required';
    if (Number(form.currentStock) < 0) newErrors.currentStock = 'Must be ≥ 0';
    if (Number(form.dailyDemand) < 1) newErrors.dailyDemand = 'Must be ≥ 1';
    if (Number(form.threshold) < 1) newErrors.threshold = 'Must be ≥ 1';
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onAdd(form);
  };

  const fields: Array<{ field: keyof typeof EMPTY_FORM; label: string; type: string; span: 1 | 2 }> = [
    { field: 'name', label: 'Medicine Name', type: 'text', span: 2 },
    { field: 'batchNo', label: 'Batch No.', type: 'text', span: 1 },
    { field: 'productNo', label: 'Product No.', type: 'text', span: 1 },
    { field: 'currentStock', label: 'Current Stock', type: 'number', span: 1 },
    { field: 'dailyDemand', label: 'Daily Demand', type: 'number', span: 1 },
    { field: 'threshold', label: 'Min Threshold', type: 'number', span: 1 },
    { field: 'unit', label: 'Unit (e.g. Tablets)', type: 'text', span: 1 },
    { field: 'mfgDate', label: 'Mfg Date', type: 'date', span: 1 },
    { field: 'expiryDate', label: 'Expiry Date', type: 'date', span: 1 },
    { field: 'supplier', label: 'Supplier', type: 'text', span: 2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-[440px] max-h-[90vh] overflow-y-auto flex flex-col gap-4 border border-border scrollbar-thin">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Add New Medicine</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to add a new medicine record</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ field, label, type, span }) => (
            <div key={`add-field-${field}`} className={span === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-foreground mb-1">
                {label}
                {errors[field] && (
                  <span className="ml-1 text-[10px] text-danger font-normal">{errors[field]}</span>
                )}
              </label>
              <input
                type={type}
                value={String(form[field])}
                min={type === 'number' ? 0 : undefined}
                onChange={(e) =>
                  handleChange(field, type === 'number' ? Number(e.target.value) : e.target.value)
                }
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  errors[field] ? 'border-danger' : 'border-border'
                }`}
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={`add-cat-${c}`} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted text-foreground hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-[#1D4ED8] transition-all duration-150 active:scale-95"
          >
            Add Medicine
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMedicineModal({
  medicine,
  onClose,
  onSave,
}: {
  medicine: Medicine;
  onClose: () => void;
  onSave: (m: Medicine) => void;
}) {
  const [form, setForm] = useState({ ...medicine });

  const handleChange = (field: keyof Medicine, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const computeStatus = (stock: number, threshold: number): Medicine['status'] => {
    if (stock === 0) return 'Out of Stock';
    if (stock < threshold * 0.5) return 'Critical';
    if (stock < threshold) return 'Low Stock';
    return 'In Stock';
  };

  const handleSave = () => {
    const updated = {
      ...form,
      status: computeStatus(Number(form.currentStock), Number(form.threshold)),
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-[420px] max-h-[90vh] overflow-y-auto flex flex-col gap-4 border border-border scrollbar-thin">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Edit Medicine Record</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { field: 'name', label: 'Medicine Name', type: 'text', span: 2 },
              { field: 'batchNo', label: 'Batch No.', type: 'text', span: 1 },
              { field: 'productNo', label: 'Product No.', type: 'text', span: 1 },
              { field: 'currentStock', label: 'Current Stock', type: 'number', span: 1 },
              { field: 'dailyDemand', label: 'Daily Demand', type: 'number', span: 1 },
              { field: 'threshold', label: 'Min Threshold', type: 'number', span: 1 },
              { field: 'mfgDate', label: 'Mfg Date', type: 'date', span: 1 },
              { field: 'expiryDate', label: 'Expiry Date', type: 'date', span: 1 },
              { field: 'supplier', label: 'Supplier', type: 'text', span: 2 },
            ] as const
          ).map(({ field, label, type, span }) => (
            <div key={`edit-field-${field}`} className={span === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
              <input
                type={type}
                value={String(form[field as keyof Medicine])}
                onChange={(e) =>
                  handleChange(
                    field as keyof Medicine,
                    type === 'number' ? Number(e.target.value) : e.target.value
                  )
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={`edit-cat-${c}`} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted text-foreground hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-[#1D4ED8] transition-all duration-150 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}