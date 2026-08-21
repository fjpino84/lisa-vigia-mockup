/* =========================================================================
   LISA vigIA — Grafo de coalición.
   Dispone el prestador en el centro y a su alrededor los pacientes que
   repiten visitas. El grosor de cada arista refleja el número de visitas,
   de modo que la concentración del patrón se aprecia de un vistazo.
   ========================================================================= */

import { crear, crearSVG, vaciar } from "../utils/dom.js";
import { comoMoneda } from "../utils/formato.js";
import { paleta } from "../utils/paleta.js";
import { escaladorDe } from "../utils/escalaGrafico.js";

const ANCHO = 760;
const ALTO = 460;
const CENTRO_X = ANCHO / 2;
/* El centro se sitúa algo por encima del medio: la mitad inferior necesita
   más espacio para los rótulos de los nodos y el cartel del prestador. */
const CENTRO_Y = 200;
const RADIO_ORBITA = 150;

/**
 * Dibuja la red de coalición entre un prestador y sus pacientes.
 * @param {object} opciones
 * @param {object} opciones.prestador Nodo central.
 * @param {object[]} opciones.pacientes Nodos periféricos.
 * @param {Function} [opciones.alElegirCaso] Recibe el id del caso elegido.
 * @returns {HTMLElement}
 */
