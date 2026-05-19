// --- VARIABLES DE ESTADO CON PERSISTENCIA ---
let TASA_BCV = parseFloat(localStorage.getItem('last_bcv_rate')) || 36.50; 
let usuarioLogueado = localStorage.getItem('human_store_logged') === 'true';
let usuarioActualCorreo = localStorage.getItem('human_store_user_email') || ""; 

// Estado Global de Moneda del Catálogo ('USD' o 'BS')
let MONEDA_ACTUAL = localStorage.getItem('human_store_display_currency') || "USD";

// Flujos luegos de autenticación avanzados
let modoRegistro = false;
let modoRecuperar = false; 
let pasoVerificacion = false; 
let codigoGeneradoSimulado = ""; 
let correoTemporalRecuperacion = "";
let datosRegistroTemporales = {};

// CONFIGURACIÓN BASE DE INVENTARIO EXTENDIDA (NUEVA MERCANCÍA PARA HOGAR AGREGADA)
const catalogoInicial = [
    { id: 1, nombre: "Laptop Gamer X-Pro", precio: 1200, cat: "electronica", stock: 5, img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500" },
    { id: 2, nombre: "Mouse Pro Wireless", precio: 25, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500" },
    { id: 3, nombre: "Lámpara Led Inteligente", precio: 45, cat: "hogar", stock: 4, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
    { id: 4, nombre: "Chaqueta Urban Style", precio: 80, cat: "ropa", stock: 12, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" },
    
    // Ropa
    { id: 5, nombre: "Jean Slim Fit Classic", precio: 45, cat: "ropa", stock: 15, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" },
    { id: 6, nombre: "Pantalón Cargo Urban", precio: 55, cat: "ropa", stock: 8, img: "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=500" },
    { id: 7, nombre: "Franela Oversize Black", precio: 20, cat: "ropa", stock: 20, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
    { id: 8, nombre: "Franela Minimalist White", precio: 18, cat: "ropa", stock: 25, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500" },
    { id: 9, nombre: "Mono Jogger Tech Fleece", precio: 50, cat: "ropa", stock: 10, img: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500" },
    { id: 10, nombre: "Mono Deportivo Casual", precio: 35, cat: "ropa", stock: 14, img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500" },
    { id: 11, nombre: "Suéter Hoodie Heavyweight", precio: 60, cat: "ropa", stock: 7, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" },
    { id: 12, nombre: "Suéter Knit Premium", precio: 65, cat: "ropa", stock: 6, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500" },

    // Electrónica
    { id: 13, nombre: "Audífonos Gamer HyperX Cloud", precio: 85, cat: "electronica", stock: 12, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500" },
    { id: 14, nombre: "Audífonos Gamer Logitech G-Pro", precio: 110, cat: "electronica", stock: 8, img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500" },
    { id: 15, nombre: "Reloj Inteligente Cubitt CT4", precio: 55, cat: "electronica", stock: 15, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500" },
    { id: 16, nombre: "Reloj Inteligente Cubitt Aura", precio: 70, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500" },
    { id: 17, nombre: "Control DualSense PS5 Black", precio: 75, cat: "electronica", stock: 9, img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500" },
    { id: 18, nombre: "Control DualSense PS5 White", precio: 70, cat: "electronica", stock: 14, img: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500" },

    // --- NUEVO LOTE: 2 COLCHONES SEMI-ORTOPÉDICOS (HOGAR) ---
    { id: 19, nombre: "Colchón Semi-Ortopédico Matrimonial", precio: 180, cat: "hogar", stock: 6, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500" },
    { id: 20, nombre: "Colchón Semi-Ortopédico Individual", precio: 130, cat: "hogar", stock: 8, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500" },

    // --- NUEVO LOTE: 2 JUEGOS DE MUEBLES (HOGAR) ---
    { id: 21, nombre: "Juego de Muebles Minimalista", precio: 450, cat: "hogar", stock: 3, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500" },
    { id: 22, nombre: "Juego de Muebles Esquinero Moderno", precio: 520, cat: "hogar", stock: 2, img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500" },

    // --- NUEVO LOTE: 2 LÁMPARAS DE MESA DE NOCHE (HOGAR) ---
    { id: 23, nombre: "Lámpara de Noche Touch Modern", precio: 30, cat: "hogar", stock: 15, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
    { id: 24, nombre: "Lámpara de Noche Vintage de Madera", precio: 35, cat: "hogar", stock: 11, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500" }
];

// Inyección y actualización automática de la BD local
let productosExistentes = JSON.parse(localStorage.getItem('human_store_products_db'));
if(!productosExistentes || productosExistentes.length !== catalogoInicial.length) {
    localStorage.setItem('human_store_products_db', JSON.stringify(catalogoInicial));
}
let productos = JSON.parse(localStorage.getItem('human_store_products_db'));

let carrito = JSON.parse(localStorage.getItem('amzon_cart')) || [];
let favoritos = JSON.parse(localStorage.getItem('human_store_favs')) || [];

// --- INYECTAR ESTILOS EXTRAS COMPATIBLES CON TU DISEÑO ---
const estilosExtra = document.createElement('style');
estilosExtra.innerHTML = `
    .user-menu-container { display: inline-block; position: relative; }
    .user-dropdown-btn {
        background: none; border: none; color: #FBBF24; font-weight: bold;
        cursor: pointer; display: flex; align-items: center; gap: 5px;
        font-size: 1rem; padding: 5px 10px; border-radius: 8px; transition: background 0.3s;
    }
    .user-dropdown-btn:hover { background: rgba(255, 255, 255, 0.1); }
    .user-dropdown-menu {
        display: none; position: absolute; right: 0; top: 110%;
        background-color: #1E293B; min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.4);
        border: 1px solid #334155; border-radius: 8px; z-index: 1000;
        overflow: hidden; animation: fadeInDropdown 0.3s ease;
    }
    @keyframes fadeInDropdown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .user-dropdown-menu a {
        color: white; padding: 12px 16px; text-decoration: none;
        display: block; font-size: 0.9rem; transition: background 0.2s, color 0.2s;
    }
    .user-dropdown-menu a:hover { background-color: #334155; color: #FBBF24; }
    .profile-info-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-top: 15px; }
    .profile-field { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #E2E8F0; }
    .profile-field:last-child { border-bottom: none; }
    .profile-label { font-weight: bold; color: #475569; }
    .profile-value { color: #0F172A; }
    .btn-nav-login { color: #FBBF24; cursor: pointer; font-weight: 700; transition: 0.3s; }
    .btn-nav-login:hover { color: white; transform: translateY(-2px); }
    .toast-fade-out {
        opacity: 0 !important; transform: scale(0.9) translateX(-50px) !important;
        filter: blur(5px) !important; transition: all 0.5s ease-in-out !important;
    }
    .pedido-card { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
    .pedido-header { display: flex; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 10px; font-size: 0.85rem; color: #64748B; }
    .pedido-totales { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #E2E8F0; display: flex; justify-content: space-between; font-weight: bold; }
    
    .nav-currency-toggle {
        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
        color: #FBBF24; padding: 6px 12px; border-radius: 20px; cursor: pointer;
        font-weight: bold; font-size: 0.8rem; display: flex; align-items: center; gap: 5px;
    }
    
    .card-sold-out { opacity: 0.6; }
    .badge-sold-out {
        position: absolute; top: 12px; left: 12px; background: #EF4444;
        color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: bold;
    }
    
    .fav-item-price-main { font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-top: 2px; }
    .fav-item-price-sub { font-size: 0.75rem; color: #64748B; font-weight: 500; }
`;
document.head.appendChild(estilosExtra);

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
            
            inyectarSelectorMonedaNavbar();

            const ultimaSeccion = localStorage.getItem('human_store_current_view') || 'store';
            if (ultimaSeccion === 'checkout' && usuarioLogueado && carrito.length > 0) {
                irASeccionCheckout(false); 
            } else {
                irASeccionTienda();
            }

            const categoriaGuardada = localStorage.getItem('human_store_active_category') || 'all';
            const textoBuscadoGuardado = localStorage.getItem('human_store_search_query') || "";
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if(btn.dataset.category === categoriaGuardada) {
                    document.querySelector('.filter-btn.active').classList.remove('active');
                    btn.classList.add('active');
                }
            });

            if(textoBuscadoGuardado) {
                document.getElementById('input-search').value = textoBuscadoGuardado;
                ejecutarFiltradoCombinado(textoBuscadoGuardado, categoriaGuardada);
            } else {
                renderProducts(categoriaGuardada === 'all' ? productos : productos.filter(p => p.cat === categoriaGuardada));
            }

            const modalAbierto = localStorage.getItem('human_store_opened_modal');
            if (modalAbierto === 'perfil' && usuarioLogueado) {
                document.getElementById('link-ver-perfil').click();
            } else if (modalAbierto === 'pedidos' && usuarioLogueado) {
                document.getElementById('link-mis-pedidos').click();
            } else if (modalAbierto === 'producto') {
                const prodId = localStorage.getItem('human_store_opened_product');
                if (prodId) abrirDetalle(parseInt(prodId));
            }

            actualizarTodo();
        }, 1000);
    }, 2800);
    
    if(!document.getElementById('modal-perfil')) {
        const modalP = document.createElement('div');
        modalP.id = 'modal-perfil'; modalP.className = 'modal'; modalP.style.display = 'none';
        modalP.innerHTML = `<div class="modal-content" style="max-width: 450px;"><span class="close" id="close-perfil">&times;</span><h2 style="font-family:'Orbitron';color:#1E293B;border-bottom:2px solid #FBBF24;padding-bottom:10px;">👤 Perfil de Usuario</h2><div id="perfil-body"></div></div>`;
        document.body.appendChild(modalP);
        document.getElementById('close-perfil').onclick = () => cerrarModalGeneral();
    }

    if(!document.getElementById('modal-historial-pedidos')) {
        const modalH = document.createElement('div');
        modalH.id = 'modal-historial-pedidos'; modalH.className = 'modal'; modalH.style.display = 'none';
        modalH.innerHTML = `<div class="modal-content" style="max-width: 500px;"><span class="close" id="close-historial">&times;</span><h2 style="font-family:'Orbitron';color:#1E293B;border-bottom:2px solid #FBBF24;padding-bottom:10px;">📦 Mis Pedidos Solicitados</h2><div id="historial-pedidos-body" style="max-height: 400px; overflow-y: auto; margin-top: 15px;"></div></div>`;
        document.body.appendChild(modalH);
        document.getElementById('close-historial').onclick = () => cerrarModalGeneral();
    }

    if (usuarioLogueado) {
        configurarMenuUsuarioDesplegable();
    } else {
        actualizarBotonLoginNavbar();
    }
});

// --- INYECTORS DINÁMICOS ---
function inyectarSelectorMonedaNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || document.getElementById('btn-currency-toggle')) return;

    const li = document.createElement('li');
    li.style.listStyle = 'none';
    li.innerHTML = `<button id="btn-currency-toggle" class="nav-currency-toggle">💵 Ver en: ${MONEDA_ACTUAL}</button>`;
    navLinks.insertBefore(li, navLinks.firstChild);

    document.getElementById('btn-currency-toggle').onclick = () => {
        MONEDA_ACTUAL = MONEDA_ACTUAL === "USD" ? "VES" : "USD";
        localStorage.setItem('human_store_display_currency', MONEDA_ACTUAL);
        document.getElementById('btn-currency-toggle').innerText = `💵 Ver en: ${MONEDA_ACTUAL}`;
        showToast(MONEDA_ACTUAL === "VES" ? "🇻🇪 Ver precios en Bolívares (BCV)" : "💵 Catálogo adaptado a Dólares (USD)");
        
        const cat = localStorage.getItem('human_store_active_category') || 'all';
        const query = localStorage.getItem('human_store_search_query') || "";
        ejecutarFiltradoCombinado(query, cat);
    };
}

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
                break; 
            }
        } catch (e) { console.warn(`Fuente fallida: ${url}`); }
    }
    const el = document.getElementById('tasa-venda');
    if (el) el.innerText = TASA_BCV.toFixed(2);
    actualizarTodo();
}

// --- MODIFICACIÓN DE TIEMPO A 10 SEGUNDOS ---
function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    
    // El mensaje se mantendrá visible por 10 segundos (10000ms) antes de desvanecerse
    setTimeout(() => { toast.classList.add('toast-fade-out'); }, 10000);
    setTimeout(() => { toast.remove(); }, 10500);
}

// --- RENDERING TIENDA ---
function renderProducts(lista) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = `<div class="no-products-msg"><h3>🔍 Sin Resultados Coincidentes</h3></div>`;
        return;
    }

    lista.forEach(p => {
        const esFav = favoritos.some(f => f.id === p.id);
        const estaAgotado = p.stock <= 0;
        
        let precioHtml = "";
        if (MONEDA_ACTUAL === "USD") {
            precioHtml = `
                <span class="price-usd" style="display:none;"></span>
                <span class="price-bs">$${p.precio.toFixed(2)} USD</span>
            `;
        } else {
            let precioEnBs = p.precio * TASA_BCV;
            precioHtml = `
                <span class="price-usd" style="display:none;"></span>
                <span class="price-bs">${precioEnBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</span>
            `;
        }

        const div = document.createElement('div');
        div.className = `product-card ${estaAgotado ? 'card-sold-out' : ''}`;
        div.innerHTML = `
            ${estaAgotado ? '<div class="badge-sold-out">AGOTADO</div>' : ''}
            <button class="btn-fav ${esFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorito(${p.id})">★</button>
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})" style="cursor:pointer">${p.nombre}</h4>
            ${precioHtml}
            <p style="font-size: 0.8rem; font-weight: bold; color: ${!estaAgotado ? '#10B981' : '#EF4444'}">
                ${!estaAgotado ? `Disponible en Stock (${p.stock} ud.)` : 'Agotado'}
            </p>
            <button class="btn-add" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">
                ${estaAgotado ? 'Sin Existencias' : 'Añadir al Carrito'}
            </button>
        `;
        grid.appendChild(div);
    });
}

function ejecutarFiltradoCombinado(texto, categoria) {
    let filtrados = productos;
    if (categoria !== 'all') filtrados = filtrados.filter(p => p.cat === categoria);
    if (texto) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase()));
    renderProducts(filtrados);
}

window.abrirDetalle = (id) => {
    const p = productos.find(i => i.id === id);
    if(!p) return;

    localStorage.setItem('human_store_opened_modal', 'producto');
    localStorage.setItem('human_store_opened_product', id);

    const body = document.getElementById('detalle-body');
    const estaAgotado = p.stock <= 0;

    body.innerHTML = `
        <div class="product-images"><img src="${p.img}" class="main-img"></div>
        <div class="product-info">
            <h2 style="font-family: 'Orbitron'; color: var(--primary)">${p.nombre}</h2>
            <h3 class="price-bs" style="font-size: 2.2rem; color:var(--secondary)">$${p.precio}</h3>
            <p style="font-size: 1.1rem">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>
            <p style="margin: 20px 0; color: #64748B">Este producto de alta calidad cuenta con control estricto de inventario en tiempo real.</p>
            <p style="font-weight:bold; margin-bottom:15px; color:${!estaAgotado ? '#10B981' : '#EF4444'}">Existencias reales: ${p.stock} unidades.</p>
            <button class="btn-primary" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id})">${!estaAgotado ? 'Añadir al Carrito' : 'Agotado'}</button>
        </div>`;
    document.getElementById('modal-detalle').style.display = 'block';
};

function cerrarModalGeneral() {
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('modal-detalle').style.display = 'none';
    document.getElementById('modal-terminos').style.display = 'none';
    document.getElementById('modal-favoritos').style.display = 'none';
    if(document.getElementById('modal-perfil')) document.getElementById('modal-perfil').style.display = 'none';
    if(document.getElementById('modal-historial-pedidos')) document.getElementById('modal-historial-pedidos').style.display = 'none';
    localStorage.removeItem('human_store_opened_modal');
    localStorage.removeItem('human_store_opened_product');
}

// --- CARRITO ---
window.agregarCarrito = (id) => {
    if (!usuarioLogueado) {
        showToast("🔑 Identifícate para una experiencia de compra completa");
        document.getElementById('welcome-screen').style.display = 'flex';
        return;
    }
    const original = productos.find(p => p.id === id);
    if(original.stock <= 0) return showToast("❌ Producto agotado");

    const existe = carrito.find(i => i.id === id);
    if(existe) {
        if(existe.qty < original.stock) { 
            existe.qty++; showToast("🛒 Carrito actualizado"); 
        } else { 
            showToast("❌ Stock máximo superado"); 
        }
    } else {
        carrito.push({...original, qty: 1});
        showToast("🛒 Añadido al carrito");
    }
    actualizarTodo();
};

function actualizarTodo() {
    localStorage.setItem('amzon_cart', JSON.stringify(carrito));
    const list = document.getElementById('cart-items');
    let total = 0, count = 0;
    
    if(list) {
        list.innerHTML = carrito.length ? "" : "<p style='text-align:center; color:#94A3B8; padding: 20px;'>Tu carrito está vacío.</p>";
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
    } else {
        carrito.forEach(item => { total += (item.precio * item.qty); count += item.qty; });
    }
    
    if(document.getElementById('total-usd')) document.getElementById('total-usd').innerText = total.toFixed(2);
    if(document.getElementById('total-bs')) document.getElementById('total-bs').innerText = (total * TASA_BCV).toLocaleString('es-VE');
    if(document.getElementById('cart-count')) document.getElementById('cart-count').innerText = count;
}

window.cambiarCant = (index, delta) => {
    const item = carrito[index];
    const original = productos.find(p => p.id === item.id);
    if (item.qty + delta > 0 && item.qty + delta <= original.stock) {
        item.qty += delta;
        showToast("📦 Cantidad actualizada");
    }
    actualizarTodo();
};

window.quitar = (i) => { carrito.splice(i, 1); showToast("🗑️ Producto removido"); actualizarTodo(); };

// --- CHECKOUT ---
function irASeccionCheckout(mostrarToast = true) {
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'flex';
    localStorage.setItem('human_store_current_view', 'checkout');

    const list = document.getElementById('checkout-items-list');
    list.innerHTML = "";
    carrito.forEach(i => {
        list.innerHTML += `<p>• ${i.nombre} (x${i.qty}) - $${(i.precio * i.qty).toFixed(2)}</p>`;
    });
    
    let totalUsdCalculado = 0;
    carrito.forEach(item => totalUsdCalculado += (item.precio * item.qty));

    document.getElementById('checkout-total-usd').innerText = `$${totalUsdCalculado.toFixed(2)}`;
    document.getElementById('checkout-total-bs').innerText = `${(totalUsdCalculado * TASA_BCV).toLocaleString('es-VE')} Bs.`;
    if (mostrarToast) showToast("📋 Resumen cargado");
}

function irASeccionTienda() {
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('store-content').style.display = 'flex';
    localStorage.setItem('human_store_current_view', 'store');
    actualizarTodo();
}

document.getElementById('btn-go-checkout').onclick = () => {
    if (!carrito.length) return showToast("⚠️ Carrito vacío");
    irASeccionCheckout(true);
};
document.getElementById('btn-back-store').onclick = () => { irASeccionTienda(); };

document.getElementById('btn-finalizar-pago').onclick = () => {
    showToast("📱 Liquidando stock y conectando a WhatsApp...");
    let totalUsd = document.getElementById('total-usd').innerText;
    let totalBs = document.getElementById('total-bs').innerText;

    carrito.forEach(itemEnCarro => {
        const prodMaster = productos.find(p => p.id === itemEnCarro.id);
        if(prodMaster) {
            prodMaster.stock = Math.max(0, prodMaster.stock - itemEnCarro.qty);
        }
    });

    localStorage.setItem('human_store_products_db', JSON.stringify(productos));

    const nuevoPedido = {
        idPedido: Math.floor(100000 + Math.random() * 900000),
        fecha: new Date().toLocaleDateString('es-VE'),
        hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        items: carrito.map(i => ({ nombre: i.nombre, qty: i.qty, subtotal: i.precio * i.qty })),
        totalUsd: totalUsd,
        totalBs: totalBs
    };

    let pedidosHistorial = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];
    pedidosHistorial.unshift(nuevoPedido); 
    localStorage.setItem(`pedidos_${usuarioActualCorreo}`, JSON.stringify(pedidosHistorial));

    const msg = `🛍️ *NUEVO PEDIDO CONFIRMADO - HUMAN STORE*%0A%0A` + 
                carrito.map(i => `▪️ ${i.nombre} (x${i.qty})%0A`).join("") + 
                `%0A💰 *TOTAL:* $${totalUsd} / ${totalBs} Bs.`;
    
    carrito = [];
    actualizarTodo();
    localStorage.removeItem('human_store_current_view');
    
    const activeCat = localStorage.getItem('human_store_active_category') || 'all';
    const query = localStorage.getItem('human_store_search_query') || "";
    ejecutarFiltradoCombinado(query, activeCat);
    
    irASeccionTienda(); 
    setTimeout(() => { window.open(`https://wa.me/584120000000?text=${msg}`, '_blank'); }, 1000);
};

// --- AUTENTICACIÓN ---
function actualizarBotonLoginNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const loginExistente = document.getElementById('btn-nav-login-item');
    if (loginExistente) loginExistente.remove();
    
    const dropdownExistente = document.getElementById('user-dropdown-wrapper');
    if (dropdownExistente) dropdownExistente.remove();

    if (!usuarioLogueado) {
        const li = document.createElement('li');
        li.className = 'nav-item btn-nav-login'; li.id = 'btn-nav-login-item'; li.style.listStyle = 'none';
        li.innerHTML = '🔑 Iniciar Sesión';
        
        li.onclick = () => {
            cancelarFlujosEspeciales();
            document.getElementById('tab-login').click(); 
            document.getElementById('welcome-screen').style.display = 'flex';
        };
        navLinks.appendChild(li);
    }
}

const btnAuth = document.getElementById('btn-auth-action');
const welcome = document.getElementById('welcome-screen');
const inputUsuario = document.getElementById('usuario');
const inputPassword = document.getElementById('password');
const fieldsetRegistro = document.getElementById('extended-register-fields');
const areaPasswordLogin = document.getElementById('login-password-area');
const areaCodigoVerificacion = document.getElementById('verification-code-area');
const areaNuevaPassword = document.getElementById('new-password-area');
const linkOlvidoPass = document.getElementById('link-forgot-password');
const linkVolverLogin = document.getElementById('link-back-to-auth');
const navTabsAutenticacion = document.getElementById('auth-nav-tabs');

function generarCodigoOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

btnAuth.onclick = () => {
    const u = inputUsuario.value.trim();
    if (modoRecuperar) {
        if (!u) return showToast("⚠️ Ingresa tu correo electrónico");
        if (!u.toLowerCase().endsWith("@gmail.com")) return showToast("❌ Formato inválido");

        if (!pasoVerificacion && codigoGeneradoSimulado === "") {
            localStorage.setItem(`user_${u}`, "12345678");
            btnAuth.disabled = true; btnAuth.innerText = "Enviando...";
            setTimeout(() => {
                correoTemporalRecuperacion = u; codigoGeneradoSimulado = generarCodigoOTP(); pasoVerificacion = true;
                inputUsuario.style.display = "none"; areaCodigoVerificacion.style.display = "block";
                btnAuth.disabled = false; btnAuth.innerText = "Verificar Código";
                showToast(`📱 Código enviado: ${codigoGeneradoSimulado}`);
            }, 1000);
            return;
        }
        if (pasoVerificacion && areaNuevaPassword.style.display === "none") {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código incorrecto");
            areaCodigoVerificacion.style.display = "none"; areaNuevaPassword.style.display = "block";
            btnAuth.innerText = "Actualizar Contraseña"; return showToast("🔑 Código verificado con éxito");
        }
        if (areaNuevaPassword.style.display === "block") {
            const nuevaPass = document.getElementById('new-password').value.trim();
            const nuevaPassConf = document.getElementById('new-password-confirm').value.trim();
            if (!nuevaPass || !nuevaPassConf) return showToast("⚠️ Rellena los campos");
            if (nuevaPass !== nuevaPassConf) return showToast("❌ Las contraseñas no coinciden");
            localStorage.setItem(`user_${correoTemporalRecuperacion}`, nuevaPass);
            showToast("🔒 ¡Contraseña actualizada!"); cancelarFlujosEspeciales(); document.getElementById('tab-login').click();
        }
        return;
    }

    if (modoRegistro) {
        const nombres = document.getElementById('reg-nombres').value.trim();
        const apellidos = document.getElementById('reg-apellidos').value.trim();
        const codigoPais = document.getElementById('reg-country-code').value;
        const telefono = document.getElementById('reg-telefono').value.trim();
        const p = inputPassword.value.trim();

        if (!pasoVerificacion) {
            if (!nombres || !apellidos || !telefono || !u || !p) return showToast("⚠️ Completa los campos");
            if (!u.toLowerCase().endsWith("@gmail.com")) return showToast("❌ Correo debe ser @gmail.com");
            if (localStorage.getItem(`user_${u}`) !== null) return showToast("⚠️ Correo ya registrado");

            datosRegistroTemporales = { correo: u, clave: p, telefono: `${codigoPais}${telefono}`, nombres, apellidos };
            codigoGeneradoSimulado = generarCodigoOTP(); pasoVerificacion = true;
            fieldsetRegistro.style.display = "none"; inputUsuario.style.display = "none"; areaPasswordLogin.style.display = "none";
            areaCodigoVerificacion.style.display = "block"; btnAuth.innerText = "Confirmar Registro";
            return showToast(`🎉 Código enviado a tu teléfono: ${codigoGeneradoSimulado}`);
        } else {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código inválido");
            localStorage.setItem(`user_${datosRegistroTemporales.correo}`, datosRegistroTemporales.clave);
            localStorage.setItem(`userdata_${datosRegistroTemporales.correo}`, JSON.stringify(datosRegistroTemporales));
            showToast("🎉 ¡Registro completado!"); cancelarFlujosEspeciales(); document.getElementById('tab-login').click();
        }
        return;
    }

    const p = inputPassword.value.trim();
    if (!u || !p) return showToast("⚠️ Por favor completa los campos");

    const passStored = localStorage.getItem(`user_${u}`);
    if (passStored === null) return showToast("❌ El usuario no existe.");
    if (passStored !== p) return showToast("🔒 Contraseña incorrecta");

    usuarioLogueado = true; usuarioActualCorreo = u;
    localStorage.setItem('human_store_logged', 'true'); localStorage.setItem('human_store_user_email', u);
    
    configurarMenuUsuarioDesplegable();
    welcome.style.opacity = "0";
    setTimeout(() => { welcome.style.display = "none"; showToast("👋 ¡Bienvenido a HUMAN STORE!"); }, 500);
};

function configurarMenuUsuarioDesplegable() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    if (document.getElementById('user-dropdown-wrapper')) document.getElementById('user-dropdown-wrapper').remove();
    if (document.getElementById('btn-nav-login-item')) document.getElementById('btn-nav-login-item').remove();

    const datosGuardados = localStorage.getItem(`userdata_${usuarioActualCorreo}`);
    let primerNombre = datosGuardados ? JSON.parse(datosGuardados).nombres.split(" ")[0] : (usuarioActualCorreo.split("@")[0] || "Premium");

    const liContainer = document.createElement('li');
    liContainer.className = 'nav-item user-menu-container'; liContainer.id = 'user-dropdown-wrapper'; liContainer.style.listStyle = 'none';
    liContainer.innerHTML = `
        <button class="user-dropdown-btn" id="dropdownUserTrigger">👤 Hola, ${primerNombre} <span style="font-size:0.7rem;">▼</span></button>
        <div class="user-dropdown-menu" id="dropdownUserMenu">
            <a href="#" id="link-ver-perfil">👤 Mi Perfil</a>
            <a href="#" id="link-mis-pedidos">📦 Mis Pedidos</a>
            <a href="#" id="link-cerrar-sesion" style="border-top: 1px solid #334155; color: #EF4444;">🚪 Cerrar Sesión</a>
        </div>
    `;
    navLinks.appendChild(liContainer);

    const trigger = document.getElementById('dropdownUserTrigger');
    const menu = document.getElementById('dropdownUserMenu');
    
    trigger.onclick = (e) => { e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
    window.addEventListener('click', () => { if(menu) menu.style.display = 'none'; });

    document.getElementById('link-ver-perfil').onclick = (e) => {
        e.preventDefault(); e.stopPropagation(); menu.style.display = 'none';
        localStorage.setItem('human_store_opened_modal', 'perfil');
        const pBody = document.getElementById('perfil-body');
        const infoUser = localStorage.getItem(`userdata_${usuarioActualCorreo}`);
        if (infoUser) {
            const data = JSON.parse(infoUser);
            pBody.innerHTML = `
                <div class="profile-info-box">
                    <div class="profile-field"><span class="profile-label">Nombres:</span><span class="profile-value">${data.nombres}</span></div>
                    <div class="profile-field"><span class="profile-label">Apellidos:</span><span class="profile-value">${data.apellidos}</span></div>
                    <div class="profile-field"><span class="profile-label">Correo:</span><span class="profile-value">${data.correo}</span></div>
                    <div class="profile-field"><span class="profile-label">Teléfono:</span><span class="profile-value">${data.telefono}</span></div>
                </div>`;
        }
        document.getElementById('modal-perfil').style.display = 'block';
    };

    document.getElementById('link-mis-pedidos').onclick = (e) => {
        e.preventDefault(); e.stopPropagation(); menu.style.display = 'none';
        localStorage.setItem('human_store_opened_modal', 'pedidos');
        const hBody = document.getElementById('historial-pedidos-body');
        const listaPedidos = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];

        if (listaPedidos.length === 0) {
            hBody.innerHTML = `<p style="text-align:center; color:#94A3B8; padding: 30px;">📭 Historial de compras vacío.</p>`;
        } else {
            hBody.innerHTML = "";
            listaPedidos.forEach(ped => {
                let itemsHtml = ped.items.map(i => `<li>• ${i.nombre} <strong>(x${i.qty})</strong></li>`).join("");
                hBody.innerHTML += `
                    <div class="pedido-card">
                        <div class="pedido-header"><span>🆔 #ID: <strong>${ped.idPedido}</strong></span><span>📅 ${ped.fecha}</span></div>
                        <ul style="margin: 0; padding-left: 15px; font-size: 0.9rem; color: #1E293B;">${itemsHtml}</ul>
                        <div class="pedido-totales"><span style="color: #64748B;">Total:</span><span style="color: #10B981;">${ped.totalUsd} / ${ped.totalBs}</span></div>
                    </div>`;
            });
        }
        document.getElementById('modal-historial-pedidos').style.display = 'block';
    };

    document.getElementById('link-cerrar-sesion').onclick = (e) => {
        e.preventDefault(); usuarioLogueado = false; usuarioActualCorreo = "";
        localStorage.clear(); location.reload(); 
    };
}

function cancelarFlujosEspeciales() {
    modoRecuperar = false; modoRegistro = false; pasoVerificacion = false;
    codigoGeneradoSimulado = ""; correoTemporalRecuperacion = ""; datosRegistroTemporales = {};
    inputUsuario.style.display = "block"; areaPasswordLogin.style.display = "block"; fieldsetRegistro.style.display = "none"; 
    areaCodigoVerificacion.style.display = "none"; areaNuevaPassword.style.display = "none"; navTabsAutenticacion.style.display = "flex";
    linkOlvidoPass.style.display = "block"; linkVolverLogin.style.display = "none";
}

linkOlvidoPass.onclick = (e) => {
    e.preventDefault(); modoRecuperar = true; modoRegistro = false; pasoVerificacion = false;
    document.getElementById('auth-msg').innerText = "Recuperación Oficial";
    navTabsAutenticacion.style.display = "none"; fieldsetRegistro.style.display = "none"; areaPasswordLogin.style.display = "none";
    areaCodigoVerificacion.style.display = "none"; areaNuevaPassword.style.display = "none"; linkOlvidoPass.style.display = "none";
    linkVolverLogin.style.display = "block"; btnAuth.innerText = "Enviar Código";
};

linkVolverLogin.onclick = (e) => { e.preventDefault(); cancelarFlujosEspeciales(); document.getElementById('tab-login').click(); };
document.getElementById('tab-login').onclick = function() { cancelarFlujosEspeciales(); this.classList.add('active'); document.getElementById('tab-register').classList.remove('active'); fieldsetRegistro.style.display = "none"; btnAuth.innerText = "Entrar"; };
document.getElementById('tab-register').onclick = function() { cancelarFlujosEspeciales(); modoRegistro = true; this.classList.add('active'); document.getElementById('tab-login').classList.remove('active'); fieldsetRegistro.style.display = "block"; btnAuth.innerText = "Enviar Registro"; };

// --- CATEGORÍAS Y BÚSQUEDA ---
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        localStorage.setItem('human_store_active_category', btn.dataset.category);
        const query = localStorage.getItem('human_store_search_query') || "";
        ejecutarFiltradoCombinado(query, btn.dataset.category);
    };
});

