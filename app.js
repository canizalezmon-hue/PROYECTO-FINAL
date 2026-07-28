// ==========================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (EL CEREBRO EN LA NUBE)
// ==========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDv1T2LlDQ_jFJEBWMLpw6Voo-0oaB2-Qc",
    authDomain: "human-store-9382a.firebaseapp.com",
    projectId: "human-store-9382a",
    storageBucket: "human-store-9382a.firebasestorage.app",
    messagingSenderId: "46873649912",
    appId: "1:46873649912:web:3e82edb6c485e9aa07d10d",
    measurementId: "G-QDV0TSR6F1"
};

// Inicializar la app y la base de datos
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================================================================
// 2. MOTOR DE SINCRONIZACIÓN EN LA NUBE (LOCAL-FIRST)
// ==========================================================================
const CloudDB = {
    async saveProduct(p) { 
        try { await db.collection('productos').doc(String(p.id)).set(p); console.log("☁️ Producto sincronizado."); } 
        catch(e){ console.warn("Error Firebase:", e); } 
    },
    async deleteProduct(id) { 
        try { await db.collection('productos').doc(String(id)).delete(); } 
        catch(e){} 
    },
    async saveOrder(o) { 
        try { await db.collection('pedidos').doc(String(o.idPedido)).set(o); } 
        catch(e){} 
    },
    async updateOrder(id, data) { 
        try { await db.collection('pedidos').doc(String(id)).update(data); } 
        catch(e){} 
    },
    async saveUserProp(correo, prop, data) { 
        try { await db.collection('usuarios').doc(correo).set({ [prop]: data }, {merge: true}); } 
        catch(e){} 
    },
    async saveQA(idProd, qaArray) { 
        try { await db.collection('qa').doc(String(idProd)).set({ preguntas: qaArray }); } 
        catch(e){} 
    }
};

// ==========================================================================
// 3. VARIABLES DE ESTADO Y PERSISTENCIA
// ==========================================================================
let TASA_BCV = parseFloat(localStorage.getItem('last_bcv_rate')) || 36.50; 
let usuarioLogueado = localStorage.getItem('human_store_logged') === 'true';
let usuarioActualCorreo = localStorage.getItem('human_store_user_email') || ""; 

let MONEDA_ACTUAL = localStorage.getItem('human_store_display_currency') || "USD";
let TEMA_ACTUAL = localStorage.getItem('human_store_theme') || 'light';
document.body.className = `theme-${TEMA_ACTUAL}`;

let modoRegistro = false;
let modoRecuperar = false; 
let pasoVerificacion = false; 
let codigoGeneradoSimulado = ""; 
let correoTemporalRecuperacion = "";
let datosRegistroTemporales = {};

let base64SellerImg = "";
let base64StoreLogo = ""; 
let editingProductId = null; 

let salesChartInstance = null;
let categoryChartInstance = null;

