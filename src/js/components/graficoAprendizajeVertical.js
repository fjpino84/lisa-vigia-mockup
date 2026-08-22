/* =========================================================================
   LISA vigIA — Curva de aprendizaje, disposición vertical.

   Variante para pantallas estrechas. El eje del tiempo baja por la
   izquierda y cada mes ocupa una franja horizontal propia, de modo que
   dispone de todo el ancho para su rótulo. Las barras del ahorro crecen
   hacia la derecha y las series de porcentaje se leen como dos columnas
   de puntos unidas por su trazo.

   No es el gráfico de escritorio encogido: comprimir aquella composición
   apretaría los elementos hasta solaparlos. Es una lectura distinta de los
   mismos datos, pensada para el formato en que se ve.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { paleta } from "../utils/paleta.js";

const ANCHO = 420;
/* Alto reservado a cada mes: da sitio al rótulo y a la barra. */
const ALTO_FILA = 52;
/* El margen derecho aloja el monto rotulado al final de cada barra. */
const MARGEN = { arriba: 56, derecha: 52, abajo: 28, izquierda: 46 };

/* Reparto horizontal: la franja de porcentajes a la izquierda y la del
   ahorro a la derecha, separadas para que no se pisen. */
const ANCHO_PORCENTAJE = 120;
const SEPARACION = 20;

let contador = 0;

/* Rótulo corto para los montos, con la coma decimal local. */
function montoCorto(monto) {
  if (monto === 0) {
    return "$0";
  }

  if (monto >= 1000000) {
    const millones = monto / 1000000;
    const texto = Number.isInteger(millones) ? String(millones) : millones.toFixed(1);
    return `$${texto.replace(".", ",")}M`;
  }

  return `$${Math.round(monto / 1000)}K`;
}

/**
 * Traza una curva suave vertical que pasa por todos los puntos.
 * @param {{x: number, y: number}[]} puntos
 * @param {number} [tension]
 * @returns {string}
 */
