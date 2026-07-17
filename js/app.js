/* ============================================
   HORUS PRO — Slider 3D + Admin + COP
   ============================================ */

// ==============================================
// 1. TIME MODE
// ==============================================
(function(){const h=new Date().getHours();let m='night'
if(h>=6&&h<=12)m='morning';else if(h>=12&&h<=18)m='afternoon'
document.body.classList.add('mode-'+m);window.__horusMode=m})()
function getTimeModeLabel(){const m=window.__horusMode||'night'
return{morning:{icon:'🌅',text:'Buenos días'},afternoon:{icon:'☀️',text:'Buenas tardes'},night:{icon:'🌙',text:'Buenas noches'}}[m]}

// ==============================================
// 2. CURRENCY — COP (Pesos Colombianos)
// ==============================================
function formatCOP(amount){
  return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP'
}
const EXCHANGE_RATE = 4200 // 1 EUR ≈ 4200 COP (reference)

// ==============================================
// 3. ADMIN PRODUCTS CRUD (localStorage)
// ==============================================
function getProducts(){
  const stored = localStorage.getItem('horus_products')
  if(stored) return JSON.parse(stored)
  return defaultProducts()
}
function saveProducts(prods){
  localStorage.setItem('horus_products',JSON.stringify(prods))
}

function defaultProducts(){
  return [
    {id:'p1',name:'Yoshi Bleach',type:'Bleach Art',price:125000,priceEUR:29.90,image:'☠️',category:'bleach',popular:true,desc:'Camiseta decolorada con cloro. Diseño de Yoshi. Efecto único.'},
    {id:'p2',name:'Super Mario Bleach',type:'Bleach Art',price:125000,priceEUR:29.90,image:'🍄',category:'bleach',popular:true,desc:'Mario Bros en bleach art. Diseño artesanal sobre tela negra.'},
    {id:'p3',name:'Tie Dye Psicodélico',type:'Tie Dye',price:146000,priceEUR:34.90,image:'🌈',category:'tiedye',desc:'Patrón psicodélico teñido a mano. Cada pieza es única.'},
    {id:'p4',name:'Dragon Ball Pintado',type:'Pintura Textil',price:167000,priceEUR:39.90,image:'🐉',category:'pintura',popular:true,desc:'Goku pintado a mano con pintura textil profesional.'},
    {id:'p5',name:'Skull Bleach',type:'Bleach Art',price:125000,priceEUR:29.90,image:'💀',category:'bleach',desc:'Calavera en bleach art. Estilo rockero y agresivo.'},
    {id:'p6',name:'Floral Tie Dye',type:'Tie Dye',price:146000,priceEUR:34.90,image:'🌸',category:'tiedye',desc:'Patrón floral en tie dye. Colores vibrantes.'},
    {id:'p7',name:'Anime Custom',type:'Pintura Textil',price:188000,priceEUR:44.90,image:'🎭',category:'pintura',desc:'Tu personaje anime favorito pintado a mano.'},
    {id:'p8',name:'Logo Personalizado',type:'Personalizado',price:104000,priceEUR:24.90,image:'✨',category:'personalizado',desc:'Tu logo o marca personalizada sobre camiseta.'},
    {id:'p9',name:'Zelda Bleach',type:'Bleach Art',price:138000,priceEUR:32.90,image:'⚔️',category:'bleach',desc:'Legend of Zelda en bleach art. Trifuerza incluida.'},
    {id:'p10',name:'Retrowave Tie Dye',type:'Tie Dye',price:155000,priceEUR:36.90,image:'🌴',category:'tiedye',desc:'Estilo retrowave ochentero en tie dye.'},
    {id:'p11',name:'One Piece Pintado',type:'Pintura Textil',price:188000,priceEUR:44.90,image:'☠️',category:'pintura',popular:true,desc:'One Piece pintado a mano. Straw Hat crew.'},
    {id:'p12',name:'Tu Diseño',type:'Personalizado',price:104000,priceEUR:24.90,image:'✨',category:'personalizado',desc:'Cualquier idea que tengas. La hacemos realidad.'}
  ]
}