// ==========================================================================
// 4. BASE DE DATOS INICIAL (CATÁLOGO SEMILLA)
// ==========================================================================
const catalogoInicial = [
    { id: 1, nombre: "Laptop Gamer X-Pro", precioOriginal: 1200, precio: 1200, descuento: 0, cat: "electronica", stock: 2, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500", opciones: { "RAM": ["16GB", "32GB"], "Color": ["Negro", "Plata"] }, galeria: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"] },
    { id: 2, nombre: "Mouse Pro Wireless", precioOriginal: 25, precio: 25, descuento: 0, cat: "electronica", stock: 10, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", opciones: { "Color": ["Negro", "Blanco"] }, galeria: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", "https://images.unsplash.com/photo-1615663245857-ac9310d5b1ff?w=500"] },
    { id: 3, nombre: "Lámpara Led Inteligente", precioOriginal: 45, precio: 45, descuento: 0, cat: "hogar", stock: 4, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", opciones: { "Luz": ["Cálida", "Fría", "RGB"] } },
    { id: 4, nombre: "Chaqueta Urban Style", precioOriginal: 80, precio: 80, descuento: 0, cat: "ropa", stock: 12, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500", opciones: { "Talla": ["S", "M", "L", "XL"], "Color": ["Negro", "Gris Oscuro"] } },
    { id: 5, nombre: "Jean Slim Fit Classic", precioOriginal: 45, precio: 45, descuento: 0, cat: "ropa", stock: 3, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", opciones: { "Talla": ["28", "30", "32", "34"] } },
    { id: 6, nombre: "Pantalón Cargo Urban", precioOriginal: 55, precio: 55, descuento: 0, cat: "ropa", stock: 8, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=500", opciones: { "Talla": ["S", "M", "L"] } },
    { id: 13, nombre: "Audífonos Gamer HyperX Cloud", precioOriginal: 85, precio: 85, descuento: 0, cat: "electronica", stock: 12, owner: 'admin@humanstore.com', img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500", opciones: { "Color": ["Rojo", "Negro"] } }
];

let productos = JSON.parse(localStorage.getItem('human_store_products_db')) || catalogoInicial;
let carrito = JSON.parse(localStorage.getItem('human_store_cart')) || [];
let favoritos = JSON.parse(localStorage.getItem('human_store_favs')) || [];

function getSimulatedRating(id) {
    const rating = (4.0 + (id % 10) * 0.1).toFixed(1); 
    const reviews = (id * 37) % 250 + 45; 
    const fullStars = Math.floor(rating);
    let starsStr = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
    return { rating, reviews, starsStr };
}

function mostrarSkeletons() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = "";
    for(let i=0; i<6; i++){
        grid.innerHTML += `<div class="skeleton-card"><div class="skeleton-item skeleton-img"></div><div class="skeleton-item skeleton-title"></div><div class="skeleton-item skeleton-stars"></div><div class="skeleton-item skeleton-price"></div><div class="skeleton-item skeleton-btn"></div></div>`;
    }
}

window.selectVariant = (btn) => {
    const siblings = btn.parentElement.querySelectorAll('.var-btn');
    siblings.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

// ==========================================================================
// 5. INICIALIZACIÓN DE LA APLICACIÓN Y DESCARGA DESDE LA NUBE
// ==========================================================================
window.addEventListener('load', async () => {
    
    // Crear Super Admin si no existe
    if (!localStorage.getItem('userdata_admin@humanstore.com')) {
        let adminData = { correo: 'admin@humanstore.com', clave: 'admin123', nombres: 'Super', apellidos: 'Administrador', telefono: '+580000000000', rol: 'admin' };
        localStorage.setItem('user_admin@humanstore.com', 'admin123');
        localStorage.setItem('userdata_admin@humanstore.com', JSON.stringify(adminData));
        CloudDB.saveUserProp('admin@humanstore.com', 'perfil', adminData);
    }

    const preloader = document.getElementById('preloader');
    const app = document.getElementById('app-container');

    obtenerTasaBCV();
    mostrarSkeletons();

    // 🚀 DESCARGA DE DATOS DESDE FIREBASE
    try {
        const snapProds = await db.collection('productos').get();
        if(!snapProds.empty) {
            let nProds = [];
            snapProds.forEach(d => nProds.push(d.data()));
            productos = nProds.sort((a,b) => b.id - a.id);
            localStorage.setItem('human_store_products_db', JSON.stringify(productos));
        } else {
            productos.forEach(p => CloudDB.saveProduct(p));
        }

        const snapOrders = await db.collection('pedidos').get();
        if(!snapOrders.empty) {
            let nOrders = [];
            snapOrders.forEach(d => nOrders.push(d.data()));
            nOrders.sort((a,b) => b.idPedido - a.idPedido);
            localStorage.setItem('human_store_global_orders', JSON.stringify(nOrders));
        }
        
        if (usuarioActualCorreo) {
            const uDoc = await db.collection('usuarios').doc(usuarioActualCorreo).get();
            if(uDoc.exists) {
                let ud = uDoc.data();
                if(ud.perfil) localStorage.setItem(`userdata_${usuarioActualCorreo}`, JSON.stringify(ud.perfil));
                if(ud.wallet) localStorage.setItem(`wallet_${usuarioActualCorreo}`, JSON.stringify(ud.wallet));
                if(ud.payment) localStorage.setItem(`paymentData_${usuarioActualCorreo}`, JSON.stringify(ud.payment));
                if(ud.branding) localStorage.setItem(`branding_${usuarioActualCorreo}`, JSON.stringify(ud.branding));
            }
        }
    } catch(e) {
        console.warn("Operando en Modo Local. Verifica tu conexión a internet.");
    }

    const urlInput = document.getElementById('seller-prod-url');
    if(urlInput) {
        urlInput.addEventListener('input', (e) => {
            if(e.target.value) {
                base64SellerImg = ""; 
                const previewBox = document.getElementById('seller-img-preview-box');
                previewBox.innerHTML = `<img src="${e.target.value}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
            }
        });
    }

    setTimeout(() => {
        preloader.style.transition = "opacity 0.8s ease, filter 0.8s ease"; 
        preloader.style.opacity = "0"; 
        preloader.style.filter = "blur(10px)";
        
        setTimeout(() => {
            preloader.style.display = "none"; 
            app.classList.remove('hidden-app'); 
            app.classList.add('app-entry-animation'); 
            inyectarSelectorMonedaNavbar();

            const ultimaSeccion = localStorage.getItem('human_store_current_view', 'store');
            if (ultimaSeccion === 'checkout' && usuarioLogueado && carrito.length > 0) { irASeccionCheckout(false); } 
            else if(ultimaSeccion === 'admin' && usuarioLogueado) { mostrarPanelAdmin(); } 
            else if(ultimaSeccion === 'seller' && usuarioLogueado) { mostrarPanelVendedor(); } 
            else { irASeccionTienda(); }

            const categoriaGuardada = localStorage.getItem('human_store_active_category') || 'all';
            const textoBuscadoGuardado = localStorage.getItem('human_store_search_query') || "";
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if(btn.dataset.category === categoriaGuardada) { document.querySelector('.filter-btn.active').classList.remove('active'); btn.classList.add('active'); }
            });

            if(textoBuscadoGuardado) { document.getElementById('input-search').value = textoBuscadoGuardado; }
            ejecutarFiltradoCombinado(textoBuscadoGuardado, categoriaGuardada);
            actualizarTodo();
        }, 800); 
    }, 1200); 

    conectarEventosAutenticacion();
    if (usuarioLogueado) { configurarMenuUsuarioDesplegable(); } else { actualizarBotonLoginNavbar(); }
});

// ==========================================================================
// 6. FLUJO DE CHECKOUT Y DOM GENERAL
// ==========================================================================
const checkoutDelivery = document.getElementById('checkout-delivery');
const deliveryAddressArea = document.getElementById('delivery-address-area');
const checkoutPayment = document.getElementById('checkout-payment');

if(checkoutDelivery) {
    checkoutDelivery.addEventListener('change', (e) => {
        if(e.target.value.includes('Delivery') || e.target.value.includes('Nacional')) { deliveryAddressArea.style.display = 'block'; } 
        else { deliveryAddressArea.style.display = 'none'; }
    });
}

if(checkoutPayment) {
    checkoutPayment.addEventListener('change', (e) => {
        const val = e.target.value;
        document.getElementById('pago-movil-info').style.display = 'none'; document.getElementById('zelle-info').style.display = 'none'; document.getElementById('paypal-info').style.display = 'none'; document.getElementById('binance-info').style.display = 'none';
        document.getElementById('pm-autofill-msg').style.display = 'none'; document.getElementById('zelle-autofill-msg').style.display = 'none'; document.getElementById('paypal-autofill-msg').style.display = 'none';

        const savedPayRaw = localStorage.getItem(`paymentData_${usuarioActualCorreo}`);
        const savedPay = savedPayRaw ? JSON.parse(savedPayRaw) : null;

        if (val === 'Pago Móvil') { document.getElementById('pago-movil-info').style.display = 'block'; if(savedPay && savedPay.pm) { document.getElementById('pm-telefono-origen').value = savedPay.pm; document.getElementById('pm-autofill-msg').style.display = 'inline-block'; } }
        if (val === 'Zelle') { document.getElementById('zelle-info').style.display = 'block'; if(savedPay && savedPay.zelle) { document.getElementById('zelle-email').value = savedPay.zelle; document.getElementById('zelle-autofill-msg').style.display = 'inline-block'; } }
        if (val === 'PayPal') { document.getElementById('paypal-info').style.display = 'block'; if(savedPay && savedPay.paypal) { document.getElementById('paypal-email').value = savedPay.paypal; document.getElementById('paypal-autofill-msg').style.display = 'inline-block'; } }
        if (val === 'Binance') document.getElementById('binance-info').style.display = 'block';
    });
}

function conectarEventosAutenticacion() {
    const btnAuthAction = document.getElementById('btn-auth-action');
    if(btnAuthAction) btnAuthAction.onclick = () => procesarAccionAuth();

    const tLogin = document.getElementById('tab-login');
    const tRegister = document.getElementById('tab-register');
    
    if(tLogin) tLogin.onclick = () => { cancelarFlujosEspeciales(); tLogin.classList.add('active'); if(tRegister) tRegister.classList.remove('active'); document.getElementById('extended-register-fields').style.display = "none"; btnAuthAction.innerText = "Entrar"; };
    if(tRegister) tRegister.onclick = () => { cancelarFlujosEspeciales(); modoRegistro = true; tRegister.classList.add('active'); if(tLogin) tLogin.classList.remove('active'); document.getElementById('extended-register-fields').style.display = "flex"; btnAuthAction.innerText = "Enviar Registro"; };

    const linkForgot = document.getElementById('link-forgot-password');
    const linkBack = document.getElementById('link-back-to-auth');
    const navTabs = document.getElementById('auth-nav-tabs');

    if(linkForgot) linkForgot.onclick = (e) => { e.preventDefault(); modoRecuperar = true; modoRegistro = false; pasoVerificacion = false; document.getElementById('auth-msg').innerText = "Recuperación Oficial"; if(navTabs) navTabs.style.display = "none"; document.getElementById('extended-register-fields').style.display = "none"; document.getElementById('login-password-area').style.display = "none"; document.getElementById('verification-code-area').style.display = "none"; document.getElementById('new-password-area').style.display = "none"; linkForgot.style.display = "none"; if(linkBack) linkBack.style.display = "block"; btnAuthAction.innerText = "Enviar Código"; };
    if(linkBack) linkBack.onclick = (e) => { e.preventDefault(); cancelarFlujosEspeciales(); if(tLogin) tLogin.click(); };

    const btnInicioFooter = document.getElementById('link-inicio-footer');
    if(btnInicioFooter) { btnInicioFooter.onclick = (e) => { e.preventDefault(); irASeccionTienda(); window.scrollTo({ top: 0, behavior: 'smooth' }); showToast("🔝 Volviste al inicio del catálogo"); }; }
}

function inyectarSelectorMonedaNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || document.getElementById('btn-currency-toggle')) return;
    const li = document.createElement('li'); li.style.listStyle = 'none';
    li.innerHTML = `<button id="btn-currency-toggle" class="nav-currency-toggle">💵 Ver en: ${MONEDA_ACTUAL}</button>`;
    navLinks.insertBefore(li, navLinks.firstChild);

    document.getElementById('btn-currency-toggle').onclick = () => {
        MONEDA_ACTUAL = MONEDA_ACTUAL === "USD" ? "VES" : "USD";
        localStorage.setItem('human_store_display_currency', MONEDA_ACTUAL);
        document.getElementById('btn-currency-toggle').innerText = `💵 Ver en: ${MONEDA_ACTUAL}`;
        showToast(MONEDA_ACTUAL === "VES" ? "  🇻🇪 Catálogo adaptado a Bolívares (BCV)" : "💵 Catálogo adaptado a Dólares (USD)");
        const cat = localStorage.getItem('human_store_active_category') || 'all'; const query = localStorage.getItem('human_store_search_query') || ""; ejecutarFiltradoCombinado(query, cat);
    };
}

async function obtenerTasaBCV() {
    const apiSources = [ 'https://ve.dolarapi.com/v1/dolares/oficial', 'https://pydolarve.org/api/v1/dollar?page=bcv' ];
    for (let url of apiSources) {
        try {
            const response = await fetch(url); const data = await response.json();
            let valor = url.includes('dolarapi') ? data.promedio : data.monedas?.usd?.valor;
            if (valor) { TASA_BCV = valor; localStorage.setItem('last_bcv_rate', TASA_BCV); break; }
        } catch (e) { console.warn(`Fuente fallida: ${url}`); }
    }
    const el = document.getElementById('tasa-venda'); if (el) el.innerText = TASA_BCV.toFixed(2);
    actualizarTodo();
}

function showToast(mensaje, duracion = 3000) {
    const container = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = mensaje; container.appendChild(toast);
    setTimeout(() => { toast.classList.add('toast-fade-out'); }, duracion); setTimeout(() => { toast.remove(); }, duracion + 500);
}

// ==========================================================================
// 7. RENDERIZADO DEL CATÁLOGO
// ==========================================================================
function renderProducts(lista) {
    const grid = document.getElementById('product-grid'); grid.innerHTML = "";
    if (lista.length === 0) { grid.innerHTML = `<div class="no-products-msg"><h3>🔍 Sin Resultados Coincidentes</h3></div>`; return; }

    lista.forEach(p => {
        const esFav = favoritos.some(f => f.id === p.id); const estaAgotado = p.stock <= 0; let precioHtml = ""; const rate = getSimulatedRating(p.id);
        let originalUsd = p.precioOriginal || p.precio; let finalUsd = p.precio;

        if (MONEDA_ACTUAL === "USD") {
            if (p.descuento > 0) { precioHtml = `<div class="price-container"><del class="price-original">$${originalUsd.toFixed(2)}</del><span class="price-bs price-discount">$${finalUsd.toFixed(2)} USD</span></div>`; } 
            else { precioHtml = `<div class="price-container"><span class="price-bs">$${finalUsd.toFixed(2)} USD</span></div>`; }
        } else {
            let originalBs = originalUsd * TASA_BCV; let finalBs = finalUsd * TASA_BCV;
            if (p.descuento > 0) { precioHtml = `<div class="price-container"><del class="price-original">${originalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</del><span class="price-bs price-discount">${finalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span></div>`; } 
            else { precioHtml = `<div class="price-container"><span class="price-bs">${finalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span></div>`; }
        }

        const badgeDescuento = p.descuento > 0 ? `<div class="badge-discount">-${p.descuento}% OFF</div>` : '';
        const badgeAgotado = estaAgotado ? '<div class="badge-sold-out">AGOTADO</div>' : '';
        const gatilloStock = (!estaAgotado && p.stock <= 5) ? `<div class="urgency-stock">🔥 ¡Últimas ${p.stock} disponibles!</div>` : '';

        const div = document.createElement('div'); div.className = `product-card ${estaAgotado ? 'card-sold-out' : ''}`;
        div.innerHTML = `
            ${badgeAgotado}${badgeDescuento}
            <button class="btn-fav ${esFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorito(${p.id})">★</button>
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})" style="cursor:pointer; margin-bottom: 5px;">${p.nombre}</h4>
            <div class="product-rating"><span class="stars">${rate.starsStr}</span><span class="reviews-count">${rate.rating} (${rate.reviews})</span></div>
            ${precioHtml}${gatilloStock}
            <p style="font-size: 0.8rem; font-weight: bold; color: ${!estaAgotado ? '#10B981' : '#EF4444'}">${!estaAgotado ? `Disponible en Stock` : 'Agotado'}</p>
            <button class="btn-add" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id}, false)">${estaAgotado ? 'Sin Existencias' : 'Añadir al Carrito'}</button>
        `;
        grid.appendChild(div);
    });
}

function ejecutarFiltradoCombinado(texto, categoria) {
    mostrarSkeletons(); const precioMax = parseFloat(document.getElementById('price-slider')?.value) || Infinity; let filtrados = productos;
    if (categoria !== 'all') filtrados = filtrados.filter(p => p.cat === categoria);
    if (texto) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase()));
    filtrados = filtrados.filter(p => p.precio <= precioMax);
    setTimeout(() => { renderProducts(filtrados); }, 500); 
}

// ==========================================================================
// 8. DETALLE DEL PRODUCTO Y SISTEMA DE PREGUNTAS
// ==========================================================================
window.abrirDetalle = (id) => {
    const p = productos.find(i => i.id === id); if(!p) return;
    localStorage.setItem('human_store_opened_modal', 'producto'); localStorage.setItem('human_store_opened_product', id);

    const body = document.getElementById('detalle-body'); const estaAgotado = p.stock <= 0; const rate = getSimulatedRating(p.id);
    let priceDetailsHtml = p.descuento > 0 ? `<div style="display:flex; align-items:center; gap: 15px; margin-bottom: 5px;"><h3 class="price-bs" style="font-size: 2.2rem; color:var(--success); margin:0;">$${p.precio} USD</h3><div style="display:flex; flex-direction:column; align-items:flex-start;"><del style="color:var(--text-sub); font-size:1.2rem;">$${p.precioOriginal} USD</del><span style="background:var(--danger); color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold; margin-top:3px;">Ahorras ${p.descuento}%</span></div></div><p style="font-size: 1.1rem; margin-top:0;">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>` : `<h3 class="price-bs" style="font-size: 2.2rem; color:var(--secondary); margin-bottom: 5px;">$${p.precio} USD</h3><p style="font-size: 1.1rem; margin-top:0;">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>`;

    let variantsHtml = "";
    if (p.opciones) {
        variantsHtml = `<div class="product-variants" style="margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 15px;">`;
        for (let [opType, opValues] of Object.entries(p.opciones)) { variantsHtml += `<div class="variant-group"><span style="display:block; font-weight:700; margin-bottom:8px; font-size:0.85rem; color:var(--text-sub); text-transform:uppercase;">${opType}:</span><div style="display:flex; gap:10px; flex-wrap:wrap;">${opValues.map((val, idx) => `<button class="var-btn ${idx===0 ? 'active' : ''}" data-type="${opType}" data-val="${val}" onclick="selectVariant(this)">${val}</button>`).join('')}</div></div>`; }
        variantsHtml += `</div>`;
    }

    let galeria = p.galeria || [p.img]; let thumbnailsHtml = "";
    if(galeria.length > 1) { thumbnailsHtml = `<div class="thumbnails-wrapper">${galeria.map((imgSrc, idx) => `<img src="${imgSrc}" class="thumbnail-img ${idx === 0 ? 'active-thumb' : ''}" onclick="cambiarImagenPrincipal(this, '${imgSrc}')">`).join('')}</div>`; }

    const espectadoresAleatorios = Math.floor(Math.random() * (18 - 4 + 1)) + 4;
    const gatilloViewers = !estaAgotado ? `<div class="urgency-viewers"><span class="blink-dot"></span> ${espectadoresAleatorios} personas están viendo esto ahora</div>` : '';
    const gatilloStockModal = (!estaAgotado && p.stock <= 5) ? `<div class="urgency-stock" style="font-size: 0.9rem; padding: 8px 12px;">⏳ ¡No lo dejes escapar! Solo quedan ${p.stock} en nuestro almacén.</div>` : '';

    let sellerBranding = JSON.parse(localStorage.getItem(`branding_${p.owner}`)) || null;
    let storeName = "Human Store Oficial";
    let storeLogo = "https://ui-avatars.com/api/?name=HS&background=0D8ABC&color=fff"; 
    
    if (p.owner && p.owner !== 'admin@humanstore.com') {
        storeName = sellerBranding && sellerBranding.name ? sellerBranding.name : p.owner.split('@')[0];
        storeLogo = sellerBranding && sellerBranding.logo ? sellerBranding.logo : `https://ui-avatars.com/api/?name=${storeName}&background=random`;
    }

    let brandingHtml = `
        <div class="seller-branding-badge">
            <img src="${storeLogo}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary);">
            <div>
                <span style="font-size: 0.75rem; color: var(--text-sub); display: block; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Vendido y despachado por:</span>
                <strong style="color: var(--text-main); font-size: 1.05rem; font-family: 'Orbitron', sans-serif;">${storeName}</strong>
            </div>
        </div>
    `;

    body.innerHTML = `
        <div class="product-images" style="position:relative;">${p.descuento > 0 ? `<div class="badge-discount" style="top: 20px; left: 20px; z-index: 10; font-size: 1rem; padding: 8px 15px;">-${p.descuento}% OFF</div>` : ''}<div class="product-gallery-container"><div class="main-image-wrapper" id="zoom-wrapper" onmousemove="zoomIn(event)" onmouseleave="zoomOut()"><img src="${p.img}" class="main-img" id="main-product-img"></div>${thumbnailsHtml}</div></div>
        <div class="product-info">
            <h2 style="font-family: 'Orbitron'; color: var(--text-main); margin-bottom: 5px;">${p.nombre}</h2>
            <div class="product-rating detail-rating"><span class="stars">${rate.starsStr}</span><span class="reviews-count" style="font-size: 0.95rem;">${rate.rating} de 5 estrellas (${rate.reviews} valoraciones)</span></div>
            ${brandingHtml}
            ${gatilloViewers}${priceDetailsHtml}${variantsHtml}
            <p style="margin: 20px 0; color: var(--text-sub)">Este producto cuenta con control estricto de inventario y garantía oficial de HUMAN STORE.</p>
            ${gatilloStockModal}<p style="font-weight:bold; margin-bottom:15px; color:${!estaAgotado ? '#10B981' : '#EF4444'}">Existencias reales: ${p.stock} unidades.</p>
            <button class="btn-primary" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id}, true)">${!estaAgotado ? 'Confirmar y Añadir al Carrito' : 'Agotado'}</button>
        </div>
        <div class="qa-container-block"><h3 class="qa-title">✨ Consultas sobre el producto</h3><div class="qa-form-wrapper"><input type="text" id="input-nueva-pregunta" class="checkout-input" placeholder="Escribe tu duda (Ej: ¿Es compatible con PS5?, ¿Hacen envíos hoy?)"><button class="btn-checkout qa-btn-ask" onclick="hacerPregunta(${p.id})">Preguntar</button></div><div id="qa-items-list" class="qa-items-feed"></div></div>
    `;
    document.getElementById('modal-detalle').style.display = 'block'; 
    window.refreshQAList(p.id);
};

window.hacerPregunta = (id) => {
    const input = document.getElementById('input-nueva-pregunta'); if (!input) return; const texto = input.value.trim();
    if (!texto) return showToast("⚠️ Escribe una pregunta válida.");
    if (!usuarioLogueado) { showToast("🔑 Inicia sesión para dejar una consulta oficial"); document.getElementById('welcome-screen').style.display = 'flex'; return; }
    
    let preguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
    preguntas.unshift({ usuario: usuarioActualCorreo, texto: texto, fecha: new Date().toLocaleDateString('es-VE'), respuesta: null });
    localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(preguntas));
    CloudDB.saveQA(id, preguntas); // NUBE
    
    showToast("❓ Consulta publicada con éxito"); input.value = ""; window.refreshQAList(id);

    setTimeout(() => {
        let currentPreguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
        if (currentPreguntas.length > 0 && !currentPreguntas[0].respuesta) {
            currentPreguntas[0].respuesta = "¡Hola! Gracias por tu consulta. Confirmamos stock e indicaciones técnicas. Puedes procesar tu orden al carrito y un asesor te atenderá de inmediato por WhatsApp.";
            localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(currentPreguntas));
            CloudDB.saveQA(id, currentPreguntas); // NUBE
            if (document.getElementById('modal-detalle').style.display === 'block') { window.refreshQAList(id); }
        }
    }, 2000);
};

window.refreshQAList = async (id) => {
    const listEl = document.getElementById('qa-items-list'); if (!listEl) return;
    
    // Intento de recargar preguntas desde la nube
    try {
        const qaDoc = await db.collection('qa').doc(String(id)).get();
        if(qaDoc.exists) { localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(qaDoc.data().preguntas)); }
    } catch(e){}

    let preguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
    listEl.innerHTML = preguntas.map(q => {
        let respHtml = q.respuesta ? `<div class="qa-answer-block"><p class="qa-answer-text"><span>↩️</span> ${q.respuesta}</p></div>` : `<div class="qa-answer-block pending"><p class="qa-answer-text italic">⏳ Esperando respuesta de HUMAN STORE...</p></div>`;
        return `<div class="qa-item-row"><div class="qa-question-header"><span class="qa-user-tag">👤 ${q.usuario.split('@')[0]}</span><span class="qa-date-tag">${q.fecha}</span></div><p class="qa-question-text">${q.texto}</p>${respHtml}</div>`;
    }).join('');
};

function cerrarModalGeneral() {
    document.getElementById('modal-carrito').style.display = 'none'; 
    document.getElementById('modal-detalle').style.display = 'none'; 
    document.getElementById('modal-terminos').style.display = 'none'; 
    document.getElementById('modal-favoritos').style.display = 'none'; 
    document.getElementById('modal-perfil').style.display = 'none'; 
    document.getElementById('modal-historial-pedidos').style.display = 'none';
    document.getElementById('modal-analiticas').style.display = 'none';
    localStorage.removeItem('human_store_opened_modal'); 
    localStorage.removeItem('human_store_opened_product');
}

// ==========================================================================
// 9. GESTIÓN DEL CARRITO DE COMPRAS Y PEDIDOS
// ==========================================================================
window.agregarCarrito = (id, desdeModal = false) => {
    if (!usuarioLogueado) { showToast("🔑 Identifícate para una experiencia de compra completa"); document.getElementById('welcome-screen').style.display = 'flex'; return; }
    const original = productos.find(p => p.id === id); if(original.stock <= 0) return showToast("❌ Producto agotado");

    let varText = "";
    if (original.opciones) {
        if (!desdeModal) { abrirDetalle(id); return showToast("⚠️ Por favor escoge tu talla o capacidad antes de comprar."); }
        const selected = []; document.querySelectorAll('.variant-group').forEach(group => { const activeBtn = group.querySelector('.var-btn.active'); if(activeBtn) selected.push(`${activeBtn.dataset.type}: ${activeBtn.dataset.val}`); });
        varText = selected.join(" | ");
    }

    const cartId = id + (varText ? `-${varText}` : ""); const existe = carrito.find(i => i.cartId === cartId);
    if(existe) { if(existe.qty < original.stock) { existe.qty++; showToast("🛒 Carrito actualizado"); } else { showToast("❌ Stock máximo superado"); } } 
    else { carrito.push({...original, qty: 1, cartId: cartId, variantesTexto: varText}); showToast("🛒 Añadido al carrito"); if(desdeModal) cerrarModalGeneral(); }
    actualizarTodo();
};

function actualizarTodo() {
    localStorage.setItem('human_store_cart', JSON.stringify(carrito));
    const list = document.getElementById('cart-items'); let total = 0, count = 0;
    
    if(list) {
        list.innerHTML = carrito.length ? "" : "<p style='text-align:center; color: var(--text-sub); padding: 20px;'>Tu carrito está vacío.</p>";
        carrito.forEach((item, i) => {
            total += (item.precio * item.qty); count += item.qty;
            let varsHtmlInfo = item.variantesTexto ? `<div style="font-size: 0.75rem; color: var(--text-sub); margin-top: 2px;">${item.variantesTexto}</div>` : "";
            list.innerHTML += `<div class="cart-item"><img src="${item.img}" class="cart-item-img"><div class="cart-item-info"><h4>${item.nombre}</h4>${varsHtmlInfo}<div class="cart-qty-controls"><button class="qty-btn" onclick="cambiarCant(${i}, -1)">-</button><span style="font-weight: 900">${item.qty}</span><button class="qty-btn" onclick="cambiarCant(${i}, 1)">+</button></div></div><div style="font-weight:bold; color: var(--text-main)">$${(item.precio * item.qty).toFixed(2)}</div><button class="btn-remove" onclick="quitar(${i})">×</button></div>`;
        });
    } else {
        carrito.forEach(item => { total += (item.precio * item.qty); count += item.qty; });
    }
    
    if(document.getElementById('total-usd')) document.getElementById('total-usd').innerText = total.toFixed(2);
    if(document.getElementById('total-bs')) document.getElementById('total-bs').innerText = (total * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    if(document.getElementById('cart-count')) document.getElementById('cart-count').innerText = count;

    const umbralEnvio = 50; const shippingText = document.getElementById('shipping-progress-text'); const shippingFill = document.getElementById('shipping-bar-fill');
    if (shippingText && shippingFill) {
        if (total === 0) { shippingText.innerHTML = `Agrega <strong>$${umbralEnvio.toFixed(2)}</strong> para 🚚 Envío Gratis`; shippingFill.style.width = '0%'; shippingFill.classList.remove('success'); } 
        else if (total < umbralEnvio) { const faltante = umbralEnvio - total; const porcentaje = (total / umbralEnvio) * 100; shippingText.innerHTML = `¡Te faltan <strong>$${faltante.toFixed(2)}</strong> para 🚚 Envío Gratis!`; shippingFill.style.width = `${porcentaje}%`; shippingFill.classList.remove('success'); } 
        else { shippingText.innerHTML = `¡Felicidades! Tienes <strong>🚚 Envío Gratis</strong>`; shippingFill.style.width = '100%'; shippingFill.classList.add('success'); }
    }
    actualizarSugerenciasCarrito();
}

window.cambiarCant = (index, delta) => {
    const item = carrito[index]; const original = productos.find(p => p.id === item.id);
    if (item.qty + delta > 0 && item.qty + delta <= original.stock) { item.qty += delta; showToast("📦 Cantidad actualizada"); }
    actualizarTodo();
};

window.quitar = (index) => { carrito.splice(index, 1); showToast("🗑️ Producto removido"); actualizarTodo(); };

function irASeccionCheckout(mostrarToast = true) {
    document.getElementById('modal-carrito').style.display = 'none'; document.getElementById('store-content').style.display = 'none'; document.getElementById('admin-panel').style.display = 'none'; document.getElementById('seller-panel').style.display = 'none'; document.getElementById('main-hero').style.display = 'none'; document.getElementById('checkout-page').style.display = 'flex';
    
    const searchBar = document.getElementById('nav-search-bar'); if(searchBar) searchBar.style.display = 'none';
    const cartBtn = document.getElementById('btn-ver-carrito'); if(cartBtn) cartBtn.style.display = 'none';

    localStorage.setItem('human_store_current_view', 'checkout');
    const list = document.getElementById('checkout-items-list'); list.innerHTML = "";
    carrito.forEach(i => { let textVars = i.variantesTexto ? ` <i>(${i.variantesTexto})</i>` : ""; list.innerHTML += `<p style="margin-bottom: 5px;">• ${i.nombre}${textVars} (x${i.qty}) - $${(i.precio * i.qty).toFixed(2)} USD</p>`; });
    let totalUsdCalculado = 0; carrito.forEach(item => totalUsdCalculado += (item.precio * item.qty));
    document.getElementById('checkout-total-usd').innerText = `$${totalUsdCalculado.toFixed(2)}`; document.getElementById('checkout-total-bs').innerText = `${(totalUsdCalculado * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`;
    if (mostrarToast) showToast("📋 Resumen cargado");
}

function irASeccionTienda() {
    document.getElementById('checkout-page').style.display = 'none'; document.getElementById('admin-panel').style.display = 'none'; document.getElementById('seller-panel').style.display = 'none'; document.getElementById('main-hero').style.display = 'flex'; document.getElementById('store-content').style.display = 'flex';
    
    const searchBar = document.getElementById('nav-search-bar'); if(searchBar) searchBar.style.display = 'flex';
    const cartBtn = document.getElementById('btn-ver-carrito'); if(cartBtn) cartBtn.style.display = 'block';

    localStorage.setItem('human_store_current_view', 'store'); actualizarTodo();
}

document.getElementById('btn-go-checkout').onclick = () => { if (!carrito.length) return showToast("⚠️ Carrito vacío"); irASeccionCheckout(true); };
document.querySelectorAll('.btn-back-store').forEach(btn => { btn.onclick = () => { irASeccionTienda(); }; });

document.getElementById('btn-finalizar-pago').onclick = () => {
    const deliveryMethod = document.getElementById('checkout-delivery').value;
    const paymentMethod = document.getElementById('checkout-payment').value;
    const address = document.getElementById('checkout-address').value.trim();

    if(!paymentMethod) return showToast("⚠️ Por favor selecciona un método de pago");
    if((deliveryMethod.includes('Delivery') || deliveryMethod.includes('Nacional')) && address === "") return showToast("⚠️ Por favor ingresa tu dirección de entrega detallada");

    let paymentDetailsText = "";
    if (paymentMethod === "Pago Móvil") {
        const telEmisor = document.getElementById('pm-telefono-origen').value.trim();
        const ref = document.getElementById('pm-referencia').value.trim();
        if(!telEmisor) return showToast("⚠️ Ingresa tu número emisor de Pago Móvil");
        if(!ref || ref.length < 4) return showToast("⚠️ Ingresa los últimos números de referencia");
        paymentDetailsText = `%0A📱 *Teléfono Emisor:* ${telEmisor}%0A🧾 *Referencia:* ${ref}`;
    } else if (paymentMethod === "Zelle") {
        const zmail = document.getElementById('zelle-email').value.trim();
        if(!zmail) return showToast("⚠️ Ingresa el correo Zelle desde donde harás el pago");
        paymentDetailsText = `%0A📧 *Correo Zelle:* ${zmail}`;
    } else if (paymentMethod === "PayPal") {
        const pmail = document.getElementById('paypal-email').value.trim();
        if(!pmail) return showToast("⚠️ Ingresa tu correo de PayPal");
        paymentDetailsText = `%0A📧 *Correo PayPal:* ${pmail}`;
    }

    showToast("📱 Procesando pedido y conectando a WhatsApp...");
    let totalUsd = document.getElementById('total-usd').innerText;
    let totalBs = document.getElementById('total-bs').innerText;

    const fullBuyerDataRaw = localStorage.getItem(`userdata_${usuarioActualCorreo}`);
    const buyerPhone = fullBuyerDataRaw ? JSON.parse(fullBuyerDataRaw).telefono : 'N/A';

    const itemsConOwner = carrito.map(i => {
        const prodMaster = productos.find(p => p.id === i.id);
        if(prodMaster) {
            prodMaster.stock = Math.max(0, prodMaster.stock - i.qty);
            CloudDB.saveProduct(prodMaster); // GUARDAR STOCK ACTUALIZADO EN LA NUBE
        }
        return {
            id: i.id, nombre: i.nombre, qty: i.qty, precio: i.precio, subtotal: i.precio * i.qty, variantes: i.variantesTexto, owner: prodMaster ? prodMaster.owner : 'admin@humanstore.com', payoutStatus: 'pendiente'
        };
    });

    localStorage.setItem('human_store_products_db', JSON.stringify(productos)); 
    let clearPaymentInfo = paymentDetailsText.replace(/%0A/g, ' | ').replace(/\*/g, '').trim();

    const nuevoPedido = {
        idPedido: Math.floor(100000 + Math.random() * 900000),
        fecha: new Date().toLocaleDateString('es-VE'),
        hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        buyer: usuarioActualCorreo,
        buyerPhone: buyerPhone,
        items: itemsConOwner,
        totalUsd: totalUsd,
        totalBs: totalBs,
        metodoPago: paymentMethod,
        paymentDetails: clearPaymentInfo,
        metodoEntrega: deliveryMethod,
        address: address,
        status: 'pendiente'
    };

    let pedidosHistorial = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];
    pedidosHistorial.unshift(nuevoPedido); 
    localStorage.setItem(`pedidos_${usuarioActualCorreo}`, JSON.stringify(pedidosHistorial));

    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    globalOrders.unshift(nuevoPedido);
    localStorage.setItem('human_store_global_orders', JSON.stringify(globalOrders));

    // GUARDAR PEDIDO EN LA NUBE
    CloudDB.saveOrder(nuevoPedido);

    let addressText = address ? `%0A📍 *Dirección:* ${address}` : "";
    const msg = `🛍️ *NUEVO PEDIDO CONFIRMADO - HUMAN STORE*%0A%0A👤 *Cliente:* ${usuarioActualCorreo}%0A🚚 *Entrega:* ${deliveryMethod}${addressText}%0A💳 *Pago:* ${paymentMethod}${paymentDetailsText}%0A%0A*🛒 ARTÍCULOS:*%0A${carrito.map(i => `▪️ ${i.nombre} ${i.variantesTexto ? `[${i.variantesTexto}]` : ''} (x${i.qty})%0A`).join("")}%0A💰 *TOTAL:* $${totalUsd} / ${totalBs} Bs.`;
    
    carrito = []; actualizarTodo(); localStorage.removeItem('human_store_current_view');
    const activeCat = localStorage.getItem('human_store_active_category') || 'all'; const query = localStorage.getItem('human_store_search_query') || ""; ejecutarFiltradoCombinado(query, activeCat);
    irASeccionTienda(); 
    setTimeout(() => { window.open(`https://wa.me/584120000000?text=${msg}`, '_blank'); }, 1000);
};

// ==========================================================================
// 10. AUTENTICACIÓN Y PERFILES (CON NUBE)
// ==========================================================================
function procesarAccionAuth() {
    const u = document.getElementById('usuario').value.trim(); const p = document.getElementById('password').value.trim(); const btnAuth = document.getElementById('btn-auth-action');

    if (modoRecuperar) {
        if (!u) return showToast("⚠️ Ingresa tu correo electrónico");
        if (!u.toLowerCase().endsWith("@gmail.com") && u !== 'admin@humanstore.com') return showToast("❌ Formato inválido");

        if (!pasoVerificacion && codigoGeneradoSimulado === "") {
            btnAuth.disabled = true; btnAuth.innerText = "Enviando...";
            setTimeout(() => {
                correoTemporalRecuperacion = u; codigoGeneradoSimulado = generarCodigoOTP(); pasoVerificacion = true;
                document.getElementById('usuario').style.display = "none"; document.getElementById('verification-code-area').style.display = "block"; 
                btnAuth.disabled = false; btnAuth.innerText = "Verificar Código"; showToast(`📱 Código enviado: ${codigoGeneradoSimulado}`);
            }, 1000);
            return;
        }
        if (pasoVerificacion && document.getElementById('new-password-area').style.display === "none") {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código incorrecto");
            document.getElementById('verification-code-area').style.display = "none"; document.getElementById('new-password-area').style.display = "block";
            btnAuth.innerText = "Actualizar Contraseña"; return showToast("🔑 Código verificado con éxito");
        }
        if (document.getElementById('new-password-area').style.display === "block") {
            const nuevaPass = document.getElementById('new-password').value.trim(); const nuevaPassConf = document.getElementById('new-password-confirm').value.trim();
            if (!nuevaPass || !nuevaPassConf) return showToast("⚠️ Rellena los campos"); if (nuevaPass !== nuevaPassConf) return showToast("❌ Las contraseñas no coinciden");
            localStorage.setItem(`user_${correoTemporalRecuperacion}`, nuevaPass); 
            CloudDB.saveUserProp(correoTemporalRecuperacion, 'clave', nuevaPass); // GUARDAR CLAVE EN NUBE
            showToast("🔒 ¡Contraseña actualizada!"); cancelarFlujosEspeciales(); document.getElementById('tab-login').click();
        }
        return;
    }

    if (modoRegistro) {
        const rolRegistro = document.getElementById('reg-rol').value; const nombres = document.getElementById('reg-nombres').value.trim(); const apellidos = document.getElementById('reg-apellidos').value.trim(); const codigoPais = document.getElementById('reg-country-code').value; const telefono = document.getElementById('reg-telefono').value.trim();
        if (!pasoVerificacion) {
            if (!nombres || !apellidos || !telefono || !u || !p) return showToast("⚠️ Completa los campos");
            if (!u.toLowerCase().endsWith("@gmail.com")) return showToast("❌ Correo debe ser @gmail.com");
            if (localStorage.getItem(`user_${u}`) !== null) return showToast("⚠️ Correo ya registrado");

            datosRegistroTemporales = { correo: u, clave: p, telefono: `${codigoPais}${telefono}`, nombres, apellidos, rol: rolRegistro };
            codigoGeneradoSimulado = generarCodigoOTP(); pasoVerificacion = true;
            document.getElementById('extended-register-fields').style.display = "none"; document.getElementById('usuario').style.display = "none"; document.getElementById('login-password-area').style.display = "none"; document.getElementById('verification-code-area').style.display = "block"; 
            btnAuth.innerText = "Confirmar Registro"; return showToast(`🎉 Código enviado: ${codigoGeneradoSimulado}`, 10000);
        } else {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código inválido");
            localStorage.setItem(`user_${datosRegistroTemporales.correo}`, datosRegistroTemporales.clave); 
            localStorage.setItem(`userdata_${datosRegistroTemporales.correo}`, JSON.stringify(datosRegistroTemporales));
            
            // GUARDAR USUARIO EN LA NUBE
            CloudDB.saveUserProp(datosRegistroTemporales.correo, 'perfil', datosRegistroTemporales);
            CloudDB.saveUserProp(datosRegistroTemporales.correo, 'clave', datosRegistroTemporales.clave);

            showToast("🎉 ¡Registro completado!"); cancelarFlujosEspeciales(); document.getElementById('tab-login').click();
        }
        return;
    }

    if (!u || !p) return showToast("⚠️ Por favor completa los campos");
    const passStored = localStorage.getItem(`user_${u}`); if (passStored === null) return showToast("❌ El usuario no existe."); if (passStored !== p) return showToast("🔒 Contraseña incorrecta");

    usuarioLogueado = true; usuarioActualCorreo = u; localStorage.setItem('human_store_logged', 'true'); localStorage.setItem('human_store_user_email', u);
    configurarMenuUsuarioDesplegable(); const welcomeScr = document.getElementById('welcome-screen'); welcomeScr.style.opacity = "0"; setTimeout(() => { welcomeScr.style.display = "none"; showToast("👋 ¡Bienvenido a HUMAN STORE!"); }, 500);
}

function actualizarBotonLoginNavbar() {
    const navLinks = document.querySelector('.nav-links'); if (!navLinks) return;
    const loginExistente = document.getElementById('btn-nav-login-item'); if (loginExistente) loginExistente.remove();
    const dropdownExistente = document.getElementById('user-dropdown-wrapper'); if (dropdownExistente) dropdownExistente.remove();

    if (!usuarioLogueado) {
        const li = document.createElement('li'); li.className = 'nav-item btn-nav-login'; li.id = 'btn-nav-login-item'; li.style.listStyle = 'none'; li.innerHTML = '🔑 Iniciar Sesión';
        li.onclick = () => { cancelarFlujosEspeciales(); document.getElementById('tab-login').click(); const welcomeScr = document.getElementById('welcome-screen'); welcomeScr.style.display = 'flex'; welcomeScr.style.opacity = "1"; };
        navLinks.appendChild(li);
    }
}

window.guardarMetodosPago = () => {
    const pm = document.getElementById('prof-pm-phone').value.trim(); const zelle = document.getElementById('prof-zelle-email').value.trim(); const paypal = document.getElementById('prof-paypal-email').value.trim();
    const payData = { pm, zelle, paypal };
    localStorage.setItem(`paymentData_${usuarioActualCorreo}`, JSON.stringify(payData)); 
    CloudDB.saveUserProp(usuarioActualCorreo, 'payment', payData); // GUARDAR EN NUBE
    showToast("💾 Métodos de pago guardados exitosamente");
};

function configurarMenuUsuarioDesplegable() {
    const navLinks = document.querySelector('.nav-links'); if (!navLinks) return;
    if (document.getElementById('user-dropdown-wrapper')) document.getElementById('user-dropdown-wrapper').remove(); if (document.getElementById('btn-nav-login-item')) document.getElementById('btn-nav-login-item').remove();

    const datosGuardados = localStorage.getItem(`userdata_${usuarioActualCorreo}`); let dataObj = datosGuardados ? JSON.parse(datosGuardados) : null;
    let primerNombre = dataObj ? dataObj.nombres.split(" ")[0] : (usuarioActualCorreo.split("@")[0] || "Premium"); let rolUsuario = dataObj && dataObj.rol ? dataObj.rol : 'comprador';
    if(usuarioActualCorreo === 'admin@humanstore.com') rolUsuario = 'admin';

    let textoLinkTema = TEMA_ACTUAL === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
    
    let menuItemsHtml = "";

    if (rolUsuario === 'admin') {
        menuItemsHtml = `
            <a href="#" id="link-panel-admin" style="color: #A78BFA; font-weight: bold;">⚙️ Panel de Admin</a>
            <a href="#" id="link-toggle-tema" style="border-top: 1px solid #334155; color: #FBBF24;">${textoLinkTema}</a>
            <a href="#" id="link-cerrar-sesion" style="border-top: 1px solid #334155; color: #EF4444;">🚪 Cerrar Sesión</a>
        `;
    } else if (rolUsuario === 'vendedor') {
        menuItemsHtml = `
            <a href="#" id="link-panel-vendedor" style="color: #FBBF24; font-weight: bold;">🏪 Mi Panel de Ventas</a>
            <a href="#" id="link-toggle-tema" style="border-top: 1px solid #334155; color: #FBBF24;">${textoLinkTema}</a>
            <a href="#" id="link-cerrar-sesion" style="border-top: 1px solid #334155; color: #EF4444;">🚪 Cerrar Sesión</a>
        `;
    } else {
        menuItemsHtml = `
            <a href="#" id="link-ver-perfil">👤 Mi Perfil</a>
            <a href="#" id="link-mis-pedidos">📦 Mis Pedidos</a>
            <a href="#" id="link-toggle-tema" style="border-top: 1px solid #334155; color: #FBBF24;">${textoLinkTema}</a>
            <a href="#" id="link-cerrar-sesion" style="border-top: 1px solid #334155; color: #EF4444;">🚪 Cerrar Sesión</a>
        `;
    }

    const liContainer = document.createElement('li'); liContainer.className = 'nav-item user-menu-container'; liContainer.id = 'user-dropdown-wrapper'; liContainer.style.listStyle = 'none';
    liContainer.innerHTML = `<button class="user-dropdown-btn" id="dropdownUserTrigger">👤 Hola, ${primerNombre} <span style="font-size:0.7rem;">▼</span></button><div class="user-dropdown-menu" id="dropdownUserMenu">${menuItemsHtml}</div>`;
    navLinks.appendChild(liContainer);

    const trigger = document.getElementById('dropdownUserTrigger'); const menu = document.getElementById('dropdownUserMenu');
    if(trigger) trigger.onclick = (e) => { e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
    window.addEventListener('click', () => { if(menu) menu.style.display = 'none'; });

    if(menu) {
        menu.onclick = (e) => {
            const linkObjetivo = e.target.closest('a'); if(!linkObjetivo) return; const idObjetivo = linkObjetivo.id;
            
            if(idObjetivo === 'link-panel-admin') { e.preventDefault(); e.stopPropagation(); menu.style.display = 'none'; mostrarPanelAdmin(); }
            if(idObjetivo === 'link-panel-vendedor') { e.preventDefault(); e.stopPropagation(); menu.style.display = 'none'; mostrarPanelVendedor(); }

            if(idObjetivo === 'link-toggle-tema') {
                e.preventDefault(); e.stopPropagation(); TEMA_ACTUAL = TEMA_ACTUAL === 'light' ? 'dark' : 'light'; localStorage.setItem('human_store_theme', TEMA_ACTUAL); document.body.className = `theme-${TEMA_ACTUAL}`; linkObjetivo.innerText = TEMA_ACTUAL === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'; showToast(TEMA_ACTUAL === 'dark' ? "🌙 Interfaz Premium adaptada al Modo Oscuro" : "☀️ Interfaz Premium adaptada al Modo Claro");
                const activeCat = localStorage.getItem('human_store_active_category') || 'all'; const query = localStorage.getItem('human_store_search_query') || ""; ejecutarFiltradoCombinado(query, activeCat); menu.style.display = 'none';
                
                if (localStorage.getItem('human_store_current_view') === 'seller' && document.getElementById('modal-analiticas').style.display === 'block') {
                    abrirAnaliticasVendedor();
                }
            }

            if(idObjetivo === 'link-ver-perfil') {
                e.preventDefault(); e.stopPropagation(); menu.style.display = 'none'; localStorage.setItem('human_store_opened_modal', 'perfil');
                const pBody = document.getElementById('perfil-body'); const infoUser = localStorage.getItem(`userdata_${usuarioActualCorreo}`); const savedPayRaw = localStorage.getItem(`paymentData_${usuarioActualCorreo}`); const savedPay = savedPayRaw ? JSON.parse(savedPayRaw) : { pm: "", zelle: "", paypal: "" };

                let profileHtml = "";
                if (infoUser) {
                    const data = JSON.parse(infoUser);
                    profileHtml = `<div class="profile-info-box"><div class="profile-field"><span class="profile-label">Nombres:</span><span class="profile-value">${data.nombres}</span></div><div class="profile-field"><span class="profile-label">Apellidos:</span><span class="profile-value">${data.apellidos}</span></div><div class="profile-field"><span class="profile-label">Correo:</span><span class="profile-value">${data.correo}</span></div><div class="profile-field"><span class="profile-label">Teléfono:</span><span class="profile-value">${data.telefono}</span></div><div class="profile-field"><span class="profile-label">Tipo de Cuenta:</span><span class="profile-value admin-badge role-${data.rol || 'comprador'}">${(data.rol || 'comprador').toUpperCase()}</span></div></div>`;
                } else {
                    profileHtml = `<div class="profile-info-box"><div class="profile-field"><span class="profile-label">Correo:</span><span class="profile-value">${usuarioActualCorreo}</span></div><div class="profile-field"><span class="profile-label">Tipo de Cuenta:</span><span class="profile-value admin-badge role-${rolUsuario}">${rolUsuario.toUpperCase()}</span></div></div>`;
                }

                profileHtml += `<div class="profile-payment-box" style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed var(--border-color);"><h4 style="color: var(--secondary); margin-bottom: 15px; font-family: 'Orbitron'; font-size: 1rem;">💳 Mis Métodos Guardados</h4><label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Teléfono emisor (Pago Móvil)</label><input type="tel" id="prof-pm-phone" class="checkout-input" style="margin-bottom:10px; padding: 10px;" placeholder="Ej: 04141234567" value="${savedPay.pm}"><label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Correo asociado a Zelle</label><input type="email" id="prof-zelle-email" class="checkout-input" style="margin-bottom:10px; padding: 10px;" placeholder="Ej: micorreo@zelle.com" value="${savedPay.zelle}"><label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Correo asociado a PayPal</label><input type="email" id="prof-paypal-email" class="checkout-input" style="margin-bottom:15px; padding: 10px;" placeholder="Ej: micorreo@paypal.com" value="${savedPay.paypal}"><button class="btn-primary" onclick="guardarMetodosPago()" style="padding: 12px;">Guardar Datos</button></div>`;
                pBody.innerHTML = profileHtml; document.getElementById('modal-perfil').style.display = 'block';
            }

            if(idObjetivo === 'link-mis-pedidos') {
                e.preventDefault(); e.stopPropagation(); menu.style.display = 'none'; localStorage.setItem('human_store_opened_modal', 'pedidos');
                const hBody = document.getElementById('historial-pedidos-body'); const listaPedidos = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];

                if (listaPedidos.length === 0) { hBody.innerHTML = `<p style="text-align:center; color: var(--text-sub); padding: 30px;">📭 Historial de compras vacío.</p>`; } 
                else {
                    hBody.innerHTML = "";
                    listaPedidos.forEach(ped => {
                        let itemsHtml = ped.items.map(i => { return `<li style="margin-bottom:8px;">• ${i.nombre} <strong>(x${i.qty})</strong>${i.variantes ? ` <br><span style="font-size:0.75rem; color:var(--secondary)">[${i.variantes}]</span>` : ""}</li>`; }).join("");
                        hBody.innerHTML += `<div class="pedido-card"><div class="pedido-header"><span>🆔 #ID: <strong>${ped.idPedido}</strong></span><span>📅 ${ped.fecha}</span></div><ul style="margin: 0; padding-left: 15px; font-size: 0.9rem; list-style-type: none;">${itemsHtml}</ul><div class="pedido-totales"><span style="color: var(--text-sub);">Total:</span><span style="color: var(--success);">$${ped.totalUsd} / ${ped.totalBs}</span></div><button class="btn-pdf" onclick="descargarRecibo('${ped.idPedido}')">📄 Descargar Recibo PDF</button></div>`;
                    });
                }
                document.getElementById('modal-historial-pedidos').style.display = 'block';
            }

            if(idObjetivo === 'link-cerrar-sesion') {
                e.preventDefault(); usuarioLogueado = false; usuarioActualCorreo = ""; localStorage.removeItem('human_store_logged'); localStorage.removeItem('human_store_user_email'); location.reload(); 
            }
        };
    }
}

// ==========================================================================
// 11. PANEL DE ADMINISTRADOR MAESTRO
// ==========================================================================
window.mostrarPanelAdmin = () => {
    document.getElementById('store-content').style.display = 'none'; document.getElementById('checkout-page').style.display = 'none'; document.getElementById('seller-panel').style.display = 'none'; document.getElementById('main-hero').style.display = 'none'; document.getElementById('admin-panel').style.display = 'flex'; localStorage.setItem('human_store_current_view', 'admin');
    const searchBar = document.getElementById('nav-search-bar'); if(searchBar) searchBar.style.display = 'none';
    const cartBtn = document.getElementById('btn-ver-carrito'); if(cartBtn) cartBtn.style.display = 'none';
    renderAdminDashboard(); renderAdminLiquidaciones(); renderAdminUsers();
};

function renderAdminDashboard() {
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    let ingresosBrutos = 0; let totalPedidos = globalOrders.length;
    globalOrders.forEach(o => { let val = parseFloat(String(o.totalUsd).replace('$', '')); if(!isNaN(val)) ingresosBrutos += val; });
    let totalUsers = 0; for (let i = 0; i < localStorage.length; i++) { if (localStorage.key(i).startsWith('userdata_')) totalUsers++; }
    document.getElementById('admin-metric-revenue').innerText = `$${ingresosBrutos.toFixed(2)}`;
    document.getElementById('admin-metric-orders').innerText = totalPedidos;
    document.getElementById('admin-metric-users').innerText = totalUsers;
}

function renderAdminLiquidaciones() {
    const list = document.getElementById('admin-payouts-list');
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    let sellersOwed = {};
    globalOrders.forEach(o => {
        if (o.status === 'completado') { o.items.forEach(i => { if (i.owner !== 'admin@humanstore.com' && i.payoutStatus !== 'pagado') { sellersOwed[i.owner] = (sellersOwed[i.owner] || 0) + i.subtotal; } }); }
    });
    if (Object.keys(sellersOwed).length === 0) { list.innerHTML = `<p style="color: var(--text-sub); text-align: center; padding: 20px;">🎉 Todo al día. No hay liquidaciones pendientes para los vendedores.</p>`; return; }
    let tableHTML = `<table class="admin-table"><thead><tr><th>Vendedor</th><th>Monto a Pagar</th><th>Billetera Guardada</th><th>Acción</th></tr></thead><tbody>`;
    for(let owner in sellersOwed) {
        let walletHtml = `<span style="color: var(--danger); font-size: 0.8rem;">Sin billetera registrada</span>`;
        let wallet = JSON.parse(localStorage.getItem(`wallet_${owner}`));
        if (wallet && (wallet.pm || wallet.zelle || wallet.binance)) { walletHtml = `<div style="font-size: 0.75rem; line-height: 1.4;">${wallet.pm ? `📱 PM: ${wallet.pm}<br>` : ''}${wallet.zelle ? `💵 Zelle: ${wallet.zelle}<br>` : ''}${wallet.binance ? `🟡 Binance: ${wallet.binance}` : ''}</div>`; }
        tableHTML += `<tr><td><strong>${owner}</strong></td><td><strong style="color: var(--success);">$${sellersOwed[owner].toFixed(2)}</strong></td><td>${walletHtml}</td><td><button onclick="liquidarVendedor('${owner}')" class="btn-admin-action" style="border-color:var(--success); color:var(--success);">✅ Marcar Pagado</button></td></tr>`;
    }
    tableHTML += `</tbody></table>`; list.innerHTML = tableHTML;
}

window.liquidarVendedor = (correo) => {
    if(confirm(`⚠️ Confirmación de Pago:\n\n¿Ya transferiste el dinero a la billetera de ${correo}?\nAl confirmar, su saldo pendiente quedará en cero.`)) {
        let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
        globalOrders.forEach(o => { 
            if (o.status === 'completado') { 
                let updated = false;
                o.items.forEach(i => { 
                    if (i.owner === correo && i.payoutStatus !== 'pagado') { 
                        i.payoutStatus = 'pagado'; 
                        updated = true;
                    } 
                }); 
                if(updated) CloudDB.updateOrder(o.idPedido, {items: o.items});
            } 
        });
        localStorage.setItem('human_store_global_orders', JSON.stringify(globalOrders)); 
        
        let userNotifs = JSON.parse(localStorage.getItem(`notifs_${correo}`)) || [];
        userNotifs.unshift({ id: Date.now(), icon: '💸', text: 'El Administrador ha liquidado tus pagos. Revisa tu saldo.', leida: false, time: new Date().toLocaleTimeString('es-VE') });
        localStorage.setItem(`notifs_${correo}`, JSON.stringify(userNotifs));

        showToast("✅ Pago registrado. Liquidación completada."); 
        renderAdminLiquidaciones();
    }
}

function renderAdminUsers() {
    const list = document.getElementById('admin-users-list'); list.innerHTML = ''; let users = [];
    for (let i = 0; i < localStorage.length; i++) { let key = localStorage.key(i); if (key.startsWith('userdata_')) { users.push(JSON.parse(localStorage.getItem(key))); } }
    let tableHTML = `<table class="admin-table"><thead><tr><th>Nombre Completo</th><th>Correo Electrónico</th><th>Rol Actual</th><th>Acciones</th></tr></thead><tbody>`;
    users.forEach(u => {
        let currentRole = u.rol || 'comprador';
        tableHTML += `<tr><td>${u.nombres || 'Admin'} ${u.apellidos || 'Maestro'}</td><td>${u.correo}</td><td><span class="admin-badge role-${currentRole}">${currentRole}</span></td>
        <td>
            <button onclick="cambiarRolUsuario('${u.correo}')" class="btn-admin-action">Cambiar Rol</button>
            ${currentRole === 'vendedor' ? `<button onclick="verBilleteraVendedor('${u.correo}')" class="btn-admin-action" style="border-color:#10B981; color:#10B981;">Ver Billetera</button>` : ''}
            <button onclick="eliminarUsuario('${u.correo}')" class="btn-admin-action btn-admin-danger">Eliminar</button>
        </td></tr>`;
    });
    tableHTML += `</tbody></table>`; list.innerHTML = tableHTML;
}

window.cambiarRolUsuario = (correo) => {
    if(correo === 'admin@humanstore.com') return showToast("❌ Permiso denegado: El Super Admin no puede ser modificado.");
    let data = JSON.parse(localStorage.getItem(`userdata_${correo}`)); if(!data) return;
    let nuevoRol = prompt(`Rol actual de ${correo}: ${data.rol || 'comprador'}\n\nEscribe el nuevo rol que deseas asignar:\n(Escribe: comprador, vendedor o admin)`);
    if(nuevoRol && ['comprador', 'vendedor', 'admin'].includes(nuevoRol.toLowerCase())) { 
        data.rol = nuevoRol.toLowerCase(); 
        localStorage.setItem(`userdata_${correo}`, JSON.stringify(data)); 
        CloudDB.saveUserProp(correo, 'perfil', data); // NUBE
        showToast(`✅ Rol de ${correo} actualizado con éxito a ${nuevoRol}`); renderAdminUsers(); 
    } 
    else if (nuevoRol) { showToast("❌ Comando inválido. Roles permitidos: comprador, vendedor, admin."); }
};

window.eliminarUsuario = (correo) => {
    if(correo === 'admin@humanstore.com') return showToast("❌ Acción crítica denegada: No puedes eliminar la raíz del sistema.");
    if(confirm(`⚠️ ESTÁS A PUNTO DE ELIMINAR A UN USUARIO.\n\n¿Estás completamente seguro de borrar la cuenta de ${correo} y todos sus datos del sistema?`)) { localStorage.removeItem(`userdata_${correo}`); localStorage.removeItem(`user_${correo}`); localStorage.removeItem(`pedidos_${correo}`); localStorage.removeItem(`paymentData_${correo}`); showToast("🗑️ Usuario eliminado del servidor local."); renderAdminUsers(); }
};

window.verBilleteraVendedor = (correo) => {
    const wallet = JSON.parse(localStorage.getItem(`wallet_${correo}`));
    if(!wallet || (!wallet.pm && !wallet.zelle && !wallet.binance)) { alert(`El vendedor ${correo} aún no ha registrado sus datos de retiro.`); return; }
    alert(`💳 BILLETERA DE ${correo}\n\n📱 Pago Móvil: ${wallet.pm || 'N/A'}\n💵 Zelle: ${wallet.zelle || 'N/A'}\n🟡 Binance: ${wallet.binance || 'N/A'}`);
};

// ==========================================================================
// 12. PANEL DE VENDEDOR, NOTIFICACIONES Y GRÁFICOS
// ==========================================================================
window.mostrarPanelVendedor = () => {
    document.getElementById('store-content').style.display = 'none'; document.getElementById('checkout-page').style.display = 'none'; document.getElementById('admin-panel').style.display = 'none'; document.getElementById('main-hero').style.display = 'none'; document.getElementById('seller-panel').style.display = 'flex'; localStorage.setItem('human_store_current_view', 'seller');
    const searchBar = document.getElementById('nav-search-bar'); if(searchBar) searchBar.style.display = 'none';
    const cartBtn = document.getElementById('btn-ver-carrito'); if(cartBtn) cartBtn.style.display = 'none';

    actualizarNotificacionesVendedor();
    renderSellerDashboard(); renderSellerOrders(); renderSellerInventory(); loadSellerWallet(); loadSellerBranding();
};

window.toggleSellerNotifications = () => {
    const dp = document.getElementById('seller-notif-dropdown');
    if (dp.style.display === 'block') {
        dp.style.display = 'none';
    } else {
        dp.style.display = 'block';
        let userNotifs = JSON.parse(localStorage.getItem(`notifs_${usuarioActualCorreo}`)) || [];
        userNotifs.forEach(n => n.leida = true);
        localStorage.setItem(`notifs_${usuarioActualCorreo}`, JSON.stringify(userNotifs));
        actualizarNotificacionesVendedor(true); 
    }
};

window.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-wrapper')) {
        const dp = document.getElementById('seller-notif-dropdown');
        if(dp) dp.style.display = 'none';
    }
});

function actualizarNotificacionesVendedor(opened = false) {
    let misProductos = productos.filter(p => p.owner === usuarioActualCorreo);
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    let misVentas = globalOrders.filter(o => o.items.some(i => i.owner === usuarioActualCorreo));
    
    let notifs = [];
    
    let pendientes = 0;
    misVentas.forEach(o => { if(o.status === 'pendiente') pendientes++; });
    if(pendientes > 0) {
        notifs.push({ icon: '📦', text: `Tienes ${pendientes} pedido(s) nuevo(s) esperando por despacho.`, time: 'Ahora', unread: !opened });
    }

    misProductos.forEach(p => {
        if(p.stock > 0 && p.stock <= 3) {
            notifs.push({ icon: '⚠️', text: `El artículo "${p.nombre}" tiene bajo stock (${p.stock} unidades restantes).`, time: 'Atención', unread: !opened });
        }
    });

    let savedNotifs = JSON.parse(localStorage.getItem(`notifs_${usuarioActualCorreo}`)) || [];
    savedNotifs.forEach(n => {
        notifs.push({ icon: n.icon, text: n.text, time: n.time, unread: !n.leida });
    });

    const badge = document.getElementById('seller-notif-badge');
    const list = document.getElementById('seller-notif-list');
    if(!badge || !list) return;

    let unreadCount = notifs.filter(n => n.unread).length;
    if(unreadCount > 0) {
        badge.style.display = 'flex';
        badge.innerText = unreadCount;
    } else {
        badge.style.display = 'none';
    }

    if(notifs.length === 0) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-sub); font-size: 0.85rem;">No tienes alertas pendientes</div>`;
        return;
    }

    list.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon">${n.icon}</div>
            <div class="notif-content">
                <p>${n.text}</p>
                <span>${n.time}</span>
            </div>
        </div>
    `).join('');
}

function renderSellerDashboard() {
    let misProductos = productos.filter(p => p.owner === usuarioActualCorreo);
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    let misVentas = globalOrders.filter(o => o.items.some(i => i.owner === usuarioActualCorreo));

    let ingresosBrutos = 0; let saldoDisponible = 0; let pedidosPendientesReales = 0; let qtyPedidos = 0;
    
    misVentas.forEach(o => {
        let ventaTieneMio = false;
        if (o.status !== 'completado') { pedidosPendientesReales++; }
        o.items.forEach(i => { 
            if (i.owner === usuarioActualCorreo) { 
                ventaTieneMio = true; ingresosBrutos += i.subtotal;
                if (o.status === 'completado' && i.payoutStatus !== 'pagado') { saldoDisponible += i.subtotal; }
            } 
        });
        if(ventaTieneMio) qtyPedidos++;
    });

    let comision = ingresosBrutos * 0.05; 
    let netoDisponible = saldoDisponible - (saldoDisponible * 0.05); 
    let ticketPromedio = qtyPedidos > 0 ? (ingresosBrutos / qtyPedidos) : 0;

    document.getElementById('seller-metric-net').innerText = `$${netoDisponible.toFixed(2)}`;
    document.getElementById('seller-metric-gross').innerText = `$${ingresosBrutos.toFixed(2)}`;
    document.getElementById('seller-metric-fee').innerText = `-$${comision.toFixed(2)}`;
    document.getElementById('seller-metric-avg').innerText = `$${ticketPromedio.toFixed(2)}`;
}

window.abrirAnaliticasVendedor = () => {
    document.getElementById('modal-analiticas').style.display = 'block';
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || [];
    let misVentas = globalOrders.filter(o => o.items.some(i => i.owner === usuarioActualCorreo));
    let catData = { "electronica": 0, "ropa": 0, "hogar": 0, "joyas": 0 };
    let last7Days = Array.from({length: 7}, (_, i) => { let d = new Date(); d.setDate(d.getDate() - i); return d.toLocaleDateString('es-VE'); }).reverse();
    let salesByDay = { [last7Days[0]]: 0, [last7Days[1]]: 0, [last7Days[2]]: 0, [last7Days[3]]: 0, [last7Days[4]]: 0, [last7Days[5]]: 0, [last7Days[6]]: 0 };

    misVentas.forEach(o => { o.items.forEach(i => { if (i.owner === usuarioActualCorreo) { let prodOrigin = productos.find(p => p.id === i.id); if(prodOrigin && prodOrigin.cat) { catData[prodOrigin.cat] = (catData[prodOrigin.cat] || 0) + i.subtotal; } if(salesByDay[o.fecha] !== undefined) { salesByDay[o.fecha] += i.subtotal; } } }); });
    setTimeout(() => { renderCharts(last7Days, Object.values(salesByDay), Object.keys(catData), Object.values(catData)); }, 50);
};

function renderCharts(daysLabels, daysData, catLabels, catData) {
    const ctxSales = document.getElementById('salesChart'); const ctxCat = document.getElementById('categoryChart');
    if(!ctxSales || !ctxCat) return;

    let colorText = TEMA_ACTUAL === 'dark' ? '#F8FAFC' : '#0F172A'; let colorGrid = TEMA_ACTUAL === 'dark' ? '#334155' : '#E2E8F0';
    Chart.defaults.color = colorText; Chart.defaults.font.family = 'Montserrat';
    if(salesChartInstance) salesChartInstance.destroy(); if(categoryChartInstance) categoryChartInstance.destroy();

    salesChartInstance = new Chart(ctxSales, {
        type: 'bar',
        data: { labels: daysLabels, datasets: [{ label: 'Ingresos Diarios (USD)', data: daysData, backgroundColor: '#D4AF37', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: colorGrid }, ticks: { callback: function(value) { return '$' + value; } } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
    });

    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: { labels: ['Electrónica', 'Ropa', 'Hogar', 'Joyas'], datasets: [{ data: catData, backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
}

window.descargarReporteVendedor = () => {
    try {
        const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape'); 
        let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || []; let misVentas = globalOrders.filter(o => o.status === 'completado' && o.items.some(i => i.owner === usuarioActualCorreo));
        if (misVentas.length === 0) { return showToast("⚠️ No tienes ventas completadas suficientes para generar un reporte."); }

        let ingresosTotales = 0; let saldoPendiente = 0; let saldoLiquidado = 0; let tableRows = [];
        misVentas.forEach(o => { o.items.forEach(i => { if (i.owner === usuarioActualCorreo) {
            ingresosTotales += i.subtotal; if (i.payoutStatus === 'pagado') saldoLiquidado += i.subtotal; else saldoPendiente += i.subtotal;
            let currentProduct = productos.find(p => p.id === i.id); let stockActual = currentProduct ? currentProduct.stock : 'Desconocido';
            tableRows.push([ `${o.fecha} ${o.hora}`, `${o.buyer}\nTel: ${o.buyerPhone}`, i.variantes ? `${i.nombre}\n(${i.variantes})` : i.nombre, i.qty.toString(), `$${i.precio.toFixed(2)}`, `$${i.subtotal.toFixed(2)}`, `${stockActual} unid.` ]);
        } }); });

        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(212, 175, 55); doc.text("HUMAN STORE", 148, 20, { align: "center" });
        doc.setFontSize(14); doc.setTextColor(50, 50, 50); doc.text("Reporte Financiero y Operativo Detallado", 148, 28, { align: "center" });
        doc.setFontSize(10); doc.text(`Vendedor: ${usuarioActualCorreo}`, 14, 40); doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}`, 14, 46);

        doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.text("RESUMEN DE CUENTA", 14, 60);
        doc.setFontSize(10); doc.setTextColor(80, 80, 80); doc.text(`Ingresos Brutos Totales: $${ingresosTotales.toFixed(2)} USD`, 14, 68); doc.text(`Saldo Pagado por Admin: $${saldoLiquidado.toFixed(2)} USD`, 14, 74); doc.text(`Saldo Pendiente por Cobrar: $${saldoPendiente.toFixed(2)} USD`, 14, 80);

        doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.text("DETALLE DE VENTAS COMPLETADAS", 14, 95);
        const tableColumn = ["Fecha/Hora Pedido", "Datos del Comprador", "Producto", "Cant.", "Precio Unit.", "Subtotal", "Stock Restante"];
        doc.autoTable({ startY: 100, head: [tableColumn], body: tableRows, theme: 'striped', headStyles: { fillColor: [15, 23, 42] }, styles: { fontSize: 8, cellPadding: 3, valign: 'middle' } });

        const finalY = doc.lastAutoTable.finalY || 100; doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.text("Este documento es un registro operativo generado automáticamente por Human Store.", 148, finalY + 15, { align: "center" });
        doc.save(`Reporte_Ventas_Detallado_${usuarioActualCorreo}.pdf`); showToast("📊 Reporte detallado descargado exitosamente");
    } catch(err) { console.error(err); showToast("❌ Error al generar el PDF. Verifica tu conexión."); }
};

