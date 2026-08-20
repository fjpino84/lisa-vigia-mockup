/* =========================================================================
   LISA vigIA — Tabla de casos con semáforo de riesgo.
   La usan tanto el listado de casos críticos como el de casos leves; la
   diferencia está en el detalle de las cabeceras y en el resaltado.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { NIVEL } from "../data/casos.js";

/* Traducción de cada nivel a un texto para lectores de pantalla. */
const TEXTO_NIVEL = {
  [NIVEL.ALTO]: "riesgo alto",
  [NIVEL.MEDIO]: "riesgo medio",
  [NIVEL.BAJO]: "riesgo bajo",
};

/**
 * Construye el círculo del semáforo para un criterio.
 * @param {string} nivel Uno de los valores de NIVEL.
 * @param {string} criterio Nombre del criterio evaluado.
 * @returns {HTMLElement}
 */
function crearSemaforo(nivel, criterio) {
  return crear("span", {
    clase: ["semaforo", `semaforo--${nivel}`],
    atributos: {
      role: "img",
      "aria-label": `${criterio}: ${TEXTO_NIVEL[nivel]}`,
      title: `${criterio}: ${TEXTO_NIVEL[nivel]}`,
    },
  });
}

/* Clasifica el puntaje para darle color al número final. */
function clasePuntaje(puntaje) {
  if (puntaje >= 70) {
    return "puntaje--alto";
  }
  if (puntaje >= 40) {
    return "puntaje--medio";
  }
  return "puntaje--bajo";
}

/**
 * Crea una tabla de casos navegable.
 * @param {object} opciones
 * @param {object[]} opciones.casos Casos que se listan.
 * @param {boolean} [opciones.compacta] Usa abreviaturas en las cabeceras.
 * @param {string} [opciones.idDestacado] Caso que se resalta en la lista.
 * @param {Function} opciones.alAbrirCaso Recibe el id del caso elegido.
 * @returns {HTMLElement}
 */
export function crearTablaCasos({ casos, compacta = false, idDestacado, alAbrirCaso }) {
  const columnas = compacta
    ? ["Beneficiario", "AF", "VE", "PT", "Score"]
    : [
        "Beneficiario (Nombre-RUT)",
        "Análisis Forense",
        "Validación Externa",
        "Patrones",
        "Scoring",
      ];

  const encabezados = columnas.map((titulo, indice) => {
    const esUltima = indice === columnas.length - 1;
    const esCentro = indice > 0 && !esUltima;

    return crear("th", {
      texto: titulo,
      clase: esUltima ? "col-derecha" : esCentro ? "col-centro" : null,
      atributos: { scope: "col" },
    });
  });

  const cuerpo = crear("tbody");

  casos.forEach((caso) => {
    const celdaBeneficiario = crear("td", {
      hijos: [
        crear("p", { clase: "celda-beneficiario__nombre", texto: caso.beneficiario }),
        crear("p", { clase: "celda-beneficiario__rut", texto: caso.rut }),
      ],
    });

    const celdasSemaforo = [
      crearSemaforo(caso.semaforo.forense, "Análisis forense de documentos"),
      crearSemaforo(caso.semaforo.validacion, "Validación externa e interna"),
      crearSemaforo(caso.semaforo.patrones, "Análisis de patrones de comportamiento"),
    ].map((marca) => crear("td", { clase: "col-centro", hijos: [marca] }));

    const esDestacado = caso.id === idDestacado;

    const valorPuntaje = crear("span", {
      clase: ["puntaje", clasePuntaje(caso.puntaje), esDestacado ? "puntaje--marcado" : null],
      texto: String(caso.puntaje),
    });

    const celdaPuntaje = crear("td", { clase: "col-derecha", hijos: [valorPuntaje] });

    const fila = crear("tr", {
      clase: esDestacado ? "esta-destacada" : null,
      atributos: {
        tabindex: "0",
        role: "link",
        "aria-label": `Abrir el caso de ${caso.beneficiario}, puntaje de riesgo ${caso.puntaje} de 100`,
      },
      datos: { caso: caso.id },
      hijos: [celdaBeneficiario, ...celdasSemaforo, celdaPuntaje],
      eventos: {
        click: () => alAbrirCaso(caso.id),
        keydown: (evento) => {
          /* La fila se comporta como un enlace también desde el teclado. */
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            alAbrirCaso(caso.id);
          }
        },
      },
    });

    cuerpo.appendChild(fila);
  });

  const tabla = crear("table", {
    clase: ["tabla-casos", compacta ? "tabla-casos--compacta" : null],
    hijos: [crear("thead", { hijos: [crear("tr", { hijos: encabezados })] }), cuerpo],
  });

  return crear("div", { clase: "tabla-envoltura", hijos: [tabla] });
}