function addProduct(data){
  const prods=getProducts()
  const id='p'+Date.now()
  prods.push({id,...data})
  saveProducts(prods)
  return id
}
function updateProduct(id,data){
  let prods=getProducts()
  const idx=prods.findIndex(p=>p.id===id)
  if(idx>-1){prods[idx]={...prods[idx],...data};saveProducts(prods)}
}
function deleteProduct(id){
  let prods=getProducts().filter(p=>p.id!==id)
  saveProducts(prods)
}

// ==============================================
// 4. CART (localStorage) — COP prices
// ==============================================
let cart=JSON.parse(localStorage.getItem('horus_cart'))||[]
let appliedCoupon=null

function saveCart(){localStorage.setItem('horus_cart',JSON.stringify(cart));updateBadge()}
function updateBadge(){
  const b=document.getElementById('cartBadge')
  if(!b)return
  const c=cart.reduce((s,i)=>s+i.qty,0)
  b.textContent=c;b.style.display=c>0?'flex':'none'
}
function addToCart(product){
  const e=cart.find(i=>i.id===product.id)
  if(e)e.qty+=1;else cart.push({...product,qty:1})
  saveCart();showToast('✓ '+product.name+' añadido')
  if(document.getElementById('checkoutContainer'))renderCheckout()
}
function removeFromCart(id){cart=cart.filter(i=>i.id!==id);saveCart();renderCart();if(document.getElementById('checkoutContainer'))renderCheckout()}
function updateQty(id,delta){const i=cart.find(x=>x.id===id);if(!i)return;i.qty=Math.max(1,i.qty+delta);saveCart();renderCart();if(document.getElementById('checkoutContainer'))renderCheckout()}
function getCartTotal(){return cart.reduce((s,i)=>s+i.price*i.qty,0)}
function getDiscount(subtotal){
  if(!appliedCoupon)return 0
  const c=appliedCoupon
  if(c.type==='percent')return subtotal*c.value/100
  return c.value*EXCHANGE_RATE
}
function getShipping(subtotal){return subtotal>=210000?0:20000} // €50 ≈ 210000 COP
const COUPONS={'HORUS10':{type:'percent',value:10,desc:'10% descuento'},'SEGUIDOR':{type:'fixed',value:5,desc:'€5 descuento'},'TIKTOK':{type:'percent',value:15,desc:'15% descuento fan TikTok'}}
function applyCoupon(code){
  const c=code.toUpperCase().trim()
  if(COUPONS[c]){appliedCoupon={code:c,...COUPONS[c]};showToast('🎉 Cupón "'+c+'" aplicado')}
  else{appliedCoupon=null;showToast('❌ Cupón no válido')}
  renderCart();if(document.getElementById('checkoutContainer'))renderCheckout()
}

// ==============================================
// 5. TOAST
// ==============================================
function showToast(msg){
  const e=document.querySelector('.toast');if(e)e.remove()
  const t=document.createElement('div');t.className='toast';t.innerHTML='<span>'+msg+'</span>'
  document.body.appendChild(t)
  requestAnimationFrame(()=>{t.style.transform='translateY(0)';t.style.opacity='1'})
  setTimeout(()=>{t.style.transform='translateY(20px)';t.style.opacity='0';setTimeout(()=>t.remove(),400)},2800)
}

