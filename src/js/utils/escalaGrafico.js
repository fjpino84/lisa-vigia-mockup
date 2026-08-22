/* =========================================================================
   LISA vigIA — Orientación de los gráficos.

   En pantallas estrechas el ancho es el recurso escaso y el alto sobra. Por
   eso los gráficos no encogen su composición de escritorio —eso apretaría
   los elementos hasta solaparlos— sino que adoptan una disposición vertical
   propia: el eje del tiempo baja, las series se leen de arriba abajo y cada
   dato dispone de una franja entera para su rótulo.
   ========================================================================= */

/* Ancho por debajo del cual los gráficos adoptan su disposición vertical. */
export const ANCHO_ESTRECHO = 760;

/**
 * Indica si conviene dibujar la versión vertical del gráfico.
 * @returns {boolean}
 */
export function esPantallaEstrecha() {
  return window.innerWidth <= ANCHO_ESTRECHO;
}