document.getElementById('input-search').oninput = (e) => {
    const query = e.target.value;
    localStorage.setItem('human_store_search_query', query);
    const cat = localStorage.getItem('human_store_active_category') || 'all';
    ejecutarFiltradoCombinado(query, cat);
};

// --- CONDICIONES Y FAVORITOS ---
const modalTerminos = document.getElementById('modal-terminos');
const checkTerminos = document.getElementById('check-terminos');
const btnConfirmarTerminos = document.getElementById('btn-confirmar-terminos');
document.getElementById('link-terminos').onclick = (e) => { e.preventDefault(); modalTerminos.style.display = 'block'; };
document.getElementById('close-terminos').onclick = () => { modalTerminos.style.display = 'none'; };
checkTerminos.onchange = function() { btnConfirmarTerminos.disabled = !this.checked; };
btnConfirmarTerminos.onclick = () => { showToast("✅ Condiciones aprobadas"); modalTerminos.style.display = 'none'; };

// Función auxiliar para actualizar dinámicamente el texto del botón global de favoritos
function actualizarContadorFavoritos() {
    const btnFavGlobal = document.getElementById('btn-search-favoritos');
    if (btnFavGlobal) {
        btnFavGlobal.innerHTML = `⭐ Favoritos (${favoritos.length})`;
    }
}

