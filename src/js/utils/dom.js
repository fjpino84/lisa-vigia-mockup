/* =========================================================================
   LISA vigIA — Utilidades de construcción de DOM.
   Todo el contenido se crea con createElement/appendChild: en el proyecto
   no se usa innerHTML en ningún punto.
   ========================================================================= */

const ESPACIO_SVG = "http://www.w3.org/2000/svg";

/**
 * Crea un elemento HTML aplicando clases, atributos, texto e hijos.
 * @param {string} etiqueta Nombre de la etiqueta a crear.
 * @param {object} [opciones]
 * @param {string|string[]} [opciones.clase] Clase o listado de clases.
 * @param {string} [opciones.texto] Contenido textual del elemento.
 * @param {object} [opciones.atributos] Pares atributo/valor.
 * @param {object} [opciones.datos] Pares que se vuelcan en dataset.
 * @param {Node[]} [opciones.hijos] Nodos que se anexan en orden.
 * @param {object} [opciones.eventos] Pares evento/manejador.
 * @returns {HTMLElement}
 */
export function crear(etiqueta, opciones = {}) {
  const elemento = document.createElement(etiqueta);
  aplicarOpciones(elemento, opciones);
  return elemento;
}

/**
 * Equivalente a `crear` para elementos SVG, que exigen espacio de nombres.
 * @param {string} etiqueta
 * @param {object} [opciones]
 * @returns {SVGElement}
 */
export function crearSVG(etiqueta, opciones = {}) {
  const elemento = document.createElementNS(ESPACIO_SVG, etiqueta);
  aplicarOpciones(elemento, opciones, true);
  return elemento;
}

/* Vuelca las opciones comunes sobre un elemento ya creado. */
function aplicarOpciones(elemento, opciones, esSVG = false) {
  const { clase, texto, atributos, datos, hijos, eventos } = opciones;

  if (clase) {
    const clases = Array.isArray(clase) ? clase : [clase];
    const limpias = clases.filter(Boolean);

    if (esSVG) {
      /* classList es de solo lectura en SVG antiguos: se usa el atributo. */
      elemento.setAttribute("class", limpias.join(" "));
    } else {
      elemento.classList.add(...limpias);
    }
  }

  if (texto !== undefined && texto !== null) {
    elemento.textContent = String(texto);
  }

  if (atributos) {
    Object.entries(atributos).forEach(([nombre, valor]) => {
      if (valor !== undefined && valor !== null && valor !== false) {
        elemento.setAttribute(nombre, String(valor));
      }
    });
  }

  if (datos) {
    Object.entries(datos).forEach(([nombre, valor]) => {
      elemento.dataset[nombre] = String(valor);
    });
  }

  if (hijos) {
    hijos.filter(Boolean).forEach((hijo) => elemento.appendChild(hijo));
  }

  if (eventos) {
    Object.entries(eventos).forEach(([nombre, manejador]) => {
      elemento.addEventListener(nombre, manejador);
    });
  }
}

/**
 * Vacía un contenedor sin recurrir a innerHTML.
 * @param {HTMLElement} contenedor
 */
export function vaciar(contenedor) {
  while (contenedor.firstChild) {
    contenedor.removeChild(contenedor.firstChild);
  }
}

/**
 * Reemplaza el contenido de un contenedor por los nodos indicados.
 * @param {HTMLElement} contenedor
 * @param {...Node} nodos
 */
export function reemplazar(contenedor, ...nodos) {
  vaciar(contenedor);
  nodos.filter(Boolean).forEach((nodo) => contenedor.appendChild(nodo));
}

/**
 * Crea un fragmento con varios nodos para insertarlos de una sola vez.
 * @param {Node[]} nodos
 * @returns {DocumentFragment}
 */
export function fragmento(nodos) {
  const contenedor = document.createDocumentFragment();
  nodos.filter(Boolean).forEach((nodo) => contenedor.appendChild(nodo));
  return contenedor;
}
