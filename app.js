// --- CONFIGURACIÓN Y ESTADO ---
const TASA_ACTUAL = 475.96; 
let usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios')) || []; 
let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || null;
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let authMode = 'login'; 
let productoActualEnModal = null; 

const productos = [
    { 
        id: 1, 
        nombre: "Laptop Pro X1", 
        precio: 120, 
        categoria: "Electrónica", 
        imgs: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop", 
            "https://images.unsplash.com/photo-1504707748692-419802cf939d?q=80&w=600&auto=format&fit=crop"
        ],
        rating: 4.5, reviewCount: 15, stock: 5,
        description: "Una laptop potente para trabajo y diseño. Pantalla 15.6' 4K, 16GB RAM, 512GB SSD.",
        specs: ["Procesador: i7 12th", "RAM: 16GB", "Pantalla: 15.6'", "Peso: 1.5kg"]
    },
    { 
        id: 2, 
        nombre: "Smartphone S22", 
        precio: 85, 
        categoria: "Electrónica", 
        imgs: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop"], 
        rating: 5, reviewCount: 32, stock: 0,
        description: "Cámara increíble y rendimiento excepcional. 128GB.",
        specs: ["Pantalla: 6.1'", "Cámara: 50MP", "Batería: 4000mAh"]
    },
    { 
        id: 3, 
        nombre: "Auriculares Noise", 
        precio: 15, 
        categoria: "Electrónica", 
        imgs: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"], 
        rating: 3.5, reviewCount: 8, stock: 20, description: "Cancelación de ruido activa. Bluetooth 5.0." 
    },
    { 
        id: 4, 
        nombre: "Lámpara LED", 
        precio: 4, 
        categoria: "Hogar", 
        imgs: ["https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=600&auto=format&fit=crop"], 
        rating: 4.2, reviewCount: 10, stock: 15, description: "Luz regulable."
    },
    { 
        id: 5, 
        nombre: "Espejo Pared", 
        precio: 7.5, 
        categoria: "Hogar", 
        imgs: ["https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop"], 
        rating: 4.8, reviewCount: 5, stock: 2, description: "Decorativo y moderno. Marco metálico." 
    },
    { 
        id: 6, 
        nombre: "Sofá Mini", 
        precio: 45, 
        categoria: "Hogar", 
        imgs: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop"], 
        rating: 3, reviewCount: 11, stock: 1, description: "Ideal para espacios pequeños."
    },
    { 
        id: 7, 
        nombre: "Camiseta Dep.", 
        precio: 2.5, 
        categoria: "Ropa", 
        imgs: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"], 
        rating: 4.6, reviewCount: 45, stock: 50, description: "Tela transpirable de secado rápido." 
    },
    { 
        id: 8, 
        nombre: "Chaqueta Inv.", 
        precio: 12, 
        categoria: "Ropa", 
        imgs: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop"], 
        rating: 5, reviewCount: 9, stock: 0, description: "Impermeable y térmica. Capucha desmontable." 
    }
];

// --- UTILIDADES ---
const formatBs = (monto) => new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(monto);

function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- PERSISTENCIA Y CARGA INICIAL ---
window.onload = () => {
    if (usuarioActivo) {
        document.getElementById('user-greeting').innerText = `Hola, ${usuarioActivo.name.split(' ')[0]}`;
        showStore();
    }
    actualizarCarritoUI();
};

// --- VISTAS Y AUTENTICACIÓN ---
function showStore() {
    document.getElementById('view-welcome').style.display = 'none';
    document.getElementById('view-store').style.display = 'block';
    document.getElementById('tasa-valor').innerText = formatBs(TASA_ACTUAL);
    mostrarProductos(productos);
}

function logout() {
    localStorage.removeItem('usuarioActivo');
    usuarioActivo = null;
    document.getElementById('view-store').style.display = 'none';
    document.getElementById('view-welcome').style.display = 'flex';
    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarritoUI();
}

function switchAuth(mode) {
    authMode = mode;
    const extra = document.getElementById('extra-fields');
    const btnText = document.getElementById('btn-auth-text');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (mode === 'register') {
        extra.innerHTML = '<input type="text" id="auth-name" placeholder="Nombre completo" required>';
        document.getElementById('tab-register').classList.add('active');
        btnText.innerText = "Registrarse";
    } else {
        extra.innerHTML = '';
        document.getElementById('tab-login').classList.add('active');
        btnText.innerText = "Entrar";
    }
}

function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    if (authMode === 'register') {
        const name = document.getElementById('auth-name').value;
        usuariosRegistrados.push({ name, email, pass });
        localStorage.setItem('usuarios', JSON.stringify(usuariosRegistrados));
        showToast("Registro exitoso. ¡Inicia sesión!");
        switchAuth('login');
    } else {
        const usuario = usuariosRegistrados.find(u => u.email === email && u.pass === pass);
        if (usuario) {
            usuarioActivo = usuario;
            localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
            document.getElementById('user-greeting').innerText = `Hola, ${usuario.name.split(' ')[0]}`;
            showStore();
        } else {
            alert("Error: credenciales incorrectas");
        }
    }
}

