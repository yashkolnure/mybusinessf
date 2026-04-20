'use client';
import { Trash2, Plus } from 'lucide-react';
import ProductSelect from './ProductSelect';

const emptyItem = () => ({
  id: Date.now() + Math.random(),
  description: '', quantity: 1, unit: '',
  unitPrice: 0, taxRate: 18, discountRate: 0, productId: null,
});

export const parseItem = (item) => ({
  description:  String(item.description || ''),
  productId:    item.productId || null,
  unit:         item.unit || null,
  quantity:     parseFloat(item.quantity)    || 0,
  unitPrice:    parseFloat(item.unitPrice)   || 0,
  taxRate:      parseFloat(item.taxRate)     || 0,
  discountRate: parseFloat(item.discountRate)|| 0,
});

export default function LineItemsEditor({ items = [], onChange, currencySymbol = '₹', taxOptions = [] }) {
  const update = (idx, field, value) => onChange(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const handleProductSelect = (idx, product) => {
    onChange(items.map((it, i) => i === idx ? {
      ...it,
      description: product.description,
      unitPrice:   product.unitPrice   !== undefined ? product.unitPrice   : it.unitPrice,
      taxRate:     product.taxRate     !== undefined ? product.taxRate     : it.taxRate,
      unit:        product.unit        !== undefined ? product.unit        : it.unit,
      productId:   product.productId   || null,
    } : it));
  };

  const calcLine = (item) => {
    const qty=parseFloat(item.quantity)||0, price=parseFloat(item.unitPrice)||0;
    const disc=parseFloat(item.discountRate)||0, tax=parseFloat(item.taxRate)||0;
    return parseFloat((qty*price*(1-disc/100)*(1+tax/100)).toFixed(2));
  };

  const subtotal  = items.reduce((s,it)=>s+(parseFloat(it.quantity)||0)*(parseFloat(it.unitPrice)||0)*(1-(parseFloat(it.discountRate)||0)/100),0);
  const totalTax  = items.reduce((s,it)=>{const b=(parseFloat(it.quantity)||0)*(parseFloat(it.unitPrice)||0)*(1-(parseFloat(it.discountRate)||0)/100); return s+b*(parseFloat(it.taxRate)||0)/100;},0);
  const grandTotal = subtotal+totalTax;

  const th={padding:'8px 10px',textAlign:'left',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',background:'var(--bg-surface)',borderBottom:'1px solid var(--border-default)'};
  const td={padding:'6px',borderBottom:'1px solid var(--border-subtle)',verticalAlign:'top'};
  const ni=(extra={})=>({padding:'6px 8px',fontSize:'13px',...extra});

  return (
    <div>
      <div style={{overflowX:'auto',borderRadius:'10px',border:'1px solid var(--border-default)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:'820px'}}>
          <thead>
            <tr>
              <th style={{...th,width:'28%'}}>Product / Description</th>
              <th style={{...th,width:'7%'}}>Qty</th>
              <th style={{...th,width:'6%'}}>Unit</th>
              <th style={{...th,width:'13%'}}>Price ({currencySymbol})</th>
              <th style={{...th,width:'9%'}}>Tax %</th>
              <th style={{...th,width:'8%'}}>Disc %</th>
              <th style={{...th,width:'13%',textAlign:'right'}}>Amount</th>
              <th style={{...th,width:'4%'}}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item,idx)=>(
              <tr key={item.id||idx} style={{background:idx%2===0?'transparent':'rgba(255,255,255,0.015)'}}>
                <td style={td}>
                  <ProductSelect placeholder="Search inventory or type…" onSelect={p=>handleProductSelect(idx,p)}/>
                  <input className="input" style={{...ni(),marginTop:'4px'}}
                    placeholder="Description…" value={item.description}
                    onChange={e=>update(idx,'description',e.target.value)}/>
                  {item.productId && <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'4px',background:'var(--primary-muted)',color:'#a5b4fc',display:'inline-block',marginTop:'3px'}}>📦 from inventory</span>}
                </td>
                <td style={td}>
                  <input className="input" style={ni({textAlign:'right'})} type="number" min="0" step="0.01"
                    value={item.quantity} onChange={e=>update(idx,'quantity',e.target.value)}/>
                </td>
                <td style={td}>
                  <input className="input" style={ni()} placeholder="pcs"
                    value={item.unit} onChange={e=>update(idx,'unit',e.target.value)}/>
                </td>
                <td style={td}>
                  <input className="input" style={ni({textAlign:'right'})} type="number" min="0" step="0.01"
                    value={item.unitPrice} onChange={e=>update(idx,'unitPrice',e.target.value)}/>
                </td>
                <td style={td}>
                  {taxOptions.length>0?(
                    <select className="input" style={ni()} value={item.taxRate} onChange={e=>update(idx,'taxRate',e.target.value)}>
                      {taxOptions.map(t=><option key={t.rate} value={t.rate}>{t.name}</option>)}
                    </select>
                  ):(
                    <input className="input" style={ni({textAlign:'right'})} type="number" min="0" max="100" step="0.5"
                      value={item.taxRate} onChange={e=>update(idx,'taxRate',e.target.value)}/>
                  )}
                </td>
                <td style={td}>
                  <input className="input" style={ni({textAlign:'right'})} type="number" min="0" max="100" step="0.5"
                    value={item.discountRate} onChange={e=>update(idx,'discountRate',e.target.value)}/>
                </td>
                <td style={{...td,textAlign:'right',fontWeight:600,fontSize:'14px',color:'var(--text-primary)',paddingTop:'14px'}}>
                  {currencySymbol}{calcLine(item).toLocaleString('en-IN',{minimumFractionDigits:2})}
                </td>
                <td style={td}>
                  <button type="button" disabled={items.length<=1}
                    onClick={()=>onChange(items.filter((_,i)=>i!==idx))}
                    className="btn-ghost btn-icon" style={{color:'var(--danger)',padding:'6px',marginTop:'4px'}}>
                    <Trash2 size={14}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={()=>onChange([...items,emptyItem()])}
        className="btn-secondary btn-sm" style={{marginTop:'10px'}}>
        <Plus size={13}/> Add Line Item
      </button>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:'16px'}}>
        <div style={{width:'280px',display:'flex',flexDirection:'column',gap:'6px'}}>
          {[{label:'Subtotal',value:subtotal},{label:'Tax',value:totalTax}].map(({label,value})=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'var(--text-secondary)'}}>
              <span>{label}</span><span>{currencySymbol}{value.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
            </div>
          ))}
          <div style={{height:'1px',background:'var(--border-default)',margin:'4px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'15px',fontWeight:700,color:'var(--text-primary)'}}>
            <span>Total</span>
            <span style={{color:'var(--primary)'}}>{currencySymbol}{grandTotal.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
