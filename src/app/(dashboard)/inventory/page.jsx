'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency } from '@/lib/utils';
import { Plus, Package, AlertTriangle, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

function ProductModal({ open, onClose, product }) {
  const qc = useQueryClient();
  const isEdit = !!product;
  const [form, setForm] = useState(product || { name:'', sku:'', category:'', unit:'PCS', sellingPrice:'', costPrice:'', taxRate:18, hsnCode:'', currentStock:0, lowStockThreshold:10, isService:false, description:'' });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data };
      ['sellingPrice','costPrice','taxRate','currentStock','lowStockThreshold'].forEach(k => {
        if (d[k] !== undefined) d[k] = parseFloat(d[k]) || 0;
      });
      if (d.isService === 'true') d.isService = true;
      if (d.isService === 'false') d.isService = false;
      return isEdit ? inventoryApi.update(product.id, d) : inventoryApi.create(d);
    },
    onSuccess: () => { toast.success(isEdit ? 'Updated.' : 'Product created.'); qc.invalidateQueries({ queryKey: ['products'] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product/Service'} size="lg"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size={13}/> : isEdit ? 'Update' : 'Add Product'}
        </button></>}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <FormField label="Product Name *"><input className="input" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Product name"/></FormField>
        <FormField label="SKU"><input className="input" value={form.sku||''} onChange={e=>upd('sku',e.target.value)} placeholder="PROD-001"/></FormField>
        <FormField label="Category"><input className="input" value={form.category||''} onChange={e=>upd('category',e.target.value)} placeholder="Electronics"/></FormField>
        <FormField label="Unit"><select className="input" value={form.unit} onChange={e=>upd('unit',e.target.value)}>{['PCS','KG','LTR','MTR','BOX','DOZEN','PAIR'].map(u=><option key={u} value={u}>{u}</option>)}</select></FormField>
        <FormField label="Selling Price *"><input type="number" min="0" step="0.01" className="input" value={form.sellingPrice} onChange={e=>upd('sellingPrice',e.target.value)}/></FormField>
        <FormField label="Cost Price"><input type="number" min="0" step="0.01" className="input" value={form.costPrice||0} onChange={e=>upd('costPrice',e.target.value)}/></FormField>
        <FormField label="GST Rate (%)"><input type="number" min="0" max="100" className="input" value={form.taxRate} onChange={e=>upd('taxRate',e.target.value)}/></FormField>
        <FormField label="HSN/SAC Code"><input className="input" value={form.hsnCode||''} onChange={e=>upd('hsnCode',e.target.value)} placeholder="998314"/></FormField>
        {!isEdit && <><FormField label="Opening Stock"><input type="number" min="0" className="input" value={form.currentStock} onChange={e=>upd('currentStock',e.target.value)}/></FormField></>}
        <FormField label="Low Stock Alert (qty)"><input type="number" min="0" className="input" value={form.lowStockThreshold} onChange={e=>upd('lowStockThreshold',e.target.value)}/></FormField>
      </div>
      <div style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'10px' }}>
        <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px', color:'var(--text-primary)' }}>
          <input type="checkbox" checked={form.isService} onChange={e=>upd('isService',e.target.checked)} style={{ width:'16px', height:'16px', accentColor:'var(--primary)' }}/>
          This is a service (no stock tracking)
        </label>
      </div>
      <div style={{ marginTop:'14px' }}>
        <FormField label="Description"><textarea className="input" rows={2} value={form.description||''} onChange={e=>upd('description',e.target.value)} style={{ resize:'vertical' }}/></FormField>
      </div>
    </Modal>
  );
}

function StockAdjustModal({ open, onClose, product, currencySymbol }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type:'IN', quantity:'', notes:'' });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data, quantity: parseFloat(data.quantity) || 0 };
      return inventoryApi.adjustStock(product.id, d);
    },
    onSuccess: () => { toast.success('Stock adjusted.'); qc.invalidateQueries({ queryKey: ['products'] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title={`Adjust Stock — ${product?.name}`}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.quantity}>
          {mutation.isPending ? <Spinner size={13}/> : 'Adjust'}
        </button></>}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <div style={{ padding:'12px', borderRadius:'10px', background:'var(--bg-surface)' }}>
          <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>Current stock: <strong style={{ color:'var(--text-primary)' }}>{product?.currentStock} {product?.unit}</strong></p>
        </div>
        <FormField label="Adjustment Type">
          <select className="input" value={form.type} onChange={e=>upd('type',e.target.value)}>
            <option value="IN">Stock In (add)</option>
            <option value="OUT">Stock Out (remove)</option>
            <option value="ADJUSTMENT">Set to Exact Amount</option>
            <option value="RETURN">Return</option>
          </select>
        </FormField>
        <FormField label="Quantity *"><input type="number" min="0.01" step="0.01" className="input" value={form.quantity} onChange={e=>upd('quantity',e.target.value)} placeholder="Enter quantity"/></FormField>
        <FormField label="Notes"><input className="input" value={form.notes} onChange={e=>upd('notes',e.target.value)} placeholder="Reason for adjustment…"/></FormField>
      </div>
    </Modal>
  );
}

