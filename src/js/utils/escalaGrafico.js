/* =========================================================================
   LISA vigIA — Escalado tipográfico de los gráficos.

   Los SVG se dibujan sobre un lienzo de tamaño fijo y el navegador los
   ajusta al ancho disponible. En pantallas estrechas esa reducción encoge
   también los textos, que quedan por debajo del umbral legible.

   Este módulo devuelve un factor que compensa la reducción: multiplica los
   tamaños declarados en el lienzo para que su medida real en pantalla se
   mantenga estable, sea cual sea el ancho del dispositivo.
   ========================================================================= */

/* Ancho por debajo del cual los gráficos adoptan su versión compacta. */
export const ANCHO_ESTRECHO = 760;

/* Espacio que consumen la barra lateral y los rellenos del panel; se resta
   del ancho de ventana para estimar el que recibe realmente el lienzo. */
const CROMO_ESCRITORIO = 118;
const CROMO_MOVIL = 100;

/** Indica si la ventana está por debajo del umbral compacto. */
export function esPantallaEstrecha() {
  return window.innerWidth <= ANCHO_ESTRECHO;
}

/**
 * Factor de corrección tipográfica para un lienzo dado.
 * @param {number} anchoLienzo Ancho del viewBox, en unidades de usuario.
 * @returns {number} Multiplicador para los tamaños de fuente y separaciones.
 */
export function factorEscala(anchoLienzo) {
  const cromo = window.innerWidth <= 620 ? CROMO_MOVIL : CROMO_ESCRITORIO;
  const anchoDisponible = Math.max(window.innerWidth - cromo, 240);
  const razon = anchoDisponible / anchoLienzo;

  /* Solo se corrige a la baja: cuando el lienzo se muestra más grande que
     su tamaño nominal, los textos ya son legibles y no conviene inflarlos.
     El tope evita factores desmedidos en pantallas muy pequeñas. */
  return Math.min(Math.max(1 / razon, 1), 3.2);
}

/**
 * Construye la función que escala medidas dentro de un gráfico.
 * @param {number} anchoLienzo
 * @returns {(base: number) => number}
 */
export function escaladorDe(anchoLienzo) {
  const factor = factorEscala(anchoLienzo);
  return (base) => +(base * factor).toFixed(1);
}
