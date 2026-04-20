'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { ChevronDown, Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

function QuickAddClientModal({ open, onClose, onCreated }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'' });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const mutation = useMutation({
    mutationFn: (data) => clientsApi.create(data),
    onSuccess: (res) => {
      toast.success('Client created!');
      qc.invalidateQueries({ queryKey:['clients-select'] });
      onCreated(res.data.data);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create client.'),
  });

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)' }} onClick={onClose}/>
      <div style={{ position:'relative', width:'100%', maxWidth:'440px', borderRadius:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
          <h3 style={{ margin:0, fontSize:'16px', fontWeight:700, color:'var(--text-primary)' }}>Quick Add Client</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px' }}><X size={16}/></button>
        </div>
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
          {[['name','Client Name *','text'],['company','Company','text'],['email','Email','email'],['phone','Phone','tel']].map(([k,label,type])=>(
            <div key={k}>
              <label style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)', display:'block', marginBottom:'5px' }}>{label}</label>
              <input type={type} className="input" value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={label.replace(' *','')}/>
            </div>
          ))}
        </div>
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:'8px', justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.name.trim() || mutation.isPending} onClick={()=>mutation.mutate(form)}>
            {mutation.isPending ? 'Creating…' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientSelect({ value, onChange, error }) {
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const { data } = useQuery({
    queryKey: ['clients-select', search],
    queryFn:  () => clientsApi.list({ search, limit: 30 }).then(r => r.data),
    enabled:  open,
  });

  const clients  = data?.data || [];
  const selected = value?.id ? value : null;

  return (
    <>
      <div ref={ref} style={{ position:'relative' }}>
        <button type="button" onClick={() => setOpen(!open)}
          className={`input${error ? ' input-error':''}`}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', textAlign:'left' }}>
          {selected
            ? <span style={{ fontWeight:500 }}>{selected.name}{selected.company ? ` — ${selected.company}`:''}</span>
            : <span style={{ color:'var(--text-muted)' }}>Select a client…</span>}
          <ChevronDown size={14} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
        </button>

        {open && (
          <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:50, borderRadius:'10px', overflow:'hidden', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ padding:'8px', borderBottom:'1px solid var(--border-subtle)' }}>
              <div style={{ position:'relative' }}>
                <Search size={13} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                <input autoFocus className="input" style={{ paddingLeft:'32px', height:'34px', fontSize:'13px' }}
                  placeholder="Search clients…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            </div>

            {/* Add new client button */}
            <button type="button" onClick={() => { setOpen(false); setShowAdd(true); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--primary-muted)', border:'none', cursor:'pointer', textAlign:'left', borderBottom:'1px solid var(--border-subtle)' }}>
              <Plus size={14} style={{ color:'var(--primary)' }}/>
              <span style={{ fontSize:'13px', fontWeight:600, color:'var(--primary)' }}>Add New Client</span>
            </button>

            <div style={{ maxHeight:'220px', overflowY:'auto' }}>
              {clients.length === 0
                ? <div style={{ padding:'20px', textAlign:'center', fontSize:'13px', color:'var(--text-muted)' }}>No clients found</div>
                : clients.map(c => (
                    <button key={c.id} type="button"
                      onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                      style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'2px', padding:'10px 14px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', borderBottom:'1px solid var(--border-subtle)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{ fontWeight:500, fontSize:'13px', color:'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{c.company || c.email || ''}</span>
                    </button>
                  ))
              }
            </div>
          </div>
        )}
      </div>

      <QuickAddClientModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={(c) => onChange(c)}/>
    </>
  );
}
