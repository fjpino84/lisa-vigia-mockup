/* =========================================================================
   LISA vigIA — Herramientas forenses.
   Laboratorio documental: estado de los verificadores automáticos y cola de
   documentos en análisis, con su veredicto y nivel de confianza.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { comoPorcentaje } from "../utils/formato.js";
import { colaDocumental, resumirCola, verificadores } from "../data/inteligencia.js";
import { icono } from "../components/iconos.js";
import { mostrarAviso } from "../components/avisos.js";

/* Traducción de cada estado de la cola. */
const ESTADO = {
  concluido: { texto: "Concluido", clase: "distintivo--neutro" },
  analizando: { texto: "En análisis", clase: "distintivo--medio" },
  en_cola: { texto: "En cola", clase: "distintivo--neutro" },
};

/* Traducción de cada veredicto del peritaje. */
const VEREDICTO = {
  adulterado: { texto: "Adulterado", clase: "distintivo--critico", icono: "alerta" },
  legitimo: { texto: "Legítimo", clase: "distintivo--ok", icono: "visto" },
};

/* Tarjeta de un verificador automático. */
function crearTarjetaVerificador(verificador) {
  return crear("article", {
    clase: "verificador",
    hijos: [
      crear("div", {
        clase: "verificador__cabecera",
        hijos: [
          crear("span", {
            clase: "verificador__icono",
            hijos: [icono(verificador.icono, { tamano: 22 })],
          }),
          crear("div", {
            hijos: [
              crear("h3", { clase: "verificador__nombre", texto: verificador.nombre }),
              crear("p", {
                clase: "verificador__estado",
                hijos: [
                  crear("span", { clase: "verificador__punto" }),
                  crear("span", { texto: "Operativo" }),
                ],
              }),
            ],
          }),
        ],
      }),
      crear("p", { clase: "verificador__descripcion", texto: verificador.descripcion }),
      crear("div", {
        clase: "verificador__pie",
        hijos: [
          crear("div", {
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: "Documentos" }),
              crear("p", {
                clase: ["verificador__cifra", "dato-mono"],
                texto: verificador.procesados.toLocaleString("es-CL"),
              }),
            ],
          }),
          crear("div", {
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: "Precisión" }),
              crear("p", {
                clase: ["verificador__cifra", "dato-mono"],
                texto: comoPorcentaje(verificador.deteccion),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/* Fila de la cola documental. */
function crearFilaDocumento(documento, alAbrirCaso) {
  const estado = ESTADO[documento.estado];
  const veredicto = documento.veredicto ? VEREDICTO[documento.veredicto] : null;

  const etiquetasHallazgo = documento.hallazgos.map((hallazgo) =>
    crear("span", { clase: "marca-hallazgo", texto: hallazgo })
  );

  const celdaVeredicto = veredicto
    ? crear("span", {
        clase: ["distintivo", veredicto.clase],
        texto: veredicto.texto,
      })
    : crear("span", { clase: "texto-tenue", texto: "—" });

  const celdaConfianza = documento.confianza
    ? crear("span", {
        clase: ["puntaje", documento.veredicto === "adulterado" ? "puntaje--alto" : "puntaje--bajo"],
        texto: `${documento.confianza}%`,
      })
    : crear("span", { clase: "texto-tenue", texto: "—" });

  return crear("tr", {
    atributos: {
      tabindex: "0",
      role: "link",
      "aria-label": `Abrir el caso de ${documento.beneficiario}`,
    },
    hijos: [
      crear("td", {
        hijos: [
          crear("p", { clase: "celda-beneficiario__nombre", texto: documento.documento }),
          crear("p", { clase: "celda-beneficiario__rut", texto: documento.beneficiario }),
        ],
      }),
      crear("td", {
        hijos: [crear("span", { clase: ["distintivo", estado.clase], texto: estado.texto })],
      }),
      crear("td", {
        hijos: [
          etiquetasHallazgo.length > 0
            ? crear("div", { clase: "marcas-hallazgo", hijos: etiquetasHallazgo })
            : crear("span", { clase: "texto-tenue", texto: "Sin hallazgos" }),
        ],
      }),
      crear("td", { clase: "col-centro", hijos: [celdaVeredicto] }),
      crear("td", { clase: "col-derecha", hijos: [celdaConfianza] }),
    ],
    eventos: {
      click: () => alAbrirCaso(documento.idCaso),
      keydown: (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          alAbrirCaso(documento.idCaso);
        }
      },
    },
  });
}

/**
 * Construye la vista de herramientas forenses.
 * @param {object} opciones
 * @param {Function} opciones.alAbrirCaso
 * @returns {HTMLElement}
 */
export function crearVistaForense({ alAbrirCaso }) {
  const cola = resumirCola();

  /* --- Indicadores del laboratorio ----------------------------------- */
  const indicadores = crear("section", {
    clase: "indicadores",
    atributos: { "aria-label": "Estado del laboratorio" },
    hijos: [
      crear("article", {
        clase: ["kpi", "kpi--alerta"],
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Documentos adulterados" }),
              icono("alerta", { tamano: 20, clase: "kpi__icono kpi__icono--alerta" }),
            ],
          }),
          crear("p", {
            clase: ["kpi__valor", "kpi__valor--critico"],
            texto: String(cola.adulterados),
          }),
          crear("p", {
            clase: "kpi__nota",
            texto: `de ${cola.concluidos} peritajes concluidos`,
          }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "En análisis" }),
          crear("p", { clase: "kpi__valor", texto: String(cola.analizando) }),
          crear("p", { clase: "kpi__nota", texto: "Peritajes en curso" }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "En cola" }),
          crear("p", { clase: "kpi__valor", texto: String(cola.enCola) }),
          crear("p", { clase: "kpi__nota", texto: "A la espera de procesamiento" }),
        ],
      }),
      crear("article", {
        clase: "kpi",
        hijos: [
          crear("div", {
            clase: "kpi__cabecera",
            hijos: [
              crear("h3", { clase: "kpi__titulo", texto: "Verificadores activos" }),
              icono("escudo", { tamano: 20, clase: "kpi__icono" }),
            ],
          }),
          crear("p", { clase: "kpi__valor", texto: String(verificadores.length) }),
          crear("p", { clase: "kpi__nota", texto: "Operativos en la canalización" }),
        ],
      }),
    ],
  });

  /* --- Verificadores --------------------------------------------------- */
  const panelVerificadores = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("forense", { tamano: 22 }),
              crear("span", { texto: "Verificadores automáticos" }),
            ],
          }),
          crear("span", {
            clase: ["distintivo", "distintivo--ok"],
            atributos: { style: "margin-left:auto" },
            texto: "Todos operativos",
          }),
        ],
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("div", {
            clase: "verificadores",
            hijos: verificadores.map(crearTarjetaVerificador),
          }),
        ],
      }),
    ],
  });

  /* --- Cola documental -------------------------------------------------- */
  const contenedorTabla = crear("div", { clase: "tabla-envoltura" });

  let filtro = "todos";

  const dibujarTabla = () => {
    const documentos =
      filtro === "todos"
        ? colaDocumental
        : colaDocumental.filter((documento) => documento.estado === filtro);

    const tabla = crear("table", {
      clase: "tabla-casos",
      hijos: [
        crear("thead", {
          hijos: [
            crear("tr", {
              hijos: [
                crear("th", { texto: "Documento", atributos: { scope: "col" } }),
                crear("th", { texto: "Estado", atributos: { scope: "col" } }),
                crear("th", { texto: "Hallazgos", atributos: { scope: "col" } }),
                crear("th", {
                  texto: "Veredicto",
                  clase: "col-centro",
                  atributos: { scope: "col" },
                }),
                crear("th", {
                  texto: "Confianza",
                  clase: "col-derecha",
                  atributos: { scope: "col" },
                }),
              ],
            }),
          ],
        }),
        crear("tbody", {
          hijos: documentos.map((documento) => crearFilaDocumento(documento, alAbrirCaso)),
        }),
      ],
    });

    reemplazar(contenedorTabla, tabla);
  };

  const FILTROS = [
    { id: "todos", etiqueta: "Todos" },
    { id: "concluido", etiqueta: "Concluidos" },
    { id: "analizando", etiqueta: "En análisis" },
    { id: "en_cola", etiqueta: "En cola" },
  ];

  const botones = FILTROS.map((opcion) =>
    crear("button", {
      clase: ["boton", opcion.id === "todos" ? "boton--primario" : "boton--fantasma"],
      atributos: { type: "button" },
      texto: opcion.etiqueta,
      datos: { filtroDoc: opcion.id },
    })
  );

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      filtro = boton.dataset.filtroDoc;

      botones.forEach((otro) => {
        const activo = otro.dataset.filtroDoc === filtro;
        otro.classList.toggle("boton--primario", activo);
        otro.classList.toggle("boton--fantasma", !activo);
      });

      dibujarTabla();
    });
  });

  const panelCola = crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [
              icono("documento", { tamano: 22 }),
              crear("span", { texto: "Cola de peritaje documental" }),
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

  /* --- Acción de carga -------------------------------------------------- */
  const cargar = crear("button", {
    clase: ["boton", "boton--primario"],
    atributos: { type: "button" },
    hijos: [icono("mas", { tamano: 16 }), crear("span", { texto: "Cargar documento" })],
    eventos: {
      click: () =>
        mostrarAviso({
          titulo: "Carga de documentos",
          texto: "La carga manual no está habilitada en el prototipo.",
        }),
    },
  });

  return crear("div", {
    clase: "vista",
    hijos: [
      crear("header", {
        clase: "vista__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h1", { clase: "vista__titulo", texto: "Herramientas forenses" }),
              crear("p", {
                clase: "vista__subtitulo",
                texto:
                  "Laboratorio de peritaje documental: verificadores automáticos y estado de los documentos en análisis.",
              }),
            ],
          }),
          cargar,
        ],
      }),
      indicadores,
      panelVerificadores,
      panelCola,
    ],
  });
}
