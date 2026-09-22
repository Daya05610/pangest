// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
let productosMenu = JSON.parse(localStorage.getItem('panGestProductos')) || [];
let gastosMateriaPrima = JSON.parse(localStorage.getItem('panGestGastos')) || [];
let ventasWeb = JSON.parse(localStorage.getItem('panGestVentasWeb')) || [];

if (typeof window.ventasLocal === 'undefined') {
    window.ventasLocal = JSON.parse(localStorage.getItem('panGestVentasLocal')) || [];
}

if (typeof window.carritoVentaLocalTemp === 'undefined') {
    window.carritoVentaLocalTemp = [];
}

let notasGuardadas = localStorage.getItem('panGestNotas') || "";
let graficaBalance = null;

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    inicializarAdmin();
});

function inicializarAdmin() {
    renderizarProductosAdmin();
    renderizarBotonesVentaLocal();
    renderizarGastos();
    renderizarVentasWeb();
    renderizarVentasLocal();
    actualizarBalanceGeneral();
    cargarNotas();

    // Evento del formulario de nuevo producto
    const formProducto = document.getElementById("form-nuevo-producto");
    if (formProducto) {
        formProducto.onsubmit = (e) => {
            e.preventDefault();
            agregarNuevoProducto();
        };
    }
}

// ==========================================
// 1. NAVEGACIÓN ENTRE MÓDULOS (SIDEBAR)
// ==========================================
function mostrarModulo(idModulo, botonElemento) {
    const modulos = document.querySelectorAll('.caja-modulo');
    modulos.forEach(mod => mod.classList.remove('modulo-visible'));

    const moduloActivo = document.getElementById(idModulo);
    if (moduloActivo) {
        moduloActivo.classList.add('modulo-visible');
    }

    const botones = document.querySelectorAll('.sidebar-nav button');
    botones.forEach(btn => btn.classList.remove('activo'));
    if (botonElemento) {
        botonElemento.classList.add('activo');
    }

    // Si abren el balance, refrescar gráfica
    if (idModulo === 'seccion-balance') {
        actualizarBalanceGeneral();
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-lateral');
    const overlay = document.getElementById('overlay');
    if (menu && overlay) {
        menu.classList.toggle('activo');
        overlay.classList.toggle('activo');
    }
}

// ==========================================
// 2. GESTIÓN DE PRODUCTOS
// ==========================================
function agregarNuevoProducto() {
    const nombre = document.getElementById("admin-nombre-producto").value.trim();
    const precio = parseFloat(document.getElementById("admin-precio-producto").value);
    const categoria = document.getElementById("admin-categoria-producto").value;
    let imagen = document.getElementById("admin-imagen-producto").value.trim();

    if (!nombre || isNaN(precio)) {
        alert("Por favor completa los campos obligatorios.");
        return;
    }

    if (!imagen) {
        imagen = "images/defecto.jpg";
    }

    const nuevoProd = { nombre, precio, categoria, imagen };
    productosMenu.push(nuevoProd);
    guardarProductos();

    renderizarProductosAdmin();
    renderizarBotonesVentaLocal();

    document.getElementById("form-nuevo-producto").reset();
    alert("📦 ¡Producto agregado con éxito y sincronizado con la tienda!");
}

function eliminarProducto(index) {
    if (confirm("¿Estás segura de eliminar este producto del catálogo?")) {
        productosMenu.splice(index, 1);
        guardarProductos();
        renderizarProductosAdmin();
        renderizarBotonesVentaLocal();
    }
}

function guardarProductos() {
    localStorage.setItem('panGestProductos', JSON.stringify(productosMenu));
}

function renderizarProductosAdmin() {
    const contenedor = document.getElementById("admin-lista-productos-tabla");
    if (!contenedor) return;

    if (productosMenu.length === 0) {
        contenedor.innerHTML = `<p style="color: #7f8c8d; font-size: 0.9rem;">No hay productos registrados actualmente.</p>`;
        return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">`;
    productosMenu.forEach((prod, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfbf7; padding: 8px 12px; border: 1px solid #ebdcc5; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${prod.imagen}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;" onerror="this.src='images/defecto.jpg'">
                    <div>
                        <strong style="font-size: 0.9rem; color: #4a3319;">${prod.nombre}</strong>
                        <span style="font-size: 0.8rem; color: #7f8c8d; display: block;">${prod.categoria} - $${prod.precio.toLocaleString('es-CO')}</span>
                    </div>
                </div>
                <button onclick="eliminarProducto(${index})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Eliminar</button>
            </div>
        `;
    });
    html += `</div>`;
    contenedor.innerHTML = html;
}

// ==========================================
// 3. REGISTRO DE GASTOS
// ==========================================
function agregarNuevoGastoMateriaPrima() {
    const concepto = document.getElementById("gasto-concepto").value.trim();
    const valor = parseFloat(document.getElementById("gasto-valor").value);

    if (!concepto || isNaN(valor) || valor <= 0) {
        alert("Por favor ingresa un concepto válido y un valor mayor a cero.");
        return;
    }

    const nuevoGasto = {
        id: Date.now(),
        concepto,
        valor,
        fecha: new Date().toLocaleDateString('es-CO')
    };

    gastosMateriaPrima.unshift(nuevoGasto);
    localStorage.setItem('panGestGastos', JSON.stringify(gastosMateriaPrima));

    document.getElementById("gasto-concepto").value = "";
    document.getElementById("gasto-valor").value = "";

    renderizarGastos();
    actualizarBalanceGeneral();
    alert("📉 ¡Gasto registrado con éxito!");
}

function eliminarGasto(id) {
    gastosMateriaPrima = gastosMateriaPrima.filter(g => g.id !== id);
    localStorage.setItem('panGestGastos', JSON.stringify(gastosMateriaPrima));
    renderizarGastos();
    actualizarBalanceGeneral();
}

window.vaciarGastos = () => {
    if (confirm("¿Estás segura de vaciar el historial de gastos de hoy?")) {
        gastosMateriaPrima = [];
        localStorage.setItem('panGestGastos', JSON.stringify(gastosMateriaPrima));
        renderizarGastos();
        actualizarBalanceGeneral();
    }
};

function renderizarGastos() {
    const contenedor = document.getElementById("lista-gastos-historial");
    if (!contenedor) return;

    if (gastosMateriaPrima.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; color:#7f8c8d; font-style:italic; font-size:0.85rem; padding:10px 0;">No hay gastos registrados.</p>`;
        return;
    }

    let html = `<div style="max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">`;
    gastosMateriaPrima.forEach(gasto => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfbf7; border: 1px solid #ebdcc5; padding: 8px 10px; border-radius: 6px; font-size: 0.85rem;">
                <div>
                    <strong>${gasto.concepto}</strong>
                    <span style="color: #7f8c8d; font-size: 0.75rem; display: block;">${gasto.fecha}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #c0392b; font-weight: bold;">-$${gasto.valor.toLocaleString('es-CO')}</span>
                    <button onclick="eliminarGasto(${gasto.id})" style="background:none; border:none; color:#c0392b; cursor:pointer; font-weight:bold;">×</button>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    contenedor.innerHTML = html;
}

// ==========================================
// 4. PEDIDOS WEB
// ==========================================
function renderizarVentasWeb() {
    const contenedor = document.getElementById("historial-ventas-admin");
    if (!contenedor) return;

    if (ventasWeb.length === 0) {
        contenedor.innerHTML = `<p style="text-align: center; color: #7f8c8d; font-style: italic; font-size: 0.9rem; padding: 15px 0;">No hay pedidos web registrados todavía.</p>`;
        return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">`;
    ventasWeb.forEach(venta => {
        let detalle = venta.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(", ");
        html += `
            <div style="background: #fdfbf7; border: 1px solid #ebdcc5; padding: 12px; border-radius: 8px; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #7f8c8d; font-size: 0.75rem;">
                    <span>📅 ${venta.fecha}</span>
                    <strong style="color: #27ae60;">${venta.id || 'WEB'}</strong>
                </div>
                <p style="margin: 0 0 6px 0; color: #4a3319;"><strong>Cliente:</strong> ${venta.cliente?.nombre || 'General'} (${venta.cliente?.telefono || 'Sin tel'})</p>
                <p style="margin: 0 0 8px 0; color: #555;">${detalle}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #ebdcc5; padding-top: 6px;">
                    <span style="font-weight: bold; color: #2c3e50;">Total: $${venta.total.toLocaleString('es-CO')}</span>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    contenedor.innerHTML = html;
}

// ==========================================
// 5. VENTAS EN MOSTRADOR (LOCAL) Y CARRITO
// ==========================================
function renderizarBotonesVentaLocal() {
    const contenedor = document.getElementById("botones-productos-venta");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (productosMenu.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d; font-size: 0.85rem;">No hay productos en el catálogo.</p>`;
        return;
    }

    productosMenu.forEach((prod, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 1px solid #ebdcc5; border-radius: 6px; padding: 8px; cursor: pointer; transition: all 0.2s;";
        btn.innerHTML = `
            <img src="${prod.imagen}" style="width: 35px; height: 35px; border-radius: 4px; object-fit: cover; margin-bottom: 4px;" onerror="this.src='images/defecto.jpg'">
            <span style="font-size: 0.8rem; font-weight: bold; color: #4a3319; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${prod.nombre}</span>
            <span style="font-size: 0.75rem; color: #27ae60; font-weight: bold;">$${prod.precio.toLocaleString('es-CO')}</span>
        `;
        btn.onclick = () => agregarAlCarritoLocal(index);
        contenedor.appendChild(btn);
    });
}

function agregarAlCarritoLocal(indexProd) {
    if (!window.carritoVentaLocalTemp) window.carritoVentaLocalTemp = [];

    const producto = productosMenu[indexProd];
    if (!producto) return;

    const encontrado = window.carritoVentaLocalTemp.find(item => item.nombre === producto.nombre);
    if (encontrado) {
        encontrado.cantidad += 1;
    } else {
        window.carritoVentaLocalTemp.push({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    actualizarResumenVentaLocalTemp();
}

function actualizarResumenVentaLocalTemp() {
    const contenedorDetalle = document.getElementById("detalle-venta-actual");
    const contenedorTotal = document.getElementById("total-venta-actual");
    if (!contenedorDetalle || !contenedorTotal) return;

    if (!window.carritoVentaLocalTemp || window.carritoVentaLocalTemp.length === 0) {
        contenedorDetalle.innerHTML = "Ningún producto seleccionado todavía.";
        contenedorTotal.textContent = "$0";
        return;
    }

    let htmlTexto = "";
    let totalGeneral = 0;

    window.carritoVentaLocalTemp.forEach(item => {
        let subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;
        htmlTexto += `• ${item.cantidad}x ${item.nombre} ($${subtotal.toLocaleString('es-CO')})<br>`;
    });

    contenedorDetalle.innerHTML = htmlTexto;
    contenedorTotal.textContent = `$${totalGeneral.toLocaleString('es-CO')}`;
}

window.limpiarSeleccionVentaLocal = () => {
    window.carritoVentaLocalTemp = [];
    actualizarResumenVentaLocalTemp();
};

window.completarVentaLocal = () => {
    if (!window.carritoVentaLocalTemp || window.carritoVentaLocalTemp.length === 0) {
        alert("Por favor selecciona al menos un producto para la venta.");
        return;
    }

    let totalVenta = window.carritoVentaLocalTemp.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const nuevaVentaLocal = {
        id: "LOCAL-" + Date.now().toString().slice(-4),
        fecha: new Date().toLocaleDateString('es-CO'),
        hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        productos: [...window.carritoVentaLocalTemp],
        total: totalVenta
    };

    if (!window.ventasLocal) window.ventasLocal = [];
    window.ventasLocal.unshift(nuevaVentaLocal);

    try {
        localStorage.setItem('panGestVentasLocal', JSON.stringify(window.ventasLocal));
    } catch (e) {
        console.error("Error guardando ventas locales:", e);
    }

    window.carritoVentaLocalTemp = [];
    actualizarResumenVentaLocalTemp();
    renderizarVentasLocal();
    actualizarBalanceGeneral();

    alert("🛒 ¡Venta en mostrador registrada con éxito!");
};

function renderizarVentasLocal() {
    const contenedor = document.getElementById("lista-ventas-local-historial");
    if (!contenedor) return;

    if (!window.ventasLocal || window.ventasLocal.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; color:#7f8c8d; font-style:italic; font-size:0.85rem; padding:10px 0;">No hay ventas de mostrador registradas.</p>`;
        return;
    }

    let html = "";
    window.ventasLocal.forEach((venta, index) => {
        let detalleProductos = venta.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(", ");
        html += `
            <div style="background:#fdfbf7; border:1px solid #ebdcc5; border-radius:6px; padding:10px; margin-bottom:8px; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; color:#7f8c8d; font-size:0.75rem; margin-bottom:4px;">
                    <span>📅 ${venta.fecha} - ${venta.hora || ''}</span>
                    <span style="color:#27ae60; font-weight:bold;">${venta.id}</span>
                </div>
                <p style="margin:0 0 6px 0; color:#4a3319; font-weight:500;">${detalleProductos}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #ebdcc5; padding-top:6px;">
                    <button onclick="reimprimirVentaLocal(${index})" style="background:#ebdcc5; color:#4a3319; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; cursor:pointer;">
                        🖨️ Imprimir
                    </button>
                    <span style="font-weight:bold; color:#2c3e50;">Total: $${venta.total.toLocaleString('es-CO')}</span>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

window.vaciarVentasLocal = () => {
    if (confirm("¿Estás segura de vaciar el historial de ventas del mostrador?")) {
        window.ventasLocal = [];
        localStorage.setItem('panGestVentasLocal', JSON.stringify(window.ventasLocal));
        renderizarVentasLocal();
        actualizarBalanceGeneral();
    }
};

window.reimprimirVentaLocal = (index) => {
    const venta = window.ventasLocal[index];
    if (venta) {
        mostrarReciboVentaLocal(venta);
    }
};

function mostrarReciboVentaLocal(venta) {
    let ventanaImpresion = window.open('', '_blank', 'width=400,height=600');
    if (!ventanaImpresion) {
        alert("El navegador bloqueó la ventana emergente de impresión. Por favor habilítala.");
        return;
    }
    
    let contenidoHtml = `
        <html>
        <head>
            <title>Recibo de Venta - PanGest</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; width: 300px; margin: 0 auto; padding: 10px; }
                .text-center { text-align: center; }
                .ticket-header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .ticket-items { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .ticket-items th, .ticket-items td { text-align: left; padding: 4px 0; font-size: 11px; }
                .ticket-total { border-top: 1px dashed #000; padding-top: 5px; font-weight: bold; text-align: right; }
                .ticket-footer { text-align: center; margin-top: 20px; font-size: 10px; }
                .btn-imprimir { display: block; width: 100%; background: #4a3319; color: white; border: none; padding: 10px; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 15px; }
                @media print {
                    .btn-imprimir { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket-header">
                <h3 class="text-center" style="margin: 0;">🍞 PANADERÍA PANGEST 🍞</h3>
                <p class="text-center" style="margin: 2px 0;">Venta Directa en Mostrador</p>
                <p style="margin: 5px 0 0 0;"><strong>Recibo:</strong> ${venta.id}</p>
                <p style="margin: 2px 0;"><strong>Fecha:</strong> ${venta.fecha} ${venta.hora || ''}</p>
            </div>
            
            <table class="ticket-items">
                <thead>
                    <tr>
                        <th>Cant. / Producto</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
    `;

    venta.productos.forEach(item => {
        contenidoHtml += `
            <tr>
                <td>${item.cantidad}x ${item.nombre}</td>
                <td style="text-align: right;">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</td>
            </tr>
        `;
    });

    contenidoHtml += `
                </tbody>
            </table>

            <div class="ticket-total">
                <p style="margin: 0; font-size: 14px;">TOTAL: $${venta.total.toLocaleString('es-CO')}</p>
            </div>

            <div class="ticket-footer">
                <p>¡Gracias por su compra!<br>¡Vuelva pronto!</p>
            </div>

            <button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir Recibo</button>
        </body>
        </html>
    `;

    ventanaImpresion.document.write(contenidoHtml);
    ventanaImpresion.document.close();
}

// ==========================================
// ==========================================
// 6. BALANCE GENERAL Y GRÁFICAS
// ==========================================
function actualizarBalanceGeneral() {
    let totalWeb = ventasWeb.reduce((sum, v) => sum + (v.total || 0), 0);
    let totalLocal = (window.ventasLocal || []).reduce((sum, v) => sum + (v.total || 0), 0);
    let totalCombinado = totalWeb + totalLocal;

    let totalGastos = gastosMateriaPrima.reduce((sum, g) => sum + (g.valor || 0), 0);

    const elWeb = document.getElementById("admin-total-web");
    const elLocal = document.getElementById("admin-total-local");
    const elCombinado = document.getElementById("admin-total-combinado");
    const elIngresos = document.getElementById("total-ventas-admin");
    const elGastos = document.getElementById("total-gastos-admin");

    if (elWeb) elWeb.textContent = `$${totalWeb.toLocaleString('es-CO')}`;
    if (elLocal) elLocal.textContent = `$${totalLocal.toLocaleString('es-CO')}`;
    if (elCombinado) elCombinado.textContent = `$${totalCombinado.toLocaleString('es-CO')}`;
    if (elIngresos) elIngresos.textContent = `$${totalCombinado.toLocaleString('es-CO')}`;
    if (elGastos) elGastos.textContent = `$${totalGastos.toLocaleString('es-CO')}`;

    actualizarGraficaBalance(totalCombinado, totalGastos);
}

function actualizarGraficaBalance(ingresos, egresos) {
    const canvas = document.getElementById("graficaBalancePanaderia");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (graficaBalance) {
        graficaBalance.destroy();
    }

    graficaBalance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos Totales', 'Gastos / Egresos'],
            datasets: [{
                label: 'Dinero ($)',
                data: [ingresos, egresos],
                backgroundColor: ['#27ae60', '#c0392b'],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ==========================================
// 7. NOTAS DEL PANADERO
// ==========================================
function cargarNotas() {
    const textarea = document.getElementById("notas-panadero");
    if (textarea) {
        textarea.value = notasGuardadas;
    }
}

window.guardarNotas = () => {
    const textarea = document.getElementById("notas-panadero");
    if (textarea) {
        notasGuardadas = textarea.value;
        localStorage.setItem('panGestNotas', notasGuardadas);
        alert("📝 ¡Notas guardadas con éxito!");
    }
};

function actualizarInterfaz() {
    renderizarVentasLocal();
    actualizarBalanceGeneral();
}