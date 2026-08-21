/* =========================================================================
   LISA vigIA — Paleta para los gráficos.
   Los SVG fijan sus colores en atributos, que no siguen a las variables CSS.
   Este módulo entrega los valores del tema activo para que los gráficos se
   dibujen coherentes con el resto de la interfaz.
   ========================================================================= */

import { esTemaClaro } from "./tema.js";

const NOCTURNA = {
  critico: "#f2857f",
  criticoFuerte: "#e5484d",
  medio: "#e5b567",
  bajo: "#6ea8d8",
  ok: "#5fc9a0",
  acento: "#c3cbf0",
  violeta: "#7c6ce0",
  violetaClaro: "#b9aef5",

  texto: "#f2f2f5",
  textoMedio: "#a0a0ae",
  textoTenue: "#6e6e7c",

  fondo: "#0a0a0c",
  rejilla: "#26262e",
  trazoTenue: "#3a3a46",

  /* Rellenos de nodo, más oscuros que su trazo. */
  nodoNeutro: "#2a2a34",
  nodoBorde: "#4a4a58",
  nodoVioleta: "#1d1b2e",
  nodoCritico: "#3a1f22",
  nodoPrestador: "#241f3d",
  nucleo: "#16161c",
  puntoPoblacion: "#3d4a5c",
  barraLiberados: "#2f4f45",
};

const DIURNA = {
  critico: "#c8322f",
  criticoFuerte: "#b3231f",
  medio: "#9a6800",
  bajo: "#2b6ea8",
  ok: "#157a56",
  acento: "#3d3f8f",
  violeta: "#5b4bc4",
  violetaClaro: "#3d3092",

  texto: "#14161d",
  textoMedio: "#4d5364",
  textoTenue: "#757c8f",

  fondo: "#ffffff",
  rejilla: "#e2e5ee",
  trazoTenue: "#b3b9c9",

  /* En tema claro los rellenos son tintes suaves del propio color. */
  nodoNeutro: "#e6e9f1",
  nodoBorde: "#a8afc2",
  nodoVioleta: "#ebe8fa",
  nodoCritico: "#fbe9e8",
  nodoPrestador: "#e8e4fa",
  nucleo: "#ffffff",
  puntoPoblacion: "#cddced",
  barraLiberados: "#a7d4c2",
};

/**
 * Devuelve la paleta que corresponde al tema activo.
 * @returns {object}
 */
export function paleta() {
  return esTemaClaro() ? DIURNA : NOCTURNA;
}
