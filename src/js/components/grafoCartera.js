/* =========================================================================
   LISA vigIA — Grafo de la cartera completa.
   Cada prestador forma un núcleo con sus beneficiarios alrededor. El tamaño
   del núcleo refleja cuántos casos concentra y su color, el nivel de alerta,
   de modo que los focos de fraude se distinguen de un vistazo.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { comoMoneda } from "../utils/formato.js";

const ANCHO = 900;

/* Alto de cada fila de núcleos; el lienzo crece según cuántas hagan falta,
   de modo que no queden franjas vacías cuando hay pocos prestadores. */
const ALTO_FILA = 250;

/* Color de cada nivel de alerta del prestador. */
const COLOR_ALERTA = {
  critica: "#f2857f",
  media: "#e5b567",
  baja: "#6ea8d8",
};

/* Proporción vertical de la órbita: la achata para dejar sitio al cartel. */
const ACHATADO = 0.68;

/* Radio de la órbita de beneficiarios en torno a un núcleo. */
const radioOrbita = (cantidad) => Math.min(40 + cantidad * 4, 76);

/**
 * Dibuja la red de prestadores y beneficiarios de toda la cartera.
 * @param {object} opciones
 * @param {object[]} opciones.nodosPrestador
 * @param {object[]} opciones.nodosBeneficiario
 * @param {Function} [opciones.alElegirCaso] Recibe el id del caso.
 * @returns {HTMLElement}
 */
