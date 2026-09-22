// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCu9JKhhKbH1D_HkLf1dw14yhy_vPoSoTU",
  authDomain: "pangest-app-web.firebaseapp.com",
  projectId: "pangest-app-web",
  storageBucket: "pangest-app-web.appspot.com",
  messagingSenderId: "933218266104",
  appId: "1:933218266104:web:ad700d022c29e1add0440d",
  measurementId: "G-8NWFHLME32"
};

if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const auth = firebase.auth();

// ==========================================
// 2. VARIABLES GLOBALES DE PRODUCTOS Y CARRITO
// ==========================================
let carrito = [];
let productosGlobales = [];

const productosDefecto = [
    { nombre: "Donas", precio: 1000, categoria: "Panes dulces", imagen: "images/donas.webp" },
    { nombre: "Pan de bono fresco", precio: 1500, categoria: "Panes salados", imagen: "images/pan-de-bono-fresco.jpg" },
    { nombre: "Torta de Chocolate", precio: 4500, categoria: "Reposteria", imagen: "images/torta-de-chocolate.webp" },
    { nombre: "Café con Leche", precio: 2000, categoria: "Bebidas", imagen: "images/cafe-con-leche.webp" },
];

// ==========================================
// 3. EVENTO PRINCIPAL AL CARGAR EL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- A. BÚSQUEDA Y CÁMARA INTEGRADA EN VIVO ---
    const inputBusqueda = document.getElementById("input-busqueda");
    const btnLupa = document.getElementById("btn-buscar-lupa");
    const btnCamara = document.getElementById("btn-buscar-camara");
    const modalCamara = document.getElementById("modal-camara");
    const videoCamara = document.getElementById("video-camara");
    const canvasCamara = document.getElementById("canvas-camara");
    const btnCapturarFoto = document.getElementById("btn-capturar-foto");
    const btnCerrarCamara = document.getElementById("btn-cerrar-modal-camara");
    const inputArchivoGaleria = document.getElementById("input-archivo-galeria");

    let streamCamara = null;

    function ejecutarFiltrado() {
        if (!inputBusqueda) return;
        const texto = inputBusqueda.value.toLowerCase().trim();
        const tarjetas = document.querySelectorAll(".tarjeta-producto");
        
        tarjetas.forEach((tarjeta) => {
            const nombre = tarjeta.innerText.toLowerCase();
            tarjeta.style.display = nombre.includes(texto) ? "" : "none";
        });
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", ejecutarFiltrado);
    }

    if (btnLupa) {
        btnLupa.addEventListener("click", ejecutarFiltrado);
    }

    // Encender webcam/cámara en vivo
    async function abrirCamara() {
        try {
            modalCamara.style.display = "flex";
            streamCamara = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            videoCamara.srcObject = streamCamara;
        } catch (error) {
            alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador o cámara.");
            console.error(error);
        }
    }

    // Apagar webcam/cámara
    function cerrarCamara() {
        if (streamCamara) {
            streamCamara.getTracks().forEach(track => track.stop());
            streamCamara = null;
        }
        modalCamara.style.display = "none";
    }

    if (btnCamara) {
        btnCamara.addEventListener("click", abrirCamara);
    }

    if (btnCerrarCamara) {
        btnCerrarCamara.addEventListener("click", cerrarCamara);
    }

    if (btnCapturarFoto) {
        btnCapturarFoto.addEventListener("click", () => {
            canvasCamara.width = videoCamara.videoWidth || 300;
            canvasCamara.height = videoCamara.videoHeight || 300;
            const ctx = canvasCamara.getContext("2d");
            ctx.drawImage(videoCamara, 0, 0, canvasCamara.width, canvasCamara.height);

            alert("¡Foto capturada correctamente en PanGest! 📸");
            cerrarCamara();
        });
    }

    if (inputArchivoGaleria) {
        inputArchivoGaleria.addEventListener("change", (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                alert(`Imagen seleccionada: ${archivo.name}\n¡Procesando en PanGest! 🖼️`);
                cerrarCamara();
            }
        });
    }

    // --- B. AUTENTICACIÓN ---
    const pantallaAuth = document.getElementById("pantalla-auth");
    const formAuth = document.getElementById("form-autenticacion");
    const divNombre = document.getElementById("div-nombre");
    const authTitulo = document.getElementById("auth-titulo");
    const authMensajeToggle = document.getElementById("auth-mensaje-toggle");
    const authLinkToggle = document.getElementById("auth-link-toggle");
    const txtPerfil = document.getElementById("nombre-cliente-perfil");
    const imgPerfil = document.getElementById("perfil-foto");

    let modoRegistro = false;

    auth.onAuthStateChanged((user) => {
        if (user) {
            if (pantallaAuth) pantallaAuth.style.display = "none";
            const nombreMostrar = user.displayName || user.email.split("@")[0];

            if (txtPerfil) txtPerfil.textContent = nombreMostrar;
            if (imgPerfil) {
                imgPerfil.src = user.photoURL 
                    ? user.photoURL 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreMostrar)}&background=ebdcc5&color=4a3319&bold=true`;
            }
        } else {
            if (pantallaAuth) pantallaAuth.style.display = "flex";
        }
    });

    if (authLinkToggle) {
        authLinkToggle.addEventListener("click", (e) => {
            e.preventDefault();
            modoRegistro = !modoRegistro;
            authTitulo.textContent = modoRegistro ? "Registro" : "Iniciar Sesión";
            authMensajeToggle.textContent = modoRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
            authLinkToggle.textContent = modoRegistro ? "Inicia sesión" : "Regístrate";
            if (divNombre) divNombre.style.display = modoRegistro ? "block" : "none";
        });
    }

    if (formAuth) {
        formAuth.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombreInput = document.getElementById("auth-nom-bre") || document.getElementById("auth-nombre");
            const nombre = nombreInput ? nombreInput.value.trim() : "";
            const correo = document.getElementById("auth-usuario").value.trim();
            const contrasena = document.getElementById("auth-password").value;

            if (modoRegistro) {
                auth.createUserWithEmailAndPassword(correo, contrasena)
                    .then((userCredential) => userCredential.user.updateProfile({ displayName: nombre }))
                    .then(() => alert("¡Bienvenido/a " + nombre + "! Registro exitoso."))
                    .catch((err) => alert("Error al registrar: " + err.message));
            } else {
                auth.signInWithEmailAndPassword(correo, contrasena)
                    .then(() => alert("¡Bienvenido/a de vuelta! 🍞"))
                    .catch((err) => alert("Error: " + err.message));
            }
        });
    }

    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            auth.signOut().then(() => {
                alert("Has cerrado sesión exitosamente.");
            }).catch((error) => {
                console.error("Error al cerrar sesión: ", error);
            });
        });
    } 

    // --- C. CATÁLOGO INICIAL (Sincronizado con Admin usando 'panGestProductos') ---
    const guardados = localStorage.getItem("panGestProductos");
    if (guardados) {
        productosGlobales = JSON.parse(guardados);
    } else {
        productosGlobales = productosDefecto;
        localStorage.setItem("panGestProductos", JSON.stringify(productosGlobales));
    }

    dibujarTienda("Todos");
    dibujarHistorialComprasCliente();

    const btnPagar = document.getElementById("btn-pagar");
    if (btnPagar) btnPagar.addEventListener("click", confirmarCompra);

    // Filtros por botón de categoría
    const botonesCategorias = document.querySelectorAll(".btn-categoria");
    botonesCategorias.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            botonesCategorias.forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            dibujarTienda(e.target.textContent.trim());
        });
    });

    // --- D. SISTEMA DE NAVEGACIÓN ---
    const btnNavInicio = document.getElementById('btn-nav-inicio');
    const btnNavPerfil = document.getElementById('btn-nav-perfil');
    const btnNavCarrito = document.getElementById('btn-nav-carrito');

    if (btnNavInicio) {
        btnNavInicio.addEventListener('click', function() {
            cambiarPantalla('pantalla-inicio', this);
        });
    }
    if (btnNavPerfil) {
        btnNavPerfil.addEventListener('click', function() {
            cambiarPantalla('pantalla-perfil', this);
            dibujarHistorialComprasCliente(); 
        });
    }
    if (btnNavCarrito) {
        btnNavCarrito.addEventListener('click', function() {
            cambiarPantalla('pantalla-carrito', this);
        });
    }

    // Escucha cambios en tiempo real desde el panel de administración
    window.addEventListener("storage", (e) => {
        if (e.key === "panGestProductos") {
            productosGlobales = JSON.parse(e.newValue) || [];
            const botonActivo = document.querySelector(".btn-categoria.active");
            dibujarTienda(botonActivo ? botonActivo.textContent.trim() : "Todos");
        }
    });

    actualizarInterfazCarrito();
});

// ==========================================
// 4. FUNCIONES DE INTERFAZ Y NAVEGACIÓN
// ==========================================
function cambiarPantalla(idPantalla, botonPresionado) {
    document.querySelectorAll('.seccion-app').forEach(seccion => {
        seccion.classList.remove('activa');
        seccion.style.display = "none";
    });

    const seccionObjetivo = document.getElementById(idPantalla);
    if (seccionObjetivo) {
        seccionObjetivo.classList.add('activa');
        seccionObjetivo.style.display = "block";
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('activo');
    });
    
    if (botonPresionado) {
        botonPresionado.classList.add('activo');
    }

    window.scrollTo(0, 0);
}

// ==========================================
// 5. RENDERS Y LÓGICA DE TIENDA / CARRITO
// ==========================================
function dibujarTienda(categoriaFiltro) {
    const contenedor = document.querySelector(".estante-contenedor");
    if (!contenedor) return;
    contenedor.innerHTML = ""; 

    productosGlobales.forEach((producto) => {
        if (categoriaFiltro === "Todos" || producto.categoria === categoriaFiltro) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta-producto";
            tarjeta.setAttribute("data-categoria", producto.categoria);
            tarjeta.style.cssText = "background:#fff; border:1px solid #ebdcc5; border-radius:12px; padding:12px; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.02); margin-bottom:10px;";

            tarjeta.innerHTML = `
                <img src="${producto.imagen}" style="width:100%; height:160px; object-fit:cover; border-radius:8px;" onerror="this.src='images/defecto.jpg'">
                <div class="info-producto" style="margin-top:10px;">
                    <h3 style="margin:5px 0; color:#4a3319; font-size:1.1rem;">${producto.nombre}</h3>
                    <p class="precio" style="color:#27ae60; font-weight:bold; margin:5px 0;">$${producto.precio.toLocaleString('es-CO')}</p>
                    <button class="btn-agregar" style="width:100%; background:#8a7355; color:#fff; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;">Añadir al carrito</button>
                </div>
            `;
            tarjeta.querySelector(".btn-agregar").addEventListener("click", agregarAlCarrito);
            contenedor.appendChild(tarjeta);
        }
    });
}

function agregarAlCarrito(e) {
    const tarjeta = e.target.closest(".tarjeta-producto");
    const nombre = tarjeta.querySelector("h3").textContent;
    const precioTexto = tarjeta.querySelector(".precio").textContent;
    const precio = parseInt(precioTexto.replace(/[^0-9]/g, ""), 10);

    const productoExistente = carrito.find(item => item.nombre === nombre);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    const listaCarrito = document.getElementById("elementos-carrito");
    const totalElemento = document.getElementById("precio-total");
    const badgeContador = document.getElementById('badge-contador'); 

    if (!listaCarrito || !totalElemento) return;
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li class="carrito-vacio" style="color:#7f8c8d; text-align:center; padding:40px 10px; font-style:italic;">El carrito está vacío</li>';
        totalElemento.textContent = "$0";
        if (badgeContador) badgeContador.style.display = 'none'; 
        return;
    }

    let sumaTotal = 0;
    let unidadesTotales = 0; 

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        sumaTotal += subtotal;
        unidadesTotales += producto.cantidad; 

        const item = document.createElement("li");
        item.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px; background:#fff; border-radius:12px; border:1px solid #ebdcc5; font-size:0.95rem; margin-bottom:8px;";
        item.innerHTML = `
            <div style="text-align:left;">
                <strong style="color:#4a3319; display:block;">${producto.nombre}</strong>
                <span style="color:#7f8c8d; font-size:0.8rem;">$${producto.precio.toLocaleString('es-CO')} x ${producto.cantidad}</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <strong style="color:#2c3e50;">$${subtotal.toLocaleString('es-CO')}</strong>
                <button onclick="quitarDelCarrito(${index})" style="background:#e74c3c; border:none; color:white; border-radius:5px; width:24px; height:24px; cursor:pointer; font-weight:bold;">×</button>
            </div>
        `;
        listaCarrito.appendChild(item);
    });

    totalElemento.textContent = `$${sumaTotal.toLocaleString('es-CO')}`;
    if (badgeContador) {
        badgeContador.textContent = unidadesTotales;
        badgeContador.style.display = 'block';
    }
}

window.quitarDelCarrito = function(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    } else {
        carrito.splice(index, 1);
    }
    actualizarInterfazCarrito();
};

function confirmarCompra() {
    if (carrito.length === 0) return;

    let totalCompra = 0;
    let resumenProductos = [];
    
    carrito.forEach(producto => {
        totalCompra += (producto.precio * producto.cantidad);
        resumenProductos.push({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad
        });
    });

    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const fechaFormateada = ahora.toLocaleDateString('es-CO');

    const nuevaVentaWeb = {
        id: "WEB-" + Date.now().toString().slice(-4),
        fecha: fechaFormateada,
        hora: horaFormateada,
        productos: resumenProductos,
        total: totalCompra,
        cliente: {
            nombre: auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email.split('@')[0]) : "Cliente Web",
            telefono: "No registrado"
        }
    };

    // Guardar en la lista de ventas web que lee el admin (`panGestVentasWeb`)
    let ventasWebAdmin = JSON.parse(localStorage.getItem("panGestVentasWeb")) || [];
    ventasWebAdmin.unshift(nuevaVentaWeb);
    localStorage.setItem("panGestVentasWeb", JSON.stringify(ventasWebAdmin));

    // Guardar historial para el perfil del cliente
    const facturaCliente = {
        productos: resumenProductos.map(p => `${p.cantidad}x ${p.nombre}`).join(", "),
        total: totalCompra,
        hora: fechaFormateada + " — " + horaFormateada
    };

    let comprasCliente = JSON.parse(localStorage.getItem("comprasCliente")) || [];
    comprasCliente.unshift(facturaCliente);
    localStorage.setItem("comprasCliente", JSON.stringify(comprasCliente));

    alert(`¡Compra Confirmada! 🎉\nTotal: $${totalCompra.toLocaleString('es-CO')}\nPuedes revisar el estado en tu perfil y se ha registrado en el sistema de administración.`);

    carrito = [];
    actualizarInterfazCarrito();

    const btnNavPerfil = document.getElementById('btn-nav-perfil');
    if (btnNavPerfil) cambiarPantalla('pantalla-perfil', btnNavPerfil);
    dibujarHistorialComprasCliente();
}

function dibujarHistorialComprasCliente() {
    const contenedor = document.getElementById("contenedor-historial");
    if (!contenedor) return;

    let comprasCliente = JSON.parse(localStorage.getItem("comprasCliente")) || [];
    contenedor.innerHTML = "";

    if (comprasCliente.length === 0) {
        contenedor.innerHTML = '<p style="color:#7f8c8d; font-style:italic; text-align:center; font-size:0.9rem;">Aún no has realizado compras.</p>';
        return;
    }

    comprasCliente.forEach(factura => {
        const bloque = document.createElement("div");
        bloque.style.cssText = "background:#ffffff; border:1px solid #ebdcc5; border-radius:10px; padding:12px; margin-bottom:10px; box-shadow:0 2px 4px rgba(0,0,0,0.05);";
        bloque.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#7f8c8d;">
                <span>📅 ${factura.hora || 'Reciente'}</span>
                <span style="color:#27ae60; font-weight:bold;">Completado</span>
            </div>
            <p style="margin:5px 0; font-size:0.95rem; color:#4a3319; font-weight:500;">${factura.productos}</p>
            <div style="border-top:1px dashed #ebdcc5; margin-top:4px; padding-top:4px; text-align:right;">
                <span style="font-size:0.9rem; color:#2c3e50;">Total: <strong>$${factura.total.toLocaleString('es-CO')}</strong></span>
            </div>
        `;
        contenedor.appendChild(bloque);
    });
}

window.cerrarSesionPanGest = function() {
    auth.signOut().then(() => {
        location.reload();
    });
};