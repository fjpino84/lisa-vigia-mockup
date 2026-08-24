/* =========================================================================
   LISA vigIA — Vista de reporte de caso.
   Reúne la ficha del siniestro y las tres secciones de evidencia: análisis
   forense del documento, validación con fuentes y patrones de conducta.
   ========================================================================= */

import { crear, fragmento } from "../utils/dom.js";
import { comoMoneda, marcaDeTiempo } from "../utils/formato.js";
import { NIVEL, casosAtipicos, poblacionHistorica, redCoalicion } from "../data/casos.js";
import { icono } from "../components/iconos.js";
import { crearVisorDocumento } from "../components/visorDocumento.js";
import { crearGraficoDesviacion } from "../components/graficoDesviacion.js";
import { crearGraficoCoalicion } from "../components/graficoCoalicion.js";
import { crearBarraDecision } from "../components/barraDecision.js";

/* Distintivo que acompaña a la cabecera de cada sección. */
function crearDistintivoNivel(nivel) {
  const textos = {
    [NIVEL.ALTO]: "Semáforo rojo",
    [NIVEL.MEDIO]: "Semáforo ámbar",
    [NIVEL.BAJO]: "Semáforo verde",
  };

  const clases = {
    [NIVEL.ALTO]: "distintivo--critico-suave",
    [NIVEL.MEDIO]: "distintivo--medio",
    [NIVEL.BAJO]: "distintivo--ok",
  };

  return crear("span", {
    clase: ["distintivo", clases[nivel], "seccion__distintivo"],
    texto: textos[nivel],
  });
}

/* Cabecera común a las tres secciones de evidencia. */
function crearCabeceraSeccion({ titulo, nombreIcono, nivel }) {
  const punto = crear("span", {
    clase: ["semaforo", "semaforo--grande", `semaforo--${nivel}`],
    atributos: { "aria-hidden": "true" },
  });

  return crear("header", {
    clase: "seccion__cabecera",
    hijos: [
      punto,
      crear("h2", {
        clase: "seccion__titulo",
        hijos: [icono(nombreIcono, { tamano: 22 }), crear("span", { texto: titulo })],
      }),
      crearDistintivoNivel(nivel),
    ],
  });
}

/* Ficha superior con los datos del siniestro y el sello de probabilidad. */
function crearFicha(caso) {
  const esCritico = caso.criticidad === "critico";

  const datos = [
    { etiqueta: "Monto reclamado", valor: comoMoneda(caso.monto), destacado: true },
    { etiqueta: "Prestador", valor: caso.prestador, secundario: `RUT ${caso.rutPrestador}` },
    { etiqueta: "Prestación", valor: caso.prestacion },
    { etiqueta: "Documento", valor: caso.documento, secundario: `Emisión ${caso.fechaDocumento}` },
    { etiqueta: "Ingreso del siniestro", valor: caso.fechaIngreso },
  ];

  const celdas = datos.map(({ etiqueta, valor, secundario, destacado }) =>
    crear("div", {
      hijos: [
        crear("p", { clase: "etiqueta-campo", texto: etiqueta }),
        crear("p", {
          clase: ["ficha__dato-valor", destacado ? "ficha__dato-valor--monto" : null],
          texto: valor,
        }),
        secundario ? crear("p", { clase: "ficha__dato-secundario", texto: secundario }) : null,
      ],
    })
  );

  const identidad = crear("div", {
    hijos: [
      crear("div", {
        clase: "ficha__identidad",
        hijos: [
          crear("h1", {
            clase: "ficha__nombre",
            hijos: [icono("usuario", { tamano: 26 }), crear("span", { texto: caso.beneficiario })],
          }),
          crear("span", { clase: "ficha__rut", texto: `RUT: ${caso.rut}` }),
          crear("p", {
            clase: "ficha__siniestro",
            hijos: [
              crear("span", { texto: "N° de siniestro: " }),
              crear("strong", { texto: caso.numeroSiniestro }),
            ],
          }),
        ],
      }),
      crear("div", { clase: "ficha__datos", hijos: celdas }),
    ],
  });

  const sello = crear("aside", {
    clase: ["sello", esCritico ? null : "sello--leve"],
    hijos: [
      crear("div", { clase: "sello__circulo", texto: String(caso.puntaje) }),
      crear("p", {
        clase: "sello__texto",
        texto: esCritico ? "Alta probabilidad de fraude" : "Baja probabilidad de fraude",
      }),
      crear("p", { clase: "sello__escala", texto: "Scoring de riesgo · escala 1 a 100" }),
    ],
  });

  return crear("section", {
    clase: ["ficha", esCritico ? null : "ficha--leve"],
    hijos: [identidad, sello],
  });
}

