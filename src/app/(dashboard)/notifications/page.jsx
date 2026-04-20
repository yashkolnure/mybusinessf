'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { PageHeader, EmptyState, Skeleton } from '@/components/ui/index.jsx';
import { timeAgo } from '@/lib/utils';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 50 }).then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { toast.success('All marked as read.'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data || [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        actions={unread > 0 && (
          <button className="btn-secondary" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      />

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} style={{ height: '60px', borderRadius: '8px' }} />)}
          </div>
        ) : !notifications.length ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
        ) : (
          <div>
            {notifications.map((n) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border-subtle)', background: n.isRead ? 'transparent' : 'var(--bg-hover)', transition: 'background 150ms' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 2px' }}>{n.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>{n.message}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{timeAgo(n.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!n.isRead && (
                    <button className="btn-ghost btn-icon" title="Mark read" onClick={() => markReadMutation.mutate(n.id)}><Check size={13} /></button>
                  )}
                  <button className="btn-ghost btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => deleteMutation.mutate(n.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
