/* =========================================================================
   LISA vigIA — Curva de aprendizaje del modelo.
   Traza cómo subió la precisión mientras caían los falsos positivos y los
   casos que lograban escapar, y marca sobre la curva el mes en que entró
   en producción cada capacidad nueva.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { paleta } from "../utils/paleta.js";

const ANCHO = 820;
const ALTO = 380;
const MARGEN = { arriba: 44, derecha: 24, abajo: 52, izquierda: 48 };

const ANCHO_TRAMA = ANCHO - MARGEN.izquierda - MARGEN.derecha;
const ALTO_TRAMA = ALTO - MARGEN.arriba - MARGEN.abajo;

/**
 * Dibuja la evolución del modelo a lo largo del semestre.
 * @param {object} opciones
 * @param {object[]} opciones.historial Meses con precisión y falsos positivos.
 * @param {object[]} opciones.hitos Capacidades incorporadas al modelo.
 * @returns {HTMLElement}
 */
export function crearGraficoAprendizaje({ historial, hitos }) {
  const COLOR = paleta();
  const contenedor = crear("div", { clase: "grafico" });

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label":
        "Evolución del modelo: la precisión sube del 62 % al 94 % mientras los falsos positivos caen del 31 % al 6 %.",
    },
  });

  const trama = crearSVG("g", {
    atributos: { transform: `translate(${MARGEN.izquierda}, ${MARGEN.arriba})` },
  });

  const paso = ANCHO_TRAMA / (historial.length - 1);
  const escalaX = (indice) => paso * indice;
  const escalaY = (porcentaje) => ALTO_TRAMA - (porcentaje / 100) * ALTO_TRAMA;

  /* --- Rejilla ------------------------------------------------------- */
  [0, 25, 50, 75, 100].forEach((valor) => {
    const y = escalaY(valor);

    trama.appendChild(
      crearSVG("line", {
        atributos: {
          x1: 0,
          y1: y,
          x2: ANCHO_TRAMA,
          y2: y,
          stroke: COLOR.rejilla,
          "stroke-width": 1,
        },
      })
    );

    trama.appendChild(
      crearSVG("text", {
        texto: `${valor}%`,
        atributos: {
          x: -10,
          y: y + 4,
          fill: COLOR.textoTenue,
          "font-size": 11,
          "font-family": "monospace",
          "text-anchor": "end",
        },
      })
    );
  });

  /* --- Área bajo la curva de precisión -------------------------------- */
  const puntosPrecision = historial.map((mes, indice) => ({
    x: escalaX(indice),
    y: escalaY(mes.precision),
  }));

  const area = [
    `M 0 ${ALTO_TRAMA}`,
    ...puntosPrecision.map((punto) => `L ${punto.x} ${punto.y}`),
    `L ${ANCHO_TRAMA} ${ALTO_TRAMA}`,
    "Z",
  ].join(" ");

  const degradado = crearSVG("defs", {
    hijos: [
      crearSVG("linearGradient", {
        atributos: { id: "degradadoPrecision", x1: "0", y1: "0", x2: "0", y2: "1" },
        hijos: [
          crearSVG("stop", {
            atributos: { offset: "0%", "stop-color": COLOR.ok, "stop-opacity": "0.32" },
          }),
          crearSVG("stop", {
            atributos: { offset: "100%", "stop-color": COLOR.ok, "stop-opacity": "0" },
          }),
        ],
      }),
    ],
  });

  svg.appendChild(degradado);
  trama.appendChild(crearSVG("path", { atributos: { d: area, fill: "url(#degradadoPrecision)" } }));

  /* --- Línea de falsos positivos, en descenso -------------------------- */
  const trazoFalsos = historial
    .map((mes, indice) => `${escalaX(indice)},${escalaY(mes.falsosPositivos)}`)
    .join(" ");

  trama.appendChild(
    crearSVG("polyline", {
      atributos: {
        points: trazoFalsos,
        fill: "none",
        stroke: COLOR.critico,
        "stroke-width": 2,
        "stroke-dasharray": "5 4",
        "stroke-linecap": "round",
      },
    })
  );

  /* --- Línea de precisión --------------------------------------------- */
  const trazoPrecision = puntosPrecision.map((punto) => `${punto.x},${punto.y}`).join(" ");

  const linea = crearSVG("polyline", {
    atributos: {
      points: trazoPrecision,
      fill: "none",
      stroke: COLOR.ok,
      "stroke-width": 3,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
  });

  /* La curva se dibuja progresivamente al entrar en pantalla. */
  const largoTrazo = ANCHO_TRAMA * 1.4;
  linea.setAttribute("stroke-dasharray", largoTrazo);
  linea.setAttribute("stroke-dashoffset", largoTrazo);
  linea.appendChild(
    crearSVG("animate", {
      atributos: {
        attributeName: "stroke-dashoffset",
        from: largoTrazo,
        to: "0",
        dur: "1.4s",
        fill: "freeze",
      },
    })
  );

  trama.appendChild(linea);

  /* --- Globo informativo ----------------------------------------------- */
  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  function mostrarTooltip(mes, evento) {
    vaciar(tooltip);
    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: mes.mes }));

    [
      ["Precisión", `${mes.precision}%`],
      ["Falsos positivos", `${mes.falsosPositivos}%`],
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
    const x = evento.clientX - limites.left + 16;
    const y = evento.clientY - limites.top + 16;
    const ancho = 240;

    tooltip.style.left = `${x + ancho > limites.width ? x - ancho - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  const ocultarTooltip = () => tooltip.classList.remove("esta-visible");

  /* --- Puntos, hitos y rótulos ------------------------------------------ */
  const mesesConHito = new Map(hitos.map((hito) => [hito.abreviatura, hito]));

  historial.forEach((mes, indice) => {
    const x = escalaX(indice);
    const hito = mesesConHito.get(mes.abreviatura);

    /* Marca vertical en los meses en que el modelo incorporó una capacidad. */
    if (hito) {
      trama.appendChild(
        crearSVG("line", {
          atributos: {
            x1: x,
            y1: escalaY(mes.precision),
            x2: x,
            y2: -12,
            stroke: COLOR.nodoBorde,
            "stroke-width": 1,
            "stroke-dasharray": "3 3",
          },
        })
      );

      trama.appendChild(
        crearSVG("circle", {
          atributos: { cx: x, cy: -16, r: 3, fill: COLOR.acento },
        })
      );
    }

    /* Punto sobre la línea de falsos positivos. */
    trama.appendChild(
      crearSVG("circle", {
        atributos: {
          cx: x,
          cy: escalaY(mes.falsosPositivos),
          r: 3.5,
          fill: COLOR.critico,
        },
      })
    );

    /* Punto de precisión, mayor en el mes final. */
    const esFinal = indice === historial.length - 1;

    const punto = crearSVG("circle", {
      clase: "punto-dato",
      atributos: {
        cx: x,
        cy: escalaY(mes.precision),
        r: esFinal ? 7 : 5,
        fill: COLOR.ok,
        stroke: COLOR.fondo,
        "stroke-width": 2,
      },
    });

    punto.addEventListener("mousemove", (evento) => mostrarTooltip(mes, evento));
    punto.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(punto);

    /* Rótulo del valor en el primer y el último mes. */
    if (indice === 0 || esFinal) {
      trama.appendChild(
        crearSVG("text", {
          texto: `${mes.precision}%`,
          atributos: {
            x: esFinal ? x - 6 : x + 6,
            y: escalaY(mes.precision) - 14,
            fill: COLOR.ok,
            "font-size": 13,
            "font-weight": "700",
            "font-family": "monospace",
            "text-anchor": esFinal ? "end" : "start",
          },
        })
      );
    }

    /* Rótulo del mes en el eje inferior. */
    trama.appendChild(
      crearSVG("text", {
        texto: mes.abreviatura,
        atributos: {
          x,
          y: ALTO_TRAMA + 22,
          fill: hito ? COLOR.acento : COLOR.textoTenue,
          "font-size": 11,
          "font-weight": hito ? "700" : "400",
          "text-anchor": "middle",
        },
      })
    );
  });

  svg.appendChild(trama);

  contenedor.appendChild(
    crear("p", {
      clase: "grafico__titulo",
      texto: "Precisión del modelo frente a falsos positivos",
    })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto:
        "Los meses marcados en el eje corresponden a la entrada en producción de una capacidad nueva. Pase el puntero sobre un punto para ver el detalle.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda(COLOR.ok, "Precisión de detección"),
        crearItemLeyenda(COLOR.critico, "Falsos positivos"),
        crearItemLeyenda(COLOR.acento, "Capacidad incorporada"),
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
