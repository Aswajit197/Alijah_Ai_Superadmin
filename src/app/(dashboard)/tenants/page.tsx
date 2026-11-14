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
  Power,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface CreatedInviteDetails {
  tenantName: string;
  ownerEmail: string;
  ownerName: string;
  inviteLink: string;
  inviteExpiresAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invitation Success Modal State
  const [createdInvite, setCreatedInvite] = useState<CreatedInviteDetails | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Resend Invite State
  const [resendingId, setResendingId] = useState<string | null>(null);

  // New Tenant Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tradeType, setTradeType] = useState('HVAC');
  const [plan, setPlan] = useState('GROWTH');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

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
      const result = await apiRequest<any>('/super/tenants', {
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
        }),
      });

      // Show the invitation modal with the single-use setup link
      setCreatedInvite({
        tenantName: result.tenant.name,
        ownerEmail: result.ownerUser.email,
        ownerName: result.ownerUser.name,
        inviteLink: result.inviteLink,
        inviteExpiresAt: result.inviteExpiresAt,
      });

      setIsModalOpen(false);
      // Reset form
      setName('');
      setSlug('');
      setOwnerName('');
      setOwnerEmail('');
      setPhone('');
      setAddress('');

      loadTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleResendInvite = async (tenantId: string) => {
    setResendingId(tenantId);
    try {
      const result = await apiRequest<any>(`/super/tenants/${tenantId}/resend-invite`, {
        method: 'POST',
      });

      // Show copied prompt or alert
      handleCopyInviteLink(result.inviteLink);
      setSuccessMessage(`New 24-hour invitation link generated and copied to clipboard for ${result.ownerEmail}!`);
      loadTenants();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
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
            Manage multi-tenant trade contractor instances and onboarding invitations.
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
                    <th className="px-6 py-3.5">Owner / Contact</th>
                    <th className="px-6 py-3.5">Onboarding</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Staff</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTenants.map((t) => {
                    const owner = t.users?.[0];
                    const isInvitePending = owner && !owner.isInviteAccepted;

                    return (
                      <tr key={t.id} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{t.name}</div>
                          <div className="text-xs text-muted">
                            Slug: <code className="text-accent">{t.slug}</code> · {t.tradeType}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-200 font-medium">{owner?.name || 'Unassigned'}</div>
                          <div className="text-xs text-muted font-mono">{owner?.email || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {isInvitePending ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                <span>Pending Setup</span>
                              </span>
                              <div>
                                <button
                                  onClick={() => handleResendInvite(t.id)}
                                  disabled={resendingId === t.id}
                                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3 h-3 ${resendingId === t.id ? 'animate-spin' : ''}`} />
                                  <span>Resend Link</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredTenants.map((t) => {
                const owner = t.users?.[0];
                const isInvitePending = owner && !owner.isInviteAccepted;

                return (
                  <div key={t.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{t.name}</h3>
                        <p className="text-xs text-muted">
                          Slug: <code className="text-accent">{t.slug}</code> · {t.tradeType}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Owner: <strong>{owner?.email || '—'}</strong>
                        </p>
                      </div>
                      <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {t.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/40">
                      <span>Plan: <strong className="text-slate-200">{t.plan}</strong></span>
                      <span>Staff: <strong className="text-slate-200">{t._count?.users || 0}</strong></span>
                      {isInvitePending ? (
                        <span className="text-amber-400 font-medium">Pending Setup</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Active</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {isInvitePending && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleResendInvite(t.id)}
                          disabled={resendingId === t.id}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${resendingId === t.id ? 'animate-spin' : ''}`} />
                          Resend Link
                        </Button>
                      )}
                      <Button
                        variant={t.status === 'ACTIVE' ? 'ghost' : 'outline'}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleToggleStatus(t)}
                      >
                        {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Modal 1: Create Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Contractor Company"
        description="Creates the tenant instance and issues a single-use onboarding link to the Owner."
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
              helper="Unique subdomain / identifier"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Owner Account Details</span>
            </h4>
            <p className="text-xs text-muted mb-3">
              This email will be the primary login ID for the company owner. A one-time activation link will be issued to set their password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                required
                placeholder="e.g. Marcus Vance"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />

              <Input
                label="Owner Email (Login ID)"
                type="email"
                required
                placeholder="owner@apexplumbing.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>

            <div className="mt-3 p-3 rounded-xl bg-surface-elevated/70 border border-border flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-ai shrink-0" />
              <span>
                <strong>Password Policy:</strong> No manual password required. The owner will set their own password via the 24-hour setup link.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Tenant & Generate Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Invitation Created & Ready */}
      <Modal
        isOpen={!!createdInvite}
        onClose={() => setCreatedInvite(null)}
        title="Tenant Created & Invitation Dispatched"
        description="The company instance is live. Share or preview the password setup link below."
        maxWidth="lg"
      >
        {createdInvite && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {createdInvite.tenantName} is provisioned!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Owner <strong>{createdInvite.ownerName}</strong> ({createdInvite.ownerEmail}) has been assigned the <code>owner</code> role.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Time Set Password Link (Valid 24 Hours)</span>
                </span>
                <span className="text-[11px] text-muted font-mono">Expires in 24h</span>
              </div>

              <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between gap-3 font-mono text-xs text-accent break-all">
                <span className="truncate">{createdInvite.inviteLink}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyInviteLink(createdInvite.inviteLink)}
                  className="shrink-0 gap-1.5 text-xs h-8"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-muted leading-relaxed">
              💡 <strong>Email Delivery:</strong> An email has been dispatched via the mail service. You can also send this link directly to the client via SMS or open it in a new tab to test the owner setup immediately.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <a
                href={createdInvite.inviteLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-border/60 text-white border border-border transition-colors"
              >
                <span>Open Link in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Button onClick={() => setCreatedInvite(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
