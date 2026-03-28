const menuData = [
    {
        id: 1,
        name: "Truffle Arancini",
        category: "starters",
        dietary: "veg",
        price: 350,
        discount: 10,
        description: "Velvety risotto spheres infused with Perigord black truffles and molten mozzarella, finished with a whisper of garlic emulsion.",
        image: "truffle_arancini_premium_1774699613755.png",
        signature: true
    },
    {
        id: 2,
        name: "Pan-Seared Sea Bass",
        category: "mains",
        dietary: "non-veg",
        price: 750,
        discount: 0,
        description: "Day-boat Sea Bass with a golden-crisp skin, served over creamed seasonal greens and finished with a citrus-herb reduction.",
        image: "sea_bass_premium_1774699663080.png"
    },
    {
        id: 3,
        name: "Wagyu Beef Carpaccio",
        category: "starters",
        dietary: "non-veg",
        price: 550,
        discount: 15,
        description: "Paper-thin ribbons of A5 Wagyu, adorned with salt-cured capers, aged Parmigiano-Reggiano, and a drizzle of cold-pressed truffle nectar.",
        image: "wagyu_carpaccio_premium_1774699689465.png",
        signature: true
    },
    {
        id: 4,
        name: "Saffron Risotto",
        category: "mains",
        dietary: "veg",
        price: 650,
        discount: 0,
        description: "Signature arborio rice slow-tempered with hand-picked saffron threads, toasted Mediterranean pine nuts, and 24-month aged parmesan.",
        image: "saffron_risotto_premium_1774699800575.png"
    },
    {
        id: 5,
        name: "Deconstructed Cheesecake",
        category: "desserts",
        dietary: "veg",
        price: 290,
        discount: 0,
        description: "A contemporary play on the classic: Whipped Tahitian vanilla cream, wild berry reduction, and a hand-crumbled artisanal shortbread.",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 6,
        name: "Chocolate Lava Cake",
        category: "desserts",
        dietary: "veg",
        price: 250,
        discount: 20,
        description: "Decadent Valrhona chocolate sponge with a cascading molten core, paired with a scoop of Madagascar vanilla bean gelato.",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 7,
        name: "Smoked Old Fashioned",
        category: "drinks",
        dietary: "veg",
        price: 380,
        discount: 0,
        description: "Small-batch bourbon, hand-charred maple, and house bitters, presented in a cloud of cherry-wood smoke.",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
        signature: true
    },
    {
        id: 8,
        name: "Passionfruit Martini",
        category: "drinks",
        dietary: "veg",
        price: 350,
        discount: 5,
        description: "Crystal-clear vodka shaken with vibrant passionfruit nectar, hand-squeezed lime, and a persistent sparkle of prosecco.",
        image: "https://images.unsplash.com/photo-1536935338218-d413524f4245?auto=format&fit=crop&q=80&w=800"
    }
];

// State
function migrateData() {
    ['menu', 'cart', 'orders'].forEach(key => {
        const oldKey = `lumina_${key}`;
        const newKey = `beast_${key}`;
        if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, localStorage.getItem(oldKey));
            localStorage.removeItem(oldKey);
        }
    });
}
migrateData();

let cart = JSON.parse(localStorage.getItem('beast_cart')) || [];
let currentCategory = 'all';
let currentDiet = 'all';

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPriceElement = document.getElementById('total-price');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.getElementById('header');
const toast = document.getElementById('toast');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const detailsForm = document.getElementById('details-form');
const backToCart = document.getElementById('back-to-cart');
const backToDetails = document.querySelectorAll('.back-to-details');
const backToPayment = document.querySelectorAll('.back-to-payment');
const paymentOptions = document.querySelectorAll('.payment-opt');
const onlineMethodBtns = document.querySelectorAll('.online-method-btn');
const confirmOnline = document.getElementById('confirm-online');
const upiSection = document.getElementById('upi-section');
const cardSection = document.getElementById('card-section');

const orderDetails = {
    customer: {},
    payment: { method: '', type: '' }
};