function curvaSuave(puntos, tension = 0.2) {
  if (puntos.length < 2) {
    return "";
  }

  let d = `M ${puntos[0].x} ${puntos[0].y}`;

  for (let i = 0; i < puntos.length - 1; i += 1) {
    const anterior = puntos[i - 1] ?? puntos[i];
    const actual = puntos[i];
    const siguiente = puntos[i + 1];
    const posterior = puntos[i + 2] ?? siguiente;

    const control1 = {
      x: actual.x + (siguiente.x - anterior.x) * tension,
      y: actual.y + (siguiente.y - anterior.y) * tension,
    };
    const control2 = {
      x: siguiente.x - (posterior.x - actual.x) * tension,
      y: siguiente.y - (posterior.y - actual.y) * tension,
    };

    d += ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${siguiente.x} ${siguiente.y}`;
  }

  return d;
}

/**
 * Dibuja la evolución del modelo en disposición vertical.
 * @param {object} opciones
 * @param {object[]} opciones.historial
 * @param {object[]} opciones.hitos
 * @returns {HTMLElement}
 */
export function crearGraficoAprendizajeVertical({ historial, hitos }) {
  const COLOR = paleta();
  const contenedor = crear("div", { clase: ["grafico", "grafico--vertical"] });

  contador += 1;
  const idBarra = `barraVertical${contador}`;
  const idArea = `areaVertical${contador}`;

  const alto = MARGEN.arriba + historial.length * ALTO_FILA + MARGEN.abajo;

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${alto}`,
      role: "img",
      "aria-label":
        "Evolución del modelo a lo largo de diez meses: la precisión sube del 20 % al 72 % con retrocesos intermedios, mientras los falsos positivos caen del 44 % al 17 % y el ahorro mensual pasa de 2,1 a 20,1 millones de pesos.",
    },
  });

  /* ------------------------------------------------------------------ */
  /* Definiciones                                                        */
  /* ------------------------------------------------------------------ */

  const defs = crearSVG("defs");

  /* Las barras se desvanecen hacia su extremo derecho. */
  defs.appendChild(
    crearSVG("linearGradient", {
      atributos: { id: idBarra, x1: "0", y1: "0", x2: "1", y2: "0" },
      hijos: [
        crearSVG("stop", {
          atributos: { offset: "0%", "stop-color": COLOR.acento, "stop-opacity": "0.32" },
        }),
        crearSVG("stop", {
          atributos: { offset: "100%", "stop-color": COLOR.acento, "stop-opacity": "0.1" },
        }),
      ],
    })
  );

  /* Área entre el eje y la curva de precisión. */
  defs.appendChild(
    crearSVG("linearGradient", {
      atributos: { id: idArea, x1: "0", y1: "0", x2: "1", y2: "0" },
      hijos: [
        crearSVG("stop", {
          atributos: { offset: "0%", "stop-color": COLOR.precision, "stop-opacity": "0.22" },
        }),
        crearSVG("stop", {
          atributos: { offset: "100%", "stop-color": COLOR.precision, "stop-opacity": "0.02" },
        }),
      ],
    })
  );

  svg.appendChild(defs);

  const trama = crearSVG("g", {
    atributos: { transform: `translate(${MARGEN.izquierda}, ${MARGEN.arriba})` },
  });

  /* Posición vertical del centro de cada mes. */
  const filaY = (indice) => indice * ALTO_FILA + ALTO_FILA / 2;

  /* La franja de porcentajes ocupa la izquierda; el 0 % queda pegado al eje
     y el 100 % en su extremo derecho. */
  const escalaPorcentaje = (valor) => (valor / 100) * ANCHO_PORCENTAJE;

  /* La franja del ahorro empieza donde termina la anterior. */
  const inicioBarras = ANCHO_PORCENTAJE + SEPARACION;
  const anchoBarras = ANCHO - MARGEN.izquierda - MARGEN.derecha - inicioBarras;

  const ahorroMaximo = Math.max(...historial.map((mes) => mes.montoBloqueado));
  const escalaAhorro = (monto) => (monto / (ahorroMaximo * 1.02)) * anchoBarras;

  /* ------------------------------------------------------------------ */
  /* Encabezados de las dos franjas                                      */
  /* ------------------------------------------------------------------ */

  const encabezados = [
    { x: 0, texto: "0%", ancla: "start", color: COLOR.textoTenue },
    { x: ANCHO_PORCENTAJE, texto: "100%", ancla: "end", color: COLOR.textoTenue },
    { x: inicioBarras, texto: "AHORRO", ancla: "start", color: COLOR.acento },
  ];

  encabezados.forEach(({ x, texto, ancla, color }) => {
    trama.appendChild(
      crearSVG("text", {
        texto,
        atributos: {
          x,
          y: -14,
          fill: color,
          "font-size": 10,
          "font-weight": "700",
          "font-family": "monospace",
          "text-anchor": ancla,
          "letter-spacing": "0.06em",
        },
      })
    );
  });

  /* Rótulo de la franja de porcentajes, centrado sobre ella. */
  trama.appendChild(
    crearSVG("text", {
      texto: "PRECISIÓN Y FALSOS POSITIVOS",
      atributos: {
        x: ANCHO_PORCENTAJE / 2,
        y: -30,
        fill: COLOR.textoTenue,
        "font-size": 9,
        "font-weight": "700",
        "font-family": "monospace",
        "text-anchor": "middle",
        "letter-spacing": "0.04em",
      },
    })
  );

  /* ------------------------------------------------------------------ */
  /* Franjas por mes                                                     */
  /* ------------------------------------------------------------------ */

  const mesesConHito = new Map(hitos.map((hito) => [hito.abreviatura, hito]));
  const altoTrama = historial.length * ALTO_FILA;

  /* Guías verticales de la escala de porcentaje. */
  [0, 50, 100].forEach((valor) => {
    const x = escalaPorcentaje(valor);

    trama.appendChild(
      crearSVG("line", {
        atributos: {
          x1: x,
          y1: -6,
          x2: x,
          y2: altoTrama,
          stroke: COLOR.rejilla,
          "stroke-width": valor === 0 ? 1.5 : 1,
          "stroke-dasharray": valor === 0 ? "none" : "2 6",
        },
      })
    );
  });

  historial.forEach((mes, indice) => {
    const y = filaY(indice);
    const hito = mesesConHito.get(mes.abreviatura);

    /* Banda tenue que agrupa la fila del mes con capacidad nueva. */
    if (hito) {
      trama.appendChild(
        crearSVG("rect", {
          atributos: {
            x: -MARGEN.izquierda + 6,
            y: y - ALTO_FILA / 2 + 2,
            width: ANCHO - 14,
            height: ALTO_FILA - 4,
            fill: COLOR.acento,
            opacity: 0.05,
            rx: 6,
          },
        })
      );
    }

    /* Rótulo del mes, en el margen izquierdo. */
    trama.appendChild(
      crearSVG("text", {
        texto: mes.abreviatura,
        atributos: {
          x: -12,
          y: y + 4,
          fill: hito ? COLOR.acento : COLOR.textoTenue,
          "font-size": 11,
          "font-weight": hito ? "700" : "500",
          "text-anchor": "end",
        },
      })
    );

    /* Barra del ahorro, creciendo hacia la derecha. */
    const largoBarra = Math.max(escalaAhorro(mes.montoBloqueado), 3);
    const altoBarra = 16;

    trama.appendChild(
      crearSVG("rect", {
        atributos: {
          x: inicioBarras,
          y: y - altoBarra / 2,
          width: largoBarra,
          height: altoBarra,
          fill: `url(#${idBarra})`,
          rx: altoBarra / 2,
        },
      })
    );

    /* Monto rotulado al final de su barra. */
    trama.appendChild(
      crearSVG("text", {
        texto: montoCorto(mes.montoBloqueado),
        atributos: {
          x: inicioBarras + largoBarra + 6,
          y: y + 3.5,
          fill: COLOR.acento,
          "font-size": 10,
          "font-weight": "700",
          "font-family": "monospace",
          "text-anchor": "start",
        },
      })
    );
  });

  /* ------------------------------------------------------------------ */
  /* Series de porcentaje                                                */
  /* ------------------------------------------------------------------ */

  const puntosPrecision = historial.map((mes, indice) => ({
    x: escalaPorcentaje(mes.precision),
    y: filaY(indice),
  }));

  const puntosFalsos = historial.map((mes, indice) => ({
    x: escalaPorcentaje(mes.falsosPositivos),
    y: filaY(indice),
  }));

  const trazoPrecision = curvaSuave(puntosPrecision);

  /* Área entre el eje y la precisión. */
  trama.appendChild(
    crearSVG("path", {
      atributos: {
        d: `${trazoPrecision} L 0 ${puntosPrecision[puntosPrecision.length - 1].y} L 0 ${puntosPrecision[0].y} Z`,
        fill: `url(#${idArea})`,
      },
    })
  );

  trama.appendChild(
    crearSVG("path", {
      atributos: {
        d: curvaSuave(puntosFalsos),
        fill: "none",
        stroke: COLOR.critico,
        "stroke-width": 2,
        "stroke-dasharray": "1 6",
        "stroke-linecap": "round",
        opacity: 0.9,
      },
    })
  );

  trama.appendChild(
    crearSVG("path", {
      atributos: {
        d: trazoPrecision,
        fill: "none",
        stroke: COLOR.precision,
        "stroke-width": 3,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
    })
  );

  /* ------------------------------------------------------------------ */
  /* Globo informativo                                                   */
  /* ------------------------------------------------------------------ */

  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  function mostrarTooltip(mes, evento) {
    vaciar(tooltip);
    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: mes.mes }));

    [
      ["Precisión", `${mes.precision}%`],
      ["Falsos positivos", `${mes.falsosPositivos}%`],
      ["Ahorro del mes", montoCorto(mes.montoBloqueado)],
      ["Días por caso", `${mes.diasResolucion}`],
      ["Casos escapados", String(mes.escapados)],
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
    const x = evento.clientX - limites.left + 14;
    const y = evento.clientY - limites.top + 14;
    const ancho = 230;

    tooltip.style.left = `${x + ancho > limites.width ? Math.max(x - ancho - 28, 4) : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  const ocultarTooltip = () => tooltip.classList.remove("esta-visible");

  /* ------------------------------------------------------------------ */
  /* Puntos y zonas de captura                                           */
  /* ------------------------------------------------------------------ */

  historial.forEach((mes, indice) => {
    const y = filaY(indice);
    const esFinal = indice === historial.length - 1;
    const esInicial = indice === 0;

    trama.appendChild(
      crearSVG("circle", {
        atributos: {
          cx: escalaPorcentaje(mes.falsosPositivos),
          cy: y,
          r: 3,
          fill: COLOR.fondo,
          stroke: COLOR.critico,
          "stroke-width": 1.8,
        },
      })
    );

    trama.appendChild(
      crearSVG("circle", {
        atributos: {
          cx: escalaPorcentaje(mes.precision),
          cy: y,
          r: esFinal || esInicial ? 6 : 4.5,
          fill: COLOR.precision,
          stroke: COLOR.fondo,
          "stroke-width": 2,
        },
      })
    );

    /* Valor rotulado en los extremos, junto a su punto. */
    if (esFinal || esInicial) {
      trama.appendChild(
        crearSVG("text", {
          texto: `${mes.precision}%`,
          atributos: {
            x: escalaPorcentaje(mes.precision) + 10,
            y: y - 9,
            fill: COLOR.precision,
            "font-size": 12,
            "font-weight": "700",
            "font-family": "monospace",
            "text-anchor": "start",
          },
        })
      );
    }

    /* Franja completa sensible al puntero. */
    const zona = crearSVG("rect", {
      clase: "punto-dato",
      atributos: {
        x: -MARGEN.izquierda,
        y: y - ALTO_FILA / 2,
        width: ANCHO,
        height: ALTO_FILA,
        fill: "transparent",
      },
    });

    zona.addEventListener("mousemove", (evento) => mostrarTooltip(mes, evento));
    zona.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(zona);
  });

  svg.appendChild(trama);

  contenedor.appendChild(
    crear("p", {
      clase: "grafico__titulo",
      texto: "Precisión del modelo y ahorro mensual",
    })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto:
        "Cada fila es un mes. A la izquierda, la precisión y los falsos positivos; a la derecha, el monto retenido. Los meses resaltados incorporan una capacidad nueva.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda(COLOR.precision, "Precisión de detección"),
        crearItemLeyenda(COLOR.critico, "Falsos positivos"),
        crearItemLeyenda(COLOR.acento, "Ahorro del mes", "barra"),
      ],
    })
  );

  contenedor.appendChild(tooltip);
  return contenedor;
}

/* Construye un elemento de la leyenda. */
function crearItemLeyenda(color, texto, forma = "punto") {
  const muestra = crear("span", {
    clase: ["grafico__muestra", forma === "barra" ? "grafico__muestra--barra" : null],
  });
  muestra.style.backgroundColor = color;

  if (forma === "barra") {
    muestra.style.opacity = "0.3";
  }

  return crear("span", {
    clase: "grafico__leyenda-item",
    hijos: [muestra, crear("span", { texto })],
  });
}
