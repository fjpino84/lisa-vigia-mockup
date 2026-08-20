/* =========================================================================
   LISA vigIA — Iconografía SVG dibujada en línea.
   Se evita cualquier librería externa: cada icono es un conjunto de trazos
   sobre una caja de 24×24 que hereda el color del texto.
   ========================================================================= */

import { crearSVG } from "../utils/dom.js";

/* Definiciones de trazo por icono. Cada entrada lista sus formas. */
const TRAZOS = {
  panel: [
    { forma: "rect", atributos: { x: 3, y: 3, width: 7, height: 7, rx: 1.5 } },
    { forma: "rect", atributos: { x: 14, y: 3, width: 7, height: 7, rx: 1.5 } },
    { forma: "rect", atributos: { x: 3, y: 14, width: 7, height: 7, rx: 1.5 } },
    { forma: "rect", atributos: { x: 14, y: 14, width: 7, height: 7, rx: 1.5 } },
  ],
  carpeta: [
    { forma: "rect", atributos: { x: 3, y: 5, width: 18, height: 15, rx: 2 } },
    { forma: "path", atributos: { d: "M3 9h18" } },
    { forma: "circle", atributos: { cx: 9, cy: 14.5, r: 2 } },
    { forma: "path", atributos: { d: "M13 13h5M13 16.5h5" } },
  ],
  red: [
    { forma: "circle", atributos: { cx: 12, cy: 5, r: 2.2 } },
    { forma: "circle", atributos: { cx: 5, cy: 18, r: 2.2 } },
    { forma: "circle", atributos: { cx: 19, cy: 18, r: 2.2 } },
    { forma: "path", atributos: { d: "M10.5 6.8 6.3 16M13.5 6.8 17.7 16M7.2 18h9.6" } },
  ],
  forense: [
    { forma: "rect", atributos: { x: 3, y: 4, width: 18, height: 16, rx: 2 } },
    { forma: "path", atributos: { d: "M10 9.5v5l4.5-2.5z" } },
  ],
  archivo: [
    { forma: "rect", atributos: { x: 3, y: 4, width: 18, height: 16, rx: 2 } },
    { forma: "path", atributos: { d: "M3 9h18M8 13h8M8 16.5h5" } },
  ],
  documento: [
    { forma: "path", atributos: { d: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" } },
    { forma: "path", atributos: { d: "M14 3v5h5M9 13h6M9 16.5h6" } },
  ],
  martillo: [
    { forma: "path", atributos: { d: "M3.5 20.5h8M5 17l7-7M9.5 6.5l5.5 5.5M12.5 3.5 20.5 11.5M8 3 5 6M19 13l-3 3" } },
  ],
  lista: [
    { forma: "rect", atributos: { x: 4, y: 3, width: 16, height: 18, rx: 2 } },
    { forma: "path", atributos: { d: "M8 8h8M8 12h8M8 16h5" } },
  ],
  alerta: [
    { forma: "path", atributos: { d: "M10.3 3.9 2.6 17.4a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" } },
    { forma: "path", atributos: { d: "M12 9v4.5" } },
    { forma: "circle", atributos: { cx: 12, cy: 17, r: 0.9, fill: "currentColor", stroke: "none" } },
  ],
  aviso: [
    { forma: "circle", atributos: { cx: 12, cy: 12, r: 9 } },
    { forma: "path", atributos: { d: "M12 7.5V13" } },
    { forma: "circle", atributos: { cx: 12, cy: 16.4, r: 0.9, fill: "currentColor", stroke: "none" } },
  ],
  tendencia: [
    { forma: "path", atributos: { d: "M3 17l6-6 4 4 8-8" } },
    { forma: "path", atributos: { d: "M15 7h6v6" } },
  ],
  grafico: [
    { forma: "path", atributos: { d: "M4 20V10M9.5 20V4M15 20v-7M20.5 20V7" } },
  ],
  lupa: [
    { forma: "circle", atributos: { cx: 11, cy: 11, r: 6.5 } },
    { forma: "path", atributos: { d: "m20 20-4.4-4.4" } },
  ],
  campana: [
    { forma: "path", atributos: { d: "M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z" } },
    { forma: "path", atributos: { d: "M13.7 19.5a2 2 0 0 1-3.4 0" } },
  ],
  ayuda: [
    { forma: "circle", atributos: { cx: 12, cy: 12, r: 9 } },
    { forma: "path", atributos: { d: "M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4" } },
    { forma: "circle", atributos: { cx: 12, cy: 16.6, r: 0.9, fill: "currentColor", stroke: "none" } },
  ],
  ajustes: [
    { forma: "circle", atributos: { cx: 12, cy: 12, r: 3 } },
    { forma: "path", atributos: { d: "M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V2.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" } },
  ],
  cerrar: [{ forma: "path", atributos: { d: "M6 6l12 12M18 6 6 18" } }],
  menu: [{ forma: "path", atributos: { d: "M4 7h16M4 12h16M4 17h16" } }],
  flechaIzquierda: [{ forma: "path", atributos: { d: "M19 12H5M11 6l-6 6 6 6" } }],
  flechaDerecha: [{ forma: "path", atributos: { d: "M5 12h14M13 6l6 6-6 6" } }],
  mas: [{ forma: "path", atributos: { d: "M12 5v14M5 12h14" } }],
  imprimir: [
    { forma: "path", atributos: { d: "M7 8V3h10v5" } },
    { forma: "rect", atributos: { x: 3, y: 8, width: 18, height: 8, rx: 2 } },
    { forma: "path", atributos: { d: "M7 14h10v7H7z" } },
  ],
  correo: [
    { forma: "rect", atributos: { x: 3, y: 5, width: 18, height: 14, rx: 2 } },
    { forma: "path", atributos: { d: "m3.5 6.5 8.5 6 8.5-6" } },
  ],
  visto: [
    { forma: "circle", atributos: { cx: 12, cy: 12, r: 9 } },
    { forma: "path", atributos: { d: "m8 12.2 2.7 2.8L16 9.5" } },
  ],
  escudo: [
    { forma: "path", atributos: { d: "M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z" } },
    { forma: "path", atributos: { d: "m9 12 2.2 2.2L15.5 10" } },
  ],
  huella: [
    { forma: "rect", atributos: { x: 4, y: 3, width: 16, height: 18, rx: 2 } },
    { forma: "path", atributos: { d: "M8.5 8.5h7M8.5 12h7M8.5 15.5h4" } },
  ],
  salir: [
    { forma: "path", atributos: { d: "M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" } },
    { forma: "path", atributos: { d: "M16 8l4 4-4 4M20 12H9" } },
  ],
  usuario: [
    { forma: "circle", atributos: { cx: 12, cy: 8, r: 3.5 } },
    { forma: "path", atributos: { d: "M5 20a7 7 0 0 1 14 0" } },
  ],
  reloj: [
    { forma: "circle", atributos: { cx: 12, cy: 12, r: 9 } },
    { forma: "path", atributos: { d: "M12 7v5.3l3.4 2" } },
  ],
};

/**
 * Construye un icono SVG por su nombre.
 * @param {string} nombre Clave dentro del catálogo de trazos.
 * @param {object} [opciones]
 * @param {number} [opciones.tamano] Lado del icono en píxeles.
 * @param {string} [opciones.clase] Clase adicional para el SVG.
 * @returns {SVGElement}
 */
export function icono(nombre, opciones = {}) {
  const { tamano = 20, clase } = opciones;
  const definicion = TRAZOS[nombre] ?? TRAZOS.aviso;

  const svg = crearSVG("svg", {
    clase: ["icono", clase],
    atributos: {
      width: tamano,
      height: tamano,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
    },
  });

  definicion.forEach(({ forma, atributos }) => {
    svg.appendChild(crearSVG(forma, { atributos }));
  });

  return svg;
}
