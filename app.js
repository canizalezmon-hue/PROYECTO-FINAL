// Base de datos de productos
const productos = [
    { id: 1, nombre: "Laptop Pro", precio: 1500, img: "https://via.placeholder.com/120" },
    { id: 2, nombre: "Smartphone", precio: 800, img: "https://via.placeholder.com/120" },
    { id: 3, nombre: "Auriculares", precio: 150, img: "https://via.placeholder.com/120" },
    { id: 4, nombre: "Teclado RGB", precio: 60, img: "https://via.placeholder.com/120" }
];

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let modoRegistro = false;

// Referencias
const btnLogin = document.getElementById('btn-login');
const btnToggle = document.getElementById('btn-toggle');
const seccionAuth = document.getElementById('seccion-auth');
const interfazTienda = document.getElementById('interfaz-tienda');

// Alternar entre Login y Registro
btnToggle.addEventListener('click', () => {
    modoRegistro = !modoRegistro;
    document.getElementById('titulo-auth').innerText = modoRegistro ? "Crear Cuenta" : "Iniciar Sesión";
    btnLogin.innerText = modoRegistro ? "Registrarse" : "Entrar";
    btnToggle.innerText = modoRegistro ? "Volver al login" : "Crear cuenta nueva";
});

// Manejo de Login
btnLogin.addEventListener('click', () => {
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) return alert("Completa los datos");

    if (modoRegistro) {
        localStorage.setItem(`user_${user}`, pass);
        alert("Cuenta creada. Ahora puedes iniciar sesión.");
        btnToggle.click();
    } else {
        const passStored = localStorage.getItem(`user_${user}`);
        if (passStored === pass) {
            iniciarSesion(user);
        } else {
            alert("Credenciales incorrectas");
        }
    }
});

function iniciarSesion(usuario) {
    seccionAuth.style.display = "none";
    interfazTienda.style.display = "block";
    document.getElementById('nombre-usuario-display').innerText = `Bienvenido, ${usuario}`;
    cargarProductos();
    actualizarCarrito();
}

// Funciones de la Tienda
function cargarProductos() {
    const catalogo = document.getElementById('catalogo');
    catalogo.innerHTML = productos.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.nombre}">
            <h4>${p.nombre}</h4>
            <p>$${p.precio}</p>
            <button class="btn-primary" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>
        </div>
    `).join('');
}

window.agregarAlCarrito = (id) => {
    const p = productos.find(prod => prod.id === id);
    carrito.push(p);
    guardarYRefrescar();
};

window.eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    guardarYRefrescar();
};

function guardarYRefrescar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

function actualizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalDisplay = document.getElementById('total-precio');
    let total = 0;

    lista.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.nombre}</span>
                <span>$${item.precio} <button onclick="eliminarDelCarrito(${index})" style="color:red">x</button></span>
            </div>
        `;
    }).join('');
    
    totalDisplay.innerText = total;
}

document.getElementById('btn-logout').onclick = () => location.reload();
document.getElementById('btn-comprar').onclick = () => {
    if (carrito.length === 0) return alert("Carrito vacío");
    alert("Compra realizada con éxito");
    carrito = [];
    guardarYRefrescar();
};