// Nutrition Elements
const nutritionModal = document.getElementById('nutrition-modal');
const openNutritionBtn = document.getElementById('open-nutrition-modal');
const closeNutritionBtn = document.getElementById('close-nutrition');
const nutritionForm = document.getElementById('nutrition-form');
const nutritionResult = document.getElementById('nutrition-result');
const proteinVal = document.getElementById('protein-result-val');
const closeAndMenu = document.getElementById('close-and-menu');

// Initial Render
function init() {
    const savedMenu = localStorage.getItem('beast_menu');
    if (savedMenu) {
        window.menuItems = JSON.parse(savedMenu);
    } else {
        window.menuItems = menuData;
        localStorage.setItem('beast_menu', JSON.stringify(menuData));
    }
    
    renderMenu();
    updateCartUI();
    setupEventListeners();
}

function renderMenu() {
    menuGrid.innerHTML = '';
    const items = window.menuItems || menuData;
    const filteredItems = items.filter(item => {
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchDiet = currentDiet === 'all' || item.dietary === currentDiet;
        return matchCategory && matchDiet;
    });

    filteredItems.forEach(item => {
        const hasDiscount = item.discount > 0;
        const discountedPrice = hasDiscount 
            ? (item.price * (1 - item.discount / 100)).toFixed(2)
            : item.price.toFixed(2);

        const card = document.createElement('div');
        card.className = 'menu-item reveal';
        const dietaryClass = item.dietary === 'veg' ? 'dietary-veg' : 'dietary-non-veg';
        
        card.innerHTML = `
            <div class="menu-item-img" style="background-image: url('${item.image}')">
                ${hasDiscount ? `<div class="discount-badge">${item.discount}% OFF</div>` : ''}
                ${item.signature ? `<div class="signature-badge">Signature Choice</div>` : ''}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3><span class="dietary-badge ${dietaryClass}"></span>${item.name}</h3>
                    <div class="price">
                        ${hasDiscount ? `<span class="old-price">₹${item.price}</span>` : ''}
                        ₹${discountedPrice}
                    </div>
                </div>
                <p>${item.description}</p>
                <button class="add-btn" onclick="addToCart(${item.id})">Add to Order</button>
            </div>
        `;
        menuGrid.appendChild(card);
        
        // Observe this new card for animation
        if (window.revealObserver) {
            window.revealObserver.observe(card);
        }
    });
}

window.addToCart = function(id) {
    const items = window.menuItems || menuData;
    const item = items.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        const discountedPrice = item.discount > 0 
            ? (item.price * (1 - item.discount / 100))
            : item.price;
        cart.push({ ...item, quantity: 1, currentPrice: discountedPrice });
    }

    saveCart();
    updateCartUI();
    showToast(`${item.name} added to cart!`);
};