function renderSellerOrders() {
    const list = document.getElementById('seller-orders-list'); let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || []; let misVentas = globalOrders.filter(o => o.items.some(i => i.owner === usuarioActualCorreo));
    if (misVentas.length === 0) { list.innerHTML = `<p style="color: var(--text-sub); text-align: center; padding: 20px;">Aún no has recibido pedidos de tus productos.</p>`; return; }

    let tableHTML = `<table class="admin-table"><thead><tr><th>Pedido / Fecha</th><th>Datos del Comprador</th><th>Artículos Vendidos</th><th>Pago / Entrega</th><th style="text-align:center;">Estado Operativo</th></tr></thead><tbody>`;
    misVentas.forEach(o => {
        let sellerItems = o.items.filter(i => i.owner === usuarioActualCorreo); let itemsHtml = sellerItems.map(i => `• ${i.nombre} (x${i.qty}) - $${i.subtotal.toFixed(2)}`).join('<br>'); let sellerTotal = sellerItems.reduce((acc, i) => acc + i.subtotal, 0);
        let isPickup = o.metodoEntrega.includes('Pick-up'); let actionBtns = '';
        
        if (o.status === 'pendiente') {
            if (isPickup) actionBtns = `<button onclick="cambiarEstadoPedido(${o.idPedido}, 'listo_retiro')" class="btn-admin-action" style="margin-top:10px; width:100%; font-size:0.7rem; border-color:#8B5CF6; color:#8B5CF6;">➡️ Preparar Retiro</button>`;
            else actionBtns = `<button onclick="cambiarEstadoPedido(${o.idPedido}, 'procesando')" class="btn-admin-action" style="margin-top:10px; width:100%; font-size:0.7rem; border-color:#3B82F6; color:#3B82F6;">➡️ Empacar Pedido</button>`;
        } else if (o.status === 'procesando' && !isPickup) { actionBtns = `<button onclick="cambiarEstadoPedido(${o.idPedido}, 'en_camino')" class="btn-admin-action" style="margin-top:10px; width:100%; font-size:0.7rem; border-color:#06B6D4; color:#06B6D4;">🚚 En proceso de entrega</button>`; } 
        else if (o.status === 'listo_retiro' && isPickup) { actionBtns = `<button onclick="cambiarEstadoPedido(${o.idPedido}, 'completado')" class="btn-admin-action" style="margin-top:10px; width:100%; font-size:0.7rem; border-color:var(--success); color:var(--success);">✅ Ya se entregó</button>`; } 
        else if (o.status === 'en_camino' && !isPickup) { actionBtns = `<button onclick="cambiarEstadoPedido(${o.idPedido}, 'completado')" class="btn-admin-action" style="margin-top:10px; width:100%; font-size:0.7rem; border-color:var(--success); color:var(--success);">✅ Marcar Entregado</button>`; }

        let statusText = o.status.replace('_', ' ').toUpperCase(); let badgeClass = 'role-vendedor'; 
        if(o.status === 'completado') badgeClass = 'role-comprador'; else if(o.status === 'procesando') badgeClass = 'role-procesando'; else if(o.status === 'en_camino') badgeClass = 'role-camino'; else if(o.status === 'listo_retiro') badgeClass = 'role-retiro';
        let statusBadge = `<span class="admin-badge ${badgeClass}">${statusText}</span>`;

        tableHTML += `<tr><td><strong>#${o.idPedido}</strong><br><span style="font-size:0.75rem;color:var(--text-sub)">${o.fecha}</span></td><td><strong>${o.buyer}</strong><br><span style="font-size:0.75rem;color:var(--text-sub)">Tel: ${o.buyerPhone}</span></td><td style="font-size:0.8rem; line-height: 1.4;">${itemsHtml}<br><strong style="color:var(--success); margin-top:5px; display:block;">Total tuyo: $${sellerTotal.toFixed(2)}</strong></td><td style="font-size:0.8rem; line-height: 1.4;"><strong style="color: var(--secondary)">${o.metodoPago}</strong><br>${o.metodoEntrega}<br><span style="color:var(--text-sub); font-size: 0.7rem; display:block; margin-top:5px;">${o.paymentDetails}</span>${o.address ? `<span style="color:var(--text-sub); font-size: 0.7rem; display:block;">Dir: ${o.address}</span>` : ''}</td><td style="text-align: center; vertical-align: middle;">${statusBadge}${actionBtns}</td></tr>`;
    });
    tableHTML += `</tbody></table>`; list.innerHTML = tableHTML;
}

