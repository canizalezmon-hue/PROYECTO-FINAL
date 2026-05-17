// --- VARIABLES DE ESTADO ---
let TASA_BCV = parseFloat(localStorage.getItem('last_bcv_rate')) || 36.50; 
let usuarioLogueado = false;
let modoRegistro = false;

const productos = [
    { 
        id: 1, 
        nombre: "Laptop Gamer X-Pro", 
        precio: 1200, 
        cat: "electronica", 
        stock: 5, 
        img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500" 
    },
    { id: 2, nombre: "Mouse Pro Wireless", precio: 25, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500" },
    { id: 3, nombre: "Lámpara Led Inteligente", precio: 45, cat: "hogar", stock: 4, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
    { id: 4, nombre: "Chaqueta Urban Style", precio: 80, cat: "ropa", stock: 12, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" }
];

let carrito = JSON.parse(localStorage.getItem('amzon_cart')) || [];
let favoritos = JSON.parse(localStorage.getItem('human_store_favs')) || [];

// --- LÓGICA DE CARGA (PRELOADER) ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const app = document.getElementById('app-container');

    obtenerTasaBCV();

    setTimeout(() => {
        preloader.style.transition = "opacity 1s ease, filter 1s ease";
        preloader.style.opacity = "0";
        preloader.style.filter = "blur(20px)";
        
        setTimeout(() => {
            preloader.style.display = "none";
            app.classList.remove('hidden-app');
            app.classList.add('app-entry-animation'); 
        }, 1000);
    }, 2800);
});

// --- SISTEMA BCV ---
async function obtenerTasaBCV() {
    const apiSources = [
        'https://ve.dolarapi.com/v1/dolares/oficial',
        'https://pydolarve.org/api/v1/dollar?page=bcv'
    ];

    for (let url of apiSources) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            let valor = url.includes('dolarapi') ? data.promedio : data.monedas?.usd?.valor;

            if (valor) {
                TASA_BCV = valor;
                localStorage.setItem('last_bcv_rate', TASA_BCV);
                actualizarVisualTasa();
                break; 
            }
        } catch (e) { console.warn(`Fuente fallida: ${url}`); }
    }
    actualizarVisualTasa();
}

function actualizarVisualTasa() {
    const el = document.getElementById('tasa-venda');
    if (el) el.innerText = TASA_BCV.toFixed(2);
    renderProducts(productos);
    actualizarTodo();
}

function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function renderProducts(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "";
    lista.forEach(p => {
        const esFav = favoritos.some(f => f.id === p.id);
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <button class="btn-fav ${esFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorito(${p.id})">★</button>
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})" style="cursor:pointer">${p.nombre}</h4>
            <span class="price-usd">Precio: $${p.precio}</span>
            <span class="price-bs">${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</span>
            <p style="font-size: 0.8rem; font-weight: bold; color: ${p.stock > 0 ? '#10B981' : '#EF4444'}">
                ${p.stock > 0 ? 'Disponible en Stock' : 'Agotado'}
            </p>
            <button class="btn-add" ${p.stock === 0 ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">Añadir al Carrito</button>
        `;
        grid.appendChild(div);
    });
}

window.abrirDetalle = (id) => {
    const p = productos.find(i => i.id === id);
    const body = document.getElementById('detalle-body');
    body.innerHTML = `
        <div class="product-images"><img src="${p.img}" class="main-img"></div>
        <div class="product-info">
            <h2 style="font-family: 'Orbitron'; color: var(--primary)">${p.nombre}</h2>
            <h3 class="price-bs" style="font-size: 2.2rem; color:var(--secondary)">$${p.precio}</h3>
            <p style="font-size: 1.1rem">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>
            <p style="margin: 20px 0; color: #64748B">Este producto de alta calidad está disponible para envío inmediato.</p>
            <button class="btn-primary" ${p.stock === 0 ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">${p.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}</button>
        </div>`;
    document.getElementById('modal-detalle').style.display = 'block';
};

// --- LÓGICA DE FAVORITOS ---
window.toggleFavorito = (id) => {
    const index = favoritos.findIndex(f => f.id === id);
    if (index > -1) {
        favoritos.splice(index, 1);
        showToast("⭐ Quitado de tus favoritos");
    } else {
        const prod = productos.find(p => p.id === id);
        favoritos.push(prod);
        showToast("⭐ ¡Añadido a tus favoritos!");
    }
    localStorage.setItem('human_store_favs', JSON.stringify(favoritos));
    
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
    renderProducts(activeCategory === 'all' ? productos : productos.filter(p => p.cat === activeCategory));
    
    if(document.getElementById('modal-favoritos').style.display === 'block') {
        renderFavoritos();
    }
};

function renderFavoritos() {
    const list = document.getElementById('fav-items');
    const actionsArea = document.getElementById('fav-actions-area');
    
    if(favoritos.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#94A3B8; padding: 20px;'>No tienes productos en tu lista de deseos.</p>";
        actionsArea.style.display = 'none';
    } else {
        list.innerHTML = "";
        actionsArea.style.display = 'block';
        
        favoritos.forEach((item) => {
            list.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.nombre}</h4>
                        <p style="margin: 5px 0 0; font-weight: bold; color: var(--accent)">$${item.precio.toFixed(2)}</p>
                    </div>
                    <button class="btn-primary" style="padding: 10px 15px; font-size: 0.8rem; border-radius: 8px;" ${item.stock === 0 ? 'disabled' : ''} onclick="agregarCarrito(${item.id})">🛒 Llevar</button>
                    <button class="btn-remove" onclick="toggleFavorito(${item.id})">×</button>
                </div>`;
        });
    }
}

