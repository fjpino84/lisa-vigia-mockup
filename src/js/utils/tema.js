/* =========================================================================
   LISA vigIA — Preferencia de tema.
   El tema se marca con un atributo en el elemento raíz; el CSS resuelve el
   resto redefiniendo sus variables. La elección se recuerda entre visitas y,
   si no hay ninguna guardada, se respeta la preferencia del sistema.
   ========================================================================= */

const CLAVE = "lisa-vigia-tema";
const OSCURO = "oscuro";
const CLARO = "claro";

/* Suscriptores que se avisan cuando el tema cambia. */
const oyentes = new Set();

/* Lee la preferencia guardada; el acceso puede fallar si el navegador
   bloquea el almacenamiento, en cuyo caso se ignora sin romper la app. */
function leerGuardado() {
  try {
    const valor = window.localStorage.getItem(CLAVE);
    return valor === CLARO || valor === OSCURO ? valor : null;
  } catch {
    return null;
  }
}

function guardar(tema) {
  try {
    window.localStorage.setItem(CLAVE, tema);
  } catch {
    /* Sin almacenamiento la elección dura lo que la sesión. */
  }
}

/* El modo nocturno es el diseño de referencia de la plataforma, así que se
   mantiene como predeterminado: solo una elección guardada lo cambia. */
function temaInicial() {
  return leerGuardado() ?? OSCURO;
}

let temaActual = temaInicial();

/** Aplica el tema al documento. */
function aplicar(tema) {
  temaActual = tema;

  if (tema === CLARO) {
    document.documentElement.setAttribute("data-tema", CLARO);
  } else {
    document.documentElement.removeAttribute("data-tema");
  }

  oyentes.forEach((oyente) => oyente(tema));
}

/** Devuelve el tema activo. */
export function obtenerTema() {
  return temaActual;
}

/** Indica si el tema activo es el diurno. */
export function esTemaClaro() {
  return temaActual === CLARO;
}

/**
 * Alterna entre el tema diurno y el nocturno.
 * @returns {string} El tema que queda activo.
 */
export function alternarTema() {
  const siguiente = temaActual === CLARO ? OSCURO : CLARO;
  aplicar(siguiente);
  guardar(siguiente);
  return siguiente;
}

/**
 * Registra una función que se ejecuta con cada cambio de tema.
 * @param {Function} oyente Recibe el nombre del tema activo.
 * @returns {Function} Función para cancelar la suscripción.
 */
export function alCambiarTema(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Deja el documento en el tema que corresponde al arrancar. */
export function iniciarTema() {
  aplicar(temaActual);
}
