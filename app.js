const TASA_BCV = 36.50;

// Catálogo ampliado con sistema de galería
const productos = [
    { 
        id: 1, 
        nombre: "Reloj Minimalista", 
        precio: 45, 
        cat: "estilo", 
        stock: 8, 
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        galeria: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500"]
    },
    { 
        id: 2, 
        nombre: "Cámara Vintage Pro", 
        precio: 210, 
        cat: "electronica", 
        stock: 3, 
        img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        galeria: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"]
    },
    { 
        id: 3, 
        nombre: "Kit Herramientas Eléctricas", 
        precio: 120, 
        cat: "hogar", 
        stock: 5, 
        img: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500",
        galeria: ["https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500"]
    },
    { 
        id: 4, 
        nombre: "Chaqueta de Paño", 
        precio: 75, 
        cat: "estilo", 
        stock: 12, 
        img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
        galeria: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"]
    }
];

let carrito = JSON.parse(localStorage.getItem('amzon_cart')) || [];
let modoRegistro = false;

// --- FUNCIONES DE INTERFAZ ---

function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Transición suave entre pantallas
function switchScreen() {
    const welcome = document.getElementById('welcome-screen');
    const app = document.getElementById('app-container');
    
    welcome.style.display = 'none';
    app.style.display = 'block';
    setTimeout(() => {
        app.style.opacity = '1';
    }, 50);
}

// --- LÓGICA DE PRODUCTOS ---

function renderProducts(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "";
    
    lista.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})" style="cursor:pointer">${p.nombre}</h4>
            <span class="price-bs">$${p.precio}</span>
            <p class="${p.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${p.stock > 0 ? 'En existencia' : 'Sin stock'}
            </p>
            <button class="btn-add" ${p.stock === 0 ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">
                Agregar al carrito
            </button>
        `;
        grid.appendChild(div);
    });
}

window.abrirDetalle = (id) => {
    const p = productos.find(item => item.id === id);
    const modal = document.getElementById('modal-detalle');
    const body = document.getElementById('detalle-body');
    
    body.innerHTML = `
        <div class="product-images">
            <img src="${p.img}" class="main-img" id="img-principal">
            <div class="thumbnails">
                ${p.galeria.map(img => `<img src="${img}" class="thumb" onclick="cambiarImagen('${img}')">`).join('')}
            </div>
        </div>
        <div class="product-info">
            <h2>${p.nombre}</h2>
            <p style="color: #666; margin-bottom: 20px;">Categoría: ${p.cat.toUpperCase()}</p>
            <h3 class="price-bs" style="font-size: 1.5rem;">$${p.precio}</h3>
            <p>Equivalente a: <strong>${(p.precio * TASA_BCV).toFixed(2)} Bs.</strong></p>
            <br>
            <button class="btn-primary" onclick="agregarCarrito(${p.id})">Añadir a mi orden</button>
        </div>
    `;
    modal.style.display = 'block';
};

window.cambiarImagen = (src) => {
    document.getElementById('img-principal').src = src;
};

// --- MANEJO DEL CARRITO ---

window.agregarCarrito = (id) => {
    const p = productos.find(item => item.id === id);
    const existe = carrito.find(item => item.id === id);

    if(existe) {
        existe.qty++;
    } else {
        carrito.push({...p, qty: 1});
    }

    actualizarTodo();
    showToast(`✔ ${p.nombre} añadido`);
};

function actualizarTodo() {
    localStorage.setItem('amzon_cart', JSON.stringify(carrito));
    
    // Actualizar UI del carrito
    const list = document.getElementById('cart-items');
    const totalUsd = document.getElementById('total-usd');
    const totalBs = document.getElementById('total-bs');
    const count = document.getElementById('cart-count');
    
    list.innerHTML = "";
    let total = 0;
    let totalQty = 0;

    carrito.forEach((item, index) => {
        total += (item.precio * item.qty);
        totalQty += item.qty;
        list.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold;">${item.nombre}</div>
                    <div style="font-size: 0.8rem; color: #666;">$${item.precio} c/u</div>
                </div>
                <div class="cart-item-qty">x${item.qty}</div>
                <button onclick="quitarItem(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">✕</button>
            </div>
        `;
    });

    totalUsd.innerText = total.toFixed(2);
    totalBs.innerText = (total * TASA_BCV).toFixed(2);
    count.innerText = totalQty;
}

window.quitarItem = (index) => {
    carrito.splice(index, 1);
    actualizarTodo();
};

// --- EVENTOS INICIALES ---

document.getElementById('btn-auth-action').onclick = () => {
    const u = document.getElementById('usuario').value;
    const p = document.getElementById('password').value;

    if(!u || !p) return showToast("Faltan datos");

    if(modoRegistro) {
        localStorage.setItem(`user_${u}`, p);
        showToast("Cuenta creada con éxito");
        document.getElementById('tab-login').click();
    } else {
        if(localStorage.getItem(`user_${u}`) === p) {
            switchScreen();
            renderProducts(productos);
            actualizarTodo();
        } else {
            showToast("Error de acceso");
        }
    }
};

document.getElementById('tab-login').onclick = () => {
    modoRegistro = false;
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('btn-auth-action').innerText = "Entrar a la tienda";
};

document.getElementById('tab-register').onclick = () => {
    modoRegistro = true;
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('btn-auth-action').innerText = "Crear mi cuenta";
};

// Cerrar modales
document.getElementById('close-detalle').onclick = () => document.getElementById('modal-detalle').style.display = 'none';
document.getElementById('close-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'none';
document.getElementById('btn-ver-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'block';
document.getElementById('btn-logout').onclick = () => location.reload();
