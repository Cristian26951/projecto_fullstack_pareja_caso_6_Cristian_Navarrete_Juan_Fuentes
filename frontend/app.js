const API_URL = "http://127.0.0.1:8000/ordenes";

let todasLasOrdenes = [];
let filtroActual = "todos";

const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
const contadorOrdenes = document.getElementById("contador-ordenes");
const formOrden = document.getElementById("form-orden");
const tituloVista = document.getElementById("titulo-vista");
const navButtons = document.querySelectorAll(".nav-btn[data-filter]");

document.addEventListener("DOMContentLoaded", () => {
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
}

function renderizarTarjetas() {
  contenedorTarjetas.innerHTML = "";

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
            <div class="card-header">
                <span class="placa-badge">${orden.placa.toUpperCase()}</span>
                <span class="status-badge ${orden.reparado ? "status-listo" : "status-pendiente"}">
                    ${orden.reparado ? "Listo para Entrega" : "En Reparación"}
                </span>
            </div>

            <div class="card-body">
                <h3><i class="fa-solid fa-car"></i> ${orden.vehiculo_modelo}</h3>
                <p><strong>Falla:</strong> ${orden.falla_reportada}</p>
            </div>

            <div class="card-actions">
                <button class="btn-action ${orden.reparado ? "btn-toggle-pendiente" : "btn-toggle-listo"}"
                        onclick="cambiarEstado('${idOrden}', ${!orden.reparado})">
                    <i class="fa-solid ${orden.reparado ? "fa-rotate-left" : "fa-check"}"></i>
                    ${orden.reparado ? "Reabrir" : "Marcar Listo"}
                </button>

                <button class="btn-action btn-delete" onclick="eliminarOrden('${idOrden}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

    contenedorTarjetas.appendChild(card);
  });
}

formOrden.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevaOrden = {
    placa: document.getElementById("placa").value.trim().toUpperCase(),
    vehiculo_modelo: document.getElementById("vehiculo_modelo").value.trim(),
    falla_reportada: document.getElementById("falla_reportada").value.trim(),
    reparado: false,
  };

  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaOrden),
    });

    if (!respuesta.ok) throw new Error("Error al guardar la orden");

    formOrden.reset();
    await obtenerOrdenes();
  } catch (error) {
    console.error("Error al crear:", error);
    alert("Hubo un problema al registrar la orden.");
  }
});

async function cambiarEstado(id, nuevoEstado) {
  const ordenActual = todasLasOrdenes.find((o) => (o.id || o._id) === id);
  if (!ordenActual) return;

  const datosActualizados = {
    placa: ordenActual.placa,
    vehiculo_modelo: ordenActual.vehiculo_modelo,
    falla_reportada: ordenActual.falla_reportada,
    reparado: nuevoEstado,
  };

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
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
});

function actualizarContador() {
  const total = todasLasOrdenes.length;
  contadorOrdenes.textContent = `${total} ${total === 1 ? "Orden" : "Órdenes"}`;
}
