/* =========================================================================
   LISA vigIA — Ventanas modales.
   Reemplazan a confirm() y prompt() manteniendo el estilo de la aplicación,
   el foco atrapado dentro del diálogo y el cierre con la tecla Escape.
   ========================================================================= */

import { crear, vaciar } from "../utils/dom.js";
import { icono } from "./iconos.js";

const SELECTOR_FOCALIZABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Solo existe un modal a la vez; se reutiliza el mismo nodo raíz. */
let raiz = null;
let cajaActual = null;
let elementoPrevio = null;

function obtenerRaiz() {
  if (!raiz) {
    raiz = crear("div", {
      clase: "modal",
      atributos: { role: "dialog", "aria-modal": "true", "aria-hidden": "true" },
    });

    /* Un clic sobre el velo, fuera de la caja, cierra el diálogo. */
    raiz.addEventListener("click", (evento) => {
      if (evento.target === raiz) {
        cerrarModal();
      }
    });

    document.body.appendChild(raiz);
  }
  return raiz;
}

/* Mantiene el tabulador dentro del diálogo mientras está abierto. */
function alPulsarTecla(evento) {
  if (evento.key === "Escape") {
    evento.preventDefault();
    cerrarModal();
    return;
  }

  if (evento.key !== "Tab" || !cajaActual) {
    return;
  }

  const focalizables = Array.from(cajaActual.querySelectorAll(SELECTOR_FOCALIZABLE));
  if (focalizables.length === 0) {
    return;
  }

  const primero = focalizables[0];
  const ultimo = focalizables[focalizables.length - 1];

  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

/**
 * Abre un diálogo modal.
 * @param {object} opciones
 * @param {string} opciones.titulo Título visible del diálogo.
 * @param {string} [opciones.nombreIcono] Icono mostrado junto al título.
 * @param {Node[]} opciones.cuerpo Nodos que componen el contenido.
 * @param {Node[]} [opciones.acciones] Botones del pie del diálogo.
 * @returns {HTMLElement} La caja del modal, por si hay que consultarla.
 */
export function abrirModal({ titulo, nombreIcono = "aviso", cuerpo, acciones = [] }) {
  const contenedor = obtenerRaiz();
  vaciar(contenedor);

  const idTitulo = "modal-titulo";

  const botonCerrar = crear("button", {
    clase: "modal__cerrar",
    atributos: { type: "button", "aria-label": "Cerrar ventana" },
    hijos: [icono("cerrar", { tamano: 18 })],
    eventos: { click: cerrarModal },
  });

  const cabecera = crear("header", {
    clase: "modal__cabecera",
    hijos: [
      icono(nombreIcono, { tamano: 22 }),
      crear("h2", { clase: "modal__titulo", texto: titulo, atributos: { id: idTitulo } }),
      botonCerrar,
    ],
  });

  const seccionCuerpo = crear("div", { clase: "modal__cuerpo", hijos: cuerpo });

  const caja = crear("div", {
    clase: "modal__caja",
    hijos: [
      cabecera,
      seccionCuerpo,
      acciones.length > 0 ? crear("footer", { clase: "modal__pie", hijos: acciones }) : null,
    ],
  });

  contenedor.setAttribute("aria-labelledby", idTitulo);
  contenedor.appendChild(caja);
  cajaActual = caja;
  elementoPrevio = document.activeElement;

  /* El siguiente cuadro permite que la transición CSS se aprecie. */
  window.requestAnimationFrame(() => {
    contenedor.classList.add("esta-visible");
    contenedor.setAttribute("aria-hidden", "false");

    const primero = caja.querySelector(SELECTOR_FOCALIZABLE);
    if (primero) {
      primero.focus();
    }
  });

  document.addEventListener("keydown", alPulsarTecla);
  return caja;
}

/** Cierra el diálogo abierto y devuelve el foco a su origen. */
export function cerrarModal() {
  if (!raiz) {
    return;
  }

  raiz.classList.remove("esta-visible");
  raiz.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", alPulsarTecla);
  cajaActual = null;

  if (elementoPrevio && typeof elementoPrevio.focus === "function") {
    elementoPrevio.focus();
  }
  elementoPrevio = null;
}

/**
 * Diálogo de confirmación con dos salidas, en reemplazo de confirm().
 * @param {object} opciones
 * @param {string} opciones.titulo
 * @param {string} opciones.mensaje
 * @param {string} [opciones.textoConfirmar]
 * @param {string} [opciones.textoCancelar]
 * @param {string} [opciones.estiloConfirmar] Clase modificadora del botón.
 * @param {string} [opciones.nombreIcono]
 * @param {Function} opciones.alConfirmar Se ejecuta al aceptar.
 */
export function confirmar({
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  estiloConfirmar = "boton--primario",
  nombreIcono = "aviso",
  alConfirmar,
}) {
  const botonCancelar = crear("button", {
    clase: ["boton", "boton--fantasma"],
    atributos: { type: "button" },
    texto: textoCancelar,
    eventos: { click: cerrarModal },
  });

  const botonConfirmar = crear("button", {
    clase: ["boton", estiloConfirmar],
    atributos: { type: "button" },
    texto: textoConfirmar,
    eventos: {
      click: () => {
        cerrarModal();
        alConfirmar();
      },
    },
  });

  abrirModal({
    titulo,
    nombreIcono,
    cuerpo: [crear("p", { texto: mensaje })],
    acciones: [botonCancelar, botonConfirmar],
  });
}
