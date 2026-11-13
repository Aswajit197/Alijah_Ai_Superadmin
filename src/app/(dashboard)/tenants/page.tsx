'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Tenant Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tradeType, setTradeType] = useState('HVAC');
  const [plan, setPlan] = useState('GROWTH');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('DesertAir2026!');

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any[]>('/super/tenants');
      setTenants(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await apiRequest('/super/tenants', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug,
          tradeType,
          plan,
          phone: phone || undefined,
          address: address || undefined,
          ownerName,
          ownerEmail,
          ownerPassword: ownerPassword || undefined,
        }),
      });

      setSuccessMessage(
        `Tenant "${result.tenant.name}" created! Owner: ${result.ownerUser.email}`
      );
      setIsModalOpen(false);
      // Reset form
      setName('');
      setSlug('');
      setOwnerName('');
      setOwnerEmail('');
      loadTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: any) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiRequest(`/super/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadTenants();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.tradeType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Companies / Tenants</h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage multi-tenant trade contractor instances and subscriptions.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Tenant
        </Button>
      </div>

      {/* Success / Error Alerts */}
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

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by company name, slug, trade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-100 placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Tenants Table (Desktop) & Cards (Mobile) */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading companies...</span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="py-12 text-center text-muted">
            <Building2 className="w-8 h-8 mx-auto text-subtle mb-2" />
            <p className="text-sm font-medium">No tenants found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-elevated/60 text-xs font-semibold text-muted uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Trade</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Users</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-xs text-muted">
                          Slug: <code className="text-accent">{t.slug}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{t.tradeType}</td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{t.plan}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-muted" />
                          {t._count?.users || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={t.status === 'ACTIVE' ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(t)}
                          className={t.status === 'ACTIVE' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredTenants.map((t) => (
                <div key={t.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{t.name}</h3>
                      <p className="text-xs text-muted">
                        Slug: <code className="text-accent">{t.slug}</code> · {t.tradeType}
                      </p>
                    </div>
                    <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {t.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/40">
                    <span>Plan: <strong className="text-slate-200">{t.plan}</strong></span>
                    <span>Staff: <strong className="text-slate-200">{t._count?.users || 0}</strong></span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleToggleStatus(t)}
                    >
                      {t.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Create Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Tenant Company"
        description="Initializes a new contractor tenant and automatically provisions the Owner account."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              required
              placeholder="e.g. Apex Plumbing Co."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <Input
              label="Company Slug / Code"
              required
              placeholder="e.g. apex-plumbing"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              helper="Used for unique tenant identification"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Trade Type
              </label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value="HVAC">HVAC</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="ROOFING">Roofing</option>
                <option value="REMODELING">Remodeling</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="LANDSCAPING">Landscaping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Subscription Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value="STARTER">Starter ($399/mo)</option>
                <option value="GROWTH">Growth ($899/mo)</option>
                <option value="OPERATIONS">Operations ($1,800/mo)</option>
                <option value="ENTERPRISE">Enterprise (Custom)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">
              Initial Owner Account (Required)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                required
                placeholder="e.g. John Doe"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />

              <Input
                label="Owner Email"
                type="email"
                required
                placeholder="owner@apexplumbing.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>

            <div className="mt-3">
              <Input
                label="Temporary Password"
                type="password"
                placeholder="DesertAir2026!"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                helper="Owner can change password upon initial login."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Tenant & Owner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