// ==============================================
// 6. SHOP
// ==============================================
function initShop(){
  const grid=document.getElementById('productsGrid')
  const filters=document.querySelectorAll('.filter-btn')
  if(!grid)return
  function render(cat='all'){
    const all=getProducts()
    const f=cat==='all'?all:all.filter(p=>p.category===cat)
    grid.innerHTML=f.map(p=>`<div class="product-card">
      <div class="product-image">${p.popular?'<span class="share-badge" style="position:absolute;top:1rem;right:1rem;background:color-mix(in srgb,var(--gold) 10%,transparent);border:1px solid color-mix(in srgb,var(--gold) 20%,transparent);padding:.2rem .8rem;border-radius:50px;font-size:.75rem;color:var(--gold);font-weight:600">🔥 Popular</span>':''}<span style="font-size:4rem;opacity:.8">${p.image}</span></div>
      <div class="product-info"><span class="product-type">${p.type}</span><h3>${p.name}</h3><div class="product-price">${formatCOP(p.price)}</div>
      <button class="btn btn-primary btn-sm btn-block" onclick="addToCart({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price}})">🛒 Añadir</button>
      <button class="btn btn-ghost btn-sm btn-block mt-1" onclick="quickView('${p.id}')">👁 Vista rápida</button></div></div>`).join('')
  }
  filters.forEach(b=>{b.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)})})
  render('all')
}

function quickView(id){
  const p=getProducts().find(x=>x.id===id)
  if(!p)return
  const o=document.createElement('div');o.className='modal-overlay'
  o.innerHTML=`<div class="modal" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2.5rem;max-width:480px;width:90%;position:relative">
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer">✕</button>
    <h2 style="font-size:1.5rem;margin-bottom:.5rem">${p.name}</h2>
    <div style="font-size:5rem;text-align:center;margin:1rem 0;opacity:.8">${p.image}</div>
    <p><strong>Tipo:</strong> ${p.type}</p>
    <p><strong>Precio:</strong> ${formatCOP(p.price)}</p>
    <p style="color:var(--text-muted);margin-top:.8rem;font-size:.9rem">${p.desc||'Técnica artesanal 100% realizada a mano.'}</p>
    <div style="display:flex;gap:.8rem;margin-top:1.5rem">
      <button class="btn btn-primary" onclick="addToCart({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price}});this.closest('.modal-overlay').remove()">🛒 Añadir</button>
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Seguir</button></div></div>`
  document.body.appendChild(o)
  requestAnimationFrame(()=>o.classList.add('open'))
  o.addEventListener('click',e=>{if(e.target===o)o.remove()})
}

// ==============================================
// 7. SLIDER 3D DE PRODUCTOS
// ==============================================
let sliderIndex=0
function initSlider(){
  const container=document.getElementById('sliderStage')
  if(!container)return
  renderSlider()
  // Auto-play
  setInterval(()=>{slideNext()},4000)
}
function renderSlider(){
  const container=document.getElementById('sliderStage')
  if(!container)return
  const all=getProducts()
  const items=[...all].reverse()
  if(!items.length){container.innerHTML='<p style="color:var(--text-muted)">No hay productos</p>';return}
  const total=items.length
  let idx=((sliderIndex%total)+total)%total
  container.innerHTML=items.map((p,i)=>{
    let pos=''
    if(i===idx)pos='active'
    else if(i===(idx-1+total)%total)pos='left'
    else if(i===(idx+1)%total)pos='right'
    else if(i===(idx-2+total)%total)pos='far-left'
    else if(i===(idx+2)%total)pos='far-right'
    return `<div class="slider-card ${pos}" onclick="if(${i}===${idx})addToCart({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price}});else{sliderIndex=${i};renderSlider()}">
      <div class="slider-img">${p.image}</div>
      <div class="slider-body"><span class="slider-type">${p.type}</span><h3>${p.name}</h3><div class="slider-price">${formatCOP(p.price)}</div></div></div>`
  }).join('')
}
function slideNext(){sliderIndex++;renderSlider()}
function slidePrev(){sliderIndex--;renderSlider()}

