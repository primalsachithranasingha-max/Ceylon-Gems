const grid = document.querySelector("#product-grid");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const empty = document.querySelector("#empty");
let activeFilter = "all";

const money = n => new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0}).format(n);

function renderProducts() {
  let list = PRODUCTS.filter(p => activeFilter === "all" || p.type === activeFilter)
    .filter(p => `${p.name} ${p.type}`.toLowerCase().includes(search.value.toLowerCase().trim()));

  if (sort.value === "low") list.sort((a,b)=>a.price-b.price);
  if (sort.value === "high") list.sort((a,b)=>b.price-a.price);

  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <button class="product-image" data-id="${p.id}" aria-label="View ${p.name}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="view-badge">View Gem</span>
      </button>
      <div class="product-info">
        <p class="product-type">${p.type} · ${p.carat}</p>
        <h3>${p.name}</h3>
        <div class="product-bottom"><strong>${money(p.price)}</strong><button class="details" data-id="${p.id}">Details →</button></div>
      </div>
    </article>`).join("");

  empty.hidden = list.length !== 0;
}
renderProducts();

document.querySelector("#filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter"); if (!btn) return;
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); activeFilter = btn.dataset.filter; renderProducts();
});
search.addEventListener("input", renderProducts);
sort.addEventListener("change", renderProducts);

const modal = document.querySelector("#product-modal");
function openProduct(id) {
  const p = PRODUCTS.find(x=>x.id === Number(id)); if (!p) return;
  document.querySelector("#modal-image").src = p.image;
  document.querySelector("#modal-image").alt = p.name;
  document.querySelector("#modal-type").textContent = `${p.type} · ${p.carat}`;
  document.querySelector("#modal-title").textContent = p.name;
  document.querySelector("#modal-price").textContent = money(p.price);
  document.querySelector("#modal-description").textContent = p.description;
  document.querySelector("#modal-specs").innerHTML = `<div><dt>Carat weight</dt><dd>${p.carat}</dd></div><div><dt>Treatment</dt><dd>${p.treatment}</dd></div><div><dt>Origin</dt><dd>Ceylon / Sri Lanka — verify for actual stone</dd></div>`;
  document.querySelector("#modal-whatsapp").href = `https://wa.me/94700000000?text=${encodeURIComponent(`Hello Ceylon Gems, I am interested in ${p.name} (${p.carat}). Please send me more details.`)}`;
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
}
grid.addEventListener("click", e => {
  const target = e.target.closest("[data-id]"); if (target) openProduct(target.dataset.id);
});
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click", closeModal));
function closeModal(){modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open");}
document.addEventListener("keydown", e=>{if(e.key==="Escape") closeModal();});

document.querySelector(".menu-toggle").addEventListener("click",()=>document.querySelector(".nav-links").classList.toggle("show"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav-links").classList.remove("show")));

document.querySelector("#contact-form").addEventListener("submit", e=>{
  e.preventDefault();
  document.querySelector("#form-status").textContent = "Thank you. Your enquiry is ready to be connected to your email/WhatsApp service.";
  e.target.reset();
});
document.querySelector("#year").textContent = new Date().getFullYear();