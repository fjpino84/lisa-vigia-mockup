/* =========================================================================
   LISA vigIA — Formato de cifras y fechas en convención chilena.
   ========================================================================= */

const formateadorMoneda = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formateadorNumero = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

/**
 * Formatea un monto como moneda chilena, por ejemplo "$905.000".
 * @param {number} monto
 * @returns {string}
 */
export function comoMoneda(monto) {
  return formateadorMoneda.format(monto);
}

/**
 * Formatea un entero con separador de miles.
 * @param {number} valor
 * @returns {string}
 */
export function comoNumero(valor) {
  return formateadorNumero.format(Math.round(valor));
}

/**
 * Formatea un porcentaje entero, por ejemplo "65%".
 * @param {number} valor
 * @returns {string}
 */
export function comoPorcentaje(valor) {
  return `${Math.round(valor)}%`;
}

/**
 * Devuelve la fecha y hora actual en formato legible para el reporte.
 * @returns {string}
 */
export function marcaDeTiempo() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  /* Se fuerza el reloj de 24 horas: evita el sufijo "a. m." abreviado,
     que arrastra puntos y complica la lectura junto a la fecha. */
  const hora = ahora.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${fecha} · ${hora} h`;
}

/**
 * Comprueba que una dirección de correo tenga una forma válida.
 * @param {string} valor
 * @returns {boolean}
 */
export function esCorreoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}
