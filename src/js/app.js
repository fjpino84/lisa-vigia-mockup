/* =========================================================================
   LISA vigIA — Punto de entrada.
   Monta el armazón, resuelve la navegación entre vistas y mantiene el
   estado mínimo del prototipo (sección activa y caso en revisión).
   ========================================================================= */

import { reemplazar } from "./utils/dom.js";
import { obtenerCaso } from "./data/casos.js";
import { crearArmazon } from "./components/layout.js";
import { mostrarAviso } from "./components/avisos.js";
import { crearVistaDashboard } from "./views/dashboard.js";
import { crearVistaRegistro } from "./views/registro.js";
import { crearVistaReporte } from "./views/reporte.js";
import { crearVistaEnConstruccion } from "./views/enConstruccion.js";

/* Descripción de las secciones que aún no tienen desarrollo propio. */
const SECCIONES_PENDIENTES = {
  red: {
    titulo: "Análisis de red",
    nombreIcono: "red",
    descripcion:
      "Reunirá los grafos de relación entre beneficiarios, prestadores y siniestros de toda la cartera. En el prototipo puede consultar la red de coalición dentro del reporte de un caso crítico.",
  },
  forense: {
    titulo: "Herramientas forenses",
    nombreIcono: "forense",
    descripcion:
      "Agrupará el laboratorio de peritaje documental: comparación de plantillas, verificación de timbres y análisis de metadatos por lotes.",
  },
  archivo: {
    titulo: "Inteligencia archivada",
    nombreIcono: "archivo",
    descripcion:
      "Contendrá el historial de casos resueltos y los patrones de fraude confirmados que alimentan el modelo de scoring.",
  },
};

/* Estado del prototipo. */
const estado = {
  seccion: "panel",
  idCaso: null,
  busqueda: "",
};

/* Referencias creadas al montar el armazón. */
let armazon = null;

/** Navega a una sección de la barra lateral. */
function navegar(seccion) {
  estado.seccion = seccion;
  estado.idCaso = null;
  dibujar();
}

/** Abre el reporte de un caso concreto. */
function abrirCaso(id) {
  const caso = obtenerCaso(id);

  if (!caso) {
    mostrarAviso({
      tipo: "alerta",
      titulo: "Caso no encontrado",
      texto: `No existe un expediente con el identificador ${id}.`,
    });
    return;
  }

  estado.seccion = "casos";
  estado.idCaso = id;
  dibujar();
}

/** Vuelve al panel inicial desde cualquier vista. */
function volverAlPanel() {
  navegar("panel");
}

/** Aplica la búsqueda de la cabecera sobre el registro de casos. */
function buscar(texto) {
  if (texto === "") {
    mostrarAviso({ titulo: "Búsqueda", texto: "Escriba un nombre, RUT o número de caso." });
    return;
  }

  estado.busqueda = texto;
  estado.seccion = "casos";
  estado.idCaso = null;
  dibujar();
}

/** Construye la vista que corresponde al estado actual. */
function resolverVista() {
  if (estado.idCaso) {
    return crearVistaReporte({
      caso: obtenerCaso(estado.idCaso),
      alVolver: volverAlPanel,
      alAbrirCaso: abrirCaso,
    });
  }

  if (estado.seccion === "casos") {
    return crearVistaRegistro({ alAbrirCaso: abrirCaso, busqueda: estado.busqueda });
  }

  const pendiente = SECCIONES_PENDIENTES[estado.seccion];

  if (pendiente) {
    return crearVistaEnConstruccion({ ...pendiente, alVolver: volverAlPanel });
  }

  return crearVistaDashboard({ alAbrirCaso: abrirCaso });
}

/** Vuelca la vista activa en el contenedor principal. */
function dibujar() {
  reemplazar(armazon.contenedorVista, resolverVista());
  armazon.marcarSeccion(estado.seccion);

  /* Cada cambio de vista empieza desde el inicio del documento. */
  window.scrollTo({ top: 0, behavior: "auto" });
}

/** Arranca la aplicación. */
function iniciar() {
  armazon = crearArmazon({ alNavegar: navegar, alBuscar: buscar });

  document.body.appendChild(armazon.app);
  document.body.appendChild(armazon.velo);

  dibujar();
}

iniciar();
