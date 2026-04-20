'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Tabs, Spinner } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, downloadBlob, INVOICE_STATUS } from '@/lib/utils';
import { Download, BarChart3, FileText, Users, Package, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const TABS = [{ label:'Sales', value:'sales' }, { label:'Expenses', value:'expenses' }, { label:'GST', value:'gst' }, { label:'Employees', value:'employees' }, { label:'Inventory', value:'inventory' }];

const DATE = () => { const d = new Date(); return { startDate: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0], endDate: d.toISOString().split('T')[0] }; };
const COLORS = ['#6366f1','#f59e0b','#22c55e','#ef4444','#a78bfa','#60a5fa','#34d399'];

export default function ReportsPage() {
  const { currencySymbol, can } = useAuth();
  const [tab, setTab] = useState('sales');
  const [dates, setDates] = useState(DATE());

  const salesQ    = useQuery({ queryKey:['report-sales',    dates], queryFn: ()=>reportsApi.sales(dates).then(r=>r.data.data),       enabled: tab==='sales' });
  const expenseQ  = useQuery({ queryKey:['report-expense',  dates], queryFn: ()=>reportsApi.expenses(dates).then(r=>r.data.data),     enabled: tab==='expenses' });
  const gstQ      = useQuery({ queryKey:['report-gst',      dates], queryFn: ()=>reportsApi.gst(dates).then(r=>r.data.data),          enabled: tab==='gst' });
  const empQ      = useQuery({ queryKey:['report-employees',dates], queryFn: ()=>reportsApi.employees({ year: new Date().getFullYear() }).then(r=>r.data.data), enabled: tab==='employees' });
  const inventoryQ= useQuery({ queryKey:['report-inventory'],       queryFn: ()=>reportsApi.inventory().then(r=>r.data.data),          enabled: tab==='inventory' });

  const handleExport = async () => {
    try {
      const res = await reportsApi.exportStatement({ ...dates, format:'excel' });
      downloadBlob(res.data, 'invoice-statement.xlsx');
      toast.success('Downloaded!');
    } catch { toast.error('Export failed.'); }
  };

  const lbl = { fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)', display:'block', marginBottom:'6px' };
  const inp = { background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'8px', padding:'6px 10px', fontSize:'13px', color:'var(--text-primary)', outline:'none', fontFamily:'inherit' };

  const DateFilter = () => (
    <div style={{ display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap' }}>
      <div><label style={lbl}>From</label><input type="date" value={dates.startDate} onChange={e=>setDates(d=>({...d,startDate:e.target.value}))} style={inp}/></div>
      <div><label style={lbl}>To</label><input type="date" value={dates.endDate} onChange={e=>setDates(d=>({...d,endDate:e.target.value}))} style={inp}/></div>
    </div>
  );

  const Summary = ({ items }) => (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'12px' }}>
      {items.map(({ label, value, color }) => (
        <div key={label} className="card" style={{ padding:'16px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
          <p className="font-display" style={{ fontSize:'20px', fontWeight:700, color: color||'var(--text-primary)', margin:0 }}>{value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Reports" subtitle="Business analytics and data exports"
        actions={can('invoice_statements','export') && (
          <button className="btn-secondary" onClick={handleExport}><Download size={13}/> Export Statement</button>
        )} />

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* SALES REPORT */}
      {tab === 'sales' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px' }}>
            <DateFilter/>
          </div>
          {salesQ.isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div> : salesQ.data && (
            <>
              <Summary items={[
                { label:'Total Invoices', value: salesQ.data.summary.totalInvoices },
                { label:'Total Amount',   value: formatCurrency(salesQ.data.summary.totalAmount, currencySymbol), color:'#a5b4fc' },
                { label:'Total Paid',     value: formatCurrency(salesQ.data.summary.totalPaid, currencySymbol),   color:'#4ade80' },
                { label:'Outstanding',    value: formatCurrency(salesQ.data.summary.totalOutstanding, currencySymbol), color:'#f87171' },
                { label:'Total Tax',      value: formatCurrency(salesQ.data.summary.totalTax, currencySymbol) },
              ]}/>
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
                  <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Invoice Details</h3>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                    <tbody>
                      {salesQ.data.invoices.slice(0,50).map((inv) => {
                        const cfg = INVOICE_STATUS[inv.status];
                        return (
                          <tr key={inv.id}>
                            <td style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:600, color:'var(--primary)' }}>{inv.invoiceNumber}</td>
                            <td>{inv.client?.name}</td>
                            <td style={{ color:'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                            <td style={{ fontWeight:600 }}>{formatCurrency(inv.totalAmount, currencySymbol)}</td>
                            <td style={{ color:'#4ade80' }}>{formatCurrency(inv.paidAmount, currencySymbol)}</td>
                            <td style={{ color: inv.balanceAmount>0?'#f87171':'#4ade80', fontWeight:600 }}>{formatCurrency(inv.balanceAmount, currencySymbol)}</td>
                            <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* EXPENSE REPORT */}
      {tab === 'expenses' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <DateFilter/>
          {expenseQ.isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div> : expenseQ.data && (
            <>
              <Summary items={[
                { label:'Total Expense', value: formatCurrency(expenseQ.data.summary.totalExpense, currencySymbol), color:'#f87171' },
                { label:'Entries',       value: expenseQ.data.summary.entryCount },
              ]}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="card" style={{ padding:'20px' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>By Category</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.entries(expenseQ.data.summary.byCategory||{}).map(([name,v])=>({ name, total: v.total }))}>
                      <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'10px', fontSize:'12px' }}/>
                      <Bar dataKey="total" fill="#ef4444" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{ overflow:'hidden' }}>
                  <table className="data-table">
                    <thead><tr><th>Category</th><th>Entries</th><th style={{ textAlign:'right' }}>Total</th></tr></thead>
                    <tbody>
                      {Object.entries(expenseQ.data.summary.byCategory||{}).map(([cat, v]) => (
                        <tr key={cat}>
                          <td><span className="badge badge-danger">{cat}</span></td>
                          <td style={{ color:'var(--text-secondary)' }}>{v.count}</td>
                          <td style={{ textAlign:'right', fontWeight:600, color:'#f87171' }}>{formatCurrency(v.total, currencySymbol)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* GST REPORT */}
      {tab === 'gst' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <DateFilter/>
          {gstQ.isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div> : gstQ.data && (
            <>
              <Summary items={[
                { label:'Total Taxable',  value: formatCurrency(gstQ.data.totalTaxable, currencySymbol)  },
                { label:'Total Tax',      value: formatCurrency(gstQ.data.totalTax, currencySymbol), color:'#fcd34d' },
                { label:'Invoice Count',  value: gstQ.data.invoiceCount },
              ]}/>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Tax Rate</th><th>Items</th><th>Taxable Amount</th><th style={{ textAlign:'right' }}>Tax Collected</th></tr></thead>
                  <tbody>
                    {gstQ.data.taxSummary?.map((row) => (
                      <tr key={row.rate}>
                        <td><span className="badge badge-warning">{row.rate}% GST</span></td>
                        <td style={{ color:'var(--text-secondary)' }}>{row.count}</td>
                        <td>{formatCurrency(row.taxableAmount, currencySymbol)}</td>
                        <td style={{ textAlign:'right', fontWeight:600, color:'#fcd34d' }}>{formatCurrency(row.taxAmount, currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* EMPLOYEE REPORT */}
      {tab === 'employees' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {empQ.isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div> : empQ.data && (
            <>
              <Summary items={[
                { label:'Total Employees', value: empQ.data.totalEmployees },
                { label:'Payroll Total',   value: formatCurrency(empQ.data.payrollSummary.totalNetSalary, currencySymbol), color:'#a5b4fc' },
                { label:'Paid',            value: formatCurrency(empQ.data.payrollSummary.totalPaid, currencySymbol), color:'#4ade80' },
                { label:'Pending',         value: formatCurrency(empQ.data.payrollSummary.totalPending, currencySymbol), color:'#f87171' },
              ]}/>
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
                  <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Salary Records</h3>
                </div>
                <table className="data-table">
                  <thead><tr><th>Employee</th><th>Department</th><th>Month/Year</th><th>Net Salary</th><th>Status</th></tr></thead>
                  <tbody>
                    {empQ.data.salaries?.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight:500 }}>{s.employee?.name}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{s.employee?.department||'—'}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{s.month}/{s.year}</td>
                        <td style={{ fontWeight:600 }}>{formatCurrency(s.netSalary, currencySymbol)}</td>
                        <td><span className={`badge ${s.status==='PAID'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* INVENTORY REPORT */}
      {tab === 'inventory' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {inventoryQ.isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div> : inventoryQ.data && (
            <>
              <Summary items={[
                { label:'Total Products',  value: inventoryQ.data.summary.totalProducts },
                { label:'Stock Value',     value: formatCurrency(inventoryQ.data.summary.totalStockValue, currencySymbol), color:'#a5b4fc' },
                { label:'Low Stock',       value: inventoryQ.data.summary.lowStockItems, color:'#fcd34d' },
                { label:'Out of Stock',    value: inventoryQ.data.summary.outOfStockItems, color:'#f87171' },
              ]}/>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Cost Price</th><th style={{ textAlign:'right' }}>Stock Value</th></tr></thead>
                  <tbody>
                    {inventoryQ.data.products?.filter(p=>!p.isService).map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight:500 }}>{p.name}</td>
                        <td style={{ fontFamily:'monospace', fontSize:'12px', color:'var(--text-secondary)' }}>{p.sku||'—'}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{p.category||'—'}</td>
                        <td style={{ color: p.currentStock<=p.lowStockThreshold?'#f87171':'#4ade80', fontWeight:600 }}>{p.currentStock} {p.unit}</td>
                        <td>{formatCurrency(p.costPrice, currencySymbol)}</td>
                        <td style={{ textAlign:'right', fontWeight:600 }}>{formatCurrency(p.currentStock*p.costPrice, currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
