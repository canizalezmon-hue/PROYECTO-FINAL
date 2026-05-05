// --- CONFIGURACIÓN Y DATOS ---
const TASA_BCV = 36.50; 
const productos = [
    { id: 1, nombre: "Smartphone X", precio: 500, cat: "electronica", stock: 5, img: "https://via.placeholder.com/150" },
    { id: 2, nombre: "Cafetera Express", precio: 80, cat: "hogar", stock: 10, img: "https://via.placeholder.com/150" },
    { id: 3, nombre: "Camisa Casual", precio: 25, cat: "ropa", stock: 0, img: "https://via.placeholder.com/150" },
    { id: 4, nombre: "Laptop Pro", precio: 1200, cat: "electronica", stock: 3, img: "https://via.placeholder.com/150" }
];

let carrito = JSON.parse(localStorage.getItem('amzon_cart')) || [];
let modoRegistro = false;

// --- ELEMENTOS DEL DOM ---
const welcomeScreen = document.getElementById('welcome-screen');
const appContainer = document.getElementById('app-container');
const btnAuth = document.getElementById('btn-auth-action');
const productGrid = document.getElementById('product-grid');

// --- SISTEMA DE NOTIFICACIONES (TOASTS) ---
function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- AUTENTICACIÓN ---
document.getElementById('tab-login').onclick = () => setAuthMode(false);
document.getElementById('tab-register').onclick = () => setAuthMode(true);

function setAuthMode(isRegister) {
    modoRegistro = isRegister;
    document.getElementById('tab-login').classList.toggle('active', !isRegister);
    document.getElementById('tab-register').classList.toggle('active', isRegister);
    document.getElementById('titulo-auth').innerText = isRegister ? "Crear Cuenta" : "Iniciar Sesión";
    btnAuth.innerText = isRegister ? "Registrarse" : "Entrar";
}

btnAuth.onclick = () => {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;

    if(!user || !pass) return showToast("⚠️ Rellena todos los campos");

    if(modoRegistro) {
        localStorage.setItem(`user_${user}`, pass);
        showToast("✅ Registro exitoso. Ahora ingresa.");
        setAuthMode(false);
    } else {
        if(localStorage.getItem(`user_${user}`) === pass) {
            welcomeScreen.style.display = 'none';
            appContainer.style.display = 'block';
            showToast(`👋 ¡Bienvenido, ${user}!`);
            renderProducts(productos);
            updateCartUI();
        } else {
            showToast("❌ Usuario o clave incorrectos");
        }
    }
};

// --- LÓGICA DE LA TIENDA ---
function renderProducts(lista) {
    productGrid.innerHTML = "";
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const isStock = p.stock > 0;
        
        card.innerHTML = `
            <img src="${p.img}" class="card-img">
            <h4>${p.nombre}</h4>
            <span class="price-bs">$${p.precio}</span>
            <p class="${isStock ? 'in-stock' : 'out-of-stock'}">${isStock ? 'Disponible' : 'Agotado'}</p>
            <button class="btn-add" ${!isStock ? 'disabled' : ''} onclick="addToCart(${p.id})">
                ${isStock ? 'Agregar al Carrito' : 'Sin Stock'}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

// Filtros por Categoría
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const cat = btn.dataset.category;
        const filtrados = cat === 'all' ? productos : productos.filter(p => p.cat === cat);
        renderProducts(filtrados);
    };
});

// Buscador
document.getElementById('input-search').oninput = (e) => {
    const query = e.target.value.toLowerCase();
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(query));
    renderProducts(filtrados);
};

// --- CARRITO ---
window.addToCart = (id) => {
    const prod = productos.find(p => p.id === id);
    const inCart = carrito.find(item => item.id === id);
    
    if(inCart) {
        inCart.qty++;
    } else {
        carrito.push({...prod, qty: 1});
    }
    
    saveCart();
    showToast(`🛒 ${prod.nombre} agregado`);
};

function saveCart() {
    localStorage.setItem('amzon_cart', JSON.stringify(carrito));
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const totalUsd = document.getElementById('total-usd');
    const totalBs = document.getElementById('total-bs');
    const count = document.getElementById('cart-count');
    
    list.innerHTML = "";
    let sum = 0;
    let itemsCount = 0;

    carrito.forEach((item, index) => {
        sum += (item.precio * item.qty);
        itemsCount += item.qty;
        list.innerHTML += `
            <div class="cart-item">
                <span>${item.nombre}</span>
                <span class="cart-item-qty">x${item.qty}</span>
                <span>$${item.precio * item.qty}</span>
                <button onclick="removeItem(${index})" style="color:red; background:none; border:none; cursor:pointer;">X</button>
            </div>
        `;
    });

    totalUsd.innerText = sum.toFixed(2);
    totalBs.innerText = (sum * TASA_BCV).toFixed(2);
    count.innerText = itemsCount;
}

window.removeItem = (index) => {
    carrito.splice(index, 1);
    saveCart();
};

// --- MODALES ---
const cartModal = document.getElementById('modal-carrito');
document.getElementById('btn-ver-carrito').onclick = () => cartModal.style.display = 'block';
document.getElementById('close-carrito').onclick = () => cartModal.style.display = 'none';

window.onclick = (e) => {
    if(e.target == cartModal) cartModal.style.display = 'none';
};

document.getElementById('btn-logout').onclick = () => location.reload();

document.getElementById('btn-checkout').onclick = () => {
    if(carrito.length === 0) return showToast("El carrito está vacío");
    showToast("🛍️ ¡Gracias por su compra!");
    carrito = [];
    saveCart();
    cartModal.style.display = 'none';
};