// --- AGREGAR TODOS LOS FAVORITOS AL CARRITO ---
document.getElementById('btn-llevar-todo-fav').onclick = () => {
    if (!usuarioLogueado) {
        showToast("🔑 Identifícate para una experiencia de compra completa");
        document.getElementById('modal-favoritos').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'flex';
        return;
    }

    let agregadosContador = 0;

    for (let i = favoritos.length - 1; i >= 0; i--) {
        const p = favoritos[i];
        
        if (p.stock > 0) {
            const existe = carrito.find(item => item.id === p.id);
            if (existe) {
                if (existe.qty < p.stock) {
                    existe.qty++;
                    agregadosContador++;
                    favoritos.splice(i, 1);
                }
            } else {
                carrito.push({...p, qty: 1});
                agregadosContador++;
                favoritos.splice(i, 1);
            }
        }
    }

    if (agregadosContador > 0) {
        showToast(`🛒 Se agregaron ${agregadosContador} productos al carrito`);
        localStorage.setItem('human_store_favs', JSON.stringify(favoritos));
        localStorage.setItem('amzon_cart', JSON.stringify(carrito));
        
        actualizarTodo();
        renderFavoritos();
        
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
        renderProducts(activeCategory === 'all' ? productos : productos.filter(p => p.cat === activeCategory));
    } else {
        showToast("❌ No se pudieron agregar productos (sin stock o límite alcanzado)");
    }
};

window.agregarCarrito = (id) => {
    if (!usuarioLogueado) {
        showToast("🔑 Identifícate para una experiencia de compra completa");
        document.getElementById('welcome-screen').style.display = 'flex';
        return;
    }
    const p = productos.find(i => i.id === id);
    const existe = carrito.find(i => i.id === id);
    if(existe) {
        if(existe.qty < p.stock) { 
            existe.qty++; 
            showToast("🛒 Cantidad actualizada"); 
        } else { 
            showToast("❌ Stock máximo alcanzado"); 
        }
    } else {
        carrito.push({...p, qty: 1});
        showToast("🛒 ¡Añadido con éxito!");
    }
    actualizarTodo();
};