export function crearGraficoCoalicion({ prestador, pacientes, alElegirCaso }) {
  const COLOR = paleta();
  const px = escaladorDe(ANCHO);
  const contenedor = crear("div", { clase: "grafico" });

  const svg = crearSVG("svg", {
    clase: "grafico__lienzo",
    atributos: {
      viewBox: `0 0 ${ANCHO} ${ALTO}`,
      role: "img",
      "aria-label": `Red de coalición: ${pacientes.length} pacientes concentran sus visitas en el prestador ${prestador.nombre}.`,
    },
  });

  const maximoVisitas = Math.max(...pacientes.map((paciente) => paciente.visitas));

  /* Reparte los pacientes en círculo alrededor del prestador. La órbita se
     estira en vertical para dejar libre la franja del cartel central. */
  const posiciones = pacientes.map((paciente, indice) => {
    const angulo = (Math.PI * 2 * indice) / pacientes.length - Math.PI / 2;
    const seno = Math.sin(angulo);

    return {
      paciente,
      x: CENTRO_X + Math.cos(angulo) * RADIO_ORBITA,
      /* Los nodos por debajo del centro se alejan algo más para que sus
         rótulos no queden bajo el cartel con el nombre del prestador. */
      y: CENTRO_Y + seno * RADIO_ORBITA * (seno > 0 ? 1.06 : 0.82),
    };
  });

  /* --- Anillos de referencia ---------------------------------------- */
  [RADIO_ORBITA * 0.55, RADIO_ORBITA].forEach((radio) => {
    svg.appendChild(
      crearSVG("ellipse", {
        atributos: {
          cx: CENTRO_X,
          cy: CENTRO_Y,
          rx: radio,
          ry: radio * 0.94,
          fill: "none",
          stroke: COLOR.rejilla,
          "stroke-width": 1,
          "stroke-dasharray": "4 6",
        },
      })
    );
  });

  /* --- Globo informativo -------------------------------------------- */
  const tooltip = crear("div", { clase: "tooltip", atributos: { role: "tooltip" } });

  function mostrarTooltip(paciente, evento) {
    vaciar(tooltip);

    const filas = [
      ["RUT", paciente.rut],
      ["Visitas", `${paciente.visitas} en ${paciente.dias} días`],
      ["Monto", comoMoneda(paciente.monto)],
      ["Prestador", prestador.nombre],
    ];

    tooltip.appendChild(crear("p", { clase: "tooltip__titulo", texto: paciente.nombre }));

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
    const anchoTooltip = 240;

    tooltip.style.left = `${x + anchoTooltip > limites.width ? x - anchoTooltip - 32 : x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("esta-visible");
  }

  function ocultarTooltip() {
    tooltip.classList.remove("esta-visible");
  }

  /* --- Aristas ------------------------------------------------------- */
  posiciones.forEach(({ paciente, x, y }) => {
    const grosor = 1 + (paciente.visitas / maximoVisitas) * 4;

    const arista = crearSVG("line", {
      atributos: {
        x1: CENTRO_X,
        y1: CENTRO_Y,
        x2: x,
        y2: y,
        stroke: paciente.esCasoActual ? COLOR.critico : COLOR.violeta,
        "stroke-width": grosor,
        opacity: paciente.esCasoActual ? 0.9 : 0.45,
        "stroke-linecap": "round",
      },
    });

    /* Un pulso recorre la arista del caso en revisión. */
    if (paciente.esCasoActual) {
      arista.appendChild(
        crearSVG("animate", {
          atributos: {
            attributeName: "opacity",
            values: "0.9;0.35;0.9",
            dur: "2.2s",
            repeatCount: "indefinite",
          },
        })
      );
    }

    svg.appendChild(arista);

    /* Número de visitas rotulado junto a la arista. El texto se aparta en
       perpendicular para no quedar bajo el nodo ni bajo el cartel central. */
    const largo = Math.hypot(x - CENTRO_X, y - CENTRO_Y) || 1;

    /* Las aristas inferiores pasan junto al cartel del prestador, así que
       sus rótulos se apartan más y se sitúan más cerca del paciente. */
    const esInferior = y > CENTRO_Y;
    const separacion = esInferior ? 34 : 16;
    const avance = esInferior ? 0.78 : 0.5;

    const medioXAjustado = CENTRO_X + (x - CENTRO_X) * avance;
    const medioYAjustado = CENTRO_Y + (y - CENTRO_Y) * avance;

    const desvioX = (-(y - CENTRO_Y) / largo) * separacion;
    const desvioY = ((x - CENTRO_X) / largo) * separacion;

    svg.appendChild(
      crearSVG("text", {
        texto: `${paciente.visitas} visitas`,
        atributos: {
          x: medioXAjustado + desvioX,
          y: medioYAjustado + desvioY,
          fill: COLOR.textoMedio,
          "font-size": px(10),
          "font-family": "monospace",
          "text-anchor": "middle",
          "dominant-baseline": "middle",
        },
      })
    );
  });

  /* --- Nodo central: el prestador ------------------------------------ */
  const halo = crearSVG("circle", {
    atributos: { cx: CENTRO_X, cy: CENTRO_Y, r: 46, fill: COLOR.violeta, opacity: 0.14 },
  });
  halo.appendChild(
    crearSVG("animate", {
      atributos: {
        attributeName: "r",
        values: "42;54;42",
        dur: "3s",
        repeatCount: "indefinite",
      },
    })
  );
  svg.appendChild(halo);

  svg.appendChild(
    crearSVG("circle", {
      atributos: {
        cx: CENTRO_X,
        cy: CENTRO_Y,
        r: 34,
        fill: COLOR.nodoPrestador,
        stroke: COLOR.violeta,
        "stroke-width": 2,
      },
    })
  );

  svg.appendChild(
    crearSVG("text", {
      texto: "PRESTADOR",
      atributos: {
        x: CENTRO_X,
        y: CENTRO_Y + 4,
        fill: COLOR.violetaClaro,
        "font-size": px(10),
        "font-weight": "700",
        "font-family": "monospace",
        "text-anchor": "middle",
      },
    })
  );

  /* Cartel opaco bajo el nodo central: evita que el nombre del prestador
     se confunda con las aristas que pasan por detrás. */
  const anchoCartel = Math.max(prestador.nombre.length * 7.2, 150);

  svg.appendChild(
    crearSVG("rect", {
      atributos: {
        x: CENTRO_X - anchoCartel / 2,
        y: CENTRO_Y + 40,
        width: anchoCartel,
        height: 36,
        rx: 6,
        fill: COLOR.fondo,
        stroke: COLOR.rejilla,
        "stroke-width": 1,
      },
    })
  );

  svg.appendChild(
    crearSVG("text", {
      texto: prestador.nombre,
      atributos: {
        x: CENTRO_X,
        y: CENTRO_Y + 56,
        fill: COLOR.texto,
        "font-size": px(13),
        "font-weight": "600",
        "text-anchor": "middle",
      },
    })
  );

  svg.appendChild(
    crearSVG("text", {
      texto: prestador.rut,
      atributos: {
        x: CENTRO_X,
        y: CENTRO_Y + 70,
        fill: COLOR.textoTenue,
        "font-size": px(11),
        "font-family": "monospace",
        "text-anchor": "middle",
      },
    })
  );

  /* --- Nodos de pacientes -------------------------------------------- */
  posiciones.forEach(({ paciente, x, y }) => {
    const color = paciente.esCasoActual ? COLOR.critico : COLOR.violeta;

    const grupo = crearSVG("g", {
      clase: "nodo-red",
      atributos: {
        tabindex: "0",
        role: "button",
        "aria-label": `${paciente.nombre}, ${paciente.visitas} visitas en ${paciente.dias} días. Abrir el caso.`,
      },
    });

    grupo.appendChild(
      crearSVG("circle", {
        clase: "nodo-red__circulo",
        atributos: {
          cx: x,
          cy: y,
          r: 22,
          fill: paciente.esCasoActual ? COLOR.nodoCritico : COLOR.nodoVioleta,
          stroke: color,
          "stroke-width": 2,
        },
      })
    );

    /* Iniciales del paciente dentro del nodo. */
    const iniciales = paciente.nombre
      .split(" ")
      .filter((parte) => parte.length > 1)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("");

    grupo.appendChild(
      crearSVG("text", {
        texto: iniciales,
        atributos: {
          x,
          y: y + 4,
          fill: color,
          "font-size": px(12),
          "font-weight": "700",
          "font-family": "monospace",
          "text-anchor": "middle",
        },
      })
    );

    /* Nombre bajo el nodo, desplazado según su posición en la órbita. */
    grupo.appendChild(
      crearSVG("text", {
        texto: paciente.nombre,
        atributos: {
          x,
          y: y < CENTRO_Y ? y - 32 : y + 40,
          fill: paciente.esCasoActual ? COLOR.critico : COLOR.textoMedio,
          "font-size": px(11),
          "font-weight": paciente.esCasoActual ? "700" : "400",
          "text-anchor": "middle",
        },
      })
    );

    grupo.addEventListener("mousemove", (evento) => mostrarTooltip(paciente, evento));
    grupo.addEventListener("mouseleave", ocultarTooltip);

    if (alElegirCaso && !paciente.esCasoActual) {
      grupo.addEventListener("click", () => alElegirCaso(paciente.id));
      grupo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          alElegirCaso(paciente.id);
        }
      });
    }

    svg.appendChild(grupo);
  });

  contenedor.appendChild(
    crear("p", { clase: "grafico__titulo", texto: "Red de concentración sobre un mismo prestador" })
  );
  contenedor.appendChild(
    crear("p", {
      clase: "grafico__ayuda",
      texto:
        "El grosor de cada vínculo representa la cantidad de visitas. Pase el puntero sobre un nodo para ver el detalle.",
    })
  );
  contenedor.appendChild(svg);

  contenedor.appendChild(
    crear("div", {
      clase: "grafico__leyenda",
      hijos: [
        crearItemLeyenda(COLOR.critico, "Caso en revisión"),
        crearItemLeyenda(COLOR.violeta, "Pacientes con el mismo patrón"),
      ],
    })
  );

  contenedor.appendChild(tooltip);
  return contenedor;
}

/* Construye un elemento de la leyenda del grafo. */
function crearItemLeyenda(color, texto) {
  const muestra = crear("span", { clase: "grafico__muestra" });
  muestra.style.backgroundColor = color;

  return crear("span", {
    clase: "grafico__leyenda-item",
    hijos: [muestra, crear("span", { texto })],
  });
}
