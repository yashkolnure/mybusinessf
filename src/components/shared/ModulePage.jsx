// ============================================================
// SHARED MODULE PAGE TEMPLATE
// Used as base for quotations, workforce, vendors,
// inventory, finance, reports, settings, notifications
// ============================================================
'use client';
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/components/ui/index.jsx';

// ── Each module exports its own page that can be built out ──

export function ModulePage({ title, subtitle, icon: Icon, addHref, addLabel, children }) {
  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={addHref && (
          <Link href={addHref} className="btn-primary">{addLabel}</Link>
        )}
      />
      {children || (
        <EmptyState
          icon={Icon}
          title={`${title} coming soon`}
          description="This module is ready to be built out."
        />
      )}
    </div>
  );
}
