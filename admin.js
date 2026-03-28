const defaultMenu = [
    {
        id: 1,
        name: "Truffle Arancini",
        category: "starters",
        price: 350,
        discount: 10,
        description: "Crispy risotto balls infused with black truffle and mozzarella, served with garlic aioli.",
        image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        name: "Pan-Seared Sea Bass",
        category: "mains",
        price: 750,
        discount: 0,
        description: "Fresh sea bass fillet, seasonal greens, lemon butter emulsion and herb-crusted potatoes.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        name: "Wagyu Beef Carpaccio",
        category: "starters",
        price: 550,
        discount: 15,
        description: "Thinly sliced Wagyu beef, capers, parmesan shavings, and truffle oil drizzle.",
        image: "https://images.unsplash.com/photo-1542691457-cbe4df041eb2?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 4,
        name: "Saffron Risotto",
        category: "mains",
        price: 650,
        discount: 0,
        description: "Creamy arborio rice infused with premium saffron, toasted pine nuts, and aged parmesan.",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5,
        name: "Deconstructed Cheesecake",
        category: "desserts",
        price: 290,
        discount: 0,
        description: "Creamy NY style cheesecake elements, berry compote, and graham cracker crumble.",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 6,
        name: "Chocolate Lava Cake",
        category: "desserts",
        price: 250,
        discount: 20,
        description: "Warm chocolate cake with a molten center, served with vanilla bean gelato.",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 7,
        name: "Smoked Old Fashioned",
        category: "drinks",
        price: 380,
        discount: 0,
        description: "Premium bourbon, maple syrup, bitters, smoked with cherry wood chips.",
        image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 8,
        name: "Passionfruit Martini",
        category: "drinks",
        price: 350,
        discount: 5,
        description: "Vodka, passionfruit liqueur, fresh lime, and a shot of prosecco on the side.",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800"
    }
];

function migrateData() {
    ['menu', 'orders'].forEach(key => {
        const oldKey = `lumina_${key}`;
        const newKey = `beast_${key}`;
        if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, localStorage.getItem(oldKey));
            localStorage.removeItem(oldKey);
        }
    });
}
migrateData();

let currentMenu = JSON.parse(localStorage.getItem('beast_menu')) || defaultMenu;
let currentOrders = JSON.parse(localStorage.getItem('beast_orders')) || [];
let editingId = null;

// DOM
const loginScreen = document.getElementById('login-screen');
const loginBtn = document.getElementById('login-btn');
const adminPass = document.getElementById('admin-pass');
const menuTableBody = document.getElementById('admin-menu-list');
const ordersTableBody = document.getElementById('admin-orders-list');
const orderCountBadge = document.getElementById('order-count-badge');
const itemForm = document.getElementById('item-form');
const toast = document.getElementById('toast');
const resetBtn = document.getElementById('reset-btn');
const clearOrdersBtn = document.getElementById('clear-orders');
const generateSampleBtn = document.getElementById('generate-sample-order');

// Tab Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const tabViews = document.querySelectorAll('.tab-view');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabViews.forEach(v => v.classList.remove('active'));
        document.getElementById(`${tab}-management-view`).classList.add('active');

        if (tab === 'menu') renderMenuTable();
        if (tab === 'orders') renderOrdersTable();
    });
});

// Login Logic
loginBtn.addEventListener('click', () => {
    if (adminPass.value === 'arjun') {
        loginScreen.style.opacity = '0';
        setTimeout(() => loginScreen.style.display = 'none', 300);
        renderMenuTable();
        updateOrderBadge();
    } else {
        alert('Incorrect password! Try: arjun');
    }
});

function updateOrderBadge() {
    currentOrders = JSON.parse(localStorage.getItem('beast_orders')) || [];
    orderCountBadge.textContent = currentOrders.filter(o => o.status === 'Active').length;
}

function renderMenuTable() {
    menuTableBody.innerHTML = '';
    currentMenu.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${item.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;">
                    <span>${item.name}</span>
                </div>
            </td>
            <td>${item.category}</td>
            <td>₹${item.price} ${item.discount > 0 ? `<span style="color:#e74c3c">(-${item.discount}%)</span>` : ''}</td>
            <td class="actions-cell">
                <button class="btn btn-outline btn-sm" onclick="editItem(${item.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        menuTableBody.appendChild(row);
    });
}

