/* =========================================================================
   LISA vigIA — Curva de aprendizaje del modelo.
   Traza cómo subió la precisión mientras caían los falsos positivos, con el
   ahorro mensual como cimiento al fondo.

   El reparto de peso visual es deliberado: la precisión manda —trazo grueso
   y área rellena—, los falsos positivos acompañan en un trazo fino, y las
   columnas del ahorro se mantienen tenues para sostener la lectura sin
   competir. Las series se interpolan como curvas suaves porque describen
   un aprendizaje continuo, no saltos discretos.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { paleta } from "../utils/paleta.js";

const ANCHO = 860;
const ALTO = 400;
const MARGEN = { arriba: 52, derecha: 32, abajo: 58, izquierda: 52 };

const ANCHO_TRAMA = ANCHO - MARGEN.izquierda - MARGEN.derecha;
const ALTO_TRAMA = ALTO - MARGEN.arriba - MARGEN.abajo;

/* Identificadores únicos por instancia: el gráfico puede dibujarse más de
   una vez y los degradados no deben colisionar entre sí. */
let contador = 0;

/* Rótulo corto para los montos, con la coma decimal de la convención
   local: 15400000 se lee como "$15,4M" y 620000 como "$620K". */
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
 * Traza una curva suave que pasa por todos los puntos.
 * Usa splines cardinales: cada tramo toma su curvatura de los puntos
 * vecinos, de modo que la línea fluye sin inventar máximos que no están
 * en los datos.
 * @param {{x: number, y: number}[]} puntos
 * @param {number} [tension] 0 es una recta; valores altos curvan más.
 * @returns {string} Definición para el atributo d de un path.
 */
