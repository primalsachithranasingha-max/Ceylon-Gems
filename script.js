const PRODUCTS = [
  {id:1,name:"Natural Ceylon Blue Sapphire",type:"Sapphire",price:5575,weight:"2.15 ct",color:"Royal Blue",origin:"Sri Lanka",treatment:"Unheated",cert:"Available",newest:10,desc:"Sample/demo product. A vivid blue Ceylon sapphire presented with transparent product details."},
  {id:2,name:"Ceylon Padparadscha Sapphire",type:"Padparadscha",price:3900,weight:"1.42 ct",color:"Pinkish Orange",origin:"Sri Lanka",treatment:"See report",cert:"Available",newest:9,desc:"Sample/demo product inspired by the delicate pink-orange tones associated with Padparadscha sapphire."},
  {id:3,name:"Natural Star Sapphire",type:"Star Sapphire",price:1250,weight:"6.80 ct",color:"Blue Grey",origin:"Sri Lanka",treatment:"Not stated",cert:"On request",newest:8,desc:"Sample/demo product featuring a distinctive cabochon-style presentation."},
  {id:4,name:"Ceylon Yellow Sapphire",type:"Yellow Sapphire",price:1850,weight:"3.10 ct",color:"Golden Yellow",origin:"Sri Lanka",treatment:"See report",cert:"Available",newest:7,desc:"Sample/demo product with a warm golden tone and classic Ceylon character."},
  {id:5,name:"Natural Ceylon Ruby",type:"Ruby",price:1650,weight:"1.75 ct",color:"Red",origin:"Sri Lanka",treatment:"See report",cert:"On request",newest:6,desc:"Sample/demo product. Ruby characteristics and treatment should always be verified with documentation."},
  {id:6,name:"Ceylon Cat’s Eye",type:"Cat’s Eye",price:980,weight:"2.60 ct",color:"Honey",origin:"Sri Lanka",treatment:"Not stated",cert:"On request",newest:5,desc:"Sample/demo product showing a honey-toned cat’s eye concept."},
  {id:7,name:"Ceylon Garnet",type:"Garnet",price:520,weight:"4.20 ct",color:"Deep Red",origin:"Sri Lanka",treatment:"Not stated",cert:"On request",newest:4,desc:"Sample/demo product. Replace with verified inventory information before launch."},
  {id:8,name:"Ceylon Moonstone",type:"Moonstone",price:390,weight:"5.35 ct",color:"Blue Sheen",origin:"Sri Lanka",treatment:"Not stated",cert:"On request",newest:3,desc:"Sample/demo product with a soft blue sheen."}
];

const state = {cart: JSON.parse(localStorage.getItem("ceylonCart") || "[]")};

const money = n => "$" + n.toLocaleString("en-US");
const el = id => document.getElementById(id);