function actualizarTodo() {
    localStorage.setItem('amzon_cart', JSON.stringify(carrito));
    const list = document.getElementById('cart-items');
    let total = 0, count = 0;
    list.innerHTML = carrito.length ? "" : "<p style='text-align:center; color:#94A3B8; padding: 20px;'>Tu bolsa está vacía.</p>";
    
    carrito.forEach((item, i) => {
        total += (item.precio * item.qty);
        count += item.qty;
        list.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="cambiarCant(${i}, -1)">-</button>
                        <span style="font-weight: 900">${item.qty}</span>
                        <button class="qty-btn" onclick="cambiarCant(${i}, 1)">+</button>
                    </div>
                </div>
                <div style="font-weight:bold; color: var(--primary)">$${(item.precio * item.qty).toFixed(2)}</div>
                <button class="btn-remove" onclick="quitar(${i})">×</button>
            </div>`;
    });
    
    document.getElementById('total-usd').innerText = total.toFixed(2);
    document.getElementById('total-bs').innerText = (total * TASA_BCV).toLocaleString('es-VE');
    document.getElementById('cart-count').innerText = count;
}

window.cambiarCant = (index, delta) => {
    const item = carrito[index];
    const original = productos.find(p => p.id === item.id);
    if (item.qty + delta > 0 && item.qty + delta <= original.stock) item.qty += delta;
    actualizarTodo();
};

window.quitar = (i) => { carrito.splice(i, 1); showToast("🗑️ Eliminado"); actualizarTodo(); };

// --- LÓGICA DE CHECKOUT ---
document.getElementById('btn-go-checkout').onclick = () => {
    if (!carrito.length) return showToast("⚠️ Carrito vacío");
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'flex';
    
    const list = document.getElementById('checkout-items-list');
    list.innerHTML = "";
    carrito.forEach(i => {
        list.innerHTML += `<p>• ${i.nombre} (x${i.qty}) - $${(i.precio * i.qty).toFixed(2)}</p>`;
    });
    document.getElementById('checkout-total-usd').innerText = `$${document.getElementById('total-usd').innerText}`;
    document.getElementById('checkout-total-bs').innerText = `${document.getElementById('total-bs').innerText} Bs.`;
};

document.getElementById('btn-back-store').onclick = () => {
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('store-content').style.display = 'flex';
};

document.getElementById('btn-finalizar-pago').onclick = () => {
    let msg = "🛍️ *NUEVO PEDIDO - HUMAN STORE*%0A%0A";
    carrito.forEach(i => msg += `▪️ ${i.nombre} (x${i.qty}) - $${i.precio * i.qty}%0A`);
    msg += `%0A💰 *TOTAL USD:* $${document.getElementById('total-usd').innerText}%0A🇻🇪 *TOTAL BS:* ${document.getElementById('total-bs').innerText} Bs.`;
    window.open(`https://wa.me/584120000000?text=${msg}`, '_blank');
};

// --- AUTH ---
const btnAuth = document.getElementById('btn-auth-action');
const welcome = document.getElementById('welcome-screen');

btnAuth.onclick = () => {
    const u = document.getElementById('usuario').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return showToast("⚠️ Llena los campos");

    if(modoRegistro) {
        localStorage.setItem(`user_${u}`, p);
        showToast("✅ ¡Registrado! Ahora inicia sesión.");
        document.getElementById('tab-login').click();
    } else {
        const passStored = localStorage.getItem(`user_${u}`);
        if(passStored === p) {
            usuarioLogueado = true;
            welcome.style.opacity = "0";
            setTimeout(() => {
                welcome.style.display = "none";
                document.getElementById('btn-logout').style.display = "block";
                showToast("👋 ¡Bienvenida!");
            }, 500);
        } else { showToast("❌ Error de acceso"); }
    }
};

// --- MODAL DE TÉRMINOS Y CONDICIONES ---
const modalTerminos = document.getElementById('modal-terminos');
const checkTerminos = document.getElementById('check-terminos');
const btnConfirmarTerminos = document.getElementById('btn-confirmar-terminos');

document.getElementById('link-terminos').onclick = (e) => {
    e.preventDefault();
    modalTerminos.style.display = 'block';
};

document.getElementById('close-terminos').onclick = () => {
    modalTerminos.style.display = 'none';
};

checkTerminos.onchange = function() {
    btnConfirmarTerminos.disabled = !this.checked;
};

btnConfirmarTerminos.onclick = () => {
    showToast("✅ Términos aceptados correctamente");
    modalTerminos.style.display = 'none';
};

// --- EVENTOS DEL MODAL DE FAVORITOS ---
document.getElementById('footer-ver-favoritos').onclick = (e) => {
    e.preventDefault();
    renderFavoritos();
    document.getElementById('modal-favoritos').style.display = 'block';
};

document.getElementById('close-favoritos').onclick = () => {
    document.getElementById('modal-favoritos').style.display = 'none';
};

// --- CIERRE Y EVENTOS GLOBALES ---
document.querySelectorAll('.close').forEach(btn => btn.onclick = () => {
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('modal-detalle').style.display = 'none';
    modalTerminos.style.display = 'none';
    document.getElementById('modal-favoritos').style.display = 'none';
});

window.onclick = (e) => {
    if (e.target.className === 'modal') {
        e.target.style.display = 'none';
    }
};

document.getElementById('btn-ver-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'block';
document.getElementById('tab-login').onclick = function() { modoRegistro = false; this.classList.add('active'); document.getElementById('tab-register').classList.remove('active'); btnAuth.innerText = "Entrar"; };
document.getElementById('tab-register').onclick = function() { modoRegistro = true; this.classList.add('active'); document.getElementById('tab-login').classList.remove('active'); btnAuth.innerText = "Registrarse"; };
document.getElementById('btn-cancel-auth').onclick = () => { welcome.style.display = 'none'; };
document.getElementById('btn-logout').onclick = () => { usuarioLogueado = false; location.reload(); };

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        renderProducts(btn.dataset.category === 'all' ? productos : productos.filter(p => p.cat === btn.dataset.category));
    };
});

document.getElementById('input-search').oninput = (e) => {
    const b = e.target.value.toLowerCase();
    renderProducts(productos.filter(p => p.nombre.toLowerCase().includes(b)));
};
