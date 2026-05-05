const TASA_BCV = 36.50;
const productos = [
    { id: 1, nombre: "Laptop Gamer", precio: 1200, cat: "electronica", stock: 5, img: "https://images.unsplash.com/photo-1517336712468-0611182b68be?w=500" },
    { id: 2, nombre: "Mouse Pro", precio: 25, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500" },
    { id: 3, nombre: "Lámpara de Espejo", precio: 45, cat: "hogar", stock: 4, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
    { id: 4, nombre: "Chaqueta Dark Academia", precio: 80, cat: "ropa", stock: 12, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" }
];

let carrito = JSON.parse(localStorage.getItem('amzon_cart')) || [];
let modoRegistro = false;

// --- MANTENIENDO TUS NOTIFICACIONES ORIGINALES ---
function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast'; // Esta clase dispara tu animación slideIn
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- LÓGICA DE TIENDA (Genera el HTML que tu CSS espera) ---
function renderProducts(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "";
    lista.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card'; // Tu clase original
        div.innerHTML = `
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})">${p.nombre}</h4>
            <span class="price-bs">$${p.precio}</span>
            <p class="${p.stock > 0 ? 'in-stock' : 'out-of-stock'}">${p.stock > 0 ? 'En Stock' : 'Agotado'}</p>
            <button class="btn-add" ${p.stock === 0 ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">Agregar</button>
        `;
        grid.appendChild(div);
    });
}

// --- DETALLE DE PRODUCTO ---
window.abrirDetalle = (id) => {
    const p = productos.find(i => i.id === id);
    const body = document.getElementById('detalle-body');
    body.innerHTML = `
        <div class="product-images"><img src="${p.img}" class="main-img"></div>
        <div class="product-info">
            <h2>${p.nombre}</h2>
            <h3 class="price-bs" style="font-size: 1.8rem;">$${p.precio}</h3>
            <p>Categoría: ${p.cat.toUpperCase()}</p>
            <button class="btn-primary" onclick="agregarCarrito(${p.id})">Añadir al Carrito</button>
        </div>
    `;
    document.getElementById('modal-detalle').style.display = 'block';
};

// --- CARRITO Y PERSISTENCIA ---
window.agregarCarrito = (id) => {
    const p = productos.find(i => i.id === id);
    const existe = carrito.find(i => i.id === id);
    if(existe) existe.qty++; else carrito.push({...p, qty: 1});
    actualizarTodo();
    showToast("🛒 Producto añadido");
};

function actualizarTodo() {
    localStorage.setItem('amzon_cart', JSON.stringify(carrito));
    const list = document.getElementById('cart-items');
    let total = 0, count = 0;
    list.innerHTML = "";
    carrito.forEach((item, i) => {
        total += (item.precio * item.qty);
        count += item.qty;
        list.innerHTML += `
            <div class="cart-item">
                <span>${item.nombre} (x${item.qty})</span>
                <span>$${item.precio * item.qty} <button onclick="quitar(${i})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">x</button></span>
            </div>`;
    });
    document.getElementById('total-usd').innerText = total.toFixed(2);
    document.getElementById('total-bs').innerText = (total * TASA_BCV).toFixed(2);
    document.getElementById('cart-count').innerText = count;
}

window.quitar = (i) => { carrito.splice(i, 1); actualizarTodo(); };

// --- EVENTOS DE USUARIO ---
const btnAuth = document.getElementById('btn-auth-action');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

tabLogin.onclick = () => { modoRegistro = false; tabLogin.classList.add('active'); tabRegister.classList.remove('active'); btnAuth.innerText = "Entrar"; };
tabRegister.onclick = () => { modoRegistro = true; tabRegister.classList.add('active'); tabLogin.classList.remove('active'); btnAuth.innerText = "Registrarse"; };

btnAuth.onclick = () => {
    const u = document.getElementById('usuario').value;
    const p = document.getElementById('password').value;
    if(!u || !p) return showToast("⚠️ Completa los campos");
    if(modoRegistro) {
        localStorage.setItem(`user_${u}`, p);
        showToast("✅ Registro exitoso");
        tabLogin.click();
    } else {
        if(localStorage.getItem(`user_${u}`) === p) {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            showToast("👋 Bienvenido");
            renderProducts(productos);
            actualizarTodo();
        } else { showToast("❌ Datos incorrectos"); }
    }
};

// Filtros y Cierre
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const cat = btn.dataset.category;
        renderProducts(cat === 'all' ? productos : productos.filter(p => p.cat === cat));
    };
});

document.getElementById('close-detalle').onclick = () => document.getElementById('modal-detalle').style.display = 'none';
document.getElementById('close-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'none';
document.getElementById('btn-ver-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'block';
document.getElementById('btn-logout').onclick = () => location.reload();
btnAuth.onclick = () => {
    const u = document.getElementById('usuario').value;
    const p = document.getElementById('password').value;

    if(!u || !p) return showToast("⚠️ Completa los campos");

    // --- NUEVA VALIDACIÓN DE CORREO ---
    if(modoRegistro) {
        // Comprobamos si el usuario incluye '@' y 'gmail.com'
        if (!u.includes('@') || !u.includes('gmail.com')) {
            return showToast("❌ El usuario debe ser un correo @gmail.com");
        }

        localStorage.setItem(`user_${u}`, p);
        showToast("✅ Registro exitoso");
        tabLogin.click();
    } else {
        // Lógica de login que ya tenías...
        if(localStorage.getItem(`user_${u}`) === p) {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            showToast("👋 Bienvenido");
            renderProducts(productos);
            actualizarTodo();
        } else { 
            showToast("❌ Datos incorrectos"); 
        }
    }
}; 
tabRegister.onclick = () => {
    modoRegistro = true;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    btnAuth.innerText = "Registrarse";
    // Cambia el texto de ayuda
    document.getElementById('usuario').placeholder = "ejemplo@gmail.com";
};

tabLogin.onclick = () => {
    modoRegistro = false;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    btnAuth.innerText = "Entrar";
    // Lo devuelve a la normalidad para el login
    document.getElementById('usuario').placeholder = "Usuario";
};
