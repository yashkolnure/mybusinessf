'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatDate, initials } from '@/lib/utils';
import { Plus, Users, UserX, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN','MANAGER','ACCOUNTANT','HR','STAFF'];
const ROLE_COLORS = { SUPER_ADMIN:'badge-danger', ADMIN:'badge-primary', MANAGER:'badge-warning', ACCOUNTANT:'badge-info', HR:'badge-success', STAFF:'badge-neutral' };

// Default permission sets per role — pre-populate checkboxes
const ROLE_DEFAULTS = {
  ADMIN:      { clients:['view','create','edit','delete','export'], invoicing:['view','create','edit','delete','export'], quotations:['view','create','edit','delete','export'], workforce:['view','create','edit','delete','approve'], vendors:['view','create','edit','delete'], purchases:['view','create','edit','delete'], inventory:['view','create','edit','delete'], finance:['view','create','edit','delete','export'], reports:['view','export'], settings:['view','create','edit'], notifications:['view'], audit:['view'] },
  MANAGER:    { clients:['view','create','edit'], invoicing:['view','create','edit','export'], quotations:['view','create','edit','delete','export'], workforce:['view','create','edit'], vendors:['view','create','edit'], purchases:['view','create','edit'], inventory:['view','create','edit'], finance:['view','create'], reports:['view','export'], notifications:['view'] },
  ACCOUNTANT: { clients:['view'], invoicing:['view','create','edit','delete','export'], quotations:['view','create','edit','export'], purchases:['view','create','edit','export'], finance:['view','create','edit','delete','export'], reports:['view','export'], notifications:['view'] },
  HR:         { workforce:['view','create','edit','delete','approve','export'], reports:['view','export'], notifications:['view'] },
  STAFF:      { notifications:['view'] },
};

const ALL_MODULES = [
  { key:'clients',           label:'Clients (CRM)'        },
  { key:'invoicing',         label:'Invoicing'            },
  { key:'invoice_statements',label:'Invoice Statements'   },
  { key:'quotations',        label:'Quotations'           },
  { key:'workforce',         label:'Workforce'            },
  { key:'vendors',           label:'Vendors'              },
  { key:'purchases',         label:'Purchases'            },
  { key:'inventory',         label:'Inventory'            },
  { key:'finance',           label:'Finance'              },
  { key:'reports',           label:'Reports'              },
  { key:'settings',          label:'Settings'             },
  { key:'notifications',     label:'Notifications'        },
  { key:'audit',             label:'Audit Log'            },
];

const ALL_ACTIONS = ['view','create','edit','delete','export','approve'];

function PermissionGrid({ permissions, onChange }) {
  const toggle = (module, action) => {
    const current = permissions[module] || [];
    const next = current.includes(action) ? current.filter(a=>a!==action) : [...current, action];
    onChange({ ...permissions, [module]: next });
  };

  const toggleModule = (module) => {
    const current = permissions[module] || [];
    onChange({ ...permissions, [module]: current.length > 0 ? [] : ['view','create','edit','delete','export'] });
  };

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
        <thead>
          <tr style={{ background:'var(--bg-surface)' }}>
            <th style={{ padding:'8px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', width:'160px', position:'sticky', left:0, background:'var(--bg-surface)' }}>Module</th>
            {ALL_ACTIONS.map(a=>(
              <th key={a} style={{ padding:'8px', textAlign:'center', fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', minWidth:'60px' }}>{a}</th>
            ))}
            <th style={{ padding:'8px', textAlign:'center', fontSize:'11px', color:'var(--text-muted)' }}>All</th>
          </tr>
        </thead>
        <tbody>
          {ALL_MODULES.map((mod, idx)=>{
            const perms = permissions[mod.key] || [];
            return (
              <tr key={mod.key} style={{ borderBottom:'1px solid var(--border-subtle)', background: idx%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                <td style={{ padding:'8px 12px', fontWeight:500, color:'var(--text-primary)', position:'sticky', left:0, background: idx%2===0?'var(--bg-elevated)':'rgba(255,255,255,0.01)' }}>{mod.label}</td>
                {ALL_ACTIONS.map(action=>(
                  <td key={action} style={{ padding:'8px', textAlign:'center' }}>
                    <input type="checkbox" checked={perms.includes(action)} onChange={()=>toggle(mod.key, action)}
                      style={{ width:'15px', height:'15px', accentColor:'var(--primary)', cursor:'pointer' }}/>
                  </td>
                ))}
                <td style={{ padding:'8px', textAlign:'center' }}>
                  <button type="button" onClick={()=>toggleModule(mod.key)}
                    style={{ fontSize:'10px', padding:'2px 6px', borderRadius:'4px', border:'1px solid var(--border-default)', background: perms.length>0?'var(--primary-muted)':'transparent', color: perms.length>0?'#a5b4fc':'var(--text-muted)', cursor:'pointer' }}>
                    {perms.length > 0 ? 'Clear' : 'All'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InviteModal({ open, onClose }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', role:'STAFF', phone:'' });
  const [permissions, setPermissions] = useState(ROLE_DEFAULTS['STAFF'] || {});
  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); if(k==='role') setPermissions(ROLE_DEFAULTS[v]||{}); };

  const mutation = useMutation({
    mutationFn: (data) => usersApi.invite(data),
    onSuccess: (res) => {
      // After invite, set permissions
      const userId = res.data.data.id;
      const permsArray = Object.entries(permissions).filter(([,a])=>a.length>0).map(([module,actions])=>({ module, actions }));
      if (permsArray.length > 0) {
        usersApi.setPermissions(userId, { permissions: permsArray }).catch(()=>{});
      }
      toast.success('User invited! They will receive login credentials via email.');
      qc.invalidateQueries({ queryKey:['users'] });
      setStep(1);
      setForm({ name:'', email:'', role:'STAFF', phone:'' });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message||'Failed to invite user.'),
  });

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div className="animate-fade-in" onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}/>
      <div className="animate-scale-in" style={{ position:'relative', width:'100%', maxWidth: step===2?'860px':'520px', borderRadius:'16px', overflow:'hidden', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid var(--border-subtle)' }}>
          <div>
            <h2 className="font-display" style={{ margin:0, fontSize:'18px', fontWeight:700, color:'var(--text-primary)' }}>
              {step === 1 ? 'Invite Team Member' : 'Set Module Permissions'}
            </h2>
            <p style={{ margin:'2px 0 0', fontSize:'12px', color:'var(--text-muted)' }}>Step {step} of 2</p>
          </div>
          {/* Step indicator */}
          <div style={{ display:'flex', gap:'8px' }}>
            {[1,2].map(s=>(
              <div key={s} style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, background: s<=step?'var(--primary)':'var(--bg-overlay)', color: s<=step?'#fff':'var(--text-muted)', border: `1px solid ${s<=step?'var(--primary)':'var(--border-default)'}` }}>
                {s < step ? <Check size={13}/> : s}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <FormField label="Full Name *"><input className="input" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="John Doe"/></FormField>
            <FormField label="Email Address *"><input type="email" className="input" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="user@company.com"/></FormField>
            <FormField label="Phone"><input className="input" value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="+91 98765 43210"/></FormField>
            <FormField label="Role">
              <select className="input" value={form.role} onChange={e=>upd('role',e.target.value)}>
                {ROLES.map(r=><option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
              </select>
            </FormField>
            <div style={{ padding:'12px', borderRadius:'10px', background:'var(--primary-muted)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ margin:0, fontSize:'12px', color:'#a5b4fc' }}>
                Default permissions for <strong>{form.role}</strong> role will be pre-selected in step 2. You can customize them.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding:'20px 24px' }}>
            <p style={{ margin:'0 0 14px', fontSize:'13px', color:'var(--text-secondary)' }}>
              Select which modules <strong style={{ color:'var(--text-primary)' }}>{form.name}</strong> can access. Actions: view, create, edit, delete, export, approve.
            </p>
            <div style={{ maxHeight:'420px', overflowY:'auto', borderRadius:'10px', border:'1px solid var(--border-default)' }}>
              <PermissionGrid permissions={permissions} onChange={setPermissions}/>
            </div>
          </div>
        )}

        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between' }}>
          <button className="btn-secondary" onClick={step===1?onClose:()=>setStep(1)}>
            {step===1?'Cancel':'← Back'}
          </button>
          <div style={{ display:'flex', gap:'8px' }}>
            {step===1 && (
              <button className="btn-primary" onClick={()=>setStep(2)} disabled={!form.name.trim()||!form.email.trim()}>
                Next: Set Permissions →
              </button>
            )}
            {step===2 && (
              <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
                {mutation.isPending?<><Spinner size={13}/> Sending Invite…</>:<><Plus size={13}/> Send Invite</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const [inviteModal, setInviteModal] = useState(false);
  const [permTarget,  setPermTarget]  = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.list({ page, limit:20, search }).then(r=>r.data),
    placeholderData: (p) => p,
  });

  const { data: permData } = useQuery({
    queryKey: ['user-perms', permTarget?.id],
    queryFn:  () => usersApi.getPermissions(permTarget.id).then(r=>r.data.data),
    enabled:  !!permTarget,
  });

  // Convert array to object for PermissionGrid
  const [editPerms, setEditPerms] = useState({});
  const permMutation = useMutation({
    mutationFn: (data) => usersApi.setPermissions(permTarget.id, { permissions: Object.entries(data).filter(([,a])=>a.length>0).map(([module,actions])=>({ module, actions })) }),
    onSuccess: () => { toast.success('Permissions updated.'); qc.invalidateQueries({ queryKey:['users'] }); setPermTarget(null); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  // When permData loads, init editPerms
  const handleOpenPerms = (user) => {
    setPermTarget(user);
    setEditPerms({});
  };

  if (permData && permTarget && Object.keys(editPerms).length === 0) {
    const obj = {};
    permData.forEach(p => { obj[p.module] = p.actions; });
    setEditPerms(obj);
  }

  const deactivateM = useMutation({
    mutationFn: (id) => usersApi.deactivate(id),
    onSuccess: () => { toast.success('User deactivated.'); qc.invalidateQueries({ queryKey:['users'] }); setDeactivateTarget(null); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  const users = data?.data || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Users & Access" subtitle={data?.meta?`${data.meta.total} team members`:'Manage team access and permissions'}
        actions={<button className="btn-primary" onClick={()=>setInviteModal(true)}><Plus size={14}/> Invite User</button>}/>

      <SearchInput value={search} onChange={(v)=>{setSearch(v);setPage(1);}} placeholder="Search by name or email…"/>

      <div className="card" style={{ overflow:'hidden' }}>
        {isLoading ? <TableSkeleton rows={6} cols={5}/> : !users.length ? (
          <EmptyState icon={Users} title="No users" description="Invite your first team member."
            action={<button className="btn-primary btn-sm" onClick={()=>setInviteModal(true)}><Plus size={13}/> Invite</button>}/>
        ) : <>
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="data-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, flexShrink:0, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff' }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, margin:0, fontSize:'14px' }}>{u.name}{u.id===me?.id&&<span style={{ fontSize:'11px', color:'var(--text-muted)', marginLeft:'6px' }}>(you)</span>}</p>
                          <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${ROLE_COLORS[u.role]||'badge-neutral'}`}>{u.role.replace(/_/g,' ')}</span></td>
                    <td><span className={`badge ${u.isActive?'badge-success':'badge-neutral'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'12px' }}>{u.lastLoginAt?formatDate(u.lastLoginAt):'Never'}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'12px' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button className="btn-ghost btn-icon" title="Manage Permissions" onClick={()=>handleOpenPerms(u)}
                          style={{ color:'var(--primary)' }}>
                          <Shield size={13}/>
                        </button>
                        {u.id!==me?.id && u.isActive && (
                          <button className="btn-ghost btn-icon" title="Deactivate" style={{ color:'var(--danger)' }} onClick={()=>setDeactivateTarget(u)}>
                            <UserX size={13}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage}/>
        </>}
      </div>

      {/* Invite Modal */}
      <InviteModal open={inviteModal} onClose={()=>setInviteModal(false)}/>

      {/* Permissions Modal */}
      {permTarget && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div onClick={()=>setPermTarget(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}/>
          <div style={{ position:'relative', width:'100%', maxWidth:'880px', borderRadius:'16px', overflow:'hidden', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid var(--border-subtle)' }}>
              <div>
                <h2 className="font-display" style={{ margin:0, fontSize:'18px', fontWeight:700, color:'var(--text-primary)' }}>Manage Permissions</h2>
                <p style={{ margin:'2px 0 0', fontSize:'12px', color:'var(--text-muted)' }}>{permTarget.name} · {permTarget.role.replace(/_/g,' ')}</p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {ROLES.map(r=>(
                  <button key={r} type="button" onClick={()=>setEditPerms(ROLE_DEFAULTS[r]||{})}
                    className="btn-secondary btn-sm" style={{ fontSize:'11px', padding:'4px 8px' }}>
                    {r.slice(0,3)} defaults
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding:'16px 24px', maxHeight:'500px', overflowY:'auto' }}>
              <p style={{ margin:'0 0 12px', fontSize:'13px', color:'var(--text-secondary)' }}>
                Check the actions each module allows. Unchecked = no access. Click role buttons to load defaults.
              </p>
              <div style={{ borderRadius:'10px', border:'1px solid var(--border-default)', overflow:'hidden' }}>
                <PermissionGrid permissions={editPerms} onChange={setEditPerms}/>
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border-subtle)', display:'flex', justifyContent:'flex-end', gap:'8px' }}>
              <button className="btn-secondary" onClick={()=>setPermTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={()=>permMutation.mutate(editPerms)} disabled={permMutation.isPending}>
                {permMutation.isPending?<><Spinner size={13}/> Saving…</>:<><Shield size={13}/> Save Permissions</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deactivateTarget} onClose={()=>setDeactivateTarget(null)}
        onConfirm={()=>deactivateM.mutate(deactivateTarget?.id)} loading={deactivateM.isPending}
        title="Deactivate User" description={`Deactivate "${deactivateTarget?.name}"? They will lose access immediately.`} confirmLabel="Deactivate" danger/>
    </div>
  );
}