/* Sección 1: análisis forense del documento. */
function crearSeccionForense(caso) {
  const { forense } = caso.evidencia;

  const visor = crearVisorDocumento({ caso, marcas: forense.marcas });

  const hallazgosVisuales = forense.visual.map((item) =>
    crear("div", {
      clase: ["hallazgo", "hallazgo--critico"],
      hijos: [
        icono("aviso", { tamano: 18, clase: "hallazgo__icono" }),
        crear("div", {
          hijos: [
            crear("p", { clase: "hallazgo__titulo", texto: item.titulo }),
            crear("p", { texto: item.texto }),
          ],
        }),
      ],
    })
  );

  const { metadatos } = forense;

  const bloqueMetadatos = crear("div", {
    clase: "metadatos",
    hijos: [
      crearLineaMetadato("File Created:", metadatos.creacion),
      crearLineaMetadato("Last Modified:", metadatos.modificacion),
      crear("div", { clase: "metadatos__separador" }),
      crear("p", {
        clase: "metadatos__alerta",
        texto: `Software: ${metadatos.software} — Modificado en 2024`,
      }),
    ],
  });

  const conclusionMeta = crear("div", {
    clase: ["hallazgo", "hallazgo--critico"],
    hijos: [
      icono("huella", { tamano: 18, clase: "hallazgo__icono" }),
      crear("p", { texto: metadatos.conclusion }),
    ],
  });

  const columnaHallazgos = crear("div", {
    clase: "seccion__columna",
    hijos: [
      crear("div", {
        hijos: [
          crear("p", { clase: "hallazgos__grupo-titulo", texto: "Detección visual (LLM)" }),
          ...hallazgosVisuales,
        ],
      }),
      crear("div", {
        atributos: { style: "margin-top:2.4rem" },
        hijos: [
          crear("p", { clase: "hallazgos__grupo-titulo", texto: "Análisis de metadatos" }),
          bloqueMetadatos,
          crear("div", { atributos: { style: "margin-top:1.6rem" }, hijos: [conclusionMeta] }),
        ],
      }),
    ],
  });

  return crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraSeccion({
        titulo: "Análisis forense del documento",
        nombreIcono: "documento",
        nivel: caso.semaforo.forense,
      }),
      crear("div", {
        clase: "seccion__doble",
        hijos: [crear("div", { clase: "seccion__columna", hijos: [visor] }), columnaHallazgos],
      }),
    ],
  });
}

/* Línea clave/valor dentro del bloque de metadatos. */
function crearLineaMetadato(clave, valor) {
  return crear("p", {
    clase: "metadatos__linea",
    hijos: [
      crear("span", { clase: "metadatos__clave", texto: `${clave} ` }),
      crear("span", { texto: valor }),
    ],
  });
}

/* Sección 2: validación con fuentes externas e internas. */
function crearSeccionValidacion(caso) {
  const tarjetas = caso.evidencia.validacion.map((item) => {
    const detalles = [];

    /* El contraste de montos se muestra como comparación explícita. */
    if (item.montoReal !== undefined) {
      detalles.push(
        crear("div", {
          clase: "metadatos",
          atributos: { style: "margin-top:1.2rem" },
          hijos: [
            crearLineaMetadato("Monto declarado:", comoMoneda(item.montoDeclarado)),
            crearLineaMetadato("Monto en código bidimensional:", comoMoneda(item.montoReal)),
            crear("div", { clase: "metadatos__separador" }),
            crear("p", {
              clase: "metadatos__alerta",
              texto: `Diferencia detectada: ${comoMoneda(item.montoDeclarado - item.montoReal)}`,
            }),
          ],
        })
      );
    }

    return crear("article", {
      clase: ["hallazgo", "hallazgo--critico"],
      atributos: { style: "flex-direction:column;align-items:stretch" },
      hijos: [
        crear("div", {
          atributos: { style: "display:flex;gap:1.2rem;align-items:flex-start" },
          hijos: [
            icono(item.fuente === "Watchlist" ? "escudo" : "aviso", {
              tamano: 18,
              clase: "hallazgo__icono",
            }),
            crear("div", {
              hijos: [
                crear("p", {
                  clase: "hallazgos__grupo-titulo",
                  texto: item.fuente.toUpperCase(),
                }),
                crear("p", { clase: "hallazgo__titulo", texto: item.titulo }),
                crear("p", { texto: item.texto }),
              ],
            }),
          ],
        }),
        ...detalles,
      ],
    });
  });

  return crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraSeccion({
        titulo: "Validación con fuentes externas e internas",
        nombreIcono: "escudo",
        nivel: caso.semaforo.validacion,
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [crear("div", { clase: "hallazgos", hijos: tarjetas })],
      }),
    ],
  });
}

