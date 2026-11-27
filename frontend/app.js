const API_URL = window.MOTORTECH_API_URL || "https://projecto-fullstack-pareja-caso-6.onrender.com/ordenes";

let todasLasOrdenes = [];
let filtroActual = "todos";

const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
const contadorOrdenes = document.getElementById("contador-ordenes");
const formOrden = document.getElementById("form-orden");
const tituloVista = document.getElementById("titulo-vista");
const navButtons = document.querySelectorAll(".nav-btn[data-filter]");
const seccionFormulario = document.getElementById("seccion-formulario");
const seccionTarjetas = document.querySelector(".cards-section");
const mainContainer = document.querySelector(".main-container");
const imagenArchivo = document.getElementById("imagen-archivo");
const vistaPrevia = document.getElementById("vista-previa");
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
let vistaPreviaUrl = null;

document.addEventListener("DOMContentLoaded", () => {
    bloquearFormulario();
    obtenerOrdenes();
});

async function obtenerOrdenes() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error al obtener las órdenes del servidor");

        todasLasOrdenes = await respuesta.json();
        actualizarContador();
        renderizarTarjetas();
    } catch (error) {
        console.error("Error:", error);
        contenedorTarjetas.innerHTML = `<p style="color: red;">No se pudo conectar con el servidor FastAPI. Verifica la URL de la API.</p>`;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderizarTarjetas() {
    contenedorTarjetas.innerHTML = "";

    const ordenesFiltradas = todasLasOrdenes.filter(orden => {
        if (filtroActual === "reparacion") return orden.reparado === false;
        if (filtroActual === "listos") return orden.reparado === true;
        return true;
    });

    if (ordenesFiltradas.length === 0) {
        contenedorTarjetas.innerHTML = `<p class="empty-message">No hay vehículos registrados en esta sección.</p>`;
        return;
    }

    ordenesFiltradas.forEach(orden => {
        const idOrden = orden._id || orden.id;
        const card = document.createElement("article");
        card.className = `card ${orden.reparado ? "reparado" : ""}`;
        const imagen = orden.imagen_url || "https://via.placeholder.com/300x180?text=Vehiculo";

        card.innerHTML = `
            <img class="card-image" src="${escapeHtml(imagen)}"
                 alt="${escapeHtml(orden.vehiculo_modelo)}"
                 onerror="this.src='https://via.placeholder.com/300x180?text=Sin+Imagen'">
            <div class="card-header">
                <span class="placa-badge">${escapeHtml(String(orden.placa).toUpperCase())}</span>
                <span class="status-badge ${orden.reparado ? "status-listo" : "status-pendiente"}">
                    ${orden.reparado ? "Listo para Entrega" : "En Reparación"}
                </span>
            </div>
            <div class="card-body">
                <h3><i class="fa-solid fa-car"></i> ${escapeHtml(orden.vehiculo_modelo)}</h3>
                <p><strong>Falla:</strong> ${escapeHtml(orden.falla_reportada)}</p>
            </div>
            <div class="card-actions">
                <button type="button" class="btn-action ${orden.reparado ? "btn-toggle-pendiente" : "btn-toggle-listo"}"
                        data-action="toggle" data-id="${escapeHtml(idOrden)}" data-state="${!orden.reparado}">
                    <i class="fa-solid ${orden.reparado ? "fa-rotate-left" : "fa-check"}"></i>
                    ${orden.reparado ? "Reabrir" : "Marcar Listo"}
                </button>
                <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${escapeHtml(idOrden)}" aria-label="Eliminar orden">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        contenedorTarjetas.appendChild(card);
    });
}

formOrden.addEventListener("submit", async (e) => {
    e.preventDefault();

    const archivoImagen = imagenArchivo.files[0];
    if (!archivoImagen) {
        alert("Selecciona una imagen del vehículo.");
        return;
    }

    const nuevaOrden = {
        placa: document.getElementById("placa").value.trim().toUpperCase(),
        vehiculo_modelo: document.getElementById("vehiculo_modelo").value.trim(),
        falla_reportada: document.getElementById("falla_reportada").value.trim(),
        reparado: false,
    };

    try {
        nuevaOrden.imagen_url = await leerArchivoComoDataUrl(archivoImagen);
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaOrden)
        });

        if (!respuesta.ok) throw new Error("Error al guardar la orden");

        bloquearFormulario();
        await obtenerOrdenes();
    } catch (error) {
        console.error("Error al crear:", error);
        alert(error.message || "Hubo un problema al registrar la orden.");
    }
});

contenedorTarjetas.addEventListener("click", async (e) => {
    const boton = e.target.closest("button[data-action]");
    if (!boton) return;

    if (boton.dataset.action === "toggle") {
        await cambiarEstado(boton.dataset.id, boton.dataset.state === "true");
    } else if (boton.dataset.action === "delete") {
        await eliminarOrden(boton.dataset.id);
    }
});

async function cambiarEstado(id, nuevoEstado) {
    const ordenActual = todasLasOrdenes.find(o => (o._id || o.id) === id);
    if (!ordenActual) return;

    const datosActualizados = {
        reparado: nuevoEstado
    };

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (!respuesta.ok) throw new Error("Error al actualizar estado");
        await obtenerOrdenes();
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("No se pudo actualizar el estado del vehículo.");
    }
}

async function eliminarOrden(id) {
    if (!confirm("¿Seguro que deseas eliminar esta orden del taller?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!respuesta.ok) throw new Error("Error al eliminar");
        await obtenerOrdenes();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar la orden.");
    }
}

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        bloquearFormulario();
        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filtroActual = btn.dataset.filter;

        if (filtroActual === "todos") tituloVista.textContent = "Órdenes en Taller (Todas)";
        if (filtroActual === "reparacion") tituloVista.textContent = "Vehículos en Reparación";
        if (filtroActual === "listos") tituloVista.textContent = "Vehículos Listos para Entrega";
        renderizarTarjetas();
    });
});

document.getElementById("btn-focus-form").addEventListener("click", abrirFormulario);
document.getElementById("btn-cancelar").addEventListener("click", bloquearFormulario);

function abrirFormulario() {
    seccionFormulario.classList.remove("oculto");
    seccionFormulario.setAttribute("aria-hidden", "false");
    seccionTarjetas.classList.add("oculto");
    mainContainer.classList.add("modo-registro");

    seccionFormulario.querySelectorAll("input, textarea, button").forEach(campo => {
        campo.disabled = false;
    });
    document.getElementById("placa").focus();
}

function bloquearFormulario() {
    formOrden.reset();
    if (vistaPreviaUrl) {
        URL.revokeObjectURL(vistaPreviaUrl);
        vistaPreviaUrl = null;
    }
    vistaPrevia.classList.remove("visible");
    vistaPrevia.removeAttribute("src");
    seccionFormulario.querySelectorAll("input, textarea, button").forEach(campo => {
        campo.disabled = true;
    });
    seccionFormulario.classList.add("oculto");
    seccionFormulario.setAttribute("aria-hidden", "true");
    seccionTarjetas.classList.remove("oculto");
    mainContainer.classList.remove("modo-registro");
}

imagenArchivo.addEventListener("change", () => {
    if (vistaPreviaUrl) {
        URL.revokeObjectURL(vistaPreviaUrl);
        vistaPreviaUrl = null;
    }
    vistaPrevia.classList.remove("visible");
    vistaPrevia.removeAttribute("src");

    const archivo = imagenArchivo.files[0];
    if (!archivo) return;

    if (!ALLOWED_IMAGE_TYPES.has(archivo.type)) {
        imagenArchivo.value = "";
        alert("Elige una imagen JPG, PNG, WebP o GIF.");
        return;
    }
    if (archivo.size > MAX_IMAGE_SIZE_BYTES) {
        imagenArchivo.value = "";
        alert("La imagen debe pesar 4 MB o menos.");
        return;
    }

    vistaPreviaUrl = URL.createObjectURL(archivo);
    vistaPrevia.src = vistaPreviaUrl;
    vistaPrevia.classList.add("visible");
});

function leerArchivoComoDataUrl(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.addEventListener("load", () => {
            if (typeof lector.result === "string") {
                resolve(lector.result);
            } else {
                reject(new Error("No se pudo leer la imagen seleccionada."));
            }
        });
        lector.addEventListener("error", () => {
            reject(lector.error || new Error("No se pudo leer la imagen seleccionada."));
        });
        lector.readAsDataURL(archivo);
    });
}

function actualizarContador() {
    const total = todasLasOrdenes.length;
    contadorOrdenes.textContent = `${total} ${total === 1 ? "Orden" : "Órdenes"}`;
}