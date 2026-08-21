/* =========================================================================
   LISA vigIA — Gráfico de barras apiladas para el histórico de resoluciones.
   Cada mes muestra los casos derivados a investigación frente a los que
   continuaron a liquidación, con el monto bloqueado como línea superpuesta.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { comoMoneda } from "../utils/formato.js";

const ANCHO = 760;
const ALTO = 320;
const MARGEN = { arriba: 24, derecha: 64, abajo: 46, izquierda: 48 };

const ANCHO_TRAMA = ANCHO - MARGEN.izquierda - MARGEN.derecha;
const ALTO_TRAMA = ALTO - MARGEN.arriba - MARGEN.abajo;

/**
 * Dibuja el histórico mensual de resoluciones.
 * @param {object} opciones
 * @param {object[]} opciones.historial Meses con fraude, liberados y monto.
 * @returns {HTMLElement}
 */
export function crearGraficoBarras({ historial }) {
  const contenedor = crear("div", { clase: "grafico" });

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label":
        "Histórico mensual de casos resueltos: derivados a investigación frente a liberados a liquidación.",
    },
  });

  const trama = crearSVG("g", {
    atributos: { transform: `translate(${MARGEN.izquierda}, ${MARGEN.arriba})` },
  });

  const maximoCasos = Math.max(
    ...historial.map((mes) => mes.fraude + mes.liberados)
  );
  const maximoMonto = Math.max(...historial.map((mes) => mes.montoBloqueado));

  const escalaY = (valor) => ALTO_TRAMA - (valor / maximoCasos) * ALTO_TRAMA;
  const paso = ANCHO_TRAMA / historial.length;
  const anchoBarra = Math.min(paso * 0.5, 46);

  /* --- Rejilla horizontal -------------------------------------------- */
  const pasos = 4;
  for (let indice = 0; indice <= pasos; indice += 1) {
    const valor = (maximoCasos / pasos) * indice;
    const y = escalaY(valor);

    trama.appendChild(
      crearSVG("line", {
        atributos: {
          x1: 0,
          y1: y,
          x2: ANCHO_TRAMA,
          y2: y,
          stroke: "#26262e",
          "stroke-width": 1,
        },
      })
    );

    trama.appendChild(
      crearSVG("text", {
        texto: String(Math.round(valor)),
        atributos: {
          x: -10,
          y: y + 4,
          fill: "#6e6e7c",
          "font-size": 11,
          "font-family": "monospace",
          "text-anchor": "end",
        },
      })
    );
  }

  /* --- Globo informativo --------------------------------------------- */
  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  function mostrarTooltip(mes, evento) {
    vaciar(tooltip);
    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: mes.mes }));

    [
      ["Derivados a fraude", String(mes.fraude)],
      ["Liberados", String(mes.liberados)],
      ["Monto bloqueado", comoMoneda(mes.montoBloqueado)],
    ].forEach(([clave, valor]) => {
      tooltip.appendChild(
        crear("div", {
          clase: "tooltip__fila",
          hijos: [
            crear("span", { clase: "tooltip__clave", texto: clave }),
            crear("span", { clase: "tooltip__valor", texto: valor }),
          ],
        })
      );
    });

    const limites = contenedor.getBoundingClientRect();
    const x = evento.clientX - limites.left + 16;
    const y = evento.clientY - limites.top + 16;
    const ancho = 240;

    tooltip.style.left = `${x + ancho > limites.width ? x - ancho - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  const ocultarTooltip = () => tooltip.classList.remove("esta-visible");

  /* --- Barras apiladas ------------------------------------------------ */
  historial.forEach((mes, indice) => {
    const centro = paso * (indice + 0.5);
    const x = centro - anchoBarra / 2;

    const altoLiberados = ALTO_TRAMA - escalaY(mes.liberados);
    const altoFraude = ALTO_TRAMA - escalaY(mes.fraude);

    const grupo = crearSVG("g", { clase: "punto-dato" });

    /* Los liberados forman la base de la barra. */
    grupo.appendChild(
      crearSVG("rect", {
        atributos: {
          x,
          y: ALTO_TRAMA - altoLiberados,
          width: anchoBarra,
          height: altoLiberados,
          fill: "#2f4f45",
          rx: 2,
        },
      })
    );

    /* Los derivados a investigación se apilan encima. */
    grupo.appendChild(
      crearSVG("rect", {
        atributos: {
          x,
          y: ALTO_TRAMA - altoLiberados - altoFraude,
          width: anchoBarra,
          height: altoFraude,
          fill: "#f2857f",
          rx: 2,
        },
      })
    );

    grupo.addEventListener("mousemove", (evento) => mostrarTooltip(mes, evento));
    grupo.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(grupo);

    /* Rótulo del mes, abreviado para que quepa. */
    trama.appendChild(
      crearSVG("text", {
        texto: mes.mes.split(" ")[0].slice(0, 3),
        atributos: {
          x: centro,
          y: ALTO_TRAMA + 20,
          fill: "#a0a0ae",
          "font-size": 11,
          "text-anchor": "middle",
        },
      })
    );
  });

  /* --- Línea del monto bloqueado -------------------------------------- */
  const escalaMonto = (monto) => ALTO_TRAMA - (monto / maximoMonto) * ALTO_TRAMA * 0.86;

  const puntos = historial
    .map((mes, indice) => `${paso * (indice + 0.5)},${escalaMonto(mes.montoBloqueado)}`)
    .join(" ");

  trama.appendChild(
    crearSVG("polyline", {
      atributos: {
        points: puntos,
        fill: "none",
        stroke: "#c3cbf0",
        "stroke-width": 2,
        "stroke-dasharray": "5 4",
        "stroke-linecap": "round",
      },
    })
  );

  historial.forEach((mes, indice) => {
    trama.appendChild(
      crearSVG("circle", {
        atributos: {
          cx: paso * (indice + 0.5),
          cy: escalaMonto(mes.montoBloqueado),
          r: 3.5,
          fill: "#c3cbf0",
        },
      })
    );
  });

  svg.appendChild(trama);

  contenedor.appendChild(
    crear("p", {
      clase: "grafico__titulo",
      texto: "Resoluciones por mes y monto bloqueado",
    })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto: "Pase el puntero sobre una barra para ver el detalle del mes.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda("#f2857f", "Derivados a investigación"),
        crearItemLeyenda("#2f4f45", "Liberados a liquidación"),
        crearItemLeyenda("#c3cbf0", "Monto bloqueado"),
      ],
    })
  );

  contenedor.appendChild(tooltip);
  return contenedor;
}

/* Construye un elemento de la leyenda. */
function crearItemLeyenda(color, texto) {
  const muestra = crear("span", { clase: "grafico__muestra" });
  muestra.style.backgroundColor = color;

  return crear("span", {
    clase: "grafico__leyenda-item",
    hijos: [muestra, crear("span", { texto })],
  });
}