function curvaSuave(puntos, tension = 0.18) {
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
 * Dibuja la evolución del modelo a lo largo del período.
 * @param {object} opciones
 * @param {object[]} opciones.historial Meses con precisión y falsos positivos.
 * @param {object[]} opciones.hitos Capacidades incorporadas al modelo.
 * @returns {HTMLElement}
 */
export function crearGraficoAprendizaje({ historial, hitos }) {
  const COLOR = paleta();
  const contenedor = crear("div", { clase: "grafico" });

  contador += 1;
  const idArea = `areaPrecision${contador}`;
  const idBarra = `degradadoBarra${contador}`;
  const idBrillo = `brilloLinea${contador}`;

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label":
        "Evolución del modelo a lo largo de diez meses: la precisión sube del 20 % al 72 % con retrocesos intermedios, mientras los falsos positivos caen del 44 % al 17 % y el ahorro mensual pasa de 2,1 a 20,1 millones de pesos.",
    },
  });

  /* ------------------------------------------------------------------ */
  /* Definiciones: degradados y filtros                                  */
  /* ------------------------------------------------------------------ */

  const defs = crearSVG("defs");

  /* Área bajo la curva de precisión: se desvanece hacia abajo. */
  defs.appendChild(
    crearSVG("linearGradient", {
      atributos: { id: idArea, x1: "0", y1: "0", x2: "0", y2: "1" },
      hijos: [
        crearSVG("stop", {
          atributos: { offset: "0%", "stop-color": COLOR.ok, "stop-opacity": "0.28" },
        }),
        crearSVG("stop", {
          atributos: { offset: "55%", "stop-color": COLOR.ok, "stop-opacity": "0.09" },
        }),
        crearSVG("stop", {
          atributos: { offset: "100%", "stop-color": COLOR.ok, "stop-opacity": "0" },
        }),
      ],
    })
  );

  /* Las columnas se aclaran hacia su base, de modo que se apoyen en el eje
     en lugar de cortarse contra él. */
  defs.appendChild(
    crearSVG("linearGradient", {
      atributos: { id: idBarra, x1: "0", y1: "0", x2: "0", y2: "1" },
      hijos: [
        crearSVG("stop", {
          atributos: { offset: "0%", "stop-color": COLOR.acento, "stop-opacity": "0.26" },
        }),
        crearSVG("stop", {
          atributos: { offset: "100%", "stop-color": COLOR.acento, "stop-opacity": "0.05" },
        }),
      ],
    })
  );

  /* Halo tenue bajo la línea principal, para despegarla del fondo. */
  const filtro = crearSVG("filter", {
    atributos: { id: idBrillo, x: "-20%", y: "-40%", width: "140%", height: "180%" },
  });
  filtro.appendChild(
    crearSVG("feDropShadow", {
      atributos: {
        dx: "0",
        dy: "2",
        stdDeviation: "4",
        "flood-color": COLOR.ok,
        "flood-opacity": "0.28",
      },
    })
  );
  defs.appendChild(filtro);

  svg.appendChild(defs);

  const trama = crearSVG("g", {
    atributos: { transform: `translate(${MARGEN.izquierda}, ${MARGEN.arriba})` },
  });

  const paso = ANCHO_TRAMA / (historial.length - 1);
  const escalaX = (indice) => paso * indice;
  const escalaY = (porcentaje) => ALTO_TRAMA - (porcentaje / 100) * ALTO_TRAMA;

  /* --- Escala del ahorro mensual ------------------------------------- */

  /* El techo deja holgura sobre la barra más alta para que ninguna llegue
     al borde superior de la trama. */
  const ahorroMaximo = Math.max(...historial.map((mes) => mes.montoBloqueado));
  const techoAhorro = ahorroMaximo * 1.75;
  const escalaAhorro = (monto) => ALTO_TRAMA - (monto / techoAhorro) * ALTO_TRAMA;

  /* ------------------------------------------------------------------ */
  /* Rejilla                                                             */
  /* ------------------------------------------------------------------ */

  [0, 25, 50, 75, 100].forEach((valor) => {
    const y = escalaY(valor);
    const esBase = valor === 0;

    trama.appendChild(
      crearSVG("line", {
        atributos: {
          x1: 0,
          y1: y,
          x2: ANCHO_TRAMA,
          y2: y,
          stroke: COLOR.rejilla,
          "stroke-width": esBase ? 1.5 : 1,
          /* Solo la línea de base es continua; el resto se insinúa. */
          "stroke-dasharray": esBase ? "none" : "2 6",
          opacity: esBase ? 1 : 0.7,
        },
      })
    );

    trama.appendChild(
      crearSVG("text", {
        texto: `${valor}%`,
        atributos: {
          x: -14,
          y: y + 4,
          fill: COLOR.textoTenue,
          "font-size": 10.5,
          "font-family": "monospace",
          "text-anchor": "end",
        },
      })
    );
  });

  /* ------------------------------------------------------------------ */
  /* Columnas de ahorro, al fondo                                        */
  /* ------------------------------------------------------------------ */

  const anchoBarra = Math.min(paso * 0.34, 30);
  const radioBarra = anchoBarra / 2;

  /* Altura libre que hace falta sobre la columna para alojar su rótulo. */
  const HOLGURA_ROTULO = 20;

  historial.forEach((mes, indice) => {
    const centro = escalaX(indice);
    const x = centro - anchoBarra / 2;
    const y = escalaAhorro(mes.montoBloqueado);
    const alto = ALTO_TRAMA - y;
    const esFinal = indice === historial.length - 1;

    /* Si alguna curva pasa por la franja donde iría el rótulo, este baja al
       interior de la columna en lugar de superponerse al trazo. */
    const yPrecision = escalaY(mes.precision);
    const yFalsos = escalaY(mes.falsosPositivos);
    const invade = (yLinea) => yLinea > y - HOLGURA_ROTULO && yLinea < y + 6;
    const rotuloDentro = alto > 34 && (invade(yPrecision) || invade(yFalsos));

    /* La columna se dibuja como un rectángulo de cabeza redondeada: el
       radio superior la suaviza y la base queda a ras del eje. */
    const radio = Math.min(radioBarra, alto);
    const d = [
      `M ${x} ${ALTO_TRAMA}`,
      `L ${x} ${y + radio}`,
      `Q ${x} ${y} ${x + radio} ${y}`,
      `L ${x + anchoBarra - radio} ${y}`,
      `Q ${x + anchoBarra} ${y} ${x + anchoBarra} ${y + radio}`,
      `L ${x + anchoBarra} ${ALTO_TRAMA}`,
      "Z",
    ].join(" ");

    trama.appendChild(
      crearSVG("path", {
        atributos: {
          d,
          fill: `url(#${idBarra})`,
          opacity: esFinal ? 1 : 0.72,
        },
      })
    );

    /* El rótulo va sobre la columna salvo que una curva ocupe ese espacio,
       en cuyo caso baja al interior, donde el fondo tenue lo admite. */
    trama.appendChild(
      crearSVG("text", {
        texto: montoCorto(mes.montoBloqueado),
        atributos: {
          x: centro,
          y: rotuloDentro ? y + 17 : y - 9,
          fill: COLOR.acento,
          "font-size": esFinal ? 11 : 10,
          "font-weight": esFinal ? "700" : "600",
          "font-family": "monospace",
          "text-anchor": "middle",
          opacity: esFinal ? 1 : 0.85,
        },
      })
    );
  });

  /* ------------------------------------------------------------------ */
  /* Series                                                              */
  /* ------------------------------------------------------------------ */

  const puntosPrecision = historial.map((mes, indice) => ({
    x: escalaX(indice),
    y: escalaY(mes.precision),
  }));

  const puntosFalsos = historial.map((mes, indice) => ({
    x: escalaX(indice),
    y: escalaY(mes.falsosPositivos),
  }));

  const trazoPrecision = curvaSuave(puntosPrecision);

  /* Área bajo la precisión, cerrada contra la base. */
  trama.appendChild(
    crearSVG("path", {
      atributos: {
        d: `${trazoPrecision} L ${ANCHO_TRAMA} ${ALTO_TRAMA} L 0 ${ALTO_TRAMA} Z`,
        fill: `url(#${idArea})`,
      },
    })
  );

  /* Falsos positivos: trazo fino y discontinuo, en segundo plano. */
  trama.appendChild(
    crearSVG("path", {
      atributos: {
        d: curvaSuave(puntosFalsos),
        fill: "none",
        stroke: COLOR.critico,
        "stroke-width": 2,
        "stroke-dasharray": "1 7",
        "stroke-linecap": "round",
        opacity: 0.85,
      },
    })
  );

  /* Precisión: la serie protagonista. */
  const linea = crearSVG("path", {
    atributos: {
      d: trazoPrecision,
      fill: "none",
      stroke: COLOR.ok,
      "stroke-width": 3.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      filter: `url(#${idBrillo})`,
    },
  });

  /* La curva se dibuja al entrar, como si el modelo trazara su historia. */
  const largoTrazo = ANCHO_TRAMA * 1.8;
  linea.setAttribute("stroke-dasharray", largoTrazo);
  linea.setAttribute("stroke-dashoffset", largoTrazo);
  linea.appendChild(
    crearSVG("animate", {
      atributos: {
        attributeName: "stroke-dashoffset",
        from: largoTrazo,
        to: "0",
        dur: "1.6s",
        fill: "freeze",
        calcMode: "spline",
        keySplines: "0.25 0.1 0.25 1",
        keyTimes: "0;1",
      },
    })
  );

  trama.appendChild(linea);

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
    const x = evento.clientX - limites.left + 16;
    const y = evento.clientY - limites.top + 16;
    const ancho = 240;

    tooltip.style.left = `${x + ancho > limites.width ? x - ancho - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  const ocultarTooltip = () => tooltip.classList.remove("esta-visible");

  /* ------------------------------------------------------------------ */
  /* Marcas de hito, puntos y rótulos                                    */
  /* ------------------------------------------------------------------ */

  const mesesConHito = new Map(hitos.map((hito) => [hito.abreviatura, hito]));

  historial.forEach((mes, indice) => {
    const x = escalaX(indice);
    const hito = mesesConHito.get(mes.abreviatura);
    const esFinal = indice === historial.length - 1;
    const esInicial = indice === 0;

    /* Guía vertical tenue en los meses que incorporan una capacidad. */
    if (hito) {
      trama.appendChild(
        crearSVG("line", {
          atributos: {
            x1: x,
            y1: escalaY(mes.precision) - 10,
            x2: x,
            y2: ALTO_TRAMA,
            stroke: COLOR.acento,
            "stroke-width": 1,
            "stroke-dasharray": "2 5",
            opacity: 0.35,
          },
        })
      );
    }

    /* Punto de falsos positivos: discreto. */
    trama.appendChild(
      crearSVG("circle", {
        atributos: {
          cx: x,
          cy: escalaY(mes.falsosPositivos),
          r: 3,
          fill: COLOR.fondo,
          stroke: COLOR.critico,
          "stroke-width": 1.8,
          opacity: 0.9,
        },
      })
    );

    /* Punto de precisión: anillo blanco que lo despega de la curva. */
    const destacado = esFinal || esInicial;

    if (esFinal) {
      const halo = crearSVG("circle", {
        atributos: { cx: x, cy: escalaY(mes.precision), r: 11, fill: COLOR.ok, opacity: 0.2 },
      });
      halo.appendChild(
        crearSVG("animate", {
          atributos: {
            attributeName: "r",
            values: "9;15;9",
            dur: "2.8s",
            repeatCount: "indefinite",
          },
        })
      );
      trama.appendChild(halo);
    }

    const punto = crearSVG("circle", {
      clase: "punto-dato",
      atributos: {
        cx: x,
        cy: escalaY(mes.precision),
        r: destacado ? 6.5 : 5,
        fill: COLOR.ok,
        stroke: COLOR.fondo,
        "stroke-width": 2.5,
      },
    });

    punto.addEventListener("mousemove", (evento) => mostrarTooltip(mes, evento));
    punto.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(punto);

    /* Zona de captura ancha: facilita apuntar sin exigir puntería. */
    const zona = crearSVG("rect", {
      clase: "punto-dato",
      atributos: {
        x: x - paso / 2,
        y: 0,
        width: paso,
        height: ALTO_TRAMA,
        fill: "transparent",
      },
    });
    zona.addEventListener("mousemove", (evento) => mostrarTooltip(mes, evento));
    zona.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(zona);

    /* Valor rotulado solo en los extremos, que es donde cuenta la historia. */
    if (destacado) {
      trama.appendChild(
        crearSVG("text", {
          texto: `${mes.precision}%`,
          atributos: {
            x: esFinal ? x - 4 : x + 4,
            y: escalaY(mes.precision) - 18,
            fill: COLOR.ok,
            "font-size": 15,
            "font-weight": "700",
            "font-family": "monospace",
            "text-anchor": esFinal ? "end" : "start",
          },
        })
      );
    }

    /* Rótulo del mes. */
    trama.appendChild(
      crearSVG("text", {
        texto: mes.abreviatura,
        atributos: {
          x,
          y: ALTO_TRAMA + 24,
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
      texto: "Precisión del modelo y ahorro mensual",
    })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto:
        "Cada columna indica el monto retenido ese mes: a medida que el modelo gana precisión, detiene más dinero. Los meses en negrita marcan la entrada de una capacidad nueva.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda(COLOR.ok, "Precisión de detección"),
        crearItemLeyenda(COLOR.critico, "Falsos positivos"),
        crearItemLeyenda(COLOR.acento, "Ahorro del mes", "barra"),
        crearItemLeyenda(COLOR.acento, "Mes con capacidad nueva", "guia"),
      ],
    })
  );

  contenedor.appendChild(tooltip);
  return contenedor;
}

/**
 * Construye un elemento de la leyenda.
 * @param {string} color
 * @param {string} texto
 * @param {"punto"|"barra"|"guia"} [forma] Cada muestra imita la forma con
 *   que su serie aparece en el gráfico: punto, columna o guía vertical.
 */
function crearItemLeyenda(color, texto, forma = "punto") {
  const modificador = forma === "punto" ? null : `grafico__muestra--${forma}`;
  const muestra = crear("span", { clase: ["grafico__muestra", modificador] });

  if (forma === "guia") {
    muestra.style.borderColor = color;
  } else {
    muestra.style.backgroundColor = color;
  }

  if (forma === "barra") {
    muestra.style.opacity = "0.3";
  }

  return crear("span", {
    clase: "grafico__leyenda-item",
    hijos: [muestra, crear("span", { texto })],
  });
}