// ==============================================
// 8. PARTICLES (Canvas Hero)
// ==============================================
function initParticles(){
  const canvas=document.getElementById('particles-canvas')
  if(!canvas)return
  const ctx=canvas.getContext('2d')
  let w=canvas.width=canvas.offsetWidth
  let h=canvas.height=canvas.offsetHeight
  const particles=[]
  const count=80
  for(let i=0;i<count;i++){
    particles.push({
      x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.8,
      r:Math.random()*2+1,o:Math.random()*.5+.1
    })
  }
  function resize(){w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight}
  window.addEventListener('resize',resize)
  function animate(){
    ctx.clearRect(0,0,w,h)
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy
      if(p.x<0||p.x>w)p.vx*=-1
      if(p.y<0||p.y>h)p.vy*=-1
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
      ctx.fillStyle=`rgba(212,168,83,${p.o})`;ctx.fill()
    })
    // Draw connections
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y
        const dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<150){
          ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y)
          ctx.lineTo(particles[j].x,particles[j].y)
          ctx.strokeStyle=`rgba(212,168,83,${.06*(1-dist/150)})`
          ctx.lineWidth=.5;ctx.stroke()
        }
      }
    }
    requestAnimationFrame(animate)
  }
  animate()
}

// ==============================================
// 9. ADMIN PANEL
// ==============================================
function initAdmin(){
  const form=document.getElementById('adminProductForm')
  const list=document.getElementById('adminProductList')
  const editId=document.getElementById('editProductId')
  if(!list)return

  function renderList(){
    if(!list)return
    const prods=getProducts()
    list.innerHTML=prods.map(p=>`<div class="admin-product-item">
      <div class="admin-p-info"><h4>${p.image} ${p.name}</h4><p>${p.type} · ${formatCOP(p.price)}</p></div>
      <div class="admin-p-actions">
        <button class="admin-btn-sm" onclick="editProduct('${p.id}')">✏️</button>
        <button class="admin-btn-sm admin-btn-danger" onclick="deleteProductConfirm('${p.id}')">🗑️</button>
      </div></div>`).join('')
  }

  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault()
      const d=new FormData(form)
      const data={
        name:d.get('name'),type:d.get('type'),
        price:parseInt(d.get('price')),category:d.get('category'),
        image:d.get('image')||'👕',popular:!!d.get('popular'),
        desc:d.get('desc')||'',
        priceEUR:Math.round(parseInt(d.get('price'))/EXCHANGE_RATE*100)/100
      }
      const eid=editId?.value
      if(eid){updateProduct(eid,data);editId.value=''}else addProduct(data)
      form.reset()
      renderList()
      showToast(eid?'Producto actualizado':'Producto creado')
      // Re-init slider and shop
      renderSlider()
      initShop()
    })
  }
  renderList()
}

function editProduct(id){
  const p=getProducts().find(x=>x.id===id)
  if(!p)return
  document.getElementById('editProductId').value=p.id
  document.getElementById('adminName').value=p.name
  document.getElementById('adminType').value=p.type
  document.getElementById('adminPrice').value=p.price
  document.getElementById('adminCategory').value=p.category
  document.getElementById('adminImage').value=p.image||''
  document.getElementById('adminDesc').value=p.desc||''
  const popularEl=document.getElementById('adminPopular')
  if(popularEl)popularEl.checked=p.popular
  window.scrollTo({top:0,behavior:'smooth'})
}

function deleteProductConfirm(id){
  if(confirm('¿Eliminar este producto?')){
    deleteProduct(id)
    if(document.getElementById('adminProductList'))initAdmin()
    renderSlider()
    initShop()
    showToast('Producto eliminado')
  }
}

