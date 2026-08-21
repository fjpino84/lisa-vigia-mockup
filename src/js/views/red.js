/* =========================================================================
   LISA vigIA — Análisis de red.
   Mira la cartera desde los vínculos en lugar de caso a caso: qué prestadores
   concentran siniestros críticos y qué beneficiarios giran a su alrededor.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { comoMoneda, comoPorcentaje } from "../utils/formato.js";
import { construirRedCartera, resumirPrestadores } from "../data/inteligencia.js";
import { icono } from "../components/iconos.js";
import { crearGrafoCartera } from "../components/grafoCartera.js";

/* Distintivo que traduce el nivel de alerta del prestador. */
const DISTINTIVO_ALERTA = {
  critica: { texto: "Concentración crítica", clase: "distintivo--critico" },
  media: { texto: "Bajo vigilancia", clase: "distintivo--medio" },
  baja: { texto: "Sin hallazgos", clase: "distintivo--ok" },
};

/* Tarjeta con el detalle de un prestador y sus casos. */
function crearFichaPrestador(prestador, alAbrirCaso) {
  const distintivo = DISTINTIVO_ALERTA[prestador.alerta];

  const casosCriticos = prestador.casos
    .filter((caso) => caso.criticidad === "critico")
    .sort((uno, otro) => otro.puntaje - uno.puntaje);

  const enlaces = casosCriticos.map((caso) =>
    crear("button", {
      clase: "relacionado",
      atributos: { type: "button" },
      hijos: [
        icono("flechaDerecha", { tamano: 16 }),
        crear("span", {
          clase: "relacionado__datos",
          hijos: [
            crear("span", { clase: "relacionado__nombre", texto: caso.beneficiario }),
            crear("span", {
              clase: "relacionado__meta",
              texto: `${caso.rut} · ${caso.prestacion} · scoring ${caso.puntaje}`,
            }),
          ],
        }),
        crear("span", { clase: "relacionado__monto", texto: comoMoneda(caso.monto) }),
      ],
      eventos: { click: () => alAbrirCaso(caso.id) },
    })
  );

  const metricas = [
    ["Casos totales", String(prestador.totalCasos)],
    ["Críticos", String(prestador.totalCriticos)],
    ["Monto expuesto", comoMoneda(prestador.monto)],
  ].map(([etiqueta, valor]) =>
    crear("div", {
      hijos: [
        crear("p", { clase: "etiqueta-campo", texto: etiqueta }),
        crear("p", { clase: "prestador__metrica", texto: valor }),
      ],
    })
  );

  return crear("article", {
    clase: ["prestador", prestador.alerta === "critica" ? "prestador--critico" : null],
    hijos: [
      crear("header", {
        clase: "prestador__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h3", { clase: "prestador__nombre", texto: prestador.nombre }),
              crear("p", {
                clase: "prestador__meta",
                texto: `${prestador.tipo} · ${prestador.especialidad}`,
              }),
              crear("p", {
                clase: "prestador__meta",
                texto: `RUT ${prestador.id} · ${prestador.comuna} · ${prestador.antiguedad}`,
              }),
            ],
          }),
          crear("span", { clase: ["distintivo", distintivo.clase], texto: distintivo.texto }),
        ],
      }),
      crear("div", { clase: "prestador__metricas", hijos: metricas }),
      crear("p", { clase: "prestador__nota", texto: prestador.nota }),
      enlaces.length > 0
        ? crear("div", {
            hijos: [
              crear("p", {
                clase: "hallazgos__grupo-titulo",
                atributos: { style: "margin-top:1.6rem" },
                texto: "Casos críticos asociados",
              }),
              crear("div", { clase: "relacionados", hijos: enlaces }),
            ],
          })
        : null,
    ],
  });
}

/**
 * Construye la vista de análisis de red.
 * @param {object} opciones
 * @param {Function} opciones.alAbrirCaso
 * @returns {HTMLElement}
 */
