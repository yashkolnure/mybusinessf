import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// ── Class merger ─────────────────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Currency formatter ───────────────────────────────────────────────────────
export function formatCurrency(amount, symbol = '₹') {
  if (amount === null || amount === undefined) return `${symbol}0.00`;
  return `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Date formatters ──────────────────────────────────────────────────────────
export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isToday(d))     return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'dd MMM yyyy, h:mm a');
}

export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ── Status badge configs ─────────────────────────────────────────────────────
export const INVOICE_STATUS = {
  DRAFT:          { label: 'Draft',           class: 'badge-neutral'  },
  SENT:           { label: 'Sent',            class: 'badge-info'     },
  VIEWED:         { label: 'Viewed',          class: 'badge-info'     },
  PARTIALLY_PAID: { label: 'Partial',         class: 'badge-warning'  },
  PAID:           { label: 'Paid',            class: 'badge-success'  },
  OVERDUE:        { label: 'Overdue',         class: 'badge-danger'   },
  CANCELLED:      { label: 'Cancelled',       class: 'badge-neutral'  },
  REFUNDED:       { label: 'Refunded',        class: 'badge-warning'  },
};

export const QUOTATION_STATUS = {
  DRAFT:     { label: 'Draft',     class: 'badge-neutral' },
  SENT:      { label: 'Sent',      class: 'badge-info'    },
  VIEWED:    { label: 'Viewed',    class: 'badge-info'    },
  APPROVED:  { label: 'Approved',  class: 'badge-success' },
  REJECTED:  { label: 'Rejected',  class: 'badge-danger'  },
  CONVERTED: { label: 'Converted', class: 'badge-primary' },
  EXPIRED:   { label: 'Expired',   class: 'badge-neutral' },
};

export const LEAVE_STATUS = {
  PENDING:   { label: 'Pending',   class: 'badge-warning' },
  APPROVED:  { label: 'Approved',  class: 'badge-success' },
  REJECTED:  { label: 'Rejected',  class: 'badge-danger'  },
  CANCELLED: { label: 'Cancelled', class: 'badge-neutral' },
};

export const SALARY_STATUS = {
  PENDING:    { label: 'Pending',    class: 'badge-warning' },
  PROCESSING: { label: 'Processing', class: 'badge-info'    },
  PAID:       { label: 'Paid',       class: 'badge-success' },
  ON_HOLD:    { label: 'On Hold',    class: 'badge-danger'  },
};

// ── Pluraliser ───────────────────────────────────────────────────────────────
export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : (plural || singular + 's')}`;
}

// ── Download blob ─────────────────────────────────────────────────────────────
export function downloadBlob(blob, filename) {
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ── Truncate ─────────────────────────────────────────────────────────────────
export function truncate(str, n = 30) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

// ── Initials ─────────────────────────────────────────────────────────────────
export function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}