window.updateQuantity = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('beast_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Start adding some delicious items!</div>';
    } else {
        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <span class="price">₹${(item.currentPrice * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    const total = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    totalPriceElement.textContent = `₹${total.toFixed(2)}`;
    
    // Update modal totals
    const modalTotals = document.querySelectorAll('#modal-total-price, .modal-total-price-val');
    modalTotals.forEach(el => el.textContent = `₹${total.toFixed(2)}`);
}

function showStep(stepId) {
    document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepId}`).classList.add('active');

    // Update progress bars
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => bar.classList.remove('active'));
    
    if (stepId === 'details') bars[0].classList.add('active');
    if (stepId === 'payment' || stepId === 'online-payment') {
        bars[0].classList.add('active');
        bars[1].classList.add('active');
    }
}

// Event Listeners
function setupEventListeners() {
    // Category Filtering
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.cat-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderMenu();
        });
    });

    // Dietary Filtering
    document.querySelectorAll('.diet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.diet-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentDiet = btn.dataset.diet;
            renderMenu();
        });
    });

    cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });

    // Unified Checkout Setup
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Add items to your order first!');
            return;
        }
        cartSidebar.classList.remove('open');
        checkoutModal.classList.add('show');
    });

    // Multi-Step Checkout Setup
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Add items to your order first!');
            return;
        }
        cartSidebar.classList.remove('open');
        showStep('details');
        checkoutModal.classList.add('show');
    });

    document.querySelectorAll('.back-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            checkoutModal.classList.remove('show');
            cartSidebar.classList.add('open');
        });
    });

    const detailsForm = document.getElementById('details-form');
    detailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const countryCode = document.getElementById('country-code-val').value;
        orderDetails.customer = {
            name: document.getElementById('cust-name').value,
            phone: countryCode + ' ' + document.getElementById('cust-phone').value,
            pincode: document.getElementById('cust-pincode').value,
            street: document.getElementById('cust-street').value,
            building: document.getElementById('cust-building').value,
            landmark: document.getElementById('cust-landmark').value,
            type: document.querySelector('input[name="loc-type"]:checked').value
        };
        showStep('payment');
    });

    document.querySelectorAll('.back-to-details').forEach(btn => {
        btn.addEventListener('click', () => showStep('details'));
    });

    // Payment Selection
    document.querySelectorAll('.payment-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            const method = opt.dataset.method;
            orderDetails.payment.method = method;
            if (method === 'cod') {
                finalizeOrder('Order placed! Please pay on delivery.');
            } else {
                showStep('online-payment');
            }
        });
    });

    document.querySelectorAll('.back-to-payment').forEach(btn => {
        btn.addEventListener('click', () => showStep('payment'));
    });

    // Online Methods Toggle
    const methodBtns = document.querySelectorAll('.online-method-btn');
    const upiSection = document.getElementById('upi-section');
    const cardSection = document.getElementById('card-section');

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            methodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.type;
            if (type === 'upi') {
                upiSection.style.display = 'block';
                cardSection.style.display = 'none';
            } else {
                upiSection.style.display = 'none';
                cardSection.style.display = 'block';
            }
        });
    });

    const confirmOnlineBtn = document.getElementById('confirm-online-btn');
    confirmOnlineBtn.addEventListener('click', () => {
        confirmOnlineBtn.classList.add('on-submit-loading');
        confirmOnlineBtn.textContent = 'Processing';
        setTimeout(() => {
            confirmOnlineBtn.classList.remove('on-submit-loading');
            confirmOnlineBtn.textContent = 'Pay securely \u2192';
            finalizeOrder('Payment successful! Order confirmed.');
        }, 2000);
    });

    // Real-time Card Mockup
    const cardNumInput = document.getElementById('card-num');
    const cardNumDisplay = document.querySelector('.card-number-display');
    const cardExpInput = document.getElementById('card-exp');
    const cardExpDisplay = document.querySelector('.card-expiry-display');

    cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = val;
        cardNumDisplay.textContent = val || '•••• •••• •••• ••••';
    });

    cardExpInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
        e.target.value = val;
        cardExpDisplay.textContent = val || 'MM/YY';
    });

    // Name and Phone Strict Validation
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');

    nameInput.addEventListener('input', (e) => {
        // Remove numbers and special chars, allow letters and space
        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });

    phoneInput.addEventListener('input', (e) => {
        // Remove all non-digits
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Custom Country Picker Logic
    const countryPickerBtn = document.getElementById('selected-country');
    const countryList = document.getElementById('country-list');
    const countryCodeHidden = document.getElementById('country-code-val');

    countryPickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        countryList.classList.toggle('show');
    });

    document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', () => {
            const flag = item.dataset.flag;
            const code = item.dataset.code;
            
            // Update button
            document.querySelector('.btn-flag').textContent = flag;
            document.querySelector('.btn-code').textContent = code;
            
            // Update hidden value
            countryCodeHidden.value = code;
            
            // Update active state
            document.querySelectorAll('.country-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            countryList.classList.remove('show');
        });
    });

    // Close dropdown on outside click
    window.addEventListener('click', () => {
        countryList.classList.remove('show');
    });

    // Policy Modal Logic
    const policyModal = document.getElementById('policy-modal');
    const policyTitle = document.getElementById('policy-title');
    const policyText = document.getElementById('policy-text');
    const closePolicyBtn = document.getElementById('close-policy');

    const policies = {
        privacy: {
            title: 'Privacy <span>Policy</span>',
            content: `
                <h4>1. Data Collection</h4>
                <p>We collect your name, phone number, and address solely for the purpose of fulfilling your food orders and providing a personalized dining experience at Beast Crunch.</p>
                <h4>2. Data Usage</h4>
                <p>Your data is never sold to third parties. We use it only for delivery logistics and occasional promotional offers if you opted in.</p>
                <h4>3. Security</h4>
                <p>All transaction data is handled via secure, encrypted protocols to ensure your information remains private.</p>
            `
        },
        refund: {
            title: 'Refund <span>Policy</span>',
            content: `
                <h4>1. Order Cancellation</h4>
                <p>Orders can be cancelled within 5 minutes of placement for a full refund. After this period, preparation begins and refunds are not possible.</p>
                <h4>2. Quality Issues</h4>
                <p>If there is an issue with the quality of your food from Beast Crunch, please contact us immediately. We will issue a replacement or a partial refund upon verification.</p>
                <h4>3. Delivery Delays</h4>
                <p>While we strive for punctuality, extreme weather or traffic may cause delays. Refunds for delays are handled on a case-by-case basis.</p>
            `
        },
        terms: {
            title: 'Terms of <span>Service</span>',
            content: `
                <h4>1. Use of Service</h4>
                <p>By using Beast Crunch, you agree to provide accurate delivery information and pay the full amount for items ordered.</p>
                <h4>2. Pricing</h4>
                <p>All prices are subject to change without notice. Discounts and promotions are subject to their specific terms.</p>
                <h4>3. Liability</h4>
                <p>Beast Crunch is not liable for indirect damages resulting from the use of our online ordering platform.</p>
            `
        }
    };

    document.querySelectorAll('.policy-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.policy;
            const data = policies[type];
            if (data) {
                policyTitle.innerHTML = data.title;
                policyText.innerHTML = data.content;
                policyModal.classList.add('show');
            }
        });
    });

    closePolicyBtn.addEventListener('click', () => {
        policyModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === policyModal) {
            policyModal.classList.remove('show');
        }
    });

    // Cinematic Reveal on Scroll Logic
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };

    window.revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    // Initial Observation of existing reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        window.revealObserver.observe(el);
    });

    // Handle scroll header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Nutrition Calculator Logic
    if (openNutritionBtn) {
        openNutritionBtn.addEventListener('click', () => {
            nutritionModal.classList.add('show');
            nutritionResult.style.display = 'none';
            nutritionForm.reset();
        });
    }

    if (closeNutritionBtn) {
        closeNutritionBtn.addEventListener('click', () => {
            nutritionModal.classList.remove('show');
        });
    }

    if (nutritionForm) {
        nutritionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const weight = parseFloat(document.getElementById('weight-input').value);
            const activity = parseFloat(document.querySelector('input[name="activity"]:checked').value);
            
            if (weight && activity) {
                const protein = Math.round(weight * activity);
                proteinVal.textContent = protein;
                
                nutritionResult.style.display = 'block';
                // Success micro-animation: jump the result
                proteinVal.parentElement.classList.add('beast-pulse');
                setTimeout(() => proteinVal.parentElement.classList.remove('beast-pulse'), 500);
            }
        });
    }

    if (closeAndMenu) {
        closeAndMenu.addEventListener('click', () => {
            nutritionModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === nutritionModal) {
            nutritionModal.classList.remove('show');
        }
    });
}

function finalizeOrder(message) {
    // Capture the final order data
    const newOrder = {
        id: 'ORD-' + Date.now(),
        customer: { ...orderDetails.customer },
        payment: { ...orderDetails.payment },
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * (1 - item.discount/100) * item.quantity), 0),
        timestamp: new Date().toLocaleString(),
        status: 'Active'
    };

    // Save to orders list
    const existingOrders = JSON.parse(localStorage.getItem('beast_orders')) || [];
    existingOrders.unshift(newOrder); // Newest first
    localStorage.setItem('beast_orders', JSON.stringify(existingOrders));

    showToast(message);
    checkoutModal.classList.remove('show');
    cart = [];
    saveCart();
    updateCartUI();
    console.log('Order Saved to Admin:', newOrder);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start the app
init();