// ==============================================
// 10. CART PAGE
// ==============================================
function renderCart(){
  const c=document.getElementById('cartContainer')
  if(!c)return
  if(!cart.length){
    c.innerHTML=`<div style="grid-column:1/-1"><div class="cart-empty"><div style="font-size:4rem;margin-bottom:1rem">🛍️</div>
      <h2>Tu carrito está vacío</h2><p style="margin-bottom:2rem">Agrega productos desde la tienda.</p>
      <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap">
        <a href="/pages/shop.html" class="btn btn-primary">Ver tienda</a>
        <a href="/pages/admin.html" class="btn btn-outline">⚙️ Admin</a></div></div></div>`
    return
  }
  let h='<div class="cart-items">'
  cart.forEach(i=>{
    h+=`<div class="cart-item"><div class="cart-item-image">👕</div>
      <div class="cart-item-info"><h3>${i.name}</h3>
      <div class="cart-item-price">${formatCOP(i.price*i.qty)}</div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="updateQty('${i.id}',-1)">−</button>
        <span class="qty-display">${i.qty}</span>
        <button class="qty-btn" onclick="updateQty('${i.id}',1)">+</button>
        <button class="remove-item" onclick="removeFromCart('${i.id}')" style="color:#e74c3c;font-size:.85rem;cursor:pointer;background:none;border:none;font-family:inherit">Eliminar</button></div></div></div>`
  })
  h+='</div>'
  const total=getCartTotal(),discount=getDiscount(total),afterDiscount=total-discount,ship=getShipping(afterDiscount)
  h+=`<div><div class="cart-summary"><h2>🛒 Resumen</h2>
    <div class="summary-row"><span>Subtotal</span><span>${formatCOP(total)}</span></div>
    ${discount>0?`<div class="summary-row" style="color:#75b798"><span>Descuento (${appliedCoupon.code})</span><span>-${formatCOP(discount)}</span></div>`:''}
    <div class="summary-row"><span>Envío</span><span>${ship===0?'Gratis 🎉':formatCOP(ship)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatCOP(afterDiscount+ship)}</span></div>
    ${total<210000?`<p style="font-size:.8rem;color:var(--text-muted);margin-top:.8rem;text-align:center">🧊 Faltan ${formatCOP(210000-total)} para envío gratis</p>`:''}
    <div style="margin-top:1rem;display:flex;gap:.5rem">
      <input type="text" id="couponInput" placeholder="Cupón" style="flex:1;padding:.6rem 1rem;border-radius:50px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);font-family:inherit;font-size:.85rem">
      <button class="btn btn-ghost btn-sm" onclick="applyCoupon(document.getElementById('couponInput').value);renderCart()">Aplicar</button></div>
    <button class="btn btn-primary" onclick="proceedToCheckout()">📱 Ir al checkout</button>
    <a href="/pages/shop.html" class="btn btn-ghost btn-block" style="margin-top:.5rem">← Seguir</a></div></div>`
  c.innerHTML=h
}
function proceedToCheckout(){if(!cart.length){showToast('❌ Carrito vacío');return};window.location.href='/pages/checkout.html'}

