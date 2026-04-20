'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { Search, Package, PenLine } from 'lucide-react';

/**
 * Combo-box: search inventory products OR type freely.
 * onChange(selected) — selected is { name, unitPrice, taxRate, unit } or { name: typedString }
 */
export default function ProductSelect({ onSelect, placeholder = 'Search products or type description…' }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const { data } = useQuery({
    queryKey: ['products-select', query],
    queryFn:  () => inventoryApi.list({ search: query, limit: 20 }).then(r => r.data),
    enabled:  open,
  });

  const products = data?.data || [];

  const pick = (p) => {
    onSelect({
      description: p.name,
      unitPrice:   p.sellingPrice,
      taxRate:     p.taxRate || 18,
      unit:        p.unit || '',
      productId:   p.id,
    });
    setOpen(false);
    setQuery('');
  };

  const useManual = () => {
    if (query.trim()) {
      onSelect({ description: query.trim(), unitPrice: 0, taxRate: 18, unit: '' });
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
        <input
          className="input"
          style={{ paddingLeft:'32px', fontSize:'13px', height:'36px' }}
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:60, borderRadius:'10px', overflow:'hidden', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-lg)', maxHeight:'240px', overflowY:'auto' }}>
          {/* Manual entry option */}
          {query.trim() && (
            <button type="button" onClick={useManual}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--primary-muted)', border:'none', cursor:'pointer', textAlign:'left', borderBottom:'1px solid var(--border-subtle)' }}>
              <PenLine size={13} style={{ color:'var(--primary)', flexShrink:0 }} />
              <div>
                <p style={{ fontSize:'13px', fontWeight:600, color:'var(--primary)', margin:0 }}>Use "{query}" as description</p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>Manual entry — set price manually</p>
              </div>
            </button>
          )}

          {products.length === 0 && !query.trim() && (
            <div style={{ padding:'16px', textAlign:'center', fontSize:'13px', color:'var(--text-muted)' }}>
              Type to search inventory products…
            </div>
          )}

          {products.map(p => (
            <button key={p.id} type="button" onClick={() => pick(p)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', borderBottom:'1px solid var(--border-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Package size={13} style={{ color:'var(--text-muted)', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'13px', fontWeight:500, color:'var(--text-primary)', margin:0 }}>{p.name}</p>
                <div style={{ display:'flex', gap:'8px', marginTop:'2px' }}>
                  {p.sku && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>SKU: {p.sku}</span>}
                  {p.sellingPrice > 0 && <span style={{ fontSize:'11px', color:'#4ade80' }}>₹{p.sellingPrice}</span>}
                  {!p.isService && <span style={{ fontSize:'11px', color: p.currentStock <= p.lowStockThreshold ? '#f87171':'var(--text-muted)' }}>Stock: {p.currentStock}</span>}
                  {p.taxRate > 0 && <span style={{ fontSize:'11px', color:'#fcd34d' }}>GST {p.taxRate}%</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
