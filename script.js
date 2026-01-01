const logoBase64 = ""; // optional, can leave empty
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let customers = [];
let items = [];
let editIndex = null;

// Fill dropdown
function fillDropdown(id, list){
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    list.forEach(obj=>{
        if(obj && obj.name){
            const opt = document.createElement('option');
            opt.value = obj.name.trim(); opt.text = obj.name.trim();
            sel.appendChild(opt);
        }
    });
}

// Load JSON or localStorage
function loadData(){
    fetch('./data.json').then(r=>r.json()).then(data=>{
        const jsonCust = (data.customers||[]).map(c=>({name:c.name.trim(), address:c.address||''}));
        const localCust = JSON.parse(localStorage.getItem('customers')||'[]');
        customers = Array.from(new Map([...jsonCust,...localCust].map(c=>[c.name,c])).values());
        fillDropdown('customer',customers);

        const jsonItems = (data.items||[]).map(i=>({name:i.name.trim(), price:parseFloat(i.price)}));
        const localItems = JSON.parse(localStorage.getItem('items')||'[]');
        items = Array.from(new Map([...jsonItems,...localItems].map(i=>[i.name,i])).values());
        fillDropdown('item',items);
        if(items.length>0) document.getElementById('price').value = items[0].price;
    }).catch(()=>console.warn('data.json load error'));
}

// Event listeners and renderTable, updateQty, updatePrice, edit/delete etc. (same as previous working code)

// PDF Generation
document.getElementById('pdfBtn').addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18); doc.text("Invoice",14,20);
  const headers=[["Date","Customer","Address","Item","Qty","Price","Total"]];
  const data=invoices.map(inv=>[inv.date,inv.customer,inv.address,inv.item,inv.qty,inv.price.toFixed(2),inv.total.toFixed(2)]);
  doc.autoTable({ head: headers, body: data, startY:30, theme:'grid', headStyles:{fillColor:[25,118,210]}, styles:{fontSize:10} });
  const finalY = doc.lastAutoTable.finalY || 30;
  doc.text(`Grand Total: $${invoices.reduce((a,b)=>a+b.total,0).toFixed(2)}`,14,finalY+10);
  doc.save('invoice.pdf');
});

// Print
document.getElementById('printBtn').addEventListener('click', ()=>{ window.print(); });

// PWA: Register Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js')
    .then(()=>console.log('Service Worker Registered'))
    .catch(err=>console.log('SW registration failed',err));
}

// Call loadData and render table
loadData();
renderTable();