// ==============================================
// 11. CHECKOUT
// ==============================================
function renderCheckout(){
  const c=document.getElementById('checkoutContainer')
  if(!c)return
  if(!cart.length){c.innerHTML=`<div class="checkout-success"><div class="checkout-success-icon">🛍️</div><h2>No hay productos</h2><p>Agrega productos primero.</p><a href="/pages/shop.html" class="btn btn-primary">Ir a la tienda</a></div>`;return}
  const total=getCartTotal(),discount=getDiscount(total),afterDiscount=total-discount,ship=getShipping(afterDiscount)
  c.innerHTML=`<form id="checkoutForm" class="checkout-layout" onsubmit="submitOrder(event)">
    <div><div class="checkout-section"><h2><span class="step-num">1</span> Información de envío</h2>
      <div class="form-row"><div class="form-group"><label>Nombre</label><input type="text" name="firstName" required></div>
      <div class="form-group"><label>Apellidos</label><input type="text" name="lastName" required></div></div>
      <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
      <div class="form-group"><label>Teléfono</label><input type="tel" name="phone" required></div>
      <div class="form-group"><label>Dirección</label><input type="text" name="address" required></div>
      <div class="form-row"><div class="form-group"><label>Ciudad</label><input type="text" name="city" required></div>
      <div class="form-group"><label>WhatsApp</label><input type="tel" name="whatsapp" placeholder="+57 300 000 0000"></div></div>
      <div class="form-group"><label>Notas</label><textarea name="notes" style="min-height:80px"></textarea></div></div>
      <div class="checkout-section"><h2><span class="step-num">2</span> Método de pago</h2>
      <div style="display:flex;flex-direction:column;gap:.8rem">
        <label class="payment-option" style="display:flex;align-items:center;gap:.8rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer">
          <input type="radio" name="payment" value="whatsapp" checked style="accent-color:var(--gold);width:18px;height:18px">
          <div><div class="payment-option-label" style="font-weight:500">📱 WhatsApp</div><div class="payment-option-desc" style="font-size:.8rem;color:var(--text-muted)">Te enviamos los datos de pago</div></div></label>
        <label class="payment-option" style="display:flex;align-items:center;gap:.8rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer">
          <input type="radio" name="payment" value="transfer" style="accent-color:var(--gold);width:18px;height:18px">
          <div><div class="payment-option-label" style="font-weight:500">🏦 Transferencia</div><div class="payment-option-desc" style="font-size:.8rem;color:var(--text-muted)">Nequi / Bancolombia</div></div></label>
        <label class="payment-option" style="display:flex;align-items:center;gap:.8rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer">
          <input type="radio" name="payment" value="pix" style="accent-color:var(--gold);width:18px;height:18px">
          <div><div class="payment-option-label" style="font-weight:500">⚡ Efecty / PSE</div><div class="payment-option-desc" style="font-size:.8rem;color:var(--text-muted)">Pago en efectivo o transferencia</div></div></label></div></div></div>
    <div><div class="cart-summary"><h2>📋 Resumen</h2>
      ${cart.map(i=>`<div style="display:flex;justify-content:space-between;padding:.6rem 0;font-size:.9rem;border-bottom:1px solid var(--border)"><span>${i.qty}x ${i.name}</span><span>${formatCOP(i.price*i.qty)}</span></div>`).join('')}
      <div class="summary-row" style="margin-top:1rem"><span>Subtotal</span><span>${formatCOP(total)}</span></div>
      ${discount>0?`<div class="summary-row" style="color:#75b798"><span>Descuento</span><span>-${formatCOP(discount)}</span></div>`:''}
      <div class="summary-row"><span>Envío</span><span>${ship===0?'Gratis 🎉':formatCOP(ship)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatCOP(afterDiscount+ship)}</span></div>
      <button type="submit" class="btn btn-primary btn-block">📱 Confirmar pedido</button></div>
      <div class="cart-summary" style="margin-top:1rem">
        <h4 style="font-size:.9rem;margin-bottom:.8rem">🎵 Síguenos</h4>
        <div style="display:flex;gap:.5rem">
          <a href="https://www.tiktok.com/@horus_histori" target="_blank" class="btn btn-ghost btn-sm" style="flex:1">TikTok</a>
          <a href="https://www.instagram.com/horus_histori/" target="_blank" class="btn btn-ghost btn-sm" style="flex:1">Instagram</a></div></div></div></form>`
}

function submitOrder(e){
  e.preventDefault()
  if(!cart.length){showToast('❌ Carrito vacío');return}
  const d=new FormData(e.target)
  const total=getCartTotal(),discount=getDiscount(total),afterDiscount=total-discount,ship=getShipping(afterDiscount)
  const items=cart.map(i=>`${i.qty}x ${i.name} (${formatCOP(i.price*i.qty)})`).join('\n')
  const t=getTimeModeLabel(),orderNum='HORUS-'+Date.now().toString(36).toUpperCase()
  let msg=`━━━━ *NUEVO PEDIDO* ━━━━\n\n📋 #${orderNum}\n${t.icon} ${t.text}\n\n👤 Cliente:\n${d.get('firstName')} ${d.get('lastName')}\n📧 ${d.get('email')}\n📱 ${d.get('phone')} / ${d.get('whatsapp')||''}\n📍 ${d.get('address')}, ${d.get('city')}\n\n━━ *PRODUCTOS* ━━\n${items}\n━━━━━━━━━━\nSubtotal: ${formatCOP(total)}`
  if(discount>0)msg+=`\nDescuento (${appliedCoupon?.code}): -${formatCOP(discount)}`
  msg+=`\nEnvío: ${ship===0?'Gratis 🎉':formatCOP(ship)}\n*Total: ${formatCOP(afterDiscount+ship)}*\n💰 Pago: ${d.get('payment')}\n\n¡Hola! Quiero confirmar este pedido 🙌`
  saveOrder({id:orderNum,date:new Date().toISOString(),customer:{name:d.get('firstName')+' '+d.get('lastName'),email:d.get('email'),phone:d.get('phone'),whatsapp:d.get('whatsapp')},items:[...cart],total:afterDiscount+ship,payment:d.get('payment'),status:'pending',address:`${d.get('address')}, ${d.get('city')}`})
  window.open(`https://wa.me/573217430543?text=${encodeURIComponent(msg)}`,'_blank')
  showToast('✅ Pedido enviado')
  cart=[];appliedCoupon=null;saveCart()
  e.target.innerHTML=`<div style="grid-column:1/-1"><div class="checkout-success"><div class="checkout-success-icon">✅</div><h2>Pedido #${orderNum} enviado</h2><p>Te contactaremos por WhatsApp.</p><div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><a href="/pages/shop.html" class="btn btn-primary">Seguir</a><a href="/pages/orders.html" class="btn btn-outline">Mis pedidos</a></div></div></div>`
}