// --- TIENDA ---
function mostrarProductos(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const isOutOfStock = p.stock <= 0;
        
        card.innerHTML = `
            <div onclick="abrirDetalleProducto(${p.id})" style="cursor:pointer">
                <img src="${p.imgs[0]}" alt="${p.nombre}" class="card-img">
                <h3>${p.nombre}</h3>
                <p><strong>$${p.precio.toFixed(2)}</strong></p>
                <span class="price-bs">${formatBs(p.precio * TASA_ACTUAL)} Bs.</span>
            </div>
            <button class="btn-add" ${isOutOfStock ? 'disabled' : ''} onclick="agregarAlCarrito(${p.id})">
                ${isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
            </button>
        `;
        grid.appendChild(card);
    });
}

function filtrarProductos(cat, el) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    const res = (cat === 'todos') ? productos : productos.filter(p => p.categoria === cat);
    mostrarProductos(res);
}

function buscarProductos() {
    const term = document.getElementById('user-search').value.toLowerCase();
    const res = productos.filter(p => p.nombre.toLowerCase().includes(term));
    mostrarProductos(res);
}

// --- DETALLE DE PRODUCTO ---
function abrirDetalleProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    productoActualEnModal = producto; 

    document.getElementById('p-title').innerText = producto.nombre;
    document.getElementById('p-price-usd').innerText = `$${producto.precio.toFixed(2)}`;
    document.getElementById('p-price-bs').innerText = `${formatBs(producto.precio * TASA_ACTUAL)} Bs.`;
    document.getElementById('p-description').innerText = producto.description;
    document.getElementById('p-main-img').src = producto.imgs[0];
    
    const thumbContainer = document.getElementById('p-thumbnails');
    thumbContainer.innerHTML = '';
    producto.imgs.forEach(imgUrl => {
        thumbContainer.innerHTML += `<img src="${imgUrl}" class="thumb" onclick="document.getElementById('p-main-img').src='${imgUrl}'">`;
    });

    const stockEl = document.getElementById('p-stock');
    const btnModal = document.getElementById('btn-modal-add');
    
    if (producto.stock > 0) {
        stockEl.innerText = `En Stock (${producto.stock} uds.)`;
        stockEl.className = 'stock-info in-stock';
        btnModal.disabled = false;
        btnModal.innerText = "🛒 Añadir al Carrito";
    } else {
        stockEl.innerText = "Temporalmente fuera de stock";
        stockEl.className = 'stock-info out-of-stock';
        btnModal.disabled = true;
        btnModal.innerText = "Agotado";
    }

    document.getElementById('p-rating-stars').innerText = "⭐".repeat(Math.round(producto.rating)) + "☆".repeat(5 - Math.round(producto.rating));
    document.getElementById('p-rating-count').innerText = `(${producto.reviewCount} reseñas)`;

    const specsEl = document.getElementById('p-specs');
    specsEl.innerHTML = (producto.specs || []).map(s => `<li>${s}</li>`).join('');

    toggleModal('product-modal');
}

// --- LÓGICA DEL CARRITO (CON CANTIDADES) ---
function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

function agregarAlCarrito(id) {
    const productoOriginal = productos.find(p => p.id === id);
    if (!productoOriginal || productoOriginal.stock <= 0) return;

    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < productoOriginal.stock) {
            itemEnCarrito.cantidad++;
            showToast(`${productoOriginal.nombre} actualizado`);
        } else {
            showToast("Límite de stock alcanzado");
            return;
        }
    } else {
        carrito.push({ ...productoOriginal, cantidad: 1 });
        showToast("Producto añadido al carrito");
    }

    actualizarCarritoUI();
}

function agregarAlCarritoModal() {
    if (productoActualEnModal) {
        agregarAlCarrito(productoActualEnModal.id);
        toggleModal('product-modal');
    }
}

function actualizarCarritoUI() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    const countLabel = document.getElementById('cart-count');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    countLabel.innerText = totalItems;

    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let totalUSD = 0;
    
    carrito.forEach((item, index) => {
        totalUSD += (item.precio * item.cantidad);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div style="flex-grow:1">
                <strong>${item.nombre}</strong> <span class="cart-item-qty">x${item.cantidad}</span>
                <br><small>$${(item.precio * item.cantidad).toFixed(2)}</small>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; cursor:pointer; font-size:1.2rem">🗑️</button>
        `;
        container.appendChild(itemDiv);
    });
    
    document.getElementById('total-price-usd').innerText = `$${totalUSD.toFixed(2)}`;
    document.getElementById('total-price-bs').innerText = `${formatBs(totalUSD * TASA_ACTUAL)} Bs.`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
    showToast("Producto eliminado");
}

function procesarCompra() {
    if (carrito.length === 0) {
        showToast("El carrito está vacío");
        return;
    }
    alert(`Compra procesada por un total de: ${document.getElementById('total-price-bs').innerText}`);
    carrito = [];
    actualizarCarritoUI();
    toggleModal('cart-modal');
}
