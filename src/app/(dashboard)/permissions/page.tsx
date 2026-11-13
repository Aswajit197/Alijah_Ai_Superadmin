'use client';

import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any[]>('/super/permissions');
      setPermissions(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const openCreateModal = () => {
    setEditingPerm(null);
    setId('');
    setName('');
    setCategory('General');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (perm: any) => {
    setEditingPerm(perm);
    setId(perm.id);
    setName(perm.name);
    setCategory(perm.category);
    setDescription(perm.description || '');
    setIsModalOpen(true);
  };

  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingPerm) {
        await apiRequest(`/super/permissions/${editingPerm.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            category,
            description,
          }),
        });
        setSuccessMessage(`Permission "${name}" updated successfully!`);
      } else {
        await apiRequest('/super/permissions', {
          method: 'POST',
          body: JSON.stringify({
            id: id.toLowerCase().replace(/[^a-z0-9_:]/g, '_'),
            name,
            category,
            description,
          }),
        });
        setSuccessMessage(`Permission "${name}" created successfully!`);
      }

      setIsModalOpen(false);
      loadPermissions();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async (perm: any) => {
    if (!confirm(`Are you sure you want to delete permission "${perm.name}" (${perm.id})? It will be removed from all roles.`)) return;

    try {
      await apiRequest(`/super/permissions/${perm.id}`, {
        method: 'DELETE',
      });
      setSuccessMessage(`Permission "${perm.name}" deleted.`);
      loadPermissions();
    } catch (err: any) {
      alert(`Cannot delete permission: ${err.message}`);
    }
  };

  // Extract unique categories
  const allCategories = ['ALL', ...Array.from(new Set(permissions.map((p) => p.category || 'General')))];

  const filteredPermissions = permissions.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Permissions Catalog</h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage granular platform action entitlements, categories, and descriptions.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Permission
        </Button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-400 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-muted hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-muted hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search permissions by name, key, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-100 placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-slate-100 hover:bg-surface-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Table & Cards */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading permissions...</span>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="py-12 text-center text-muted">
            <KeyRound className="w-8 h-8 mx-auto text-subtle mb-2" />
            <p className="text-sm font-medium">No permissions found matching your criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-elevated/60 text-xs font-semibold text-muted uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">Permission Name & Key</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Used by Roles</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPermissions.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-xs font-mono text-accent mt-0.5">{p.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{p.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted max-w-xs truncate">
                        {p.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          {p._count?.roles || 0} roles
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(p)}
                            className="text-subtle hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePermission(p)}
                            className="text-subtle hover:text-danger hover:bg-red-500/10 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredPermissions.map((p) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{p.name}</h3>
                      <code className="text-xs text-accent font-mono block mt-0.5">{p.id}</code>
                    </div>
                    <Badge variant="neutral">{p.category}</Badge>
                  </div>
                  {p.description && <p className="text-xs text-muted">{p.description}</p>}
                  <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/40">
                    <span>Used in: <strong>{p._count?.roles || 0} roles</strong></span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePermission(p)} className="text-danger">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add / Edit Permission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPerm ? `Edit Permission: ${editingPerm.name}` : 'Register New Platform Permission'}
        description="Permissions define granular authorization gates for features and API endpoints."
      >
        <form onSubmit={handleSavePermission} className="space-y-4">
          <Input
            label="Permission Key / ID"
            required
            disabled={!!editingPerm}
            placeholder="e.g. reports_export"
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_:]/g, '_'))}
            helper="Unique programmatic identifier used in backend checkPermission('...')"
          />

          <Input
            label="Display Name"
            required
            placeholder="e.g. Export Reports"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Category
            </label>
            <input
              type="text"
              required
              list="categories-list"
              placeholder="e.g. General, Inbox, Dispatch, Finance"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary"
            />
            <datalist id="categories-list">
              <option value="General" />
              <option value="Inbox" />
              <option value="Customers" />
              <option value="Dispatch" />
              <option value="Estimating" />
              <option value="Finance" />
              <option value="Needs You" />
              <option value="AI Team" />
              <option value="Knowledge" />
              <option value="Field" />
              <option value="Projects" />
              <option value="Settings" />
              <option value="Compliance" />
              <option value="Analytics" />
            </datalist>
          </div>

          <Input
            label="Description (Optional)"
            placeholder="Describe what this permission allows users to do"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingPerm ? 'Save Changes' : 'Create Permission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