/* Sección 3: patrones de comportamiento, con los dos gráficos. */
function crearSeccionPatrones(caso, alAbrirCaso) {
  const { desviacion, coalicion } = caso.evidencia.patrones;

  /* --- Bloque de desviación estadística ----------------------------- */
  const relacionados = casosAtipicos
    .filter((dato) => !dato.esCasoActual)
    .map((dato) =>
      crear("button", {
        clase: "relacionado",
        atributos: { type: "button" },
        hijos: [
          icono("flechaDerecha", { tamano: 16 }),
          crear("span", {
            clase: "relacionado__datos",
            hijos: [
              crear("span", { clase: "relacionado__nombre", texto: dato.nombre }),
              crear("span", {
                clase: "relacionado__meta",
                texto: `${dato.rut} · ${dato.prestacion} · ${dato.fecha}`,
              }),
            ],
          }),
          crear("span", { clase: "relacionado__monto", texto: comoMoneda(dato.monto) }),
        ],
        eventos: { click: () => alAbrirCaso(dato.idCaso) },
      })
    );

  /* El gráfico ocupa la mitad izquierda y los casos con desviación
     semejante acompañan a la derecha, donde antes quedaban debajo. */
  const bloqueDesviacion = crear("div", {
    hijos: [
      crear("div", {
        clase: ["hallazgo", "hallazgo--critico"],
        hijos: [
          icono("tendencia", { tamano: 18, clase: "hallazgo__icono" }),
          crear("div", {
            hijos: [
              crear("p", { clase: "hallazgo__titulo", texto: "Desviación" }),
              crear("p", { texto: desviacion.texto }),
            ],
          }),
        ],
      }),
      crear("div", {
        clase: "patron-doble",
        hijos: [
          crearGraficoDesviacion({
            poblacion: poblacionHistorica,
            atipicos: casosAtipicos,
            promedioReferencia: desviacion.promedio,
            alElegirCaso: alAbrirCaso,
          }),
          crear("div", {
            clase: ["patron-doble__lado", "no-imprimir"],
            hijos: [
              crear("p", {
                clase: "hallazgos__grupo-titulo",
                texto: "Casos con desviación similar",
              }),
              crear("div", { clase: "relacionados", hijos: relacionados }),
            ],
          }),
        ],
      }),
    ],
  });

  /* --- Bloque de coalición ------------------------------------------ */

  /* Los demás pacientes de la red, con sus visitas y su monto. */
  const pacientesRelacionados = redCoalicion.pacientes
    .filter((paciente) => !paciente.esCasoActual)
    .map((paciente) =>
      crear("button", {
        clase: "relacionado",
        atributos: { type: "button" },
        hijos: [
          icono("flechaDerecha", { tamano: 16 }),
          crear("span", {
            clase: "relacionado__datos",
            hijos: [
              crear("span", { clase: "relacionado__nombre", texto: paciente.nombre }),
              crear("span", {
                clase: "relacionado__meta",
                texto: `${paciente.rut} · ${paciente.visitas} visitas en ${paciente.dias} días`,
              }),
            ],
          }),
          crear("span", {
            clase: "relacionado__monto",
            texto: comoMoneda(paciente.monto),
          }),
        ],
        eventos: { click: () => alAbrirCaso(paciente.id) },
      })
    );
  const bloqueCoalicion = crear("div", {
    atributos: { style: "margin-top:3.2rem" },
    hijos: [
      crear("div", {
        clase: ["hallazgo", "hallazgo--critico"],
        hijos: [
          icono("red", { tamano: 18, clase: "hallazgo__icono" }),
          crear("div", {
            hijos: [
              crear("p", { clase: "hallazgo__titulo", texto: "Coalición" }),
              crear("p", { texto: coalicion.texto }),
            ],
          }),
        ],
      }),
      crear("div", {
        clase: "patron-doble",
        hijos: [
          crearGraficoCoalicion({
            prestador: redCoalicion.prestador,
            pacientes: redCoalicion.pacientes,
            alElegirCaso: alAbrirCaso,
          }),
          crear("div", {
            clase: ["patron-doble__lado", "no-imprimir"],
            hijos: [
              crear("p", {
                clase: "hallazgos__grupo-titulo",
                texto: "Pacientes sobre el mismo prestador",
              }),
              crear("div", { clase: "relacionados", hijos: pacientesRelacionados }),
            ],
          }),
        ],
      }),
    ],
  });

  return crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraSeccion({
        titulo: "Análisis de patrones de comportamiento",
        nombreIcono: "red",
        nivel: caso.semaforo.patrones,
      }),
      crear("div", { clase: "panel__cuerpo", hijos: [bloqueDesviacion, bloqueCoalicion] }),
    ],
  });
}

