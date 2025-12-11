// Global State
let cart = [];
let currentUser = null;
let products = [];
let selectedProduct = null;
let appliedVoucher = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  loadProducts();
  setupEventListeners();
  loadCart();
});

// Check Session
async function checkSession() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    if (data.logged_in) {
      currentUser = data.user;
      updateUserUI();
    }
  } catch (err) {
    console.error('Session check error:', err);
  }
}

// Update User UI
function updateUserUI() {
  if (currentUser) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('memberBtn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username + (currentUser.is_member ? ' 👑' : '');
  } else {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('memberBtn').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
  }
}

// Event Listeners
function setupEventListeners() {
  // Login
  document.getElementById('loginBtn').addEventListener('click', () => {
    openModal('loginModal');
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.success) {
        currentUser = result.user;
        updateUserUI();
        closeModal('loginModal');
        alert('เข้าสู่ระบบสำเร็จ');
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      currentUser = null;
      updateUserUI();
      alert('ออกจากระบบสำเร็จ');
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  });

  // Member
  document.getElementById('memberBtn').addEventListener('click', () => {
    showSection('member');
  });

  document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/membership/register', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        alert('สมัครสมาชิกสำเร็จ! รอการอนุมัติจากแอดมิน');
        closeModal('memberModal');
        e.target.reset();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  });

  // Voucher Form
  document.getElementById('voucherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/vouchers/create', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        alert(`สั่งซื้อสำเร็จ!\nรหัส Voucher: ${result.code}\nรอการอนุมัติจากแอดมิน`);
        closeModal('voucherModal');
        e.target.reset();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  });

  // Checkout Form
  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const subtotal = calculateSubtotal();
    const discount = appliedVoucher ? Math.min(subtotal, appliedVoucher.remaining) : 0;
    const total = Math.max(0, subtotal - discount);

    formData.append('items', JSON.stringify(cart));
    formData.append('subtotal', subtotal);
    formData.append('discount', discount);
    formData.append('total', total);
    if (appliedVoucher) formData.append('voucher_code', appliedVoucher.code);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        alert(`สั่งซื้อสำเร็จ!\nเลขที่คำสั่งซื้อ: ${result.order_number}`);
        cart = [];
        appliedVoucher = null;
        saveCart();
        updateCartCount();
        closeModal('checkoutModal');
        closeModal('cartModal');
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  });
}

// Load Products
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    products = await res.json();
    displayProducts(products);
  } catch (err) {
    console.error('Load products error:', err);
  }
}

// Display Products
function displayProducts(items) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = items.map(p => `
    <div class="product-card" onclick="showProduct(${p.id})">
      <img src="/Image/${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E${p.name}%3C/text%3E%3C/svg%3E'">
      <div class="info">
        <h4>${p.name}</h4>
        <p class="price">฿${p.price}</p>
      </div>
    </div>
  `).join('');
}

// Filter Products
function filterProducts(category) {
  // Update active tab
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  if (category === 'all') {
    displayProducts(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    displayProducts(filtered);
  }
}

// Show Product Detail
function showProduct(id) {
  selectedProduct = products.find(p => p.id === id);
  if (!selectedProduct) return;

  document.getElementById('productName').textContent = selectedProduct.name;
  document.getElementById('productDesc').textContent = selectedProduct.description;
  document.getElementById('productPrice').textContent = `฿${selectedProduct.price}`;

  // Show options if available
  const optionsDiv = document.getElementById('productOptions');
  optionsDiv.innerHTML = '';

  try {
    const options = JSON.parse(selectedProduct.options);

    if (options.sizes) {
      optionsDiv.innerHTML += `
        <label>ไซส์:</label>
        <select id="productSize">
          ${options.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      `;
    }

    if (options.colors) {
      optionsDiv.innerHTML += `
        <label>สี:</label>
        <select id="productColor">
          ${options.colors.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      `;
    }

    if (options.patterns) {
      optionsDiv.innerHTML += `
        <label>ลาย:</label>
        <select id="productPattern">
          ${options.patterns.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
      `;
    }
  } catch (e) {
    // No options
  }

  optionsDiv.innerHTML += `
    <label>จำนวน:</label>
    <input type="number" id="productQty" value="1" min="1" max="10">
  `;

  openModal('productModal');
}

// Add to Cart
function addToCart() {
  if (!selectedProduct) return;

  const qty = parseInt(document.getElementById('productQty').value);
  let price = selectedProduct.price;
  let options = {};

  // Get selected options
  const sizeEl = document.getElementById('productSize');
  const colorEl = document.getElementById('productColor');
  const patternEl = document.getElementById('productPattern');

  if (sizeEl) {
    options.size = sizeEl.value;
    // 3XL ขึ้นไป ราคา 250
    if (['3XL', '4XL', '5XL'].includes(options.size)) {
      price = 250;
    }
  }
  if (colorEl) options.color = colorEl.value;
  if (patternEl) options.pattern = patternEl.value;

  // Check if buying 2 tumblers
  const tumblerCount = cart.filter(item => item.name.includes('Tumbler')).reduce((sum, item) => sum + item.qty, 0);
  if (selectedProduct.name.includes('Tumbler') && tumblerCount + qty >= 2) {
    // Apply promotion: 2 for 500
    price = 250; // 500 / 2
  }

  const item = {
    id: selectedProduct.id,
    name: selectedProduct.name,
    price: price,
    qty: qty,
    options: options
  };

  // Check if item already exists
  const existingIndex = cart.findIndex(i =>
    i.id === item.id &&
    JSON.stringify(i.options) === JSON.stringify(item.options)
  );

  if (existingIndex >= 0) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push(item);
  }

  saveCart();
  updateCartCount();
  closeModal('productModal');
  alert('เพิ่มสินค้าลงตะกร้าแล้ว');
}