// ==============================================
// 12. ORDERS
// ==============================================
function saveOrder(o){const or=JSON.parse(localStorage.getItem('horus_orders')||'[]');or.unshift(o);localStorage.setItem('horus_orders',JSON.stringify(or))}
function getOrders(){return JSON.parse(localStorage.getItem('horus_orders')||'[]')}
function renderOrders(){
  const c=document.getElementById('ordersContainer')
  if(!c)return
  const orders=getOrders()
  if(!orders.length){c.innerHTML=`<div class="cart-empty"><div style="font-size:4rem;margin-bottom:1rem">📦</div><h2>Sin pedidos aún</h2><a href="/pages/shop.html" class="btn btn-primary">Ir a la tienda</a></div>`;return}
  const sl={pending:'⏳ Pendiente',processing:'⚙️ Procesando',shipped:'📦 Enviado',delivered:'✅ Entregado'}
  c.innerHTML=`<div style="overflow-x:auto"><table class="orders-table"><thead><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead><tbody>
    ${orders.map(o=>`<tr onclick="showOrderDetail('${o.id}')" style="cursor:pointer"><td><strong>#${o.id}</strong></td>
    <td style="font-size:.85rem;color:var(--text-muted)">${new Date(o.date).toLocaleDateString('es')}</td>
    <td>${o.items.map(i=>`${i.qty}x ${i.name}`).join(', ')}</td><td><strong>${formatCOP(o.total)}</strong></td>
    <td><span class="order-status ${o.status}">${sl[o.status]||o.status}</span></td></tr>`).join('')}
  </tbody></table></div>`
}
function showOrderDetail(id){
  const o=getOrders().find(x=>x.id===id)
  if(!o)return
  const steps=['pending','processing','shipped','delivered'],ci=steps.indexOf(o.status)
  const sl={pending:'Pendiente',processing:'Procesando',shipped:'Enviado',delivered:'Entregado'}
  const ov=document.createElement('div');ov.className='modal-overlay'
  ov.innerHTML=`<div class="modal" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2.5rem;max-width:560px;width:90%;position:relative">
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer">✕</button>
    <h2 style="font-size:1.5rem;margin-bottom:.3rem">Pedido #${o.id}</h2>
    <p style="font-size:.85rem;color:var(--text-muted)">${new Date(o.date).toLocaleString('es')}</p>
    <hr style="border-color:var(--border);margin:1rem 0">
    <div class="tracking-timeline" style="margin-bottom:1.5rem">
      ${steps.map((s,i)=>`<div class="tracking-step ${i<ci?'completed':i===ci?'active':''}"><h4>${sl[s]}</h4></div>`).join('')}</div>
    ${o.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:.4rem 0;font-size:.9rem;border-bottom:1px solid var(--border)"><span>${i.qty}x ${i.name}</span><span>${formatCOP(i.price*i.qty)}</span></div>`).join('')}
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;font-weight:700;margin-top:.5rem"><span>Total</span><span>${formatCOP(o.total)}</span></div>
    <button class="btn btn-outline btn-block mt-2" onclick="openWhatsAppChat('${o.id}')">📱 Consultar</button></div>`
  document.body.appendChild(ov)
  requestAnimationFrame(()=>ov.classList.add('open'))
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()})
}
function openWhatsAppChat(id){window.open(`https://wa.me/5537999038127?text=${encodeURIComponent('📋 Consulta pedido #'+id)}`,'_blank')}

