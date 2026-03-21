/* ═══════════════════════════════════════════════════════════════
   app.js  —  Muchhad · Main Application Logic
   ─────────────────────────────────────────────────────────────
   Depends on:  db.js  (must be loaded first)
   CDN deps  :  @supabase/supabase-js  ·  @emailjs/browser
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   EMAILJS CONFIG
   Get from: emailjs.com → Account → API Keys
   and your Email Templates dashboard.
───────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'Os2kzS8UJS5eiUoQF';
const EMAILJS_SERVICE_ID  = 'service_9cvh6o5';
const EMAILJS_TEMPLATE_ID = 'template_9o42iyp';

/* ─── Init EmailJS ─── */
emailjs.init(EMAILJS_PUBLIC_KEY);


/* ═══════════════════════════════════════════════════════════════
   PRODUCT CATALOGUE
═══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  {
    id: 0,
    name: "The Heritage Box",
    subtitle: "150g · Roasted Almond",
    category: "Signature Collection",
    price: 99,
    priceDisplay: "₹99.00",
    weight: "150g",
    badge: "Bestseller",
    img: "1.jpg",
    description: "Our original creation — the biscuit that started it all. Slow-baked whole-wheat biscuits with hand-roasted almonds, sweetened only with pure jaggery. No maida, no refined sugar, no preservatives. Just the real deal.",
    ingredients: ["Whole Wheat Flour", "Jaggery", "Roasted Almonds", "Cold-Pressed Ghee", "Rock Salt", "Cardamom"],
    perks: ["No Preservatives", "Jaggery Sweetened", "High Protein", "Slow Baked"]
  },
  {
    id: 1,
    name: "The Sample Pouch",
    subtitle: "Travel-friendly · Try-before-you-commit",
    category: "Try It First",
    price: 0,
    priceDisplay: "Free Sample",
    weight: "30g",
    badge: "Free",
    img: "4.jpg",
    description: "Not sure yet? Try a travel-sized pouch before you commit. Each sample pouch contains 4–5 biscuits — enough to fall in love. One free sample per household.",
    ingredients: ["Whole Wheat Flour", "Jaggery", "Roasted Almonds", "Ghee", "Rock Salt"],
    perks: ["Try Before You Buy", "No Commitment", "Perfect for Travel", "No Artificial Flavours"]
  },
  {
    id: 2,
    name: "The Glass Jar",
    subtitle: "Airtight · Stays fresh longer",
    category: "Premium Packaging",
    price: 129,
    priceDisplay: "₹129.00",
    weight: "150g",
    badge: "Most Fresh",
    img: "2.jpg",
    description: "Same beloved Heritage recipe, stored in a handsome reusable glass jar. The airtight seal locks in the natural flavours of cardamom and roasted almonds.",
    ingredients: ["Whole Wheat Flour", "Jaggery", "Roasted Almonds", "Cold-Pressed Ghee", "Rock Salt", "Cardamom", "Fennel Seeds"],
    perks: ["Reusable Glass Jar", "Airtight Freshness", "Zero Plastic", "Shelf-Ready"]
  },
  {
    id: 3,
    name: "The Variety Set",
    subtitle: "Almond, Pista & More",
    category: "Gift Collection",
    price: 289,
    priceDisplay: "₹289.00",
    weight: "3 × 100g",
    badge: "Great Gift",
    img: "3.jpg",
    description: "Three distinct flavours — Roasted Almond, Pista Rose, and Sesame Jaggery. Each one a love letter to a different region of India. Gift it to someone you care about.",
    ingredients: ["Whole Wheat Flour", "Jaggery", "Roasted Almonds", "Pistachios", "Rose Petals", "Sesame Seeds", "Cold-Pressed Ghee", "Rock Salt", "Cardamom"],
    perks: ["3 Unique Flavours", "Gift-Ready Box", "No Refined Sugar", "Handcrafted"]
  }
];


/* ═══════════════════════════════════════════════════════════════
   CART STATE & HELPERS
═══════════════════════════════════════════════════════════════ */
let cart = []; // [{ productId: number, qty: number }]