window.cambiarEstadoPedido = (idPedido, nuevoEstado) => {
    let globalOrders = JSON.parse(localStorage.getItem('human_store_global_orders')) || []; let order = globalOrders.find(o => String(o.idPedido) === String(idPedido));
    if(order) {
        order.status = nuevoEstado; localStorage.setItem('human_store_global_orders', JSON.stringify(globalOrders));
        CloudDB.updateOrder(idPedido, {status: nuevoEstado}); // ACTUALIZAR EN LA NUBE
        let msjExito = "";
        if (nuevoEstado === 'procesando') msjExito = "📦 Pedido en proceso de empaque"; if (nuevoEstado === 'en_camino') msjExito = "🚚 Pedido en proceso de entrega"; if (nuevoEstado === 'listo_retiro') msjExito = "🛍️ Pedido listo para retiro en tienda"; if (nuevoEstado === 'completado') msjExito = "✅ Pedido entregado exitosamente";
        showToast(msjExito); renderSellerOrders(); renderSellerDashboard(); actualizarNotificacionesVendedor(false);
    }
};

// ==========================================================================
// 13. GESTIÓN DE INVENTARIO Y MARKETING DEL VENDEDOR
// ==========================================================================
function loadSellerWallet() {
    const walletData = JSON.parse(localStorage.getItem(`wallet_${usuarioActualCorreo}`)) || { pm: '', zelle: '', binance: '' };
    document.getElementById('wallet-pm').value = walletData.pm || ''; document.getElementById('wallet-zelle').value = walletData.zelle || ''; document.getElementById('wallet-binance').value = walletData.binance || '';
}