// Show Cart
function showCart() {
  const cartItemsDiv = document.getElementById('cartItems');

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p style="text-align:center;padding:20px;">ตะกร้าว่าง</p>';
  } else {
    cartItemsDiv.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
          <p>จำนวน: ${item.qty}</p>
        </div>
        <div>
          <span class="cart-item-price">฿${item.price * item.qty}</span>
          <button class="remove-btn" onclick="removeFromCart(${index})">ลบ</button>
        </div>
      </div>
    `).join('');
  }

  updateCartSummary();
  openModal('cartModal');
}

// Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  showCart();
}

// Calculate Subtotal
function calculateSubtotal() {
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Apply member discount for books
  if (currentUser && currentUser.is_member) {
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product && product.category === 'book') {
        const discount = product.name.includes('Success Publisher') ? 0.15 : 0.10;
        subtotal -= (product.price * item.qty * discount);
      }
    });
  }

  return subtotal;
}

// Update Cart Summary
function updateCartSummary() {
  const subtotal = calculateSubtotal();
  let discount = 0;

  if (appliedVoucher) {
    discount = Math.min(subtotal, appliedVoucher.remaining);
  }

  const total = Math.max(0, subtotal - discount);

  document.getElementById('cartSubtotal').textContent = subtotal.toFixed(2);
  document.getElementById('cartTotal').textContent = total.toFixed(2);

  if (discount > 0) {
    document.getElementById('cartDiscount').style.display = 'block';
    document.getElementById('discountAmount').textContent = discount.toFixed(2);
  } else {
    document.getElementById('cartDiscount').style.display = 'none';
  }
}

// Apply Voucher
async function applyVoucher() {
  const code = document.getElementById('voucherCode').value.trim();
  if (!code) return alert('กรุณากรอกรหัส Voucher');

  try {
    const res = await fetch(`/api/vouchers/check/${code}`);
    const data = await res.json();

    if (res.ok && data.status === 'approved') {
      if (data.remaining <= 0) {
        alert('Voucher นี้ถูกใช้หมดแล้ว');
      } else {
        appliedVoucher = data;
        updateCartSummary();
        alert(`ใช้ Voucher สำเร็จ! มูลค่าคงเหลือ: ฿${data.remaining}`);
      }
    } else {
      alert('ไม่พบรหัส Voucher หรือยังไม่ได้รับการอนุมัติ');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด');
  }
}

// Checkout
function checkout() {
  if (cart.length === 0) return alert('ตะกร้าว่าง');

  const total = parseFloat(document.getElementById('cartTotal').textContent);
  document.getElementById('checkoutTotal').textContent = total.toFixed(2) + ' บาท';

  // Hide slip upload if total is 0
  if (total === 0) {
    document.getElementById('slipLabel').style.display = 'none';
    document.querySelector('#checkoutForm input[name="slip"]').required = false;
  } else {
    document.getElementById('slipLabel').style.display = 'block';
    document.querySelector('#checkoutForm input[name="slip"]').required = true;
  }

  closeModal('cartModal');
  openModal('checkoutModal');
}

// Save/Load Cart
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartCount();
  }
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

// Voucher Selection
function selectVoucher(price, credit) {
  document.getElementById('voucherPrice').textContent = price;
  document.getElementById('voucherCredit').textContent = credit;

  // Update template prices
  const templatePrice = document.getElementById('templatePrice');
  const templateCredit = document.getElementById('templateCredit');
  if (templatePrice) templatePrice.textContent = price;
  if (templateCredit) templateCredit.textContent = credit;

  openModal('voucherModal');
}

// Show Section
function showSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');

  // Show selected section
  if (section === 'voucher') {
    document.getElementById('voucherSection').style.display = 'block';
  } else if (section === 'shop') {
    document.getElementById('shopSection').style.display = 'block';
  } else if (section === 'member') {
    document.getElementById('memberSection').style.display = 'block';
  }

  // Scroll to section
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Member Form
function showMemberForm() {
  openModal('memberModal');
}

// Scroll to Section (generic)
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Scroll to Member Section (legacy support)
function scrollToMember() {
  scrollToSection('memberSection');
}

// Scroll to Shop with filter
function scrollToShop(category) {
  const shopSection = document.getElementById('shopSection');
  if (shopSection) {
    // Show the shop section first
    shopSection.style.display = 'block';
    // Filter products
    filterProducts(category);
    // Scroll to shop section
    shopSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Show Check Status - Open modal
function showCheckStatus() {
  openModal('checkStatusModal');
}

// Modal Functions
function openModal(id) {
  document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}

// ============ Auth Functions ============

// Show Auth Tab
function showAuthTab(tabName) {
  // Hide all forms
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });

  // Remove active from all tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected form
  const selectedForm = document.getElementById(tabName + 'Tab');
  if (selectedForm) {
    selectedForm.classList.add('active');
  }

  // Activate tab button (if it exists)
  const tabButtons = document.querySelectorAll('.auth-tab');
  if (tabName === 'login' && tabButtons[0]) tabButtons[0].classList.add('active');
  if (tabName === 'register' && tabButtons[1]) tabButtons[1].classList.add('active');
}

// Copy Forgot Template
function copyForgotTemplate() {
  const template = document.getElementById('forgotTemplate');
  copyToClipboard(template.innerText, 'คัดลอกข้อความสำเร็จ! วางใน LINE ได้เลย');
}

// Login Form Submit
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const phone = formData.get('phone');
      const password = formData.get('password');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        const data = await res.json();

        if (data.success) {
          showToast('เข้าสู่ระบบสำเร็จ!');
          closeModal('loginModal');
          location.reload();
        } else {
          alert(data.error || 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const fullname = formData.get('fullname');
      const phone = formData.get('phone');
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่');
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullname, phone, email, password })
        });
        const data = await res.json();

        if (data.success) {
          showToast('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
          showAuthTab('login');
          e.target.reset();
        } else {
          alert(data.error || 'เบอร์โทรนี้ถูกใช้แล้ว');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    });
  }
});

// Copy Template Functions
function copyTemplate() {
  const template = document.getElementById('lineTemplate');
  copyToClipboard(template.innerText, 'คัดลอกข้อความสำเร็จ! วางใน LINE ได้เลย');
}

function copyCheckoutTemplate() {
  const template = document.getElementById('checkoutTemplate');
  copyToClipboard(template.innerText, 'คัดลอกข้อความสำเร็จ! วางใน LINE ได้เลย');
}

function copyMemberTemplate() {
  const template = document.getElementById('memberTemplate');
  copyToClipboard(template.innerText, 'คัดลอกข้อความสำเร็จ! วางใน LINE ได้เลย');
}

function copyStatusTemplate() {
  const template = document.getElementById('statusTemplate');
  copyToClipboard(template.innerText, 'คัดลอกข้อความสำเร็จ! วางใน LINE ได้เลย');
}

// Copy Account Number Functions
function copyAccountNumber() {
  copyToClipboard('0592647984', 'คัดลอกเลขบัญชีสำเร็จ!');
}

function copyAccountNumber2() {
  copyToClipboard('0592647984', 'คัดลอกเลขบัญชีสำเร็จ!');
}

function copyAccountNumber3() {
  copyToClipboard('0592647984', 'คัดลอกเลขบัญชีสำเร็จ!');
}

// Generic Copy to Clipboard Function
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

// Fallback for older browsers
function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showCopySuccess(successMessage);
  } catch (err) {
    alert('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
  }
  document.body.removeChild(textArea);
}

// Show Copy Success Toast
function showCopySuccess(message) {
  // Remove existing toast
  const existingToast = document.querySelector('.copy-toast');
  if (existingToast) existingToast.remove();

  // Create toast
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);

  // Animate
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ============ Gallery Functions ============

// Gallery images list (excluding ระบบชำระเงิน.png)
const galleryImages = [
  '/Image/2.png',
  '/Image/3.png',
  '/Image/4.png',
  '/Image/5.png',
  '/Image/6.png',
  '/Image/7.png',
  '/Image/8.png',
  '/Image/9.png',
  '/Image/10.png',
  '/Image/หนังสือ.png'
];

let currentImageIndex = 0;

// Scroll Gallery
function scrollGallery(direction) {
  const slider = document.getElementById('gallerySlider');
  const scrollAmount = 220; // width + gap
  slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Open Lightbox
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');

  currentImageIndex = galleryImages.indexOf(imageSrc);
  if (currentImageIndex === -1) currentImageIndex = 0;

  lightboxImage.src = imageSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Lightbox
function closeLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// Change Lightbox Image
function changeLightboxImage(direction) {
  currentImageIndex += direction;

  // Loop around
  if (currentImageIndex < 0) currentImageIndex = galleryImages.length - 1;
  if (currentImageIndex >= galleryImages.length) currentImageIndex = 0;

  const lightboxImage = document.getElementById('lightboxImage');
  lightboxImage.src = galleryImages[currentImageIndex];
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox || !lightbox.classList.contains('active')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') changeLightboxImage(-1);
  if (e.key === 'ArrowRight') changeLightboxImage(1);
});