function getCartItem(id)    { return cart.find(i => i.productId === id); }
function cartTotal()        { return cart.reduce((sum, i) => sum + PRODUCTS[i.productId].price * i.qty, 0); }
function cartItemCount()    { return cart.reduce((s, i) => s + i.qty, 0); }

function addToCart(productId, event) {
  if (event) event.stopPropagation();
  const existing = getCartItem(productId);
  existing ? existing.qty++ : cart.push({ productId, qty: 1 });
  renderCart();
  updateBadge();
  flashAddBtn(event);
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  renderCart();
  updateBadge();
}

function changeQty(productId, delta) {
  const item = getCartItem(productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else { renderCart(); updateBadge(); }
}

function updateBadge() {
  const count = cartItemCount();
  const badge = document.getElementById('cart-badge');
  badge.textContent = count;
  count > 0 ? badge.classList.add('visible') : badge.classList.remove('visible');
}

function flashAddBtn(event) {
  if (!event) return;
  const btn = event.currentTarget || event.target;
  btn.classList.add('added');
  btn.innerHTML = '<span class="material-symbols-outlined text-base" style="font-variation-settings:\'FILL\' 1;">check_circle</span> Added!';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<span class="material-symbols-outlined text-base">add_shopping_cart</span>Pre-order';
  }, 1400);
}