function loadSellerBranding() {
    let branding = JSON.parse(localStorage.getItem(`branding_${usuarioActualCorreo}`));
    if(branding) {
        if(document.getElementById('branding-name')) document.getElementById('branding-name').value = branding.name || '';
        if(branding.logo) { base64StoreLogo = branding.logo; document.getElementById('branding-logo-preview').innerHTML = `<img src="${branding.logo}" style="width:100%; height:100%; object-fit:cover;">`; }
    }
}

window.previewBrandingLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64StoreLogo = e.target.result;
            const previewBox = document.getElementById('branding-logo-preview');
            previewBox.innerHTML = `<img src="${base64StoreLogo}" style="width:100%; height:100%; object-fit:cover;">`;
        }
        reader.readAsDataURL(file);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formWallet = document.getElementById('form-seller-wallet');
    if(formWallet) {
        formWallet.onsubmit = (e) => { 
            e.preventDefault(); const pm = document.getElementById('wallet-pm').value.trim(); const zelle = document.getElementById('wallet-zelle').value.trim(); const binance = document.getElementById('wallet-binance').value.trim(); 
            const wallData = { pm, zelle, binance };
            localStorage.setItem(`wallet_${usuarioActualCorreo}`, JSON.stringify(wallData)); 
            CloudDB.saveUserProp(usuarioActualCorreo, 'wallet', wallData); // GUARDAR EN LA NUBE
            showToast("💳 Datos de retiro guardados exitosamente. El Admin ya puede verlos."); 
        };
    }
    const formBranding = document.getElementById('form-seller-branding');
    if(formBranding) {
        formBranding.onsubmit = (e) => { 
            e.preventDefault(); const name = document.getElementById('branding-name').value.trim(); 
            const brandData = { name: name, logo: base64StoreLogo };
            localStorage.setItem(`branding_${usuarioActualCorreo}`, JSON.stringify(brandData)); 
            CloudDB.saveUserProp(usuarioActualCorreo, 'branding', brandData); // GUARDAR EN LA NUBE
            showToast("🏪 Identidad comercial actualizada con éxito."); 
        };
    }
});

