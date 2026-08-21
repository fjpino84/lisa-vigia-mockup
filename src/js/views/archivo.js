/* =========================================================================
   LISA vigIA — Inteligencia archivada.
   Reúne los casos ya resueltos, el histórico de resoluciones y los patrones
   de fraude confirmados que alimentan el modelo de scoring.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { comoMoneda, comoPorcentaje } from "../utils/formato.js";
import {
  casosArchivados,
  historialResoluciones,
  patronesAprendidos,
  resumirArchivo,
} from "../data/inteligencia.js";
import { icono } from "../components/iconos.js";
import { crearGraficoBarras } from "../components/graficoBarras.js";

/* Tarjeta de un patrón de fraude aprendido. */
function crearTarjetaPatron(patron) {
  const sube = patron.tendencia >= 0;

  return crear("article", {
    clase: "patron",
    hijos: [
      crear("div", {
        clase: "patron__cabecera",
        hijos: [
          crear("h3", { clase: "patron__nombre", texto: patron.nombre }),
          crear("span", {
            clase: ["patron__tendencia", sube ? "patron__tendencia--sube" : "patron__tendencia--baja"],
            hijos: [
              icono("tendencia", { tamano: 14 }),
              crear("span", {
                texto: `${sube ? "+" : ""}${patron.tendencia}% semestral`,
              }),
            ],
          }),
        ],
      }),
      crear("p", { clase: "patron__descripcion", texto: patron.descripcion }),
      crear("div", {
        clase: "patron__medida",
        hijos: [
          crear("div", {
            clase: "patron__cifra",
            hijos: [
              crear("span", {
                clase: ["puntaje", "puntaje--alto"],
                texto: String(patron.detecciones),
              }),
              crear("span", { clase: "texto-tenue", texto: " detecciones" }),
            ],
          }),
          crear("div", {
            clase: "patron__peso",
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: "Peso en el scoring" }),
              crear("div", {
                clase: "kpi__medida",
                hijos: [
                  crear("span", {
                    clase: "patron__porcentaje",
                    texto: comoPorcentaje(patron.peso),
                  }),
                  crear("span", { clase: "barra", hijos: [crearRelleno(patron.peso)] }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/* Fila del listado de casos archivados. */
function crearFilaArchivo(caso) {
  const esFraude = caso.resolucion === "fraude";

  return crear("tr", {
    hijos: [
      crear("td", {
        hijos: [
          crear("p", { clase: "celda-beneficiario__nombre", texto: caso.beneficiario }),
          crear("p", { clase: "celda-beneficiario__rut", texto: caso.rut }),
        ],
      }),
      crear("td", { hijos: [crear("span", { clase: "texto-tenue", texto: caso.prestador })] }),
      crear("td", { hijos: [crear("span", { clase: "marca-hallazgo", texto: caso.patron })] }),
      crear("td", {
        clase: "col-centro",
        hijos: [
          crear("span", {
            clase: ["distintivo", esFraude ? "distintivo--critico" : "distintivo--ok"],
            texto: esFraude ? "Fraude" : "Liberado",
          }),
        ],
      }),
      crear("td", {
        clase: "col-derecha",
        hijos: [
          crear("span", {
            clase: ["puntaje", esFraude ? "puntaje--alto" : "puntaje--bajo"],
            texto: String(caso.puntaje),
          }),
        ],
      }),
      crear("td", {
        clase: "col-derecha",
        hijos: [crear("span", { clase: "dato-mono", texto: comoMoneda(caso.monto) })],
      }),
      crear("td", {
        clase: "col-derecha",
        hijos: [crear("span", { clase: "texto-tenue", texto: caso.cierre })],
      }),
    ],
  });
}

/**
 * Construye la vista de inteligencia archivada.
 * @returns {HTMLElement}
 */
export function crearVistaArchivo() {
  const resumen = resumirArchivo();

  /* --- Indicadores del archivo ---------------------------------------- */
  const indicadores = crear("section", {
    clase: "indicadores",
    atributos: { "aria-label": "Resumen del archivo" },
    hijos: [
      crear("article", {
        clase: ["kpi", "kpi--alerta", "kpi--ancho"],
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Monto bloqueado en seis meses" }),
              crear("span", {
                clase: ["distintivo", "distintivo--ok"],
                texto: "Recuperado",
              }),
            ],
          }),
          crear("p", {
            clase: ["kpi__valor", "kpi__valor--monto", "kpi__valor--critico"],
            texto: comoMoneda(resumen.montoBloqueado),
          }),
          crear("p", {
            clase: "kpi__nota",
            texto: `Correspondiente a ${resumen.fraude} siniestros derivados a investigación`,
          }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Casos resueltos" }),
          crear("p", { clase: "kpi__valor", texto: String(resumen.total) }),
          crear("p", { clase: "kpi__nota", texto: "En los últimos seis meses" }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Tasa de fraude confirmado" }),
          crear("div", {
            clase: "kpi__medida",
            hijos: [
              crear("span", {
                clase: "kpi__porcentaje",
                texto: comoPorcentaje(resumen.tasaFraude),
              }),
              crear("span", { clase: "barra", hijos: [crearRelleno(resumen.tasaFraude)] }),
            ],
          }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Patrones aprendidos" }),
              icono("huella", { tamano: 20, clase: "kpi__icono" }),
            ],
          }),
          crear("p", { clase: "kpi__valor", texto: String(patronesAprendidos.length) }),
          crear("p", { clase: "kpi__nota", texto: "Alimentan el modelo de scoring" }),
        ],
      }),
    ],
  });

  /* --- Histórico ------------------------------------------------------- */
  const panelHistorico = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("grafico", { tamano: 22 }),
              crear("span", { texto: "Histórico de resoluciones" }),
            ],
          }),
        ],
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [crearGraficoBarras({ historial: historialResoluciones })],
      }),
    ],
  });

  /* --- Patrones aprendidos ---------------------------------------------- */
  const panelPatrones = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("huella", { tamano: 22 }),
              crear("span", { texto: "Patrones de fraude confirmados" }),
            ],
          }),
        ],
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("div", {
            clase: "patrones",
            hijos: patronesAprendidos.map(crearTarjetaPatron),
          }),
        ],
      }),
    ],
  });

  /* --- Casos archivados --------------------------------------------------- */
  const contenedorTabla = crear("div", { clase: "tabla-envoltura" });

  let filtro = "todos";

  const dibujarTabla = () => {
    const listado =
      filtro === "todos"
        ? casosArchivados
        : casosArchivados.filter((caso) => caso.resolucion === filtro);

    reemplazar(
      contenedorTabla,
      crear("table", {
        clase: "tabla-casos",
        hijos: [
          crear("thead", {
            hijos: [
              crear("tr", {
                hijos: [
                  crear("th", { texto: "Beneficiario", atributos: { scope: "col" } }),
                  crear("th", { texto: "Prestador", atributos: { scope: "col" } }),
                  crear("th", { texto: "Patrón", atributos: { scope: "col" } }),
                  crear("th", {
                    texto: "Resolución",
                    clase: "col-centro",
                    atributos: { scope: "col" },
                  }),
                  crear("th", {
                    texto: "Scoring",
                    clase: "col-derecha",
                    atributos: { scope: "col" },
                  }),
                  crear("th", {
                    texto: "Monto",
                    clase: "col-derecha",
                    atributos: { scope: "col" },
                  }),
                  crear("th", {
                    texto: "Cierre",
                    clase: "col-derecha",
                    atributos: { scope: "col" },
                  }),
                ],
              }),
            ],
          }),
          crear("tbody", { hijos: listado.map(crearFilaArchivo) }),
        ],
      })
    );
  };

  const FILTROS = [
    { id: "todos", etiqueta: "Todos" },
    { id: "fraude", etiqueta: "Fraude confirmado" },
    { id: "liberado", etiqueta: "Liberados" },
  ];

  const botones = FILTROS.map((opcion) =>
    crear("button", {
      clase: ["boton", opcion.id === "todos" ? "boton--primario" : "boton--fantasma"],
      atributos: { type: "button" },
      texto: opcion.etiqueta,
      datos: { filtroArchivo: opcion.id },
    })
  );

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      filtro = boton.dataset.filtroArchivo;

      botones.forEach((otro) => {
        const activo = otro.dataset.filtroArchivo === filtro;
        otro.classList.toggle("boton--primario", activo);
        otro.classList.toggle("boton--fantasma", !activo);
      });

      dibujarTabla();
    });
  });

  const panelCasos = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("archivo", { tamano: 22 }),
              crear("span", { texto: "Casos cerrados" }),
            ],
          }),
          crear("div", {
            atributos: { style: "margin-left:auto;display:flex;gap:0.8rem;flex-wrap:wrap" },
            hijos: botones,
          }),
        ],
      }),
      contenedorTabla,
    ],
  });

  dibujarTabla();

  return crear("div", {
    clase: "vista",
    hijos: [
      crear("header", {
        clase: "vista__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h1", { clase: "vista__titulo", texto: "Inteligencia archivada" }),
              crear("p", {
                clase: "vista__subtitulo",
                texto:
                  "Historial de casos resueltos y patrones de fraude confirmados que alimentan el modelo de scoring.",
              }),
            ],
          }),
        ],
      }),
      indicadores,
      panelHistorico,
      panelPatrones,
      panelCasos,
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
