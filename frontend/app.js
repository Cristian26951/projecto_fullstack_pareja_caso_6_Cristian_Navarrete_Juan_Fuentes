const API_URL = window.MOTORTECH_API_URL || "http://127.0.0.1:8000/ordenes";

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
const imagenUrl = document.getElementById("imagen-url");
const vistaPrevia = document.getElementById("vista-previa");

document.addEventListener("DOMContentLoaded", () => {
<<<<<<< HEAD
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
=======
  obtenerOrdenes();
});

async function obtenerOrdenes() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok)
      throw new Error("Error al obtener las órdenes del servidor");

    todasLasOrdenes = await respuesta.json();
    actualizarContador();
    renderizarTarjetas();
  } catch (error) {
    console.error("Error:", error);
    contenedorTarjetas.innerHTML = `<p style="color: red;">No se pudo conectar con el servidor FastAPI. Verifica que esté encendido.</p>`;
  }
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
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

<<<<<<< HEAD
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
=======
  const ordenesFiltradas = todasLasOrdenes.filter((orden) => {
    if (filtroActual === "reparacion") return orden.reparado === false;
    if (filtroActual === "listos") return orden.reparado === true;
    return true;
  });

  if (ordenesFiltradas.length === 0) {
    contenedorTarjetas.innerHTML = `<p style="color: #6b7280;">No hay vehículos registrados en esta sección.</p>`;
    return;
  }

  ordenesFiltradas.forEach((orden) => {
    const idOrden = orden.id || orden._id;

    const card = document.createElement("article");
    card.className = `card ${orden.reparado ? "reparado" : ""}`;

    card.innerHTML = `
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
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
<<<<<<< HEAD
                <button type="button" class="btn-action ${orden.reparado ? "btn-toggle-pendiente" : "btn-toggle-listo"}"
                        data-action="toggle" data-id="${escapeHtml(idOrden)}" data-state="${!orden.reparado}">
                    <i class="fa-solid ${orden.reparado ? "fa-rotate-left" : "fa-check"}"></i>
                    ${orden.reparado ? "Reabrir" : "Marcar Listo"}
                </button>
                <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${escapeHtml(idOrden)}" aria-label="Eliminar orden">
=======
                <button class="btn-action ${orden.reparado ? "btn-toggle-pendiente" : "btn-toggle-listo"}"
                        onclick="cambiarEstado('${idOrden}', ${!orden.reparado})">
                    <i class="fa-solid ${orden.reparado ? "fa-rotate-left" : "fa-check"}"></i>
                    ${orden.reparado ? "Reabrir" : "Marcar Listo"}
                </button>

                <button class="btn-action btn-delete" onclick="eliminarOrden('${idOrden}')">
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

    contenedorTarjetas.appendChild(card);
  });
}

formOrden.addEventListener("submit", async (e) => {
  e.preventDefault();

<<<<<<< HEAD
    const nuevaOrden = {
        placa: document.getElementById("placa").value.trim().toUpperCase(),
        vehiculo_modelo: document.getElementById("vehiculo_modelo").value.trim(),
        falla_reportada: document.getElementById("falla_reportada").value.trim(),
        reparado: false,
        imagen_url: imagenUrl.value.trim()
    };
=======
  const nuevaOrden = {
    placa: document.getElementById("placa").value.trim().toUpperCase(),
    vehiculo_modelo: document.getElementById("vehiculo_modelo").value.trim(),
    falla_reportada: document.getElementById("falla_reportada").value.trim(),
    reparado: false,
  };
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247

  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaOrden),
    });

    if (!respuesta.ok) throw new Error("Error al guardar la orden");

<<<<<<< HEAD
        bloquearFormulario();
        await obtenerOrdenes();
    } catch (error) {
        console.error("Error al crear:", error);
        alert("Hubo un problema al registrar la orden.");
    }
=======
    formOrden.reset();
    await obtenerOrdenes();
  } catch (error) {
    console.error("Error al crear:", error);
    alert("Hubo un problema al registrar la orden.");
  }
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
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
  const ordenActual = todasLasOrdenes.find((o) => (o.id || o._id) === id);
  if (!ordenActual) return;

<<<<<<< HEAD
    const datosActualizados = {
        placa: ordenActual.placa,
        vehiculo_modelo: ordenActual.vehiculo_modelo,
        falla_reportada: ordenActual.falla_reportada,
        reparado: nuevoEstado,
        imagen_url: ordenActual.imagen_url
    };
=======
  const datosActualizados = {
    placa: ordenActual.placa,
    vehiculo_modelo: ordenActual.vehiculo_modelo,
    falla_reportada: ordenActual.falla_reportada,
    reparado: nuevoEstado,
  };
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
    });

<<<<<<< HEAD
        if (!respuesta.ok) throw new Error("Error al actualizar estado");
        await obtenerOrdenes();
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("No se pudo actualizar el estado del vehículo.");
    }
=======
    if (!respuesta.ok) throw new Error("Error al actualizar estado");

    await obtenerOrdenes();
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("No se pudo actualizar el estado del vehículo.");
  }
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
}

async function eliminarOrden(id) {
  if (!confirm("¿Seguro que deseas eliminar esta orden del taller?")) return;

<<<<<<< HEAD
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

imagenUrl.addEventListener("input", () => {
    if (imagenUrl.value.trim()) {
        vistaPrevia.src = imagenUrl.value.trim();
        vistaPrevia.classList.add("visible");
    } else {
        vistaPrevia.removeAttribute("src");
        vistaPrevia.classList.remove("visible");
    }
});

vistaPrevia.addEventListener("error", () => {
    vistaPrevia.src = "https://via.placeholder.com/300x180?text=Sin+Imagen";
=======
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!respuesta.ok) throw new Error("Error al eliminar");

    await obtenerOrdenes();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar la orden.");
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    filtroActual = btn.getAttribute("data-filter");

    if (filtroActual === "todos")
      tituloVista.textContent = "Órdenes en Taller (Todas)";
    if (filtroActual === "reparacion")
      tituloVista.textContent = "Vehículos en Reparación";
    if (filtroActual === "listos")
      tituloVista.textContent = "Vehículos Listos para Entrega";

    renderizarTarjetas();
  });
});

document.getElementById("btn-focus-form").addEventListener("click", () => {
  document.getElementById("placa").focus();
>>>>>>> 30122adaf5b8a3ba11b911f4ac20bfcff1fdc247
});

function actualizarContador() {
  const total = todasLasOrdenes.length;
  contadorOrdenes.textContent = `${total} ${total === 1 ? "Orden" : "Órdenes"}`;
}
