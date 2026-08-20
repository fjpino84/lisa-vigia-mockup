/* =========================================================================
   LISA vigIA — Vista de secciones aún no desarrolladas en el prototipo.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { icono } from "../components/iconos.js";

/**
 * Construye una vista informativa para una sección pendiente.
 * @param {object} opciones
 * @param {string} opciones.titulo Nombre de la sección.
 * @param {string} opciones.descripcion Qué ofrecerá la sección.
 * @param {string} opciones.nombreIcono Icono representativo.
 * @param {Function} opciones.alVolver Regresa al panel inicial.
 * @returns {HTMLElement}
 */
export function crearVistaEnConstruccion({ titulo, descripcion, nombreIcono, alVolver }) {
  const panel = crear("section", {
    clase: "panel",
    hijos: [
      crear("div", {
        clase: "estado-vacio",
        hijos: [
          crear("div", {
            atributos: { style: "color:var(--color-texto-tenue);margin-bottom:1.6rem" },
            hijos: [icono(nombreIcono, { tamano: 48 })],
          }),
          crear("p", {
            atributos: { style: "font-size:1.6rem;color:var(--color-texto)" },
            texto: "Sección en desarrollo",
          }),
          crear("p", {
            atributos: { style: "margin-top:0.8rem;max-width:52rem;margin-inline:auto" },
            texto: descripcion,
          }),
          crear("button", {
            clase: ["boton", "boton--primario"],
            atributos: { type: "button", style: "margin-top:2.4rem" },
            texto: "Volver al centro de mando",
            eventos: { click: alVolver },
          }),
        ],
      }),
    ],
  });

  return crear("div", {
    clase: "vista",
    hijos: [
      crear("header", {
        clase: "vista__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h1", { clase: "vista__titulo", texto: titulo }),
              crear("p", {
                clase: "vista__subtitulo",
                texto: "Este módulo no forma parte del alcance del prototipo.",
              }),
            ],
          }),
        ],
      }),
      panel,
    ],
  });
}
