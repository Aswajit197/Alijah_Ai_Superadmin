'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [approvalLimit, setApprovalLimit] = useState<number>(0);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        apiRequest<any[]>('/super/roles'),
        apiRequest<any[]>('/super/permissions'),
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permsData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setName('');
    setSlug('');
    setDescription('');
    setApprovalLimit(0);
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setName(role.name);
    setSlug(role.slug);
    setDescription(role.description || '');
    setApprovalLimit(Number(role.approvalLimit) || 0);
    const existingPermIds = role.permissions.map((p: any) => p.permissionId || p.permission?.id);
    setSelectedPermissions(existingPermIds);
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const selectAllCategory = (categoryPerms: any[]) => {
    const ids = categoryPerms.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingRole) {
        // Update
        await apiRequest(`/super/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            description,
            approvalLimit: Number(approvalLimit),
            permissions: selectedPermissions,
          }),
        });
        setSuccessMessage(`Role "${name}" updated successfully!`);
      } else {
        // Create
        await apiRequest('/super/roles', {
          method: 'POST',
          body: JSON.stringify({
            name,
            slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
            description,
            approvalLimit: Number(approvalLimit),
            permissions: selectedPermissions,
          }),
        });
        setSuccessMessage(`Role "${name}" created successfully!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: any) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      await apiRequest(`/super/roles/${role.id}`, {
        method: 'DELETE',
      });
      setSuccessMessage(`Role "${role.name}" deleted.`);
      loadData();
    } catch (err: any) {
      alert(`Cannot delete role: ${err.message}`);
    }
  };

  // Group permissions by category
  const categories = availablePermissions.reduce((acc: Record<string, any[]>, perm) => {
    const cat = perm.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Platform Roles & Permissions</h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Configure dynamic platform roles, entitlements, and financial approval thresholds.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Role
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

      {/* Roles Grid (Responsive Cards) */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs">Loading roles...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => {
            const permCount = r.permissions?.length || 0;
            const userCount = r._count?.users || 0;
            const limit = Number(r.approvalLimit);

            return (
              <Card key={r.id} className="flex flex-col justify-between hover:border-border-hover">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{r.name}</h3>
                      <code className="text-xs text-accent font-mono block mt-0.5">{r.slug}</code>
                    </div>
                    <Badge variant={limit > 0 ? 'success' : 'neutral'}>
                      {limit >= 99999999 ? 'Unlimited Approval' : limit > 0 ? `$${limit.toLocaleString()} Limit` : '$0 Limit'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted mt-3 line-clamp-2">
                    {r.description || 'Standard operational role for company staff members.'}
                  </p>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/60 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      <strong className="text-slate-200">{permCount}</strong> permissions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-subtle" />
                      <strong className="text-slate-200">{userCount}</strong> assigned
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border/80">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openEditModal(r)}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit Role
                  </Button>
                  {r.slug !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(r)}
                      className="text-subtle hover:text-danger hover:bg-red-500/10 px-2.5"
                      title="Delete Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create Dynamic Platform Role'}
        description="Configure permissions and financial approval thresholds for this role."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveRole} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role Display Name"
              required
              placeholder="e.g. Lead Dispatcher"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingRole) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'));
                }
              }}
            />

            <Input
              label="Role Slug"
              required
              disabled={!!editingRole}
              placeholder="e.g. lead_dispatcher"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'))}
              helper="Unique programmatic identifier"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Financial Approval Threshold ($)"
              type="number"
              min={0}
              required
              value={approvalLimit}
              onChange={(e) => setApprovalLimit(parseFloat(e.target.value) || 0)}
              helper="Maximum $ quote/discount amount this role can approve autonomously."
            />

            <Input
              label="Description (Optional)"
              placeholder="Short explanation of responsibilities"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Granular Permission Checkbox Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-accent">
                Select Permissions ({selectedPermissions.length} selected)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedPermissions.length === availablePermissions.length) {
                    setSelectedPermissions([]);
                  } else {
                    setSelectedPermissions(availablePermissions.map((p) => p.id));
                  }
                }}
                className="text-xs text-accent hover:underline font-medium"
              >
                {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All (35)'}
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 rounded-xl bg-surface p-4 border border-border">
              {Object.entries(categories).map(([category, perms]) => {
                const categoryPermIds = perms.map((p) => p.id);
                const isAllSelected = categoryPermIds.every((id) => selectedPermissions.includes(id));

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted border-b border-border/50 pb-1">
                      <span>{category}</span>
                      <button
                        type="button"
                        onClick={() => selectAllCategory(perms)}
                        className="text-[11px] text-subtle hover:text-white"
                      >
                        {isAllSelected ? 'Deselect' : 'Select category'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-primary/10 border-primary/40 text-slate-100'
                                : 'bg-surface-elevated/40 border-border/40 text-muted hover:border-border'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.id)}
                              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                            />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-[10px] text-subtle truncate">{p.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingRole ? 'Save Changes' : 'Create Platform Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