export function crearVistaRed({ alAbrirCaso }) {
  const red = construirRedCartera();
  const resumen = resumirPrestadores().filter((prestador) => prestador.totalCasos > 0);

  const foco = resumen[0];
  const concentracion = (foco.totalCriticos / red.totalCriticos) * 100;

  /* --- Indicadores de la red ---------------------------------------- */
  const indicadores = crear("section", {
    clase: "indicadores",
    atributos: { "aria-label": "Indicadores de la red" },
    hijos: [
      crear("article", {
        clase: ["kpi", "kpi--alerta"],
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Prestador con mayor foco" }),
              icono("alerta", { tamano: 20, clase: "kpi__icono kpi__icono--alerta" }),
            ],
          }),
          crear("p", {
            clase: ["kpi__valor", "kpi__valor--critico"],
            atributos: { style: "font-size:2.2rem" },
            texto: foco.nombre,
          }),
          crear("p", {
            clase: "kpi__nota",
            texto: `${foco.totalCriticos} de ${red.totalCriticos} casos críticos de la cartera`,
          }),
        ],
      }),
      crear("article", {
        clase: ["kpi", "kpi--alerta"],
        hijos: [
          crear("h3", {
            clase: "kpi__titulo",
            texto: "Concentración en un solo prestador",
          }),
          crear("div", {
            clase: "kpi__medida",
            hijos: [
              crear("span", {
                clase: "kpi__porcentaje",
                texto: comoPorcentaje(concentracion),
              }),
              crear("span", {
                clase: "barra",
                hijos: [crearRelleno(concentracion)],
              }),
            ],
          }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Prestadores en la cartera" }),
          crear("p", { clase: "kpi__valor", texto: String(resumen.length) }),
          crear("p", {
            clase: "kpi__nota",
            texto: `${resumen.filter((p) => p.alerta !== "baja").length} bajo vigilancia`,
          }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Vínculos analizados" }),
              icono("red", { tamano: 20, clase: "kpi__icono" }),
            ],
          }),
          crear("p", { clase: "kpi__valor", texto: String(red.vinculos.length) }),
          crear("p", { clase: "kpi__nota", texto: "Relaciones prestador-beneficiario" }),
        ],
      }),
    ],
  });

  /* --- Grafo de la cartera ------------------------------------------- */
  const panelGrafo = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [icono("red", { tamano: 22 }), crear("span", { texto: "Red de la cartera" })],
          }),
          crear("span", {
            clase: ["distintivo", "distintivo--critico-suave"],
            atributos: { style: "margin-left:auto" },
            texto: "1 foco detectado",
          }),
        ],
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crearGrafoCartera({
            nodosPrestador: red.nodosPrestador,
            nodosBeneficiario: red.nodosBeneficiario,
            alElegirCaso: alAbrirCaso,
          }),
        ],
      }),
    ],
  });

  /* --- Fichas de prestador -------------------------------------------- */
  const fichas = resumen.map((prestador) => crearFichaPrestador(prestador, alAbrirCaso));

  const panelPrestadores = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("carpeta", { tamano: 22 }),
              crear("span", { texto: "Prestadores por exposición" }),
            ],
          }),
        ],
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [crear("div", { clase: "prestadores", hijos: fichas })],
      }),
    ],
  });

  return crear("div", {
    clase: "vista",
    hijos: [
      crear("header", {
        clase: "vista__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h1", { clase: "vista__titulo", texto: "Análisis de red" }),
              crear("p", {
                clase: "vista__subtitulo",
                texto:
                  "Vínculos entre prestadores y beneficiarios de toda la cartera, para detectar focos que no se aprecian caso a caso.",
              }),
            ],
          }),
        ],
      }),
      indicadores,
      panelGrafo,
      panelPrestadores,
    ],
  });
}

/* Barra de progreso con animación de entrada. */
function crearRelleno(porcentaje) {
  const relleno = crear("span", { clase: "barra__relleno" });
  relleno.style.width = "0%";

  window.requestAnimationFrame(() => {
    relleno.style.width = `${porcentaje}%`;
  });

  return relleno;
}
