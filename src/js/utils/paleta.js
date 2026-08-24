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
  /* Turquesa tomado de la onda de LISA, reservado a la serie de precisión.
     Sobre el fondo nocturno rinde de sobra (contraste 8,5), así que se usa
     el tono del logotipo sin ajustar. */
  precision: "#00e5c2",
  acento: "#9b7cff",
  violeta: "#9b7cff",
  violetaClaro: "#c4aeff",

  texto: "#eef2fb",
  textoMedio: "#a3b0cc",
  textoTenue: "#7b8cb0",

  fondo: "#0a1836",
  rejilla: "#24386b",
  trazoTenue: "#3d5490",

  /* Rellenos de nodo, más oscuros que su trazo. */
  nodoNeutro: "#1c2f5c",
  nodoBorde: "#3d5490",
  nodoVioleta: "#221a4d",
  nodoCritico: "#3d1f2e",
  nodoPrestador: "#261c56",
  nucleo: "#101f42",
  puntoPoblacion: "#2c4272",
  barraLiberados: "#1d4f52",
};

/* La paleta diurna se apoya en los colores de los logotipos: el violeta y el
   cian de la onda de LISA. Los tonos del semáforo —crítico, medio, bajo y
   correcto— quedan fuera de esa armonía porque comunican estado de riesgo. */
const DIURNA = {
  critico: "#c8322f",
  criticoFuerte: "#b3231f",
  medio: "#9a6800",
  bajo: "#2b7ea6",
  ok: "#157a56",
  /* El mismo turquesa, oscurecido para que rinda sobre fondo claro: el tono
     del logotipo daría 2,3 de contraste, y este alcanza 4,8. */
  precision: "#1e798d",
  acento: "#4a00c5",
  violeta: "#4a00c5",
  violetaClaro: "#35008c",

  texto: "#1a1633",
  textoMedio: "#4d4869",
  textoTenue: "#6a6484",

  fondo: "#ffffff",
  rejilla: "#e2ddf0",
  trazoTenue: "#b0a8cd",

  /* En tema claro los rellenos son tintes suaves del propio color. */
  nodoNeutro: "#e7e3f7",
  nodoBorde: "#aaa2c9",
  nodoVioleta: "#e8e0fa",
  nodoCritico: "#fbe9e8",
  nodoPrestador: "#e3daf8",
  nucleo: "#ffffff",
  puntoPoblacion: "#c7dcea",
  barraLiberados: "#a7d4c2",
};

/**
 * Devuelve la paleta que corresponde al tema activo.
 * @returns {object}
 */
export function paleta() {
  return esTemaClaro() ? DIURNA : NOCTURNA;
}