function gemCard(p){
  return `<article class="product-card">
    <div class="product-visual"></div>
    <div class="product-info">
      <div class="product-meta"><span class="chip">${p.type}</span><span class="chip">${p.weight}</span></div>
      <h3>${p.name}</h3><p>${p.color} · ${p.origin} · ${p.treatment}</p>
      <div class="card-bottom"><span class="price">${money(p.price)}</span><button class="small-btn" onclick="openProduct(${p.id})">View Details</button></div>
      <button class="btn btn-gold full" style="margin-top:12px" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
  </article>`;
}
function featuredCard(p){
  return `<article class="gem-card"><div class="gem-visual"></div><div class="gem-info"><h3>${p.name.replace("Natural ","")}</h3><p>${p.desc}</p><div class="card-bottom"><span class="price">${money(p.price)}</span><button class="small-btn" onclick="openProduct(${p.id})">View Details</button></div></div></article>`;
}
function renderFeatured(){
  el("featuredGrid").innerHTML = PRODUCTS.slice(0,6).map(featuredCard).join("");
}
function renderProducts(){
  const q = el("productSearch").value.toLowerCase().trim();
  const type = el("typeFilter").value;
  const sort = el("sortProducts").value;
  let list = PRODUCTS.filter(p => (type==="all" || p.type===type) && `${p.name} ${p.type} ${p.color}`.toLowerCase().includes(q));
  if(sort==="price-low") list.sort((a,b)=>a.price-b.price);
  if(sort==="price-high") list.sort((a,b)=>b.price-a.price);
  if(sort==="newest") list.sort((a,b)=>b.newest-a.newest);
  el("productGrid").innerHTML = list.length ? list.map(gemCard).join("") : `<div style="grid-column:1/-1;padding:50px;text-align:center;color:#718092">No matching gemstones found.</div>`;
}
function openProduct(id){
  const p=PRODUCTS.find(x=>x.id===id);
  el("productModalContent").innerHTML = `<div class="product-detail">
    <div class="detail-visual"><div class="detail-gem"></div></div>
    <div><p class="eyebrow">${p.type} · SAMPLE PRODUCT</p><h2>${p.name}</h2><p style="color:#718092">${p.desc}</p>
    <div class="detail-list"><span><b>Weight</b><br>${p.weight}</span><span><b>Color</b><br>${p.color}</span><span><b>Origin</b><br>${p.origin}</span><span><b>Treatment</b><br>${p.treatment}</span><span><b>Certification</b><br>${p.cert}</span><span><b>Price</b><br>${money(p.price)}</span></div>
    <p style="font-size:11px;background:#f7f4ec;padding:12px"><b>Important:</b> Gemstone certification and treatment information will be provided where applicable. Sample product data must be replaced with verified details.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-gold" onclick="addToCart(${p.id});closeModals()">Add to Cart</button><a class="btn btn-outline" style="color:#101820;border-color:#cfd5da" href="#contact" onclick="closeModals()">Contact Seller</a></div></div></div>`;
  openModal("productModal");
}
function addToCart(id){
  const item=state.cart.find(x=>x.id===id);
  if(item) item.qty++; else state.cart.push({id,qty:1});
  saveCart(); renderCart(); flashCart();
}
function removeFromCart(id){state.cart=state.cart.filter(x=>x.id!==id);saveCart();renderCart();}
function changeQty(id,delta){
  const item=state.cart.find(x=>x.id===id); if(!item)return;
  item.qty+=delta; if(item.qty<=0)removeFromCart(id); else {saveCart();renderCart();}
}
function saveCart(){localStorage.setItem("ceylonCart",JSON.stringify(state.cart));el("cartCount").textContent=state.cart.reduce((s,x)=>s+x.qty,0);}
function renderCart(){
  const items=state.cart.map(i=>({...PRODUCTS.find(p=>p.id===i.id),qty:i.qty})).filter(Boolean);
  el("cartItems").innerHTML=items.length ? items.map(p=>`<div class="cart-row"><div><strong>${p.name}</strong><br><small>${p.weight} · ${money(p.price)}</small></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button> ${p.qty} <button onclick="changeQty(${p.id},1)">+</button></div><button class="small-btn remove" onclick="removeFromCart(${p.id})">Remove</button></div>`).join("") : `<p style="color:#718092;padding:25px 0">Your cart is empty. Explore our gemstones and add a selection.</p>`;
  const subtotal=items.reduce((s,p)=>s+p.price*p.qty,0);
  el("cartSubtotal").textContent=money(subtotal);el("cartTotal").textContent=money(subtotal);
}
function flashCart(){el("cartBtn").animate([{transform:"scale(1)"},{transform:"scale(1.15)"},{transform:"scale(1)"}],{duration:300});}
function openModal(id){el(id).classList.add("open");document.body.style.overflow="hidden";}
function closeModals(){document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.remove("open"));document.body.style.overflow="";}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
el("cartBtn").addEventListener("click",()=>{renderCart();openModal("cartModal")});
el("checkoutBtn").addEventListener("click",()=>{if(!state.cart.length){alert("Please add a gemstone to your cart first.");return}closeModals();openModal("checkoutModal")});
el("menuToggle").addEventListener("click",()=>el("nav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>el("nav").classList.remove("open")));
["productSearch","typeFilter","sortProducts"].forEach(id=>el(id).addEventListener("input",renderProducts));
el("contactForm").addEventListener("submit",e=>{e.preventDefault();el("formNote").textContent="Thank you. This demo form is ready to connect to your email or backend service.";e.target.reset()});
el("checkoutForm").addEventListener("submit",e=>{e.preventDefault();el("checkoutNote").textContent="Order inquiry received in demo mode. No payment was processed.";e.target.reset();state.cart=[];saveCart();renderCart()});
document.querySelectorAll(".read-more").forEach(b=>b.addEventListener("click",()=>{el("infoContent").innerHTML=`<p class="eyebrow">CEYLON GEM GUIDE</p><h2>${b.dataset.topic}</h2><p>This educational section is a starter placeholder for your future gemstone guide. Add your own verified educational content, laboratory references and professional advice here.</p>`;openModal("infoModal")}));
el("whatsappBtn").addEventListener("click",()=>{const phone=WHATSAPP_NUMBER.replace(/\D/g,"");window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Hello Ceylon SL Gems, I would like to inquire about a gemstone.")}`,"_blank")});
el("searchBtn").addEventListener("click",()=>{document.querySelector("#shop").scrollIntoView();setTimeout(()=>el("productSearch").focus(),500)});
const WHATSAPP_NUMBER="+94XXXXXXXXX"; // Replace with your real WhatsApp number.
renderFeatured();renderProducts();renderCart();
