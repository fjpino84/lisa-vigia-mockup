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
  precision: "#4fbab9",
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