function renderSellerInventory() {
    const list = document.getElementById('seller-inventory-list'); let misProductos = productos.filter(p => p.owner === usuarioActualCorreo);
    if (misProductos.length === 0) { list.innerHTML = `<p style="color: var(--text-sub); text-align: center; padding: 20px;">Aún no has publicado ningún producto en la plataforma.</p>`; return; }
    let tableHTML = `<table class="admin-table"><thead><tr><th>Producto</th><th>Precio Base</th><th>Inventario</th><th>Estado y Acción</th></tr></thead><tbody>`;
    misProductos.forEach(p => {
        let statusHtml = p.stock > 0 ? `<span class="admin-badge role-comprador">Activo</span>` : `<span class="admin-badge role-vendedor">Agotado</span>`;
        tableHTML += `<tr><td><div style="display: flex; align-items: center; gap: 10px;"><img src="${p.img}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"><strong style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block;">${p.nombre}</strong></div></td><td>$${p.precio.toFixed(2)}</td><td>${p.stock} unid.</td><td>${statusHtml}<br><button onclick="editarProductoVendedor(${p.id})" class="btn-admin-action" style="margin-top: 8px; font-size: 0.7rem;">✏️ Editar / Stock</button><button onclick="eliminarProductoVendedor(${p.id})" class="btn-admin-action btn-admin-danger" style="margin-top: 8px; font-size: 0.7rem;">🗑️ Eliminar</button></td></tr>`;
    });
    tableHTML += `</tbody></table>`; list.innerHTML = tableHTML;
}