// ==============================================
// 13. CUSTOMIZE
// ==============================================
function initCustomize(){
  const f=document.getElementById('customizeForm'),pt=document.getElementById('previewText'),to=document.querySelectorAll('.tech-option'),pi=document.getElementById('previewIcon')
  if(!f)return
  to.forEach(b=>{b.addEventListener('click',()=>{to.forEach(x=>x.classList.remove('selected'));b.classList.add('selected')
    if(pi){const icons={bleach:'☠️',tiedye:'🌈',pintura:'🎨',personalizado:'✨'};pi.textContent=icons[b.dataset.tech]||'👕'}})})
  document.getElementById('customText')?.addEventListener('input',e=>{if(pt)pt.textContent=e.target.value||'Tu diseño aquí'})
  f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f),t=document.querySelector('.tech-option.selected')
    const msg=encodeURIComponent(`🎨 *Solicitud HORUS*\n\nTécnica: ${t?t.textContent.trim():'—'}\nTalla: ${d.get('size')||'—'}\nColor: ${d.get('color')||'—'}\nTexto: ${d.get('customText')||'—'}\nIdea: ${d.get('description')||'—'}\n\n¡Hola! Quiero personalizar 🙌`)
    window.open(`https://wa.me/5537999038127?text=${msg}`,'_blank')})
}

// ==============================================
// 14. NAV / UTILITIES
// ==============================================
function initNavbar(){
  const h=document.getElementById('hamburger'),nl=document.getElementById('navLinks')
  if(!h||!nl)return
  h.addEventListener('click',()=>nl.classList.toggle('open'))
  nl.querySelectorAll('a').forEach(a=>{a.addEventListener('click',()=>nl.classList.remove('open'))})
  const p=window.location.pathname
  nl.querySelectorAll('a').forEach(a=>{const h=a.getAttribute('href');if(p===h||(h!=='/'&&p.startsWith(h)))a.classList.add('active')})
}
function initScrollNav(){const n=document.querySelector('.navbar');if(!n)return;window.addEventListener('scroll',()=>n.classList.toggle('scrolled',window.scrollY>50))}
function initReveal(){new IntersectionObserver((entries)=>{entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('visible'),i*80)})},{threshold:.1}).forEach(el=>observer.observe(el),document.querySelectorAll('.reveal'))}
function initCounters(){document.querySelectorAll('.count-up').forEach(el=>{const t=parseInt(el.dataset.target)||parseInt(el.textContent.replace(/[^0-9]/g,''))||0,s=el.textContent.replace(/[0-9]/g,'').trim()
    new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){let c=0,step=Math.ceil(t/40)
      const timer=setInterval(()=>{c+=step;if(c>=t){c=t;clearInterval(timer)}el.textContent=c.toLocaleString()+(s?' '+s:'')},30)
      observer.unobserve(el)}})}).observe(el)})}

// ==============================================
// 15. INIT
// ==============================================
document.addEventListener('DOMContentLoaded',()=>{
  initNavbar();initScrollNav();initReveal();initCounters()
  updateBadge();renderCart();renderCheckout();renderOrders()
  initShop();initSlider();initParticles();initAdmin();initCustomize()
  const ti=document.getElementById('timeIndicator')
  if(ti)ti.textContent=getTimeModeLabel().icon+' '+getTimeModeLabel().text
})