window.toggleFavorito = (id) => {
    const index = favoritos.findIndex(f => f.id === id);
    if (index > -1) { 
        favoritos.splice(index, 1); 
        showToast("✨ Quitado de Favoritos"); 
    } else { 
        favoritos.push(productos.find(p => p.id === id)); 
        showToast("⭐ Añadido a Favoritos"); 
    }
    localStorage.setItem('human_store_favs', JSON.stringify(favoritos));
    
    // Sincroniza la UI del catálogo superior y el botón global
    actualizarContadorFavoritos();
    const cat = localStorage.getItem('human_store_active_category') || 'all';
    const query = localStorage.getItem('human_store_search_query') || "";
    ejecutarFiltradoCombinado(query, cat);
    if(document.getElementById('modal-favoritos').style.display === 'block') renderFavoritos();
};

function renderFavoritos() {
    const list = document.getElementById('fav-items');
    if(favoritos.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 20px; color:#94A3B8;'>Lista vacía.</p>";
        document.getElementById('fav-actions-area').style.display = 'none';
    } else {
        list.innerHTML = ""; 
        document.getElementById('fav-actions-area').style.display = 'block';
        favoritos.forEach(item => {
            let precioHtmlFavoritos = "";
            if (MONEDA_ACTUAL === "USD") {
                precioHtmlFavoritos = `
                    <div class="fav-item-price-main">$${item.precio.toFixed(2)} USD</div>
                `;
            } else {
                precioHtmlFavoritos = `
                    <div class="fav-item-price-main" style="color:#10B981;">${(item.precio * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</div>
                `;
            }

            list.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 style="margin: 0;">${item.nombre}</h4>
                        ${precioHtmlFavoritos}
                    </div>
                    <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; margin-left: 10px; white-space: nowrap;" ${item.stock <= 0 ? 'disabled' : ''} onclick="agregarCarrito(${item.id})">🛒 Llevar</button>
                    <button class="btn-remove" style="margin-left: 10px;" onclick="toggleFavorito(${item.id})">×</button>
                </div>`;
        });
    }
}

document.getElementById('btn-llevar-todo-fav').onclick = () => {
    if (!usuarioLogueado) { document.getElementById('modal-favoritos').style.display = 'none'; document.getElementById('welcome-screen').style.display = 'flex'; return; }
    favoritos.forEach(p => { if(p.stock > 0) agregarCarrito(p.id); });
    favoritos = []; 
    localStorage.setItem('human_store_favs', JSON.stringify(favoritos));
    actualizarContadorFavoritos();
    cerrarModalGeneral(); 
    actualizarTodo();
};

document.getElementById('footer-ver-favoritos').onclick = (e) => { e.preventDefault(); renderFavoritos(); document.getElementById('modal-favoritos').style.display = 'block'; };
document.getElementById('close-favoritos').onclick = () => { document.getElementById('modal-favoritos').style.display = 'none'; };

// --- ACCIONES GLOBALES ---
document.querySelectorAll('.close').forEach(btn => btn.onclick = () => { cerrarModalGeneral(); });
window.onclick = (e) => { if (e.target.className === 'modal' || e.target.className === 'welcome-overlay') { cerrarModalGeneral(); document.getElementById('welcome-screen').style.display = 'none'; } };
document.getElementById('btn-ver-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'block';
document.getElementById('btn-cancel-auth').onclick = () => { document.getElementById('welcome-screen').style.display = 'none'; };

// --- INTEGRACIÓN CORRECTA Y RENDERIZADO DEL BOTÓN DE BÚSQUEDA DE FAVORITOS ---
document.getElementById('btn-search-favoritos').addEventListener('click', () => {
    renderFavoritos(); 
    document.getElementById('modal-favoritos').style.display = 'block'; 
});

// Inicialización de la cantidad de favoritos guardados al cargar la aplicación
actualizarContadorFavoritos();