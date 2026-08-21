/* =========================================================================
   LISA vigIA — Gráfico de dispersión de montos.
   Sitúa cada siniestro sobre la banda de ±1σ y ±2σ del promedio histórico
   para que los cuatro casos atípicos queden visualmente fuera del rango.
   El globo informativo se muestra al posar el puntero sobre cada punto.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { comoMoneda } from "../utils/formato.js";
import { paleta } from "../utils/paleta.js";

/* Lienzo en unidades de usuario; el SVG escala con el contenedor. */
const ANCHO = 760;
const ALTO = 340;
const MARGEN = { arriba: 24, derecha: 24, abajo: 42, izquierda: 78 };

const ANCHO_TRAMA = ANCHO - MARGEN.izquierda - MARGEN.derecha;
const ALTO_TRAMA = ALTO - MARGEN.arriba - MARGEN.abajo;

/* Calcula media y desviación estándar de una serie de montos. */
function calcularEstadisticos(montos) {
  const media = montos.reduce((suma, valor) => suma + valor, 0) / montos.length;
  const varianza =
    montos.reduce((suma, valor) => suma + (valor - media) ** 2, 0) / montos.length;
  return { media, desviacion: Math.sqrt(varianza) };
}

/**
 * Dibuja el gráfico de desviación.
 * @param {object} opciones
 * @param {object[]} opciones.poblacion Casos dentro del rango esperado.
 * @param {object[]} opciones.atipicos Casos que se salen de la banda.
 * @param {number} [opciones.promedioReferencia] Promedio histórico oficial.
 * @param {Function} [opciones.alElegirCaso] Recibe el id de un atípico.
 * @returns {HTMLElement}
 */
export function crearGraficoDesviacion({
  poblacion,
  atipicos,
  promedioReferencia,
  alElegirCaso,
}) {
  const COLOR = paleta();
  const estadisticos = calcularEstadisticos(poblacion.map((dato) => dato.monto));
  const { desviacion } = estadisticos;

  /* Se rotula el promedio histórico declarado por el modelo de riesgo; la
     media de la muestra solo se usa para dimensionar la banda. */
  const media = promedioReferencia ?? estadisticos.media;

  /* La escala vertical llega algo más allá del mayor atípico. */
  const montoMaximo = Math.max(...atipicos.map((dato) => dato.monto)) * 1.12;

  /* Escala de raíz cuadrada: comprime la parte alta del eje para que la
     banda de desviación siga siendo legible junto a montos diez veces
     mayores, sin perder de vista lo lejos que quedan los atípicos. */
  const escalaY = (monto) =>
    ALTO_TRAMA - Math.sqrt(Math.max(monto, 0) / montoMaximo) * ALTO_TRAMA;

  /* Los atípicos se intercalan entre la población para que la comparación
     sea inmediata, en lugar de agruparse todos al final del eje. */
  const total = poblacion.length + atipicos.length;
  const escalaX = (indice) => (ANCHO_TRAMA / (total + 1)) * (indice + 1);

  /* Posiciones repartidas de forma regular para los cuatro atípicos. */
  const posicionAtipico = (indice) =>
    Math.round(((indice + 1) * total) / (atipicos.length + 1));

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label":
        "Dispersión de montos por siniestro: la banda sombreada marca el rango esperado y cuatro casos quedan muy por encima.",
    },
  });

  const trama = crearSVG("g", {
    atributos: { transform: `translate(${MARGEN.izquierda}, ${MARGEN.arriba})` },
  });

  /* --- Bandas de desviación ---------------------------------------- */
  const bandas = [
    { factor: 2, opacidad: 0.06 },
    { factor: 1, opacidad: 0.1 },
  ];

  bandas.forEach(({ factor, opacidad }) => {
    const superior = escalaY(media + desviacion * factor);
    const inferior = escalaY(Math.max(media - desviacion * factor, 0));

    trama.appendChild(
      crearSVG("rect", {
        atributos: {
          x: 0,
          y: superior,
          width: ANCHO_TRAMA,
          height: Math.max(inferior - superior, 1),
          fill: COLOR.bajo,
          opacity: opacidad,
          rx: 4,
        },
      })
    );
  });

  /* --- Línea del promedio histórico -------------------------------- */
  trama.appendChild(
    crearSVG("line", {
      atributos: {
        x1: 0,
        y1: escalaY(media),
        x2: ANCHO_TRAMA,
        y2: escalaY(media),
        stroke: COLOR.bajo,
        "stroke-width": 1.5,
        "stroke-dasharray": "6 4",
      },
    })
  );

  trama.appendChild(
    crearSVG("text", {
      texto: `Promedio histórico ${comoMoneda(media)}`,
      atributos: {
        x: 6,
        y: escalaY(media) - 8,
        fill: COLOR.bajo,
        "font-size": 11,
        "font-family": "monospace",
      },
    })
  );

  /* --- Eje vertical con marcas de monto -----------------------------
     Los valores se eligen a mano porque la escala no es lineal: así el
     eje conserva cifras redondas y suficiente detalle en la zona baja. */
  const marcasEje = [0, 50000, 150000, 400000, 700000, 1000000].filter(
    (monto) => monto <= montoMaximo
  );

  marcasEje.forEach((monto) => {
    const y = escalaY(monto);

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
        texto: `$${Math.round(monto / 1000)}k`,
        atributos: {
          x: -12,
          y: y + 4,
          fill: COLOR.textoTenue,
          "font-size": 11,
          "font-family": "monospace",
          "text-anchor": "end",
        },
      })
    );
  });

  /* --- Globo informativo -------------------------------------------- */
  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  /* Rellena y posiciona el globo respecto del contenedor del gráfico. */
  function mostrarTooltip(dato, evento, contenedor) {
    vaciar(tooltip);

    const filas = [
      ["RUT", dato.rut],
      ["Documento", dato.documento],
      ["Monto", comoMoneda(dato.monto)],
      ["Prestación", dato.prestacion],
      ["Fecha", dato.fecha],
    ];

    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: dato.nombre }));

    filas.forEach(([clave, valor]) => {
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

    /* Se corrige la posición para que el globo no rebase el panel. */
    const anchoTooltip = 240;
    const desbordaDerecha = x + anchoTooltip > limites.width;

    tooltip.style.left = `${desbordaDerecha ? x - anchoTooltip - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  function ocultarTooltip() {
    tooltip.classList.remove("esta-visible");
  }

  /* --- Puntos de la población de referencia ------------------------- */
  const contenedor = crear("div", { clase: "grafico" });

  /* Índices que ocuparán los atípicos, para no solaparlos con el resto. */
  const indicesAtipicos = new Set(atipicos.map((_, indice) => posicionAtipico(indice)));

  /* Cada punto de la población toma la siguiente ranura libre del eje. */
  const ranurasPoblacion = [];
  for (let ranura = 0, asignadas = 0; asignadas < poblacion.length; ranura += 1) {
    if (!indicesAtipicos.has(ranura)) {
      ranurasPoblacion.push(ranura);
      asignadas += 1;
    }
  }

  poblacion.forEach((dato, indice) => {
    const punto = crearSVG("circle", {
      clase: "punto-dato",
      atributos: {
        cx: escalaX(ranurasPoblacion[indice]),
        cy: escalaY(dato.monto),
        r: 5,
        fill: COLOR.puntoPoblacion,
        stroke: COLOR.bajo,
        "stroke-width": 1.5,
      },
    });

    punto.addEventListener("mousemove", (evento) => mostrarTooltip(dato, evento, contenedor));
    punto.addEventListener("mouseleave", ocultarTooltip);
    trama.appendChild(punto);
  });

  /* --- Puntos atípicos ---------------------------------------------- */
  atipicos.forEach((dato, indice) => {
    const cx = escalaX(posicionAtipico(indice));
    const cy = escalaY(dato.monto);

    /* Halo que resalta el punto correspondiente al caso en pantalla. */
    if (dato.esCasoActual) {
      const halo = crearSVG("circle", {
        atributos: { cx, cy, r: 14, fill: COLOR.critico, opacity: 0.18 },
      });
      halo.appendChild(
        crearSVG("animate", {
          atributos: {
            attributeName: "r",
            values: "12;18;12",
            dur: "2.4s",
            repeatCount: "indefinite",
          },
        })
      );
      trama.appendChild(halo);
    }

    /* Línea vertical que enfatiza la distancia respecto del promedio. */
    trama.appendChild(
      crearSVG("line", {
        atributos: {
          x1: cx,
          y1: cy,
          x2: cx,
          y2: escalaY(media),
          stroke: COLOR.critico,
          "stroke-width": 1,
          "stroke-dasharray": "3 3",
          opacity: 0.5,
        },
      })
    );

    const punto = crearSVG("circle", {
      clase: "punto-dato",
      atributos: {
        cx,
        cy,
        r: dato.esCasoActual ? 8 : 7,
        fill: COLOR.critico,
        stroke: COLOR.fondo,
        "stroke-width": 2,
        tabindex: "0",
        role: "button",
        "aria-label": `${dato.nombre}, monto ${comoMoneda(dato.monto)}. Abrir el caso.`,
      },
    });

    punto.addEventListener("mousemove", (evento) => mostrarTooltip(dato, evento, contenedor));
    punto.addEventListener("mouseleave", ocultarTooltip);

    /* El punto también da acceso directo al caso relacionado. */
    if (alElegirCaso && dato.idCaso && !dato.esCasoActual) {
      punto.addEventListener("click", () => alElegirCaso(dato.idCaso));
      punto.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          alElegirCaso(dato.idCaso);
        }
      });
    }

    trama.appendChild(punto);
  });

  svg.appendChild(trama);

  /* --- Leyenda ------------------------------------------------------ */
  const leyenda = crear("div", {
    clase: "grafico__leyenda",
    hijos: [
      crearItemLeyenda(COLOR.bajo, "Siniestros dentro del rango esperado"),
      crearItemLeyenda(COLOR.critico, "Casos fuera de la desviación (4)"),
      crearItemLeyenda(COLOR.puntoPoblacion, "Banda de ±1σ y ±2σ", true),
    ],
  });

  contenedor.appendChild(
    crear("p", { clase: "grafico__titulo", texto: "Dispersión de montos frente al promedio histórico" })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto: "Pase el puntero sobre un punto para ver el detalle del siniestro.",
    })
  );
  contenedor.appendChild(svg);
  contenedor.appendChild(leyenda);
  contenedor.appendChild(tooltip);

  return contenedor;
}

/* Construye un elemento de la leyenda del gráfico. */
function crearItemLeyenda(color, texto, esBanda = false) {
  const muestra = crear("span", { clase: "grafico__muestra" });
  muestra.style.backgroundColor = color;
  if (esBanda) {
    muestra.style.borderRadius = "0.2rem";
  }

  return crear("span", {
    clase: "grafico__leyenda-item",
    hijos: [muestra, crear("span", { texto })],
  });
}