window.eliminarProductoVendedor = (id) => {
    if(confirm("⚠️ ¿Estás seguro de que deseas eliminar este producto de la tienda? Esta acción no se puede deshacer.")) {
        productos = productos.filter(p => p.id !== id); 
        localStorage.setItem('human_store_products_db', JSON.stringify(productos)); 
        CloudDB.deleteProduct(id); // ELIMINAR DE LA NUBE
        showToast("🗑️ Producto eliminado exitosamente del catálogo."); renderSellerInventory(); renderSellerDashboard(); actualizarNotificacionesVendedor(false);
    }
};

window.editarProductoVendedor = (id) => {
    const prod = productos.find(p => p.id === id); if(!prod) return;
    editingProductId = prod.id; 
    document.getElementById('seller-prod-title').value = prod.nombre; 
    document.getElementById('seller-prod-cat').value = prod.cat; 
    document.getElementById('seller-prod-price').value = prod.precioOriginal || prod.precio; 
    
    // CARGAR DESCUENTO
    const discountEl = document.getElementById('seller-prod-discount');
    if (discountEl) discountEl.value = prod.descuento || 0;

    document.getElementById('seller-prod-stock').value = prod.stock;
    base64SellerImg = prod.img; document.getElementById('seller-img-preview-box').innerHTML = `<img src="${prod.img}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`; document.getElementById('seller-prod-url').value = ""; 

    if(prod.opciones) { let varsArray = []; for(let key in prod.opciones) { varsArray.push(`${key}: ${prod.opciones[key].join(', ')}`); } document.getElementById('seller-prod-variants').value = varsArray.join(' / '); } else { document.getElementById('seller-prod-variants').value = ""; }

    document.getElementById('seller-form-title').innerHTML = "✏️ Editando Producto"; document.getElementById('btn-submit-product').innerHTML = "💾 Guardar Cambios";
    document.getElementById('form-add-product').scrollIntoView({ behavior: 'smooth', block: 'center' }); showToast("✏️ Modo edición activado. Realiza los cambios y guarda.");
};