export default function InventoryPage() {
  const { can, currencySymbol } = useAuth();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get('modal') === 'add') {
      setEditProduct(null);
      setProductModal(true);
    }
  }, [searchParams]);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data: summary } = useQuery({ queryKey: ['inventory-summary'], queryFn: () => inventoryApi.summary().then(r=>r.data.data) });
  const { data, isLoading } = useQuery({ queryKey: ['products', page, search, sortBy, sortOrder], queryFn: () => inventoryApi.list({ page, limit:20, search, sortBy, sortOrder }).then(r=>r.data), placeholderData: (p)=>p });

  const deleteM = useMutation({
    mutationFn: (id) => inventoryApi.delete(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey:['products'] }); setDeleteTarget(null); },
  });

  const products = data?.data || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Inventory" subtitle="Products, stock levels and movement"
        actions={can('inventory','create') && <button className="btn-primary" onClick={()=>{setEditProduct(null);setProductModal(true);}}><Plus size={14}/> Add Product</button>} />

      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {[
            { label:'Total Products',  value: summary.totalProducts,           unit:'' },
            { label:'Stock Value',     value: formatCurrency(summary.totalStockValue, currencySymbol), unit:'' },
            { label:'Low Stock',       value: summary.lowStockCount,            unit:'items', color:'#fcd34d' },
            { label:'Out of Stock',    value: summary.outOfStockCount,          unit:'items', color:'#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding:'16px' }}>
              <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
              <p className="font-display" style={{ fontSize:'22px', fontWeight:700, color: color||'var(--text-primary)', margin:0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setPage(1);}} placeholder="Search products, SKU…" />
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <label style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:600 }}>Sort by:</label>
          <select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:'140px', fontSize:'13px', padding:'6px 10px' }}>
            <option value="name">Name</option>
            <option value="currentStock">Stock Level</option>
            <option value="sellingPrice">Selling Price</option>
            <option value="costPrice">Cost Price</option>
            <option value="createdAt">Date Added</option>
          </select>
          <button className="btn-secondary btn-sm" onClick={()=>setSortOrder(o=>o==='asc'?'desc':'asc')} title="Toggle sort direction">
            {sortOrder==='asc'?'↑ Asc':'↓ Desc'}
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {isLoading ? <TableSkeleton rows={8} cols={7}/> : !products.length ? (
          <EmptyState icon={Package} title="No products yet" description="Add your first product or service."
            action={<button className="btn-primary btn-sm" onClick={()=>setProductModal(true)}><Plus size={13}/> Add Product</button>}/>
        ) : <>
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Selling Price</th><th>Stock</th><th>Value</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p) => {
                  const isLow = !p.isService && p.currentStock <= p.lowStockThreshold && p.currentStock > 0;
                  const isOut = !p.isService && p.currentStock === 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p style={{ fontWeight:600, margin:0 }}>{p.name}</p>
                          <div style={{ display:'flex', gap:'4px', marginTop:'2px' }}>
                            {p.isService && <span className="badge badge-info" style={{ fontSize:'10px' }}>Service</span>}
                            {isLow && <span className="badge badge-warning" style={{ fontSize:'10px' }}><AlertTriangle size={9}/> Low</span>}
                            {isOut && <span className="badge badge-danger"  style={{ fontSize:'10px' }}>Out of Stock</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily:'monospace', fontSize:'12px', color:'var(--text-secondary)' }}>{p.sku||'—'}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{p.category||'—'}</td>
                      <td style={{ fontWeight:600 }}>{formatCurrency(p.sellingPrice, currencySymbol)}</td>
                      <td>
                        {p.isService ? <span style={{ color:'var(--text-muted)' }}>N/A</span>
                          : <span style={{ fontWeight:600, color: isOut?'#f87171':isLow?'#fcd34d':'#4ade80' }}>{p.currentStock} {p.unit}</span>}
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{p.isService ? '—' : formatCurrency(p.currentStock*p.costPrice, currencySymbol)}</td>
                      <td>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {can('inventory','edit') && !p.isService && (
                            <button className="btn-ghost btn-icon" title="Adjust Stock" onClick={()=>setAdjustTarget(p)}><ArrowUpDown size={13}/></button>
                          )}
                          {can('inventory','edit') && (
                            <button className="btn-ghost btn-icon" onClick={()=>{setEditProduct(p);setProductModal(true);}}><Pencil size={13}/></button>
                          )}
                          {can('inventory','delete') && (
                            <button className="btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={()=>setDeleteTarget(p)}><Trash2 size={13}/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage}/>
        </>}
      </div>

      {productModal && <ProductModal open={productModal} onClose={()=>setProductModal(false)} product={editProduct}/>}
      {adjustTarget && <StockAdjustModal open={!!adjustTarget} onClose={()=>setAdjustTarget(null)} product={adjustTarget} currencySymbol={currencySymbol}/>}
      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteM.mutate(deleteTarget?.id)}
        loading={deleteM.isPending} title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" danger/>
    </div>
  );
}
