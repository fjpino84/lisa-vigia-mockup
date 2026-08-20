/* =========================================================================
   LISA vigIA — Avisos flotantes.
   Sustituyen por completo a alert(): el feedback siempre ocurre en el DOM
   y con el mismo lenguaje visual del resto de la interfaz.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { icono } from "./iconos.js";

const DURACION = 4200;

/* Contenedor único, creado la primera vez que se emite un aviso. */
let contenedor = null;

function obtenerContenedor() {
  if (!contenedor) {
    contenedor = crear("div", {
      clase: "avisos",
      atributos: { role: "status", "aria-live": "polite" },
    });
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

/**
 * Muestra un aviso temporal en la esquina inferior derecha.
 * @param {object} opciones
 * @param {string} opciones.titulo Encabezado breve del aviso.
 * @param {string} [opciones.texto] Detalle complementario.
 * @param {"info"|"exito"|"alerta"} [opciones.tipo] Estilo del aviso.
 */
export function mostrarAviso({ titulo, texto = "", tipo = "info" }) {
  const nombreIcono = tipo === "exito" ? "visto" : tipo === "alerta" ? "alerta" : "aviso";

  const cuerpo = crear("div", {
    hijos: [
      crear("p", { clase: "aviso__titulo", texto: titulo }),
      texto ? crear("p", { clase: "aviso__texto", texto }) : null,
    ],
  });

  const aviso = crear("div", {
    clase: ["aviso", tipo !== "info" ? `aviso--${tipo}` : null],
    hijos: [icono(nombreIcono, { tamano: 18, clase: "aviso__icono" }), cuerpo],
  });

  obtenerContenedor().appendChild(aviso);

  window.setTimeout(() => {
    aviso.remove();
  }, DURACION);
}