window.previewSellerImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64SellerImg = e.target.result; const previewBox = document.getElementById('seller-img-preview-box');
            previewBox.innerHTML = `<img src="${base64SellerImg}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
            const urlInput = document.getElementById('seller-prod-url'); if(urlInput) urlInput.value = ""; 
        }
        reader.readAsDataURL(file);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formAddProduct = document.getElementById('form-add-product');
    if(formAddProduct) {
        formAddProduct.onsubmit = (e) => {
            e.preventDefault(); 
            const nombre = document.getElementById('seller-prod-title').value.trim(); 
            const cat = document.getElementById('seller-prod-cat').value; 
            const precioOriginal = parseFloat(document.getElementById('seller-prod-price').value); 
            const stock = parseInt(document.getElementById('seller-prod-stock').value); 
            const urlImg = document.getElementById('seller-prod-url').value.trim(); 
            const variantesStr = document.getElementById('seller-prod-variants').value.trim();
            
            // CAPTURAR Y CALCULAR EL DESCUENTO MANUAL
            const discountInput = document.getElementById('seller-prod-discount');
            const descuento = discountInput ? parseInt(discountInput.value) || 0 : 0;
            const precioFinal = precioOriginal - (precioOriginal * (descuento / 100));

            let finalImg = base64SellerImg || urlImg; if(!finalImg) return showToast("⚠️ Añade una imagen del producto (URL, Archivo o Foto)");

            let opciones = null;
            if(variantesStr) {
                opciones = {}; let parts = variantesStr.split('/');
                parts.forEach(part => { let desglose = part.split(':'); if(desglose.length === 2) { let key = desglose[0].trim(); let vals = desglose[1].split(',').map(v => v.trim()); opciones[key] = vals; } });
            }

            if (editingProductId) {
                let index = productos.findIndex(p => p.id === editingProductId);
                if(index !== -1) {
                    productos[index].nombre = nombre; 
                    productos[index].cat = cat; 
                    productos[index].precioOriginal = precioOriginal; 
                    productos[index].precio = precioFinal; 
                    productos[index].descuento = descuento; 
                    productos[index].stock = stock; 
                    productos[index].img = finalImg; 
                    productos[index].opciones = opciones && Object.keys(opciones).length > 0 ? opciones : null;
                    CloudDB.saveProduct(productos[index]); // GUARDAR EN LA NUBE
                    showToast("✅ Producto actualizado y reabastecido correctamente");
                }
                editingProductId = null; document.getElementById('seller-form-title').innerHTML = "📦 Añadir Nuevo Producto"; document.getElementById('btn-submit-product').innerHTML = "➕ Publicar en el Catálogo";
            } else {
                const nuevoProd = { 
                    id: Date.now(), 
                    nombre: nombre, 
                    precio: precioFinal, 
                    precioOriginal: precioOriginal, 
                    descuento: descuento, 
                    cat: cat, 
                    stock: stock, 
                    img: finalImg, 
                    owner: usuarioActualCorreo, 
                    opciones: opciones && Object.keys(opciones).length > 0 ? opciones : null 
                };
                productos.unshift(nuevoProd); 
                CloudDB.saveProduct(nuevoProd); // GUARDAR EN LA NUBE
                showToast("✅ Producto publicado con éxito en el catálogo");
            }
            localStorage.setItem('human_store_products_db', JSON.stringify(productos)); 
            formAddProduct.reset(); 
            if(discountInput) discountInput.value = "0"; 
            base64SellerImg = ""; document.getElementById('seller-img-preview-box').innerHTML = `<span style="color: var(--text-sub); font-size: 0.7rem;">Vista Previa</span>`; 
            renderSellerDashboard(); renderSellerInventory(); actualizarNotificacionesVendedor(false);
        };
    }
});

// ==========================================================================
// 14. CANCELACIÓN DE FLUJOS Y EFECTOS VISUALES
// ==========================================================================
function cancelarFlujosEspeciales() {
    modoRecuperar = false; modoRegistro = false; pasoVerificacion = false; 
    if(document.getElementById('usuario')) document.getElementById('usuario').style.display = "block"; 
    if(document.getElementById('login-password-area')) document.getElementById('login-password-area').style.display = "block"; 
    if(document.getElementById('extended-register-fields')) document.getElementById('extended-register-fields').style.display = "none"; 
    if(document.getElementById('verification-code-area')) document.getElementById('verification-code-area').style.display = "none"; 
    if(document.getElementById('new-password-area')) document.getElementById('new-password-area').style.display = "none"; 
    if(document.getElementById('auth-nav-tabs')) document.getElementById('auth-nav-tabs').style.display = "flex";
    if(document.getElementById('link-forgot-password')) document.getElementById('link-forgot-password').style.display = "block"; 
    if(document.getElementById('link-back-to-auth')) document.getElementById('link-back-to-auth').style.display = "none";
    document.getElementById('auth-msg').innerText = "Identifícate para gestionar tu cuenta y pedidos";
}

function generarCodigoOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

const modalTerminos = document.getElementById('modal-terminos'); const checkTerminos = document.getElementById('check-terminos'); const btnConfirmarTerminos = document.getElementById('btn-confirmar-terminos');
document.getElementById('link-terminos').onclick = (e) => { e.preventDefault(); modalTerminos.style.display = 'block'; }; document.getElementById('close-terminos').onclick = () => { modalTerminos.style.display = 'none'; }; checkTerminos.onchange = function() { btnConfirmarTerminos.disabled = !this.checked; }; btnConfirmarTerminos.onclick = () => { showToast("✅ Condiciones aprobadas"); modalTerminos.style.display = 'none'; };

function actualizarContadorFavoritos() { const favCountEl = document.getElementById('fav-count'); if (favCountEl) favCountEl.innerText = favoritos.length; }

window.toggleFavorito = (id) => {
    const index = favoritos.findIndex(f => f.id === id);
    if (index > -1) { favoritos.splice(index, 1); showToast("✨ Quitado de Favoritos"); } else { favoritos.push(productos.find(p => p.id === id)); showToast("⭐ Añadido a Favoritos"); }
    localStorage.setItem('human_store_favs', JSON.stringify(favoritos)); actualizarContadorFavoritos(); const cat = localStorage.getItem('human_store_active_category') || 'all'; const query = localStorage.getItem('human_store_search_query') || ""; ejecutarFiltradoCombinado(query, cat); if(document.getElementById('modal-favoritos').style.display === 'block') renderFavoritos();
};

function renderFavoritos() {
    const list = document.getElementById('fav-items');
    if(favoritos.length === 0) { list.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-sub);'>Lista vacía.</p>"; document.getElementById('fav-actions-area').style.display = 'none'; } else {
        list.innerHTML = ""; document.getElementById('fav-actions-area').style.display = 'block';
        favoritos.forEach(item => {
            let precioHtmlFavorites = MONEDA_ACTUAL === "USD" ? `<div class="fav-item-price-main">$${item.precio.toFixed(2)} USD</div>` : `<div class="fav-item-price-main" style="color:#10B981;">${(item.precio * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</div>`;
            list.innerHTML += `<div class="cart-item"><img src="${item.img}" class="cart-item-img"><div class="cart-item-info"><h4 style="margin: 0;">${item.nombre}</h4>${precioHtmlFavorites}</div><button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; margin-left: 10px; white-space: nowrap;" ${item.stock <= 0 ? 'disabled' : ''} onclick="agregarCarrito(${item.id}, false)">🛒 Llevar</button><button class="btn-remove" style="margin-left: 10px;" onclick="toggleFavorito(${item.id})">×</button></div>`;
        });
    }
}

document.getElementById('btn-llevar-todo-fav').onclick = () => { if (!usuarioLogueado) { cerrarModalGeneral(); document.getElementById('welcome-screen').style.display = 'flex'; return; } favoritos.forEach(p => { if(p.stock > 0) agregarCarrito(p.id, false); }); favoritos = []; localStorage.setItem('human_store_favs', JSON.stringify(favoritos)); actualizarContadorFavoritos(); cerrarModalGeneral(); actualizarTodo(); };
document.getElementById('footer-ver-favoritos').onclick = (e) => { e.preventDefault(); renderFavoritos(); document.getElementById('modal-favoritos').style.display = 'block'; }; document.getElementById('close-favoritos').onclick = () => { document.getElementById('modal-favoritos').style.display = 'none'; }; document.querySelectorAll('.close').forEach(btn => btn.onclick = () => { cerrarModalGeneral(); }); window.onclick = (e) => { if (e.target.className === 'modal' || e.target.id === 'modal-perfil' || e.target.id === 'modal-historial-pedidos' || e.target.id === 'modal-analiticas') cerrarModalGeneral(); }; document.getElementById('btn-search-favoritos').addEventListener('click', () => { renderFavoritos(); document.getElementById('modal-favoritos').style.display = 'block'; });

actualizarContadorFavoritos();

window.descargarRecibo = (idPedidoStr) => {
    try {
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        const pedidosLista = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || []; const pedidoData = pedidosLista.find(p => String(p.idPedido) === String(idPedidoStr));
        if(!pedidoData) return showToast("❌ Error: No se encontraron los datos de este pedido.");
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(212, 175, 55); doc.text("HUMAN STORE", 105, 20, { align: "center" }); doc.setFontSize(12); doc.setTextColor(50, 50, 50); doc.text("Recibo de Compra Oficial", 105, 28, { align: "center" }); doc.setFontSize(10); doc.text(`Nro de Orden: #${pedidoData.idPedido}`, 14, 45); doc.text(`Fecha y Hora: ${pedidoData.fecha} - ${pedidoData.hora}`, 14, 52); doc.text(`Cliente: ${usuarioActualCorreo}`, 14, 59);

        const tableColumn = ["Producto", "Cant.", "Subtotal"]; const tableRows = [];
        pedidoData.items.forEach(item => { tableRows.push([item.variantes ? `${item.nombre}\n(${item.variantes})` : item.nombre, item.qty.toString(), `$${item.subtotal.toFixed(2)}`]); });
        doc.autoTable({ startY: 68, head: [tableColumn], body: tableRows, theme: 'striped', headStyles: { fillColor: [15, 23, 42] }, alternateRowStyles: { fillColor: [245, 245, 245] } });
        const finalY = doc.lastAutoTable.finalY || 68; doc.setFont("helvetica", "bold"); doc.text(`Total Cancelado (USD): $${pedidoData.totalUsd}`, 14, finalY + 15); doc.text(`Total Equivalente (Bs): ${pedidoData.totalBs}`, 14, finalY + 22); doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.text("Gracias por preferir calidad y estilo. HUMAN STORE.", 105, finalY + 40, { align: "center" }); doc.save(`Recibo_HumanStore_Orden_${pedidoData.idPedido}.pdf`); showToast("📄 Recibo descargado exitosamente");
    } catch(err) { console.error(err); showToast("❌ Error al generar el PDF. Verifica tu conexión."); }
}

window.cambiarImagenPrincipal = (elem, src) => { document.getElementById('main-product-img').src = src; document.querySelectorAll('.thumbnail-img').forEach(img => img.classList.remove('active-thumb')); elem.classList.add('active-thumb'); };
window.zoomIn = (e) => { const wrapper = document.getElementById('zoom-wrapper'); const img = document.getElementById('main-product-img'); const { left, top, width, height } = wrapper.getBoundingClientRect(); const x = ((e.clientX - left) / width) * 100; const y = ((e.clientY - top) / height) * 100; img.style.transformOrigin = `${x}% ${y}%`; img.style.transform = "scale(2.5)"; };
window.zoomOut = () => { const img = document.getElementById('main-product-img'); img.style.transformOrigin = "center center"; img.style.transform = "scale(1)"; };

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById('global-transition'); const textElement = document.getElementById('transition-text');
    function triggerTransition(message, duration = 1500) { textElement.textContent = message; overlay.classList.add('active'); setTimeout(() => { overlay.classList.remove('active'); }, duration); }
    const btnAuth = document.getElementById('btn-auth-action'); if (btnAuth) btnAuth.addEventListener('click', () => { triggerTransition("Preparando tu experiencia..."); });
    const btnCancelAuth = document.getElementById('btn-cancel-auth'); if (btnCancelAuth) btnCancelAuth.addEventListener('click', () => { triggerTransition("Ingresando al catálogo..."); });
    const btnCheckout = document.getElementById('btn-go-checkout'); if (btnCheckout) btnCheckout.addEventListener('click', () => { triggerTransition("Ya casi terminamos..."); });
});