export function crearGrafoCartera({ nodosPrestador, nodosBeneficiario, alElegirCaso }) {
  const contenedor = crear("div", { clase: "grafico" });

  /* Los prestadores se reparten en una retícula holgada, ordenados de mayor
     a menor concentración para que el foco principal quede a la izquierda. */
  const ordenados = [...nodosPrestador].sort((uno, otro) => otro.casos - uno.casos);
  const columnas = Math.min(ordenados.length, 3);
  const filas = Math.ceil(ordenados.length / columnas);

  const anchoCelda = ANCHO / columnas;
  const altoCelda = ALTO_FILA;
  const alto = filas * ALTO_FILA;

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${alto}`,
      role: "img",
      "aria-label": `Red de la cartera: ${nodosPrestador.length} prestadores y ${nodosBeneficiario.length} beneficiarios.`,
    },
  });

  const centros = new Map();

  ordenados.forEach((prestador, indice) => {
    const columna = indice % columnas;
    const fila = Math.floor(indice / columnas);

    centros.set(prestador.id, {
      x: anchoCelda * (columna + 0.5),
      y: altoCelda * (fila + 0.5),
      prestador,
    });
  });

  /* --- Globo informativo -------------------------------------------- */
  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  function mostrarTooltip(titulo, filas, evento) {
    vaciar(tooltip);
    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: titulo }));

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
    const ancho = 240;

    tooltip.style.left = `${x + ancho > limites.width ? x - ancho - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  const ocultarTooltip = () => tooltip.classList.remove("esta-visible");

  /* --- Vínculos y beneficiarios -------------------------------------- */
  centros.forEach(({ x, y, prestador }) => {
    const propios = nodosBeneficiario.filter(
      (nodo) => nodo.prestador === prestador.id
    );

    const color = COLOR_ALERTA[prestador.alerta];
    const radio = radioOrbita(propios.length);

    propios.forEach((beneficiario, indice) => {
      const angulo = (Math.PI * 2 * indice) / propios.length - Math.PI / 2;
      const bx = x + Math.cos(angulo) * radio;
      /* La órbita se achata para reservar espacio al cartel del nombre. */
      const by = y + Math.sin(angulo) * radio * ACHATADO;

      const esCritico = beneficiario.criticidad === "critico";

      svg.appendChild(
        crearSVG("line", {
          atributos: {
            x1: x,
            y1: y,
            x2: bx,
            y2: by,
            stroke: esCritico ? color : "#3a3a46",
            "stroke-width": esCritico ? 1.6 : 1,
            opacity: esCritico ? 0.7 : 0.35,
          },
        })
      );

      const nodo = crearSVG("circle", {
        clase: "punto-dato",
        atributos: {
          cx: bx,
          cy: by,
          r: esCritico ? 7 : 5,
          fill: esCritico ? color : "#2a2a34",
          stroke: esCritico ? "#0a0a0c" : "#4a4a58",
          "stroke-width": 1.5,
          tabindex: "0",
          role: "button",
          "aria-label": `${beneficiario.etiqueta}, puntaje ${beneficiario.puntaje}. Abrir el caso.`,
        },
      });

      const detalle = [
        ["RUT", beneficiario.rut],
        ["Monto", comoMoneda(beneficiario.monto)],
        ["Scoring", `${beneficiario.puntaje}/100`],
        ["Criticidad", esCritico ? "Crítico" : "Leve"],
      ];

      nodo.addEventListener("mousemove", (evento) =>
        mostrarTooltip(beneficiario.etiqueta, detalle, evento)
      );
      nodo.addEventListener("mouseleave", ocultarTooltip);

      if (alElegirCaso) {
        nodo.addEventListener("click", () => alElegirCaso(beneficiario.id));
        nodo.addEventListener("keydown", (evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            alElegirCaso(beneficiario.id);
          }
        });
      }

      svg.appendChild(nodo);
    });
  });

  /* --- Núcleos de prestador ------------------------------------------ */
  centros.forEach(({ x, y, prestador }) => {
    const color = COLOR_ALERTA[prestador.alerta];
    const radioNucleo = 16 + Math.min(prestador.casos, 6) * 2.6;

    /* El foco crítico late para atraer la mirada. */
    if (prestador.alerta === "critica") {
      const halo = crearSVG("circle", {
        atributos: { cx: x, cy: y, r: radioNucleo + 12, fill: color, opacity: 0.16 },
      });
      halo.appendChild(
        crearSVG("animate", {
          atributos: {
            attributeName: "r",
            values: `${radioNucleo + 8};${radioNucleo + 20};${radioNucleo + 8}`,
            dur: "3s",
            repeatCount: "indefinite",
          },
        })
      );
      svg.appendChild(halo);
    }

    const nucleo = crearSVG("circle", {
      clase: "punto-dato",
      atributos: {
        cx: x,
        cy: y,
        r: radioNucleo,
        fill: "#16161c",
        stroke: color,
        "stroke-width": prestador.alerta === "critica" ? 3 : 2,
        tabindex: "0",
        "aria-label": `${prestador.etiqueta}: ${prestador.casos} casos, ${prestador.criticos} críticos.`,
      },
    });

    nucleo.addEventListener("mousemove", (evento) =>
      mostrarTooltip(prestador.etiqueta, [
        ["RUT", prestador.id],
        ["Casos", String(prestador.casos)],
        ["Críticos", String(prestador.criticos)],
        ["Monto", comoMoneda(prestador.monto)],
      ], evento)
    );
    nucleo.addEventListener("mouseleave", ocultarTooltip);
    svg.appendChild(nucleo);

    svg.appendChild(
      crearSVG("text", {
        texto: String(prestador.casos),
        atributos: {
          x,
          y: y + 4,
          fill: color,
          "font-size": 13,
          "font-weight": "700",
          "font-family": "monospace",
          "text-anchor": "middle",
        },
      })
    );

    /* Cartel con el nombre, sobre fondo opaco para separarlo del grafo. */
    const etiqueta = prestador.etiqueta;
    const anchoCartel = Math.max(etiqueta.length * 6.4, 120);

    /* El cartel se sitúa por debajo de la órbita, no del núcleo, para que
       ningún beneficiario quede tapado por el nombre del prestador. */
    const propios = nodosBeneficiario.filter((nodo) => nodo.prestador === prestador.id);
    const yCartel = y + radioOrbita(propios.length) * ACHATADO + 18;

    svg.appendChild(
      crearSVG("rect", {
        atributos: {
          x: x - anchoCartel / 2,
          y: yCartel,
          width: anchoCartel,
          height: 20,
          rx: 5,
          fill: "#0a0a0c",
          stroke: "#26262e",
          "stroke-width": 1,
        },
      })
    );

    svg.appendChild(
      crearSVG("text", {
        texto: etiqueta,
        atributos: {
          x,
          y: yCartel + 14,
          fill: "#f2f2f5",
          "font-size": 11,
          "font-weight": "600",
          "text-anchor": "middle",
        },
      })
    );
  });

  contenedor.appendChild(
    crear("p", {
      clase: "grafico__titulo",
      texto: "Mapa de vínculos entre prestadores y beneficiarios",
    })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto:
        "El tamaño del núcleo indica cuántos casos concentra el prestador. Pase el puntero sobre cualquier nodo para ver el detalle.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda(COLOR_ALERTA.critica, "Concentración crítica"),
        crearItemLeyenda(COLOR_ALERTA.media, "Bajo vigilancia"),
        crearItemLeyenda(COLOR_ALERTA.baja, "Sin hallazgos"),
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