/* Aviso mostrado en casos sin expediente forense detallado. */
function crearAvisoSinEvidencia(caso) {
  const estaCerrado = caso.estado === "cerrado";

  const primeraLinea = estaCerrado
    ? "Este siniestro ya fue resuelto y su expediente se conserva en el archivo."
    : "Este caso aún no cuenta con un expediente forense detallado en el prototipo.";

  return crear("section", {
    clase: "panel",
    hijos: [
      crear("div", {
        clase: "estado-vacio",
        hijos: [
          estaCerrado
            ? crear("span", {
                clase: ["distintivo", "distintivo--neutro"],
                atributos: { style: "margin-bottom:1.6rem" },
                texto: "Caso cerrado",
              })
            : null,
          crear("p", { texto: primeraLinea }),
          crear("p", {
            atributos: { style: "margin-top:0.8rem" },
            texto:
              "El expediente completo se encuentra disponible en el caso de Ramiro Lucas Fiochi (N° 77940303).",
          }),
        ],
      }),
    ],
  });
}

/* Encabezado que solo aparece en la versión impresa del reporte. */
function crearEncabezadoImpresion(caso) {
  return crear("header", {
    clase: "encabezado-impresion",
    hijos: [
      crear("div", {
        clase: "encabezado-impresion__marca",
        hijos: [
          crear("img", {
            clase: "encabezado-impresion__logo",
            atributos: { src: "assets/lisa-logo.png", alt: "" },
          }),
          crear("span", { texto: "LISA vigIA · Reporte de caso" }),
        ],
      }),
      crear("div", {
        clase: "encabezado-impresion__meta",
        hijos: [
          crear("p", { texto: `Siniestro N° ${caso.numeroSiniestro}` }),
          crear("p", { texto: `Emitido el ${marcaDeTiempo()}` }),
        ],
      }),
    ],
  });
}

/**
 * Construye la vista de reporte para un caso.
 * @param {object} opciones
 * @param {object} opciones.caso Caso que se está revisando.
 * @param {Function} opciones.alVolver Regresa al panel inicial.
 * @param {Function} opciones.alAbrirCaso Navega a otro caso.
 * @returns {HTMLElement}
 */
export function crearVistaReporte({ caso, alVolver, alAbrirCaso }) {
  const volver = crear("button", {
    clase: ["volver", "no-imprimir"],
    atributos: { type: "button" },
    hijos: [icono("flechaIzquierda", { tamano: 16 }), crear("span", { texto: "Volver al panel" })],
    eventos: { click: alVolver },
  });

  const secciones = caso.evidencia
    ? [
        crearSeccionForense(caso),
        crearSeccionValidacion(caso),
        crearSeccionPatrones(caso, alAbrirCaso),
      ]
    : [crearAvisoSinEvidencia(caso)];

  return crear("div", {
    clase: "vista",
    hijos: [
      crearEncabezadoImpresion(caso),
      volver,
      crearFicha(caso),
      fragmento(secciones),
      /* Un caso cerrado ya no admite decisión: su resolución está tomada. */
      caso.estado === "cerrado" ? null : crearBarraDecision({ caso }),
    ],
  });
}