/* ═══════════════════════════════════════════════════════════════
   CART RENDER
═══════════════════════════════════════════════════════════════ */
function renderCart() {
  const list    = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty-cart-state">
        <span class="material-symbols-outlined text-6xl text-text-muted opacity-40">shopping_basket</span>
        <p class="font-display text-xl font-bold text-text-muted uppercase tracking-wider">Your cart is empty</p>
        <p class="font-body text-sm text-text-muted italic">Add some homemade goodness!</p>
        <button
          onclick="closeCart(); document.getElementById('product').scrollIntoView({behavior:'smooth'})"
          class="mt-4 h-10 px-6 border-2 border-text-main font-display text-xs font-bold uppercase tracking-widest hover:bg-text-main hover:text-background-light transition-all">
          Browse Products
        </button>
      </div>`;
    totalEl.textContent = '₹0.00';
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    checkoutBtn.style.cursor  = 'not-allowed';
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = '1';
  checkoutBtn.style.cursor  = 'pointer';

  list.innerHTML = cart.map(item => {
    const p = PRODUCTS[item.productId];
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}" class="cart-item-img sepia-img" />
        <div class="cart-item-meta">
          <p class="font-display text-sm font-bold uppercase tracking-tight text-text-main leading-tight">${p.name}</p>
          <p class="font-body text-xs text-text-muted italic mt-0.5">${p.subtitle}</p>
          <p class="font-display text-base font-bold text-text-main mt-2">${p.priceDisplay}</p>
          <div class="flex items-center gap-0 mt-3">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <div class="cart-qty-display">${item.qty}</div>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
            <button onclick="removeFromCart(${p.id})"
              class="ml-auto flex items-center justify-center text-text-muted hover:text-text-main transition-colors">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  const total = cartTotal();
  totalEl.textContent = total === 0 ? 'Free' : `₹${total.toFixed(2)}`;
}


/* ═══════════════════════════════════════════════════════════════
   CART SIDEBAR OPEN / CLOSE
═══════════════════════════════════════════════════════════════ */
function openCart() {
  renderCart();
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}


/* ═══════════════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
let currentModalProduct = null;

function openModal(productId) {
  const p = PRODUCTS[productId];
  currentModalProduct = productId;

  document.getElementById('modal-img').src            = p.img;
  document.getElementById('modal-img').alt            = p.name;
  document.getElementById('modal-badge').textContent  = p.badge;
  document.getElementById('modal-category').textContent = p.category;
  document.getElementById('modal-title').textContent  = p.name;
  document.getElementById('modal-subtitle').textContent = p.subtitle;
  document.getElementById('modal-description').textContent = p.description;
  document.getElementById('modal-price').textContent  = p.priceDisplay;
  document.getElementById('modal-weight').textContent = p.weight;

  document.getElementById('modal-ingredients').innerHTML = p.ingredients.map(ing => `
    <li class="flex items-center gap-1.5 bg-background-light border border-text-main/40 px-3 py-1 font-body text-xs text-text-main">
      <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>${ing}
    </li>`).join('');

  document.getElementById('modal-perks').innerHTML = p.perks.map(perk => `
    <span class="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-text-muted">
      <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings:'FILL' 1;">check_circle</span>${perk}
    </span>`).join('');

  const btn = document.getElementById('modal-atc-btn');
  btn.classList.remove('added');
  btn.innerHTML = '<span class="material-symbols-outlined text-base">add_shopping_cart</span> Add to Cart';
  btn.style.pointerEvents = 'all';

  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentModalProduct = null;
}

function modalAddToCart() {
  if (currentModalProduct === null) return;
  addToCart(currentModalProduct, null);
  const btn = document.getElementById('modal-atc-btn');
  btn.classList.add('added');
  btn.innerHTML = '<span class="material-symbols-outlined text-base" style="font-variation-settings:\'FILL\' 1;">check_circle</span> Added to Cart!';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<span class="material-symbols-outlined text-base">add_shopping_cart</span> Add to Cart';
  }, 1800);
}


/* ═══════════════════════════════════════════════════════════════
   PRE-ORDER MODAL — OPEN
═══════════════════════════════════════════════════════════════ */
function openPreorderModal() {
  if (cart.length === 0) return;
  closeCart();

  /* Populate order summary panel */
  const list    = document.getElementById('preorder-items-list');
  const totalEl = document.getElementById('preorder-total-display');

  list.innerHTML = cart.map(item => {
    const p = PRODUCTS[item.productId];
    return `
      <div class="preorder-summary-item">
        <img src="${p.img}" alt="${p.name}" class="preorder-summary-img sepia-img"/>
        <div class="flex-1 min-w-0">
          <p class="font-display text-sm font-bold uppercase tracking-tight text-text-main leading-tight">${p.name}</p>
          <p class="font-body text-xs text-text-muted italic mt-0.5">${p.subtitle}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="font-body text-xs text-text-muted">Qty: ${item.qty}</span>
            <span class="font-display text-sm font-bold text-text-main">
              ${p.price === 0 ? 'Free' : '₹' + (p.price * item.qty).toFixed(2)}
            </span>
          </div>
        </div>
      </div>`;
  }).join('');

  const total = cartTotal();
  totalEl.textContent = total === 0 ? 'Free' : `₹${total.toFixed(2)}`;

  /* Reset form */
  document.getElementById('preorder-form-view').style.display = '';
  document.getElementById('preorder-success').classList.remove('show');
  clearFormErrors();
  resetFormFields();

  document.getElementById('preorder-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePreorderModal() {
  document.getElementById('preorder-modal').classList.remove('open');
  document.body.style.overflow = '';
}


/* ═══════════════════════════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════════════════════════ */
const FIELDS = ['po-name', 'po-email', 'po-phone', 'po-address'];

function clearFormErrors() {
  FIELDS.forEach(id => {
    document.getElementById(id).classList.remove('error');
    document.getElementById(id + '-err').classList.remove('show');
  });
  document.getElementById('po-api-error').classList.add('hidden');
  document.getElementById('po-api-error').textContent = '';
}

function resetFormFields() {
  FIELDS.forEach(id => { document.getElementById(id).value = ''; });
}

function validateForm() {
  let valid = true;
  const v = {};
  FIELDS.forEach(id => { v[id] = document.getElementById(id).value.trim(); });

  const rules = [
    { id: 'po-name',    test: v['po-name'].length > 1,
      msg: 'Please enter your full name.' },
    { id: 'po-email',   test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v['po-email']),
      msg: 'Please enter a valid email address.' },
    { id: 'po-phone',   test: /^\d{10}$/.test(v['po-phone']),
      msg: 'Please enter a valid 10-digit mobile number.' },
    { id: 'po-address', test: v['po-address'].length >= 10,
      msg: v['po-address'].length === 0 ? 'Please enter your delivery address.' : 'Address seems too short — please be more specific.' }
  ];

  rules.forEach(({ id, test, msg }) => {
    if (!test) {
      document.getElementById(id).classList.add('error');
      const errEl = document.getElementById(id + '-err');
      errEl.textContent = msg;
      errEl.classList.add('show');
      valid = false;
    }
  });

  return valid;
}


/* ═══════════════════════════════════════════════════════════════
   PRE-ORDER SUBMIT
═══════════════════════════════════════════════════════════════ */
async function submitPreorder() {
  clearFormErrors();
  if (!validateForm()) return;

  const btn = document.getElementById('po-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving your order...';

  const name    = document.getElementById('po-name').value.trim();
  const email   = document.getElementById('po-email').value.trim();
  const phone   = document.getElementById('po-phone').value.trim();
  const address = document.getElementById('po-address').value.trim();
  const total   = cartTotal();

  /* Build structured cart items for the database */
  const cartItems = cart.map(item => ({
    product_id:   PRODUCTS[item.productId].id,
    product_name: PRODUCTS[item.productId].name,
    quantity:     item.qty,
    unit_price:   PRODUCTS[item.productId].price,
    line_total:   PRODUCTS[item.productId].price * item.qty
  }));

  /* Human-readable order string for the email template */
  const orderSummaryText = cartItems
    .map(i => `${i.product_name} × ${i.quantity}  —  ${i.unit_price === 0 ? 'Free' : '₹' + i.line_total}`)
    .join('\n');

  /* ── Step 1: Save to Supabase ── */
  const dbResult = await window.MuchhhadDB.savePreorder({
    name, email, phone, address,
    cart_items:   cartItems,
    total_amount: total,
    status:       'pending'
  });

  if (!dbResult.success) {
    document.getElementById('po-api-error').textContent =
      'Something went wrong saving your order. Please try again or WhatsApp us directly.';
    document.getElementById('po-api-error').classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined text-base">bookmark_added</span> Confirm Pre-Order';
    return;
  }

  /* ── Step 2: Send confirmation email ── */
  btn.innerHTML = '<span class="spinner"></span> Sending confirmation...';

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      customer_name:    name,
      customer_email:   email,
      customer_phone:   phone,
      customer_address: address,
      order_items:      orderSummaryText,
      order_total:      total === 0 ? 'Free' : '₹' + total.toFixed(2),
      to_email:         email,
      reply_to:         'hello@muchhad.com'   // ← update to your email
    });
  } catch (emailErr) {
    /* Email failed, but order is saved — don't block the user */
    console.warn('[Muchhad] EmailJS warning (order still saved):', emailErr);
  }

  /* ── Step 3: Clear cart & show success ── */
  cart = [];
  updateBadge();
  showPreorderSuccess(name, email);
}


/* ═══════════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════════ */
function showPreorderSuccess(name, email) {
  document.getElementById('preorder-form-view').style.display = 'none';
  const successEl = document.getElementById('preorder-success');
  document.getElementById('success-message').textContent =
    `Hey ${name.split(' ')[0]}! We've saved your spot. A confirmation has been sent to ${email}.`;
  successEl.classList.add('show');
  launchConfetti();
}

