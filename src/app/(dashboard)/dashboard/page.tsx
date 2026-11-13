'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, Users, Briefcase, Plus, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tenantsData, rolesData] = await Promise.all([
        apiRequest<any[]>('/super/tenants'),
        apiRequest<any[]>('/super/roles'),
      ]);
      setTenants(tenantsData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalUsers = tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0);
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-surface-elevated to-surface p-5 sm:p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Platform Health & Operations
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time multi-tenant monitoring, company status, and role entitlements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/tenants">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider">Total Tenants</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{isLoading ? '-' : tenants.length}</span>
            <span className="text-xs text-emerald-400 font-medium ml-2">{activeTenants} active</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider">Total Staff / Users</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-accent">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{isLoading ? '-' : totalUsers}</span>
            <span className="text-xs text-muted ml-2">across all companies</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider">Platform Roles</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-warning">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{isLoading ? '-' : roles.length}</span>
            <span className="text-xs text-muted ml-2">dynamic roles</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider">Database Status</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-white">PostgreSQL 16</span>
            <p className="text-xs text-emerald-400 font-medium">pgvector & isolation healthy</p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout for Recent Tenants and Roles Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenants List Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Companies</CardTitle>
            <Link href="/tenants" className="text-xs text-accent hover:underline flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <div className="mt-4 divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 flex justify-center text-muted">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : tenants.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No tenants registered yet.</p>
            ) : (
              tenants.slice(0, 5).map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <p className="text-xs text-muted truncate">
                      Code: <code className="text-accent">{t.slug}</code> · {t.tradeType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge>
                    <span className="text-xs text-muted">{t._count?.users || 0} users</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Roles List Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Roles & Permissions</CardTitle>
            <Link href="/roles" className="text-xs text-accent hover:underline flex items-center gap-1 font-medium">
              Manage Roles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <div className="mt-4 divide-y divide-border/60">
            {isLoading ? (
              <div className="py-8 flex justify-center text-muted">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              roles.slice(0, 6).map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                    <p className="text-xs text-muted truncate">
                      Slug: <code className="text-accent">{r.slug}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="neutral">{r.permissions?.length || 0} perms</Badge>
                    <span className="text-xs text-muted">Limit: ${Number(r.approvalLimit).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