function renderOrdersTable() {
    currentOrders = JSON.parse(localStorage.getItem('beast_orders')) || [];
    ordersTableBody.innerHTML = '';

    if (currentOrders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 3rem;">No orders yet.</td></tr>';
        return;
    }

    currentOrders.forEach(order => {
        const row = document.createElement('tr');
        const itemsListMarkup = order.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('');

        row.innerHTML = `
            <td>#${order.id.split('-')[1]}<br><small style="color:var(--text-dim)">${order.timestamp}</small></td>
            <td>
                <div class="order-cust-info">
                    <strong>${order.customer.name}</strong>
                    <span>📞 ${order.customer.phone}</span><br>
                    <span>📍 ${order.customer.building}, ${order.customer.street}<br>(Zip: ${order.customer.pincode})</span>
                </div>
            </td>
            <td>
                <ul class="order-items-list">
                    ${itemsListMarkup}
                </ul>
            </td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span><br>
                <small style="color:var(--text-dim)">via ${order.payment.method.toUpperCase()}</small>
            </td>
            <td>
                <div class="actions-cell">
                    ${order.status === 'Active' ? `<button class="btn btn-primary btn-sm" onclick="completeOrder('${order.id}')">Complete</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.id}')">Delete</button>
                </div>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
}

window.completeOrder = function (id) {
    currentOrders = currentOrders.map(o => o.id === id ? { ...o, status: 'Completed' } : o);
    localStorage.setItem('beast_orders', JSON.stringify(currentOrders));
    renderOrdersTable();
    updateOrderBadge();
    showToast('Order marked as Completed!');
};

window.deleteOrder = function (id) {
    if (confirm('Delete this order record?')) {
        currentOrders = currentOrders.filter(o => o.id !== id);
        localStorage.setItem('beast_orders', JSON.stringify(currentOrders));
        renderOrdersTable();
        updateOrderBadge();
    }
};

clearOrdersBtn.addEventListener('click', () => {
    if (confirm('Permanently clear all order records?')) {
        currentOrders = [];
        localStorage.setItem('beast_orders', JSON.stringify(currentOrders));
        renderOrdersTable();
        updateOrderBadge();
    }
});

generateSampleBtn.addEventListener('click', () => {
    const sample = {
        id: 'ORD-' + Date.now(),
        customer: {
            name: "John Doe",
            phone: "+91 9876543210",
            pincode: "400001",
            street: "Marine Drive",
            building: "Sunrise Apts 101",
            landmark: "Near Gateway",
            type: "Home"
        },
        payment: { method: "online" },
        items: [
            { name: "Truffle Arancini", price: 350, quantity: 2, discount: 10 },
            { name: "日本和牛 Japanese Wagyu", price: 2500, quantity: 1, discount: 0 }
        ],
        total: 3130,
        timestamp: new Date().toLocaleString(),
        status: "Active"
    };

    currentOrders.unshift(sample);
    localStorage.setItem('beast_orders', JSON.stringify(currentOrders));
    renderOrdersTable();
    updateOrderBadge();
    showToast('Sent a sample order to your dashboard!');
});

// CRUD Actions
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newItem = {
        id: editingId || Date.now(),
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        discount: parseInt(document.getElementById('item-discount').value) || 0,
        image: document.getElementById('item-image').value,
        description: document.getElementById('item-desc').value
    };

    if (editingId) {
        currentMenu = currentMenu.map(item => item.id === editingId ? newItem : item);
        showToast('Item updated successfully!');
        cancelEditMode();
    } else {
        currentMenu.push(newItem);
        showToast('New item added!');
    }

    saveMenu();
    renderMenuTable();
    itemForm.reset();
});

window.editItem = function (id) {
    const item = currentMenu.find(i => i.id === id);
    if (!item) return;

    editingId = id;
    document.getElementById('edit-id').value = id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-discount').value = item.discount;
    document.getElementById('item-image').value = item.image;
    document.getElementById('item-desc').value = item.description;

    document.getElementById('form-title').innerText = 'Edit Item';
    document.getElementById('submit-btn').innerText = 'Update Item';
    document.getElementById('cancel-edit').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteItem = function (id) {
    if (confirm('Are you sure you want to delete this item?')) {
        currentMenu = currentMenu.filter(item => item.id !== id);
        saveMenu();
        renderMenuTable();
        showToast('Item deleted.');
    }
};

function cancelEditMode() {
    editingId = null;
    itemForm.reset();
    document.getElementById('form-title').innerText = 'Add New Item';
    document.getElementById('submit-btn').innerText = 'Save Item';
    document.getElementById('cancel-edit').style.display = 'none';
}

document.getElementById('cancel-edit').addEventListener('click', cancelEditMode);

resetBtn.addEventListener('click', () => {
    if (confirm('Reset all menu items to original defaults? All your changes will be lost.')) {
        currentMenu = [...defaultMenu];
        saveMenu();
        renderMenuTable();
        showToast('Menu reset to defaults.');
    }
});

function saveMenu() {
    localStorage.setItem('beast_menu', JSON.stringify(currentMenu));
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