function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#D4AF37', '#8FBC8F', '#EAE0D5', '#3E2723', '#D6C5B3'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 10}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      transform: rotate(${Math.random() * 360}deg);
      animation-delay: ${(Math.random() * 0.5).toFixed(2)}s;
      animation-duration: ${(0.8 + Math.random() * 0.8).toFixed(2)}s;
    `;
    container.appendChild(el);
  }
}


/* ═══════════════════════════════════════════════════════════════
   TEAM RING ANIMATION
═══════════════════════════════════════════════════════════════ */
(function initRing() {
  const members    = document.querySelectorAll('.ring-member');
  if (!members.length) return;

  const baseAngles = [0, 51.43, 102.86, 154.29, 205.71, 257.14, 308.57];
  const R = 38;
  let offset = 0, paused = false, last = null;

  members.forEach(m => {
    m.addEventListener('mouseenter', () => paused = true);
    m.addEventListener('mouseleave', () => paused = false);
  });

  function tick(ts) {
    if (last !== null && !paused) offset += (ts - last) * 0.018;
    last = ts;
    members.forEach((m, i) => {
      const rad = (baseAngles[i] + offset) * Math.PI / 180;
      m.style.left = (50 + R * Math.sin(rad)) + '%';
      m.style.top  = (50 - R * Math.cos(rad)) + '%';
    });
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
    closePreorderModal();
  }
});
