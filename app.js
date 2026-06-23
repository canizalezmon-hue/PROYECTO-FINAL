// --- ETIQUETA: VARIABLES DE ESTADO CON PERSISTENCIA ---
let TASA_BCV = parseFloat(localStorage.getItem('last_bcv_rate')) || 36.50; 
let usuarioLogueado = localStorage.getItem('human_store_logged') === 'true';
let usuarioActualCorreo = localStorage.getItem('human_store_user_email') || ""; 

// Estado Global de Moneda del Catálogo ('USD' o 'VES')
let MONEDA_ACTUAL = localStorage.getItem('human_store_display_currency') || "USD";

// PERSISTENCIA DEL MODO CLARO / OSCURO (CARGA INMEDIATA ANTES DE RENDERIZAR)
let TEMA_ACTUAL = localStorage.getItem('human_store_theme') || 'light';
document.body.className = `theme-${TEMA_ACTUAL}`;

let modoRegistro = false;
let modoRecuperar = false; 
let pasoVerificacion = false; 
let codigoGeneradoSimulado = ""; 
let correoTemporalRecuperacion = "";
let datosRegistroTemporales = {};

// --- ETIQUETA: CONFIGURACIÓN DE INVENTARIO EXTENDIDO PARA TIENDA GENERAL (CON VARIANTES Y GALERÍAS) ---
const catalogoInicial = [
    { id: 1, nombre: "Laptop Gamer X-Pro", precio: 1200, cat: "electronica", stock: 2, img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500", opciones: { "RAM": ["16GB", "32GB"], "Color": ["Negro", "Plata"] }, galeria: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"] },
    { id: 2, nombre: "Mouse Pro Wireless", precio: 25, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", opciones: { "Color": ["Negro", "Blanco"] }, galeria: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", "https://images.unsplash.com/photo-1615663245857-ac9310d5b1ff?w=500"] },
    { id: 3, nombre: "Lámpara Led Inteligente", precio: 45, cat: "hogar", stock: 4, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", opciones: { "Luz": ["Cálida", "Fría", "RGB"] }, galeria: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?w=500"] },
    { id: 4, nombre: "Chaqueta Urban Style", precio: 80, cat: "ropa", stock: 12, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500", opciones: { "Talla": ["S", "M", "L", "XL"], "Color": ["Negro", "Gris Oscuro"] } },
    
    // Ropa
    { id: 5, nombre: "Jean Slim Fit Classic", precio: 45, cat: "ropa", stock: 3, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", opciones: { "Talla": ["28", "30", "32", "34"] } },
    { id: 6, nombre: "Pantalón Cargo Urban", precio: 55, cat: "ropa", stock: 8, img: "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=500", opciones: { "Talla": ["S", "M", "L"] } },
    { id: 7, nombre: "Franela Oversize Black", precio: 20, cat: "ropa", stock: 20, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", opciones: { "Talla": ["M", "L", "XL"] } },
    { id: 8, nombre: "Franela Minimalist White", precio: 18, cat: "ropa", stock: 25, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500", opciones: { "Talla": ["S", "M", "L", "XL"] } },
    { id: 9, nombre: "Mono Jogger Tech Fleece", precio: 50, cat: "ropa", stock: 10, img: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500", opciones: { "Talla": ["M", "L"] } },
    { id: 10, nombre: "Mono Deportivo Casual", precio: 35, cat: "ropa", stock: 4, img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500", opciones: { "Talla": ["S", "M", "L"] } },
    { id: 11, nombre: "Suéter Hoodie Heavyweight", precio: 60, cat: "ropa", stock: 7, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", opciones: { "Talla": ["M", "L", "XL"], "Color": ["Negro", "Azul Marino"] } },
    { id: 12, nombre: "Suéter Knit Premium", precio: 65, cat: "ropa", stock: 6, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500", opciones: { "Talla": ["S", "M", "L"] } },

    // Electrónica
    { id: 13, nombre: "Audífonos Gamer HyperX Cloud", precio: 85, cat: "electronica", stock: 12, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500", opciones: { "Color": ["Rojo", "Negro"] } },
    { id: 14, nombre: "Audífonos Gamer Logitech G-Pro", precio: 110, cat: "electronica", stock: 5, img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500", opciones: { "Edición": ["Estándar", "League of Legends"] } },
    { id: 15, nombre: "Reloj Inteligente Cubitt CT4", precio: 55, cat: "electronica", stock: 15, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500", opciones: { "Correa": ["Silicona Negra", "Metal Plata"] } },
    { id: 16, nombre: "Reloj Inteligente Cubitt Aura", precio: 70, cat: "electronica", stock: 10, img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500", opciones: { "Correa": ["Rosa", "Gris"] } },
    { id: 17, nombre: "Control DualSense PS5 Black", precio: 75, cat: "electronica", stock: 9, img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500" },
    { id: 18, nombre: "Control DualSense PS5 White", precio: 70, cat: "electronica", stock: 14, img: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500" },

    // Hogar
    { id: 19, nombre: "Colchón Semi-Ortopédico Matrimonial", precio: 180, cat: "hogar", stock: 6, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500" },
    { id: 20, nombre: "Colchón Semi-Ortopédico Individual", precio: 130, cat: "hogar", stock: 8, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500" },
    { id: 21, nombre: "Juego de Muebles Minimalista", precio: 450, cat: "hogar", stock: 3, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500", opciones: { "Tela": ["Microfibra Gris", "Cuero Sintético Negro"] } },
    { id: 22, nombre: "Juego de Muebles Esquinero Moderno", precio: 520, cat: "hogar", stock: 2, img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500" },
    { id: 23, nombre: "Lámpara de Noche Touch Modern", precio: 30, cat: "hogar", stock: 15, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
    { id: 24, nombre: "Lámpara de Noche Vintage de Madera", precio: 35, cat: "hogar", stock: 11, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500" }
];

// --- ETIQUETA: INICIALIZACIÓN DE DB CON GENERADOR DE OFERTAS ALEATORIAS ---
let productosExistentes = JSON.parse(localStorage.getItem('human_store_products_db'));
let dbVersion = localStorage.getItem('human_store_db_version');

// Si no existe, o si es una versión anterior, reiniciamos la BD.
if(!productosExistentes || dbVersion !== "v7") {
    
    let catalogoConDescuentos = catalogoInicial.map(p => ({ ...p, precioOriginal: p.precio, descuento: 0 }));

    for (let i = 0; i < catalogoConDescuentos.length; i += 4) {
        let maxIndex = Math.min(i + 3, catalogoConDescuentos.length - 1);
        let randomIndex = Math.floor(Math.random() * (maxIndex - i + 1)) + i;
        let randomDesc = Math.floor(Math.random() * (35 - 15 + 1)) + 15; 
        
        catalogoConDescuentos[randomIndex].descuento = randomDesc;
        catalogoConDescuentos[randomIndex].precio = Number((catalogoConDescuentos[randomIndex].precioOriginal * (1 - (randomDesc / 100))).toFixed(2));
    }

    localStorage.setItem('human_store_products_db', JSON.stringify(catalogoConDescuentos));
    localStorage.setItem('human_store_db_version', "v7"); 
    productosExistentes = catalogoConDescuentos;
}

let productos = productosExistentes;
let carrito = JSON.parse(localStorage.getItem('human_store_cart')) || [];
let favoritos = JSON.parse(localStorage.getItem('human_store_favs')) || [];

function getSimulatedRating(id) {
    const rating = (4.0 + (id % 10) * 0.1).toFixed(1); 
    const reviews = (id * 37) % 250 + 45; 
    const fullStars = Math.floor(rating);
    let starsStr = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
    return { rating, reviews, starsStr };
}

// --- ETIQUETA: SKELETON LOADERS (CARGA FANTASMA) ---
function mostrarSkeletons() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = "";
    // Generamos 6 tarjetas fantasma
    for(let i=0; i<6; i++){
        grid.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton-item skeleton-img"></div>
                <div class="skeleton-item skeleton-title"></div>
                <div class="skeleton-item skeleton-stars"></div>
                <div class="skeleton-item skeleton-price"></div>
                <div class="skeleton-item skeleton-btn"></div>
            </div>
        `;
    }
}

// --- ETIQUETA: SELECTOR DINÁMICO DE VARIANTES (INTERACTIVIDAD) ---
window.selectVariant = (btn) => {
    const siblings = btn.parentElement.querySelectorAll('.var-btn');
    siblings.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

function actualizarSugerenciasCarrito() {
    const container = document.getElementById('cart-suggestions-container');
    const list = document.getElementById('cart-suggestions-list');
    if (!container || !list) return;

    if (carrito.length === 0) {
        container.style.display = 'none';
        return;
    }

    const idsEnCarrito = carrito.map(item => item.id);
    const categoriasEnCarrito = [...new Set(carrito.map(item => item.cat))];

    let sugerencias = productos.filter(p => 
        categoriasEnCarrito.includes(p.cat) && p.stock > 0 && !idsEnCarrito.includes(p.id)
    );

    if (sugerencias.length < 3) {
        const extras = productos.filter(p => p.stock > 0 && !idsEnCarrito.includes(p.id) && !sugerencias.includes(p));
        sugerencias = sugerencias.concat(extras);
    }

    sugerencias = sugerencias.sort(() => 0.5 - Math.random()).slice(0, 3);

    if (sugerencias.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = "";

    sugerencias.forEach(p => {
        let precioStr = MONEDA_ACTUAL === "USD" ? `$${p.precio.toFixed(2)} USD` : `${(p.precio * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`;
        list.innerHTML += `
            <div class="suggestion-card">
                <img src="${p.img}" alt="${p.nombre}">
                <h5 title="${p.nombre}">${p.nombre}</h5>
                <span>${precioStr}</span>
                <button class="btn-add-suggestion" onclick="agregarCarrito(${p.id})">+ Agregar</button>
            </div>
        `;
    });
}

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const app = document.getElementById('app-container');

    obtenerTasaBCV();
    
    // 1. Mostrar Skeletons ocultos detrás del telón para cuando aparezca la app
    mostrarSkeletons();

    // 2. Controlar el Preloader de imagen
    setTimeout(() => {
        preloader.style.transition = "opacity 0.8s ease, filter 0.8s ease";
        preloader.style.opacity = "0";
        preloader.style.filter = "blur(10px)";
        
        setTimeout(() => {
            preloader.style.display = "none";
            app.classList.remove('hidden-app');
            app.classList.add('app-entry-animation'); 
            
            inyectarSelectorMonedaNavbar();

            // 3. Ya viendo los Skeletons, esperamos un poco más para cargar la data real
            setTimeout(() => {
                const ultimaSeccion = localStorage.getItem('human_store_current_view', 'store');
                if (ultimaSeccion === 'checkout' && usuarioLogueado && carrito.length > 0) {
                    irASeccionCheckout(false); 
                } else {
                    irASeccionTienda();
                }

                const categoriaGuardada = localStorage.getItem('human_store_active_category') || 'all';
                const textoBuscadoGuardado = localStorage.getItem('human_store_search_query') || "";
                
                const savedPrice = localStorage.getItem('human_store_price_max');
                if (savedPrice && document.getElementById('price-slider')) {
                    document.getElementById('price-slider').value = savedPrice;
                    document.getElementById('price-slider-value').innerText = `$${savedPrice}`;
                }
                
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    if(btn.dataset.category === categoriaGuardada) {
                        document.querySelector('.filter-btn.active').classList.remove('active');
                        btn.classList.add('active');
                    }
                });

                if(textoBuscadoGuardado || savedPrice) {
                    if (textoBuscadoGuardado) document.getElementById('input-search').value = textoBuscadoGuardado;
                    ejecutarFiltradoCombinado(textoBuscadoGuardado, categoriaGuardada);
                } else {
                    renderProducts(categoriaGuardada === 'all' ? productos : productos.filter(p => p.cat === categoriaGuardada));
                }

                actualizarTodo();
            }, 800); 

        }, 800);
    }, 1200); 

    conectarEventosAutenticacion();

    if (usuarioLogueado) {
        configurarMenuUsuarioDesplegable();
    } else {
        actualizarBotonLoginNavbar();
    }
});

const checkoutDelivery = document.getElementById('checkout-delivery');
const deliveryAddressArea = document.getElementById('delivery-address-area');
const checkoutPayment = document.getElementById('checkout-payment');

const pagoMovilInfo = document.getElementById('pago-movil-info');
const zelleInfo = document.getElementById('zelle-info');
const paypalInfo = document.getElementById('paypal-info');
const binanceInfo = document.getElementById('binance-info');

if(checkoutDelivery) {
    checkoutDelivery.addEventListener('change', (e) => {
        if(e.target.value.includes('Delivery') || e.target.value.includes('Nacional')) {
            deliveryAddressArea.style.display = 'block';
        } else {
            deliveryAddressArea.style.display = 'none';
        }
    });
}

// --- ETIQUETA: LÓGICA DE AUTOCOMPLETADO DE MÉTODOS DE PAGO EN EL CHECKOUT ---
if(checkoutPayment) {
    checkoutPayment.addEventListener('change', (e) => {
        const val = e.target.value;
        pagoMovilInfo.style.display = 'none';
        zelleInfo.style.display = 'none';
        paypalInfo.style.display = 'none';
        binanceInfo.style.display = 'none';

        if(document.getElementById('pm-autofill-msg')) document.getElementById('pm-autofill-msg').style.display = 'none';
        if(document.getElementById('zelle-autofill-msg')) document.getElementById('zelle-autofill-msg').style.display = 'none';
        if(document.getElementById('paypal-autofill-msg')) document.getElementById('paypal-autofill-msg').style.display = 'none';

        const savedPayRaw = localStorage.getItem(`paymentData_${usuarioActualCorreo}`);
        const savedPay = savedPayRaw ? JSON.parse(savedPayRaw) : null;

        if (val === 'Pago Móvil') {
            pagoMovilInfo.style.display = 'block';
            if(savedPay && savedPay.pm) {
                document.getElementById('pm-telefono-origen').value = savedPay.pm;
                document.getElementById('pm-autofill-msg').style.display = 'inline-block';
            }
        }
        if (val === 'Zelle') {
            zelleInfo.style.display = 'block';
            if(savedPay && savedPay.zelle) {
                document.getElementById('zelle-email').value = savedPay.zelle;
                document.getElementById('zelle-autofill-msg').style.display = 'inline-block';
            }
        }
        if (val === 'PayPal') {
            paypalInfo.style.display = 'block';
            if(savedPay && savedPay.paypal) {
                document.getElementById('paypal-email').value = savedPay.paypal;
                document.getElementById('paypal-autofill-msg').style.display = 'inline-block';
            }
        }
        if (val === 'Binance') binanceInfo.style.display = 'block';
    });
}

function conectarEventosAutenticacion() {
    const btnAuthAction = document.getElementById('btn-auth-action');
    if(btnAuthAction) btnAuthAction.onclick = () => procesarAccionAuth();

    const tLogin = document.getElementById('tab-login');
    const tRegister = document.getElementById('tab-register');
    
    if(tLogin) tLogin.onclick = () => {
        cancelarFlujosEspeciales();
        tLogin.classList.add('active');
        if(tRegister) tRegister.classList.remove('active');
        document.getElementById('extended-register-fields').style.display = "none";
        btnAuthAction.innerText = "Entrar";
    };

    if(tRegister) tRegister.onclick = () => {
        cancelarFlujosEspeciales();
        modoRegistro = true;
        tRegister.classList.add('active');
        if(tLogin) tLogin.classList.remove('active');
        document.getElementById('extended-register-fields').style.display = "flex";
        btnAuthAction.innerText = "Enviar Registro";
    };

    const linkForgot = document.getElementById('link-forgot-password');
    const linkBack = document.getElementById('link-back-to-auth');
    const navTabs = document.getElementById('auth-nav-tabs');

    if(linkForgot) linkForgot.onclick = (e) => {
        e.preventDefault();
        modoRecuperar = true;
        modoRegistro = false;
        pasoVerificacion = false;
        document.getElementById('auth-msg').innerText = "Recuperación Oficial";
        if(navTabs) navTabs.style.display = "none";
        document.getElementById('extended-register-fields').style.display = "none";
        document.getElementById('login-password-area').style.display = "none";
        document.getElementById('verification-code-area').style.display = "none";
        document.getElementById('new-password-area').style.display = "none";
        linkForgot.style.display = "none";
        if(linkBack) linkBack.style.display = "block";
        btnAuthAction.innerText = "Enviar Código";
    };

    if(linkBack) linkBack.onclick = (e) => {
        e.preventDefault();
        cancelarFlujosEspeciales();
        if(tLogin) tLogin.click();
    };

    const btnInicioFooter = document.getElementById('link-inicio-footer');
    if(btnInicioFooter) {
        btnInicioFooter.onclick = (e) => {
            e.preventDefault();
            irASeccionTienda();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast("🔝 Volviste al inicio del catálogo");
        };
    }
}

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
        showToast(MONEDA_ACTUAL === "VES" ? "  🇻🇪 Catálogo adaptado a Bolívares (BCV)" : "💵 Catálogo adaptado a Dólares (USD)");
        
        const cat = localStorage.getItem('human_store_active_category') || 'all';
        const query = localStorage.getItem('human_store_search_query') || "";
        ejecutarFiltradoCombinado(query, cat);
    };
}

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

function showToast(mensaje, duracion = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    
    setTimeout(() => { toast.classList.add('toast-fade-out'); }, duracion);
    setTimeout(() => { toast.remove(); }, duracion + 500);
}

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

        const rate = getSimulatedRating(p.id);

        let originalUsd = p.precioOriginal || p.precio; 
        let finalUsd = p.precio;

        if (MONEDA_ACTUAL === "USD") {
            if (p.descuento > 0) {
                precioHtml = `
                    <div class="price-container">
                        <del class="price-original">$${originalUsd.toFixed(2)}</del>
                        <span class="price-bs price-discount">$${finalUsd.toFixed(2)} USD</span>
                    </div>`;
            } else {
                precioHtml = `<div class="price-container"><span class="price-bs">$${finalUsd.toFixed(2)} USD</span></div>`;
            }
        } else {
            let originalBs = originalUsd * TASA_BCV;
            let finalBs = finalUsd * TASA_BCV;
            if (p.descuento > 0) {
                precioHtml = `
                    <div class="price-container">
                        <del class="price-original">${originalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</del>
                        <span class="price-bs price-discount">${finalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                    </div>`;
            } else {
                precioHtml = `<div class="price-container"><span class="price-bs">${finalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span></div>`;
            }
        }

        const badgeDescuento = p.descuento > 0 ? `<div class="badge-discount">-${p.descuento}% OFF</div>` : '';
        const badgeAgotado = estaAgotado ? '<div class="badge-sold-out">AGOTADO</div>' : '';
        
        // GATILLO: AVISO DE BAJO STOCK EN EL CATÁLOGO
        const gatilloStock = (!estaAgotado && p.stock <= 5) ? `<div class="urgency-stock">🔥 ¡Últimas ${p.stock} disponibles!</div>` : '';

        const div = document.createElement('div');
        div.className = `product-card ${estaAgotado ? 'card-sold-out' : ''}`;
        div.innerHTML = `
            ${badgeAgotado}
            ${badgeDescuento}
            <button class="btn-fav ${esFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorito(${p.id})">★</button>
            <img src="${p.img}" class="card-img" onclick="abrirDetalle(${p.id})">
            <h4 onclick="abrirDetalle(${p.id})" style="cursor:pointer; margin-bottom: 5px;">${p.nombre}</h4>
            
            <div class="product-rating">
                <span class="stars">${rate.starsStr}</span>
                <span class="reviews-count">${rate.rating} (${rate.reviews})</span>
            </div>

            ${precioHtml}
            ${gatilloStock}
            <p style="font-size: 0.8rem; font-weight: bold; color: ${!estaAgotado ? '#10B981' : '#EF4444'}">
                ${!estaAgotado ? `Disponible en Stock` : 'Agotado'}
            </p>
            <button class="btn-add" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id}, false)">
                ${estaAgotado ? 'Sin Existencias' : 'Añadir al Carrito'}
            </button>
        `;
        grid.appendChild(div);
    });
}

function ejecutarFiltradoCombinado(texto, categoria) {
    mostrarSkeletons(); 
    
    const precioMax = parseFloat(document.getElementById('price-slider')?.value) || Infinity;
    let filtrados = productos;
    
    if (categoria !== 'all') filtrados = filtrados.filter(p => p.cat === categoria);
    if (texto) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase()));
    filtrados = filtrados.filter(p => p.precio <= precioMax);
    
    setTimeout(() => {
        renderProducts(filtrados);
    }, 500); 
}

// --- ETIQUETA: PERSISTENCIA E INICIALIZACIÓN DE PREGUNTAS SEMILLA (Q&A) ---
function obtenerPreguntasProducto(id) {
    let localData = localStorage.getItem(`human_store_qa_${id}`);
    if (localData) return JSON.parse(localData);
    
    let seed = [
        { usuario: "cliente_premium@gmail.com", texto: "¿Tienen disponibilidad inmediata para envío a Caracas?", fecha: "22/06/2026", respuesta: "¡Hola! Sí, contamos con stock listo en tienda para despacho inmediato vía delivery." },
        { usuario: "tech_user98@gmail.com", texto: "¿El producto cuenta con garantía oficial de fábrica?", fecha: "15/06/2026", respuesta: "Hola, totalmente. Todos nuestros productos de HUMAN STORE incluyen 3 meses de garantía por desperfectos de fábrica." }
    ];
    localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(seed));
    return seed;
}

window.hacerPregunta = (id) => {
    const input = document.getElementById('input-nueva-pregunta');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return showToast("⚠️ Escribe una pregunta válida.");
    if (!usuarioLogueado) {
        showToast("🔑 Inicia sesión para dejar una consulta oficial");
        document.getElementById('welcome-screen').style.display = 'flex';
        return;
    }
    
    let preguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
    preguntas.unshift({
        usuario: usuarioActualCorreo,
        texto: texto,
        fecha: new Date().toLocaleDateString('es-VE'),
        respuesta: null
    });
    localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(preguntas));
    showToast("❓ Consulta publicada con éxito");
    input.value = "";
    window.refreshQAList(id);

    // SIMULACIÓN DE RESPUESTA AUTOMÁTICA DEL VENDEDOR (PRUEBA SOCIAL EN VIVO)
    setTimeout(() => {
        let currentPreguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
        if (currentPreguntas.length > 0 && !currentPreguntas[0].respuesta) {
            currentPreguntas[0].respuesta = "¡Hola! Gracias por tu consulta. Confirmamos stock e indicaciones técnicas. Puedes procesar tu orden al carrito y un asesor te atenderá de inmediato por WhatsApp.";
            localStorage.setItem(`human_store_qa_${id}`, JSON.stringify(currentPreguntas));
            
            const openedProduct = localStorage.getItem('human_store_opened_product');
            if (openedProduct && String(openedProduct) === String(id) && document.getElementById('modal-detalle').style.display === 'block') {
                window.refreshQAList(id);
            }
        }
    }, 2000);
};

window.refreshQAList = (id) => {
    const listEl = document.getElementById('qa-items-list');
    if (!listEl) return;
    let preguntas = JSON.parse(localStorage.getItem(`human_store_qa_${id}`)) || [];
    
    listEl.innerHTML = preguntas.map(q => {
        let respHtml = q.respuesta ? `
            <div class="qa-answer-block">
                <p class="qa-answer-text"><span>↩️</span> ${q.respuesta}</p>
            </div>
        ` : `
            <div class="qa-answer-block pending">
                <p class="qa-answer-text italic">⏳ Esperando respuesta de HUMAN STORE...</p>
            </div>
        `;
        return `
            <div class="qa-item-row">
                <div class="qa-question-header">
                    <span class="qa-user-tag">👤 ${q.usuario.split('@')[0]}</span>
                    <span class="qa-date-tag">${q.fecha}</span>
                </div>
                <p class="qa-question-text">${q.texto}</p>
                ${respHtml}
            </div>
        `;
    }).join('');
};

// --- ETIQUETA: DETALLES DEL PRODUCTO (CON INYECCIÓN DE VARIANTES, GALERÍA Y Q&A) ---
window.abrirDetalle = (id) => {
    const p = productos.find(i => i.id === id);
    if(!p) return;

    localStorage.setItem('human_store_opened_modal', 'producto');
    localStorage.setItem('human_store_opened_product', id);

    const body = document.getElementById('detalle-body');
    const estaAgotado = p.stock <= 0;
    const rate = getSimulatedRating(p.id);

    let priceDetailsHtml = "";
    if (p.descuento > 0) {
        priceDetailsHtml = `
            <div style="display:flex; align-items:center; gap: 15px; margin-bottom: 5px;">
                <h3 class="price-bs" style="font-size: 2.2rem; color:var(--success); margin:0;">$${p.precio} USD</h3>
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <del style="color:var(--text-sub); font-size:1.2rem;">$${p.precioOriginal} USD</del>
                    <span style="background:var(--danger); color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold; margin-top:3px;">Ahorras ${p.descuento}%</span>
                </div>
            </div>
            <p style="font-size: 1.1rem; margin-top:0;">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>
        `;
    } else {
        priceDetailsHtml = `
            <h3 class="price-bs" style="font-size: 2.2rem; color:var(--secondary); margin-bottom: 5px;">$${p.precio} USD</h3>
            <p style="font-size: 1.1rem; margin-top:0;">Precio en Moneda Local: <strong>${(p.precio * TASA_BCV).toLocaleString('es-VE')} Bs.</strong></p>
        `;
    }

    // CONSTRUCCIÓN DINÁMICA DE BOTONES DE VARIANTES
    let variantsHtml = "";
    if (p.opciones) {
        variantsHtml = `<div class="product-variants" style="margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 15px;">`;
        for (let [opType, opValues] of Object.entries(p.opciones)) {
            variantsHtml += `
                <div class="variant-group">
                    <span style="display:block; font-weight:700; margin-bottom:8px; font-size:0.85rem; color:var(--text-sub); text-transform:uppercase;">${opType}:</span>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        ${opValues.map((val, idx) => `<button class="var-btn ${idx===0 ? 'active' : ''}" data-type="${opType}" data-val="${val}" onclick="selectVariant(this)">${val}</button>`).join('')}
                    </div>
                </div>
            `;
        }
        variantsHtml += `</div>`;
    }

    // CONSTRUCCIÓN DE GALERÍA MULTIVISTA
    let galeria = p.galeria || [p.img];
    let thumbnailsHtml = "";
    if(galeria.length > 1) {
        thumbnailsHtml = `<div class="thumbnails-wrapper">
            ${galeria.map((imgSrc, idx) => `
                <img src="${imgSrc}" class="thumbnail-img ${idx === 0 ? 'active-thumb' : ''}" onclick="cambiarImagenPrincipal(this, '${imgSrc}')">
            `).join('')}
        </div>`;
    }

    // GATILLOS DE URGENCIA PARA EL MODAL (PRUEBA SOCIAL + STOCK)
    const espectadoresAleatorios = Math.floor(Math.random() * (18 - 4 + 1)) + 4;
    const gatilloViewers = !estaAgotado ? `<div class="urgency-viewers"><span class="blink-dot"></span> ${espectadoresAleatorios} personas están viendo esto ahora</div>` : '';
    const gatilloStockModal = (!estaAgotado && p.stock <= 5) ? `<div class="urgency-stock" style="font-size: 0.9rem; padding: 8px 12px;">⏳ ¡No lo dejes escapar! Solo quedan ${p.stock} en nuestro almacén.</div>` : '';

    // Cargar preguntas asociadas del localStorage
    obtenerPreguntasProducto(p.id);

    body.innerHTML = `
        <div class="product-images" style="position:relative;">
            ${p.descuento > 0 ? `<div class="badge-discount" style="top: 20px; left: 20px; z-index: 10; font-size: 1rem; padding: 8px 15px;">-${p.descuento}% OFF</div>` : ''}
            <div class="product-gallery-container">
                <div class="main-image-wrapper" id="zoom-wrapper" onmousemove="zoomIn(event)" onmouseleave="zoomOut()">
                    <img src="${p.img}" class="main-img" id="main-product-img">
                </div>
                ${thumbnailsHtml}
            </div>
        </div>
        <div class="product-info">
            <h2 style="font-family: 'Orbitron'; color: var(--text-main); margin-bottom: 5px;">${p.nombre}</h2>
            
            <div class="product-rating detail-rating">
                <span class="stars">${rate.starsStr}</span>
                <span class="reviews-count" style="font-size: 0.95rem;">${rate.rating} de 5 estrellas (${rate.reviews} valoraciones)</span>
            </div>
            
            ${gatilloViewers}
            ${priceDetailsHtml}
            ${variantsHtml}
            
            <p style="margin: 20px 0; color: var(--text-sub)">Este producto cuenta con control estricto de inventario y garantía oficial de HUMAN STORE.</p>
            
            ${gatilloStockModal}
            <p style="font-weight:bold; margin-bottom:15px; color:${!estaAgotado ? '#10B981' : '#EF4444'}">Existencias reales: ${p.stock} unidades.</p>
            
            <button class="btn-primary" ${estaAgotado ? 'disabled' : ''} onclick="agregarCarrito(${p.id}, true)">${!estaAgotado ? 'Confirmar y Añadir al Carrito' : 'Agotado'}</button>
        </div>
        
        <!-- SECCIÓN DE PREGUNTAS Y RESPUESTAS INCORPORADA -->
        <div class="qa-container-block">
            <h3 class="qa-title">✨ Consultas sobre el producto</h3>
            <div class="qa-form-wrapper">
                <input type="text" id="input-nueva-pregunta" class="checkout-input" placeholder="Escribe tu duda (Ej: ¿Es compatible con PS5?, ¿Hacen envíos hoy?)">
                <button class="btn-checkout qa-btn-ask" onclick="hacerPregunta(${p.id})">Preguntar</button>
            </div>
            <div id="qa-items-list" class="qa-items-feed"></div>
        </div>
    `;
    
    document.getElementById('modal-detalle').style.display = 'block';
    window.refreshQAList(p.id);
};

function cerrarModalGeneral() {
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('modal-detalle').style.display = 'none';
    document.getElementById('modal-terminos').style.display = 'none';
    document.getElementById('modal-favoritos').style.display = 'none';
    document.getElementById('modal-perfil').style.display = 'none';
    document.getElementById('modal-historial-pedidos').style.display = 'none';
    localStorage.removeItem('human_store_opened_modal');
    localStorage.removeItem('human_store_opened_product');
}

// --- ETIQUETA: LÓGICA DE AGREGADO CON COMPATIBILIDAD DE VARIANTES ---
window.agregarCarrito = (id, desdeModal = false) => {
    if (!usuarioLogueado) {
        showToast("🔑 Identifícate para una experiencia de compra completa");
        const welcomeScr = document.getElementById('welcome-screen');
        if(welcomeScr) { welcomeScr.style.display = 'flex'; welcomeScr.style.opacity = '1'; }
        return;
    }
    const original = productos.find(p => p.id === id);
    if(original.stock <= 0) return showToast("❌ Producto agotado");

    let varText = "";
    if (original.opciones) {
        if (!desdeModal) {
            abrirDetalle(id);
            return showToast("⚠️ Por favor escoge tu talla o capacidad antes de comprar.");
        }
        
        const selected = [];
        document.querySelectorAll('.variant-group').forEach(group => {
            const activeBtn = group.querySelector('.var-btn.active');
            if(activeBtn) {
                selected.push(`${activeBtn.dataset.type}: ${activeBtn.dataset.val}`);
            }
        });
        varText = selected.join(" | ");
    }

    const cartId = id + (varText ? `-${varText}` : "");
    const existe = carrito.find(i => i.cartId === cartId);

    if(existe) {
        if(existe.qty < original.stock) { 
            existe.qty++; showToast("🛒 Carrito actualizado"); 
        } else { 
            showToast("❌ Stock máximo superado"); 
        }
    } else {
        carrito.push({...original, qty: 1, cartId: cartId, variantesTexto: varText});
        showToast("🛒 Añadido al carrito");
        if(desdeModal) cerrarModalGeneral(); 
    }
    actualizarTodo();
};

function actualizarTodo() {
    localStorage.setItem('human_store_cart', JSON.stringify(carrito));
    const list = document.getElementById('cart-items');
    let total = 0, count = 0;
    
    if(list) {
        list.innerHTML = carrito.length ? "" : "<p style='text-align:center; color: var(--text-sub); padding: 20px;'>Tu carrito está vacío.</p>";
        carrito.forEach((item, i) => {
            total += (item.precio * item.qty);
            count += item.qty;
            
            let varsHtmlInfo = item.variantesTexto ? `<div style="font-size: 0.75rem; color: var(--text-sub); margin-top: 2px;">${item.variantesTexto}</div>` : "";

            list.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.nombre}</h4>
                        ${varsHtmlInfo}
                        <div class="cart-qty-controls">
                            <button class="qty-btn" onclick="cambiarCant(${i}, -1)">-</button>
                            <span style="font-weight: 900">${item.qty}</span>
                            <button class="qty-btn" onclick="cambiarCant(${i}, 1)">+</button>
                        </div>
                    </div>
                    <div style="font-weight:bold; color: var(--text-main)">$${(item.precio * item.qty).toFixed(2)}</div>
                    <button class="btn-remove" onclick="quitar(${i})">×</button>
                </div>`;
        });
    } else {
        carrito.forEach(item => { total += (item.precio * item.qty); count += item.qty; });
    }
    
    if(document.getElementById('total-usd')) document.getElementById('total-usd').innerText = total.toFixed(2);
    if(document.getElementById('total-bs')) document.getElementById('total-bs').innerText = (total * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    if(document.getElementById('cart-count')) document.getElementById('cart-count').innerText = count;

    const umbralEnvio = 50;
    const shippingText = document.getElementById('shipping-progress-text');
    const shippingFill = document.getElementById('shipping-bar-fill');
    
    if (shippingText && shippingFill) {
        if (total === 0) {
            shippingText.innerHTML = `Agrega <strong>$${umbralEnvio.toFixed(2)}</strong> para 🚚 Envío Gratis`;
            shippingFill.style.width = '0%';
            shippingFill.classList.remove('success');
        } else if (total < umbralEnvio) {
            const faltante = umbralEnvio - total;
            const porcentaje = (total / umbralEnvio) * 100;
            shippingText.innerHTML = `¡Te faltan <strong>$${faltante.toFixed(2)}</strong> para 🚚 Envío Gratis!`;
            shippingFill.style.width = `${porcentaje}%`;
            shippingFill.classList.remove('success');
        } else {
            shippingText.innerHTML = `¡Felicidades! Tienes <strong>🚚 Envío Gratis</strong>`;
            shippingFill.style.width = '100%';
            shippingFill.classList.add('success');
        }
    }

    actualizarSugerenciasCarrito();
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

window.quitar = (index) => { carrito.splice(index, 1); showToast("🗑️ Producto removido"); actualizarTodo(); };

function irASeccionCheckout(mostrarToast = true) {
    document.getElementById('modal-carrito').style.display = 'none';
    document.getElementById('store-content').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'flex';
    localStorage.setItem('human_store_current_view', 'checkout');

    const list = document.getElementById('checkout-items-list');
    list.innerHTML = "";
    carrito.forEach(i => {
        let textVars = i.variantesTexto ? ` <i>(${i.variantesTexto})</i>` : "";
        list.innerHTML += `<p style="margin-bottom: 5px;">• ${i.nombre}${textVars} (x${i.qty}) - $${(i.precio * i.qty).toFixed(2)} USD</p>`;
    });
    
    let totalUsdCalculado = 0;
    carrito.forEach(item => totalUsdCalculado += (item.precio * item.qty));

    document.getElementById('checkout-total-usd').innerText = `$${totalUsdCalculado.toFixed(2)}`;
    document.getElementById('checkout-total-bs').innerText = `${(totalUsdCalculado * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`;
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
    
    const deliveryMethod = document.getElementById('checkout-delivery').value;
    const paymentMethod = document.getElementById('checkout-payment').value;
    const address = document.getElementById('checkout-address').value.trim();

    if(!paymentMethod) {
        return showToast("⚠️ Por favor selecciona un método de pago");
    }

    if((deliveryMethod.includes('Delivery') || deliveryMethod.includes('Nacional')) && address === "") {
        return showToast("⚠️ Por favor ingresa tu dirección de entrega detallada");
    }

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
        items: carrito.map(i => ({ 
            nombre: i.nombre, 
            qty: i.qty, 
            subtotal: i.precio * i.qty, 
            variantes: i.variantesTexto 
        })),
        totalUsd: totalUsd,
        totalBs: totalBs,
        metodoPago: paymentMethod,     
        metodoEntrega: deliveryMethod  
    };

    let pedidosHistorial = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];
    pedidosHistorial.unshift(nuevoPedido); 
    localStorage.setItem(`pedidos_${usuarioActualCorreo}`, JSON.stringify(pedidosHistorial));

    let addressText = address ? `%0A📍 *Dirección:* ${address}` : "";

    const msg = `🛍️ *NUEVO PEDIDO CONFIRMADO - HUMAN STORE*%0A%0A` + 
                `👤 *Cliente:* ${usuarioActualCorreo}%0A` +
                `🚚 *Entrega:* ${deliveryMethod}` + addressText + `%0A` +
                `💳 *Pago:* ${paymentMethod}` + paymentDetailsText + `%0A%0A` +
                `*🛒 ARTÍCULOS:*%0A` +
                carrito.map(i => `▪️ ${i.nombre} ${i.variantesTexto ? `[${i.variantesTexto}]` : ''} (x${i.qty})%0A`).join("") + 
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

function procesarAccionAuth() {
    const u = document.getElementById('usuario').value.trim();
    const p = document.getElementById('password').value.trim();
    const btnAuth = document.getElementById('btn-auth-action');

    if (modoRecuperar) {
        if (!u) return showToast("⚠️ Ingresa tu correo electrónico");
        if (!u.toLowerCase().endsWith("@gmail.com")) return showToast("❌ Formato inválido");

        if (!pasoVerificacion && codigoGeneradoSimulado === "") {
            btnAuth.disabled = true; btnAuth.innerText = "Enviando...";
            setTimeout(() => {
                correoTemporalRecuperacion = u; 
                codigoGeneradoSimulado = generarCodigoOTP(); 
                pasoVerificacion = true;
                document.getElementById('usuario').style.display = "none"; 
                document.getElementById('verification-code-area').style.display = "block"; 
                btnAuth.disabled = false; 
                btnAuth.innerText = "Verificar Código";
                showToast(`📱 Código enviado: ${codigoGeneradoSimulado}`);
            }, 1000);
            return;
        }
        if (pasoVerificacion && document.getElementById('new-password-area').style.display === "none") {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código incorrecto");
            document.getElementById('verification-code-area').style.display = "none"; 
            document.getElementById('new-password-area').style.display = "block";
            btnAuth.innerText = "Actualizar Contraseña"; 
            return showToast("🔑 Código verificado con éxito");
        }
        if (document.getElementById('new-password-area').style.display === "block") {
            const nuevaPass = document.getElementById('new-password').value.trim();
            const nuevaPassConf = document.getElementById('new-password-confirm').value.trim();
            if (!nuevaPass || !nuevaPassConf) return showToast("⚠️ Rellena los campos");
            if (nuevaPass !== nuevaPassConf) return showToast("❌ Las contraseñas no coinciden");
            localStorage.setItem(`user_${correoTemporalRecuperacion}`, nuevaPass);
            showToast("🔒 ¡Contraseña actualizada!"); 
            cancelarFlujosEspeciales(); 
            document.getElementById('tab-login').click();
        }
        return;
    }

    if (modoRegistro) {
        const nombres = document.getElementById('reg-nombres').value.trim();
        const apellidos = document.getElementById('reg-apellidos').value.trim();
        const codigoPais = document.getElementById('reg-country-code').value;
        const telefono = document.getElementById('reg-telefono').value.trim();

        if (!pasoVerificacion) {
            if (!nombres || !apellidos || !telefono || !u || !p) return showToast("⚠️ Completa los campos");
            if (!u.toLowerCase().endsWith("@gmail.com")) return showToast("❌ Correo debe ser @gmail.com");
            if (localStorage.getItem(`user_${u}`) !== null) return showToast("⚠️ Correo ya registrado");

            datosRegistroTemporales = { correo: u, clave: p, telefono: `${codigoPais}${telefono}`, nombres, apellidos };
            codigoGeneradoSimulado = generarCodigoOTP(); 
            pasoVerificacion = true;
            
            document.getElementById('extended-register-fields').style.display = "none"; 
            document.getElementById('usuario').style.display = "none"; 
            document.getElementById('login-password-area').style.display = "none";
            document.getElementById('verification-code-area').style.display = "block"; 
            btnAuth.innerText = "Confirmar Registro";
            
            return showToast(`🎉 Código enviado a tu teléfono: ${codigoGeneradoSimulado}`, 10000);
        } else {
            const codigoIngresado = document.getElementById('auth-verification-code').value.trim();
            if (codigoIngresado !== codigoGeneradoSimulado) return showToast("🔒 Código inválido");
            localStorage.setItem(`user_${datosRegistroTemporales.correo}`, datosRegistroTemporales.clave);
            localStorage.setItem(`userdata_${datosRegistroTemporales.correo}`, JSON.stringify(datosRegistroTemporales));
            showToast("🎉 ¡Registro completado!"); 
            cancelarFlujosEspeciales(); 
            document.getElementById('tab-login').click();
        }
        return;
    }

    if (!u || !p) return showToast("⚠️ Por favor completa los campos");

    const passStored = localStorage.getItem(`user_${u}`);
    if (passStored === null) return showToast("❌ El usuario no existe.");
    if (passStored !== p) return showToast("🔒 Contraseña incorrecta");

    usuarioLogueado = true; usuarioActualCorreo = u;
    localStorage.setItem('human_store_logged', 'true'); localStorage.setItem('human_store_user_email', u);
    
    configurarMenuUsuarioDesplegable();
    const welcomeScr = document.getElementById('welcome-screen');
    welcomeScr.style.opacity = "0";
    setTimeout(() => { welcomeScr.style.display = "none"; showToast("👋 ¡Bienvenido a HUMAN STORE!"); }, 500);
}

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
            const welcomeScr = document.getElementById('welcome-screen');
            welcomeScr.style.display = 'flex';
            welcomeScr.style.opacity = "1";
        };
        navLinks.appendChild(li);
    }
}

window.guardarMetodosPago = () => {
    const pm = document.getElementById('prof-pm-phone').value.trim();
    const zelle = document.getElementById('prof-zelle-email').value.trim();
    const paypal = document.getElementById('prof-paypal-email').value.trim();
    const datos = { pm, zelle, paypal };
    localStorage.setItem(`paymentData_${usuarioActualCorreo}`, JSON.stringify(datos));
    showToast("💾 Métodos de pago guardados exitosamente");
};

function configurarMenuUsuarioDesplegable() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    if (document.getElementById('user-dropdown-wrapper')) document.getElementById('user-dropdown-wrapper').remove();
    if (document.getElementById('btn-nav-login-item')) document.getElementById('btn-nav-login-item').remove();

    const datosGuardados = localStorage.getItem(`userdata_${usuarioActualCorreo}`);
    let primerNombre = datosGuardados ? JSON.parse(datosGuardados).nombres.split(" ")[0] : (usuarioActualCorreo.split("@")[0] || "Premium");

    let textoLinkTema = TEMA_ACTUAL === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro';

    const liContainer = document.createElement('li');
    liContainer.className = 'nav-item user-menu-container'; liContainer.id = 'user-dropdown-wrapper'; liContainer.style.listStyle = 'none';
    liContainer.innerHTML = `
        <button class="user-dropdown-btn" id="dropdownUserTrigger">👤 Hola, ${primerNombre} <span style="font-size:0.7rem;">▼</span></button>
        <div class="user-dropdown-menu" id="dropdownUserMenu">
            <a href="#" id="link-ver-perfil">👤 Mi Perfil</a>
            <a href="#" id="link-mis-pedidos">📦 Mis Pedidos</a>
            <a href="#" id="link-toggle-tema" style="border-top: 1px solid #334155; color: #FBBF24;">${textoLinkTema}</a>
            <a href="#" id="link-cerrar-sesion" style="border-top: 1px solid #334155; color: #EF4444;">🚪 Cerrar Sesión</a>
        </div>
    `;
    navLinks.appendChild(liContainer);

    const trigger = document.getElementById('dropdownUserTrigger');
    const menu = document.getElementById('dropdownUserMenu');
    
    if(trigger) {
        trigger.onclick = (e) => { 
            e.stopPropagation(); 
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; 
        };
    }
    
    window.addEventListener('click', () => { if(menu) menu.style.display = 'none'; });

    if(menu) {
        menu.onclick = (e) => {
            const linkObjetivo = e.target.closest('a');
            if(!linkObjetivo) return;

            const idObjetivo = linkObjetivo.id;
            
            if(idObjetivo === 'link-toggle-tema') {
                e.preventDefault(); e.stopPropagation();
                TEMA_ACTUAL = TEMA_ACTUAL === 'light' ? 'dark' : 'light';
                localStorage.setItem('human_store_theme', TEMA_ACTUAL);
                document.body.className = `theme-${TEMA_ACTUAL}`;
                linkObjetivo.innerText = TEMA_ACTUAL === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
                showToast(TEMA_ACTUAL === 'dark' ? "🌙 Interfaz Premium adaptada al Modo Oscuro" : "☀️ Interfaz Premium adaptada al Modo Claro");
                
                const activeCat = localStorage.getItem('human_store_active_category') || 'all';
                const query = localStorage.getItem('human_store_search_query') || "";
                ejecutarFiltradoCombinado(query, activeCat);
                menu.style.display = 'none';
            }

            if(idObjetivo === 'link-ver-perfil') {
                e.preventDefault(); e.stopPropagation(); menu.style.display = 'none';
                localStorage.setItem('human_store_opened_modal', 'perfil');
                const pBody = document.getElementById('perfil-body');
                const infoUser = localStorage.getItem(`userdata_${usuarioActualCorreo}`);
                
                const savedPayRaw = localStorage.getItem(`paymentData_${usuarioActualCorreo}`);
                const savedPay = savedPayRaw ? JSON.parse(savedPayRaw) : { pm: "", zelle: "", paypal: "" };

                let profileHtml = "";

                if (infoUser) {
                    const data = JSON.parse(infoUser);
                    profileHtml = `
                        <div class="profile-info-box">
                            <div class="profile-field"><span class="profile-label">Nombres:</span><span class="profile-value">${data.nombres}</span></div>
                            <div class="profile-field"><span class="profile-label">Apellidos:</span><span class="profile-value">${data.apellidos}</span></div>
                            <div class="profile-field"><span class="profile-label">Correo:</span><span class="profile-value">${data.correo}</span></div>
                            <div class="profile-field"><span class="profile-label">Teléfono:</span><span class="profile-value">${data.telefono}</span></div>
                        </div>`;
                } else {
                    profileHtml = `
                        <div class="profile-info-box">
                            <div class="profile-field"><span class="profile-label">Correo:</span><span class="profile-value">${usuarioActualCorreo}</span></div>
                            <div class="profile-field"><span class="profile-label">Rango:</span><span class="profile-value">Cliente Premium</span></div>
                        </div>`;
                }

                profileHtml += `
                    <div class="profile-payment-box" style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed var(--border-color);">
                        <h4 style="color: var(--secondary); margin-bottom: 15px; font-family: 'Orbitron'; font-size: 1rem;">💳 Mis Métodos Guardados</h4>
                        <p style="font-size: 0.8rem; color: var(--text-sub); margin-bottom: 15px;">Guarda tus datos para agilizar el proceso de compra.</p>
                        
                        <label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Teléfono emisor (Pago Móvil)</label>
                        <input type="tel" id="prof-pm-phone" class="checkout-input" style="margin-bottom:10px; padding: 10px;" placeholder="Ej: 04141234567" value="${savedPay.pm}">
                        
                        <label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Correo asociado a Zelle</label>
                        <input type="email" id="prof-zelle-email" class="checkout-input" style="margin-bottom:10px; padding: 10px;" placeholder="Ej: micorreo@zelle.com" value="${savedPay.zelle}">
                        
                        <label style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">Correo asociado a PayPal</label>
                        <input type="email" id="prof-paypal-email" class="checkout-input" style="margin-bottom:15px; padding: 10px;" placeholder="Ej: micorreo@paypal.com" value="${savedPay.paypal}">
                        
                        <button class="btn-primary" onclick="guardarMetodosPago()" style="padding: 12px;">Guardar Datos de Pago</button>
                    </div>
                `;

                pBody.innerHTML = profileHtml;
                document.getElementById('modal-perfil').style.display = 'block';
            }

            if(idObjetivo === 'link-mis-pedidos') {
                e.preventDefault(); e.stopPropagation(); menu.style.display = 'none';
                localStorage.setItem('human_store_opened_modal', 'pedidos');
                const hBody = document.getElementById('historial-pedidos-body');
                const listaPedidos = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];

                if (listaPedidos.length === 0) {
                    hBody.innerHTML = `<p style="text-align:center; color: var(--text-sub); padding: 30px;">📭 Historial de compras vacío.</p>`;
                } else {
                    hBody.innerHTML = "";
                    listaPedidos.forEach(ped => {
                        let itemsHtml = ped.items.map(i => {
                            let vt = i.variantes ? ` <br><span style="font-size:0.75rem; color:var(--secondary)">[${i.variantes}]</span>` : "";
                            return `<li style="margin-bottom:8px;">• ${i.nombre} <strong>(x${i.qty})</strong>${vt}</li>`;
                        }).join("");
                        
                        hBody.innerHTML += `
                            <div class="pedido-card">
                                <div class="pedido-header"><span>🆔 #ID: <strong>${ped.idPedido}</strong></span><span>📅 ${ped.fecha}</span></div>
                                <ul style="margin: 0; padding-left: 15px; font-size: 0.9rem; list-style-type: none;">${itemsHtml}</ul>
                                <div class="pedido-totales"><span style="color: var(--text-sub);">Total:</span><span style="color: var(--success);">$${ped.totalUsd} / ${ped.totalBs}</span></div>
                                <button class="btn-pdf" onclick="descargarRecibo('${ped.idPedido}')">📄 Descargar Recibo PDF</button>
                            </div>`;
                    });
                }
                document.getElementById('modal-historial-pedidos').style.display = 'block';
            }

            if(idObjetivo === 'link-cerrar-sesion') {
                e.preventDefault(); usuarioLogueado = false; usuarioActualCorreo = "";
                localStorage.removeItem('human_store_logged');
                localStorage.removeItem('human_store_user_email');
                location.reload(); 
            }
        };
    }
}

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
    document.getElementById('auth-msg').innerText = "Identifícate para gestionar tu carrito y pedidos";
}

function generarCodigoOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

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

const priceSlider = document.getElementById('price-slider');
const priceDisplay = document.getElementById('price-slider-value');
if (priceSlider) {
    priceSlider.oninput = (e) => {
        priceDisplay.innerText = `$${e.target.value}`;
    };
    priceSlider.onchange = (e) => {
        localStorage.setItem('human_store_price_max', e.target.value);
        const cat = localStorage.getItem('human_store_active_category') || 'all';
        const query = localStorage.getItem('human_store_search_query') || "";
        ejecutarFiltradoCombinado(query, cat);
    };
}

const modalTerminos = document.getElementById('modal-terminos');
const checkTerminos = document.getElementById('check-terminos');
const btnConfirmarTerminos = document.getElementById('btn-confirmar-terminos');
document.getElementById('link-terminos').onclick = (e) => { e.preventDefault(); modalTerminos.style.display = 'block'; };
document.getElementById('close-terminos').onclick = () => { modalTerminos.style.display = 'none'; };
checkTerminos.onchange = function() { btnConfirmarTerminos.disabled = !this.checked; };
btnConfirmarTerminos.onclick = () => { showToast("✅ Condiciones aprobadas"); modalTerminos.style.display = 'none'; };

function actualizarContadorFavoritos() {
    const favCountEl = document.getElementById('fav-count');
    if (favCountEl) {
        favCountEl.innerText = favoritos.length;
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
    
    actualizarContadorFavoritos();
    const cat = localStorage.getItem('human_store_active_category') || 'all';
    const query = localStorage.getItem('human_store_search_query') || "";
    ejecutarFiltradoCombinado(query, cat);
    if(document.getElementById('modal-favoritos').style.display === 'block') renderFavoritos();
};

function renderFavoritos() {
    const list = document.getElementById('fav-items');
    if(favoritos.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-sub);'>Lista vacía.</p>";
        document.getElementById('fav-actions-area').style.display = 'none';
    } else {
        list.innerHTML = ""; 
        document.getElementById('fav-actions-area').style.display = 'block';
        favoritos.forEach(item => {
            let precioHtmlFavorites = "";
            if (MONEDA_ACTUAL === "USD") {
                precioHtmlFavorites = `<div class="fav-item-price-main">$${item.precio.toFixed(2)} USD</div>`;
            } else {
                precioHtmlFavorites = `<div class="fav-item-price-main" style="color:#10B981;">${(item.precio * TASA_BCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</div>`;
            }

            list.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 style="margin: 0;">${item.nombre}</h4>
                        ${precioHtmlFavorites}
                    </div>
                    <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; margin-left: 10px; white-space: nowrap;" ${item.stock <= 0 ? 'disabled' : ''} onclick="agregarCarrito(${item.id}, false)">🛒 Llevar</button>
                    <button class="btn-remove" style="margin-left: 10px;" onclick="toggleFavorito(${item.id})">×</button>
                </div>`;
        });
    }
}

document.getElementById('btn-llevar-todo-fav').onclick = () => {
    if (!usuarioLogueado) { cerrarModalGeneral(); document.getElementById('welcome-screen').style.display = 'flex'; return; }
    favoritos.forEach(p => { if(p.stock > 0) agregarCarrito(p.id, false); });
    favoritos = []; 
    localStorage.setItem('human_store_favs', JSON.stringify(favoritos));
    actualizarContadorFavoritos();
    cerrarModalGeneral(); 
    actualizarTodo();
};

document.getElementById('footer-ver-favoritos').onclick = (e) => { e.preventDefault(); renderFavoritos(); document.getElementById('modal-favoritos').style.display = 'block'; };
document.getElementById('close-favoritos').onclick = () => { document.getElementById('modal-favoritos').style.display = 'none'; };

document.querySelectorAll('.close').forEach(btn => btn.onclick = () => { cerrarModalGeneral(); });
window.onclick = (e) => { 
    if (e.target.className === 'modal' || e.target.id === 'modal-perfil' || e.target.id === 'modal-historial-pedidos') { 
        cerrarModalGeneral(); 
    } 
};
document.getElementById('btn-ver-carrito').onclick = () => document.getElementById('modal-carrito').style.display = 'block';
document.getElementById('btn-cancel-auth').onclick = () => { document.getElementById('welcome-screen').style.display = 'none'; };

document.getElementById('btn-search-favoritos').addEventListener('click', () => {
    renderFavoritos(); 
    document.getElementById('modal-favoritos').style.display = 'block'; 
});

actualizarContadorFavoritos();

window.descargarRecibo = (idPedidoStr) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pedidosLista = JSON.parse(localStorage.getItem(`pedidos_${usuarioActualCorreo}`)) || [];
        const pedidoData = pedidosLista.find(p => String(p.idPedido) === String(idPedidoStr));
        
        if(!pedidoData) {
            showToast("❌ Error: No se encontraron los datos de este pedido.");
            return;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(212, 175, 55); 
        doc.text("HUMAN STORE", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text("Recibo de Compra Oficial", 105, 28, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Nro de Orden: #${pedidoData.idPedido}`, 14, 45);
        doc.text(`Fecha y Hora: ${pedidoData.fecha} - ${pedidoData.hora}`, 14, 52);
        doc.text(`Cliente: ${usuarioActualCorreo}`, 14, 59);

        const tableColumn = ["Producto", "Cant.", "Subtotal"];
        const tableRows = [];

        pedidoData.items.forEach(item => {
            const nombreConVariante = item.variantes ? `${item.nombre}\n(${item.variantes})` : item.nombre;
            const rowData = [
                nombreConVariante,
                item.qty.toString(),
                `$${item.subtotal.toFixed(2)}`
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            startY: 68,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }, 
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        const finalY = doc.lastAutoTable.finalY || 68;
        doc.setFont("helvetica", "bold");
        doc.text(`Total Cancelado (USD): $${pedidoData.totalUsd}`, 14, finalY + 15);
        doc.text(`Total Equivalente (Bs): ${pedidoData.totalBs}`, 14, finalY + 22);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Gracias por preferir calidad y estilo. HUMAN STORE.", 105, finalY + 40, { align: "center" });

        doc.save(`Recibo_HumanStore_Orden_${pedidoData.idPedido}.pdf`);
        showToast("📄 Recibo descargado exitosamente");
        
    } catch(err) {
        console.error(err);
        showToast("❌ Error al generar el PDF. Verifica tu conexión.");
    }
}

window.cambiarImagenPrincipal = (elem, src) => {
    document.getElementById('main-product-img').src = src;
    document.querySelectorAll('.thumbnail-img').forEach(img => img.classList.remove('active-thumb'));
    elem.classList.add('active-thumb');
};

window.zoomIn = (e) => {
    const wrapper = document.getElementById('zoom-wrapper');
    const img = document.getElementById('main-product-img');
    const { left, top, width, height } = wrapper.getBoundingClientRect();
    
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(2.5)"; 
};

window.zoomOut = () => {
    const img = document.getElementById('main-product-img');
    img.style.transformOrigin = "center center";
    img.style.transform = "scale(1)";
};
