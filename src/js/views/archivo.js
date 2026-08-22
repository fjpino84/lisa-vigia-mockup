/* =========================================================================
   LISA vigIA — Inteligencia archivada.
   El archivo no es un registro muerto: es lo que entrena al modelo. La vista
   se ordena en torno a esa idea — cuánto aprendió, hacia dónde se mueve el
   fraude, qué reconoce el scoring, por qué se equivoca y cuáles fueron los
   hallazgos de mayor monto.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { comoMoneda, comoNumero, comoPorcentaje } from "../utils/formato.js";
import {
  casosArchivados,
  causasFalsosPositivos,
  historialResoluciones,
  hitosModelo,
  patronesAprendidos,
  resumirArchivo,
  senalesTempranas,
} from "../data/inteligencia.js";
import { icono } from "../components/iconos.js";
import { crearGraficoAprendizaje } from "../components/graficoAprendizaje.js";
import { crearGraficoAprendizajeVertical } from "../components/graficoAprendizajeVertical.js";
import { esPantallaEstrecha } from "../utils/escalaGrafico.js";

/* -------------------------------------------------------------------- */
/* Encabezado: la evolución del modelo                                   */
/* -------------------------------------------------------------------- */

/* Cifra destacada del titular. Las métricas que evolucionan llevan su valor
   de partida; las acumuladas, una nota que explica sobre qué se calculan. */
function crearCifraTitular({ etiqueta, valor, desde, mejora, invertido = false, nota }) {
  const pie = nota
    ? crear("p", { clase: "titular__pie", texto: nota })
    : crear("p", {
        clase: [
          "titular__variacion",
          /* En métricas invertidas, bajar es mejorar. */
          mejora < 0 === invertido
            ? "titular__variacion--buena"
            : "titular__variacion--mala",
        ],
        hijos: [
          icono("tendencia", { tamano: 14 }),
          crear("span", { texto: `${desde} en diciembre` }),
        ],
      });

  return crear("div", {
    clase: "titular__cifra",
    hijos: [
      crear("p", { clase: "etiqueta-campo", texto: etiqueta }),
      crear("p", { clase: "titular__valor", texto: valor }),
      pie,
    ],
  });
}

function crearTitular() {
  const primero = historialResoluciones[0];
  const ultimo = historialResoluciones[historialResoluciones.length - 1];

  const resumen = resumirArchivo();

  const cifras = [
    {
      etiqueta: "Accuracy",
      valor: comoPorcentaje(ultimo.precision),
      desde: comoPorcentaje(primero.precision),
      mejora: ultimo.precision - primero.precision,
    },
    {
      etiqueta: "Tasa de detección",
      valor: `${resumen.tasaDeteccion.toFixed(1).replace(".", ",")}%`,
      nota: `${comoNumero(resumen.total)} de ${comoNumero(resumen.procesados)} siniestros procesados`,
    },
    {
      etiqueta: "Monto detectado",
      valor: comoMoneda(resumen.montoBloqueado),
      nota: "Acumulado de diez meses",
    },
    {
      etiqueta: "Casos detectados",
      valor: comoNumero(resumen.total),
      nota: `${resumen.fraude} confirmados como fraude`,
    },
  ];

  const salto = ultimo.precision - primero.precision;

  return crear("section", {
    clase: "titular",
    hijos: [
      crear("div", {
        clase: "titular__texto",
        hijos: [
          crear("span", {
            clase: ["distintivo", "distintivo--ok"],
            texto: "Modelo en aprendizaje continuo",
          }),
          crear("h2", {
            clase: "titular__frase",
            hijos: [
              crear("span", { texto: "El modelo detecta hoy " }),
              crear("strong", { texto: `${salto} puntos` }),
              crear("span", { texto: " más de fraude que al ponerse en marcha." }),
            ],
          }),
          crear("p", {
            clase: "titular__nota",
            texto:
              "Cada caso resuelto vuelve al archivo y reentrena el scoring. La mejora no viene de ajustes manuales, sino de la evidencia acumulada.",
          }),
        ],
      }),
      crear("div", { clase: "titular__cifras", hijos: cifras.map(crearCifraTitular) }),
    ],
  });
}

/* -------------------------------------------------------------------- */
/* Señales anticipadas                                                   */
/* -------------------------------------------------------------------- */

function crearSenal(senal) {
  const sube = senal.variacion >= 0;

  return crear("article", {
    clase: ["senal", `senal--${senal.nivel}`],
    hijos: [
      crear("div", {
        clase: "senal__cabecera",
        hijos: [
          icono("aviso", { tamano: 18, clase: "senal__icono" }),
          crear("h4", { clase: "senal__titulo", texto: senal.titulo }),
          crear("span", {
            clase: ["senal__variacion", sube ? "patron__tendencia--sube" : "patron__tendencia--baja"],
            texto: `${sube ? "+" : ""}${senal.variacion}%`,
          }),
        ],
      }),
      crear("p", { clase: "senal__detalle", texto: senal.detalle }),
    ],
  });
}

/* -------------------------------------------------------------------- */
/* Patrones aprendidos                                                   */
/* -------------------------------------------------------------------- */

/**
 * Tarjeta de un comportamiento aprendido por el modelo.
 * @param {object} patron
 * @param {object} [opciones]
 * @param {string} [opciones.unidad] Nombre de lo que cuenta la cifra.
 * @param {string} [opciones.etiquetaPeso] Rótulo de la barra de peso.
 */
function crearTarjetaPatron(patron, { unidad = "detecciones", etiquetaPeso = "Peso en el scoring" } = {}) {
  const sube = patron.tendencia >= 0;

  return crear("article", {
    clase: "patron",
    hijos: [
      crear("div", {
        clase: "patron__cabecera",
        hijos: [
          crear("h4", { clase: "patron__nombre", texto: patron.nombre }),
          crear("span", {
            clase: [
              "patron__tendencia",
              sube ? "patron__tendencia--sube" : "patron__tendencia--baja",
            ],
            hijos: [
              icono("tendencia", { tamano: 14 }),
              crear("span", { texto: `${sube ? "+" : ""}${patron.tendencia}% anual` }),
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
                /* Una incidencia en descenso no se pinta como alarma. */
                clase: ["puntaje", sube ? "puntaje--alto" : "puntaje--medio"],
                texto: String(patron.detecciones),
              }),
              crear("span", { clase: "texto-tenue", texto: ` ${unidad}` }),
            ],
          }),
          crear("div", {
            clase: "patron__peso",
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: etiquetaPeso }),
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

/* -------------------------------------------------------------------- */
/* Casos cerrados                                                        */
/* -------------------------------------------------------------------- */

/**
 * Fila del top diez. Repite el formato del listado de casos críticos del
 * panel inicial y añade el monto al final.
 * @param {object} caso
 * @param {number} posicion Lugar que ocupa en el ranking.
 * @param {Function} alAbrirCaso
 */
function crearFilaTop(caso, posicion, alAbrirCaso) {
  const semaforos = [
    [caso.semaforo.forense, "Análisis forense de documentos"],
    [caso.semaforo.validacion, "Validación externa e interna"],
    [caso.semaforo.patrones, "Análisis de patrones de comportamiento"],
  ].map(([nivel, criterio]) =>
    crear("td", {
      clase: "col-centro",
      hijos: [
        crear("span", {
          clase: ["semaforo", `semaforo--${nivel}`],
          atributos: {
            role: "img",
            "aria-label": `${criterio}: riesgo ${nivel}`,
            title: `${criterio}: riesgo ${nivel}`,
          },
        }),
      ],
    })
  );

  return crear("tr", {
    clase: posicion <= 3 ? "esta-destacada" : null,
    atributos: {
      tabindex: "0",
      role: "link",
      "aria-label": `Abrir el caso de ${caso.beneficiario}, monto ${comoMoneda(caso.monto)}`,
    },
    datos: { casoArchivado: caso.id },
    hijos: [
      crear("td", {
        clase: "col-centro",
        hijos: [crear("span", { clase: "posicion", texto: String(posicion) })],
      }),
      crear("td", {
        hijos: [
          crear("p", { clase: "celda-beneficiario__nombre", texto: caso.beneficiario }),
          crear("p", { clase: "celda-beneficiario__rut", texto: caso.rut }),
        ],
      }),
      ...semaforos,
      crear("td", {
        clase: "col-derecha",
        hijos: [
          crear("span", {
            clase: ["puntaje", "puntaje--alto", posicion === 1 ? "puntaje--marcado" : null],
            texto: String(caso.puntaje),
          }),
        ],
      }),
      crear("td", {
        clase: "col-derecha",
        hijos: [crear("span", { clase: "monto-top", texto: comoMoneda(caso.monto) })],
      }),
    ],
    eventos: {
      click: () => alAbrirCaso(caso.id),
      keydown: (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          alAbrirCaso(caso.id);
        }
      },
    },
  });
}

/* Listado de los diez fraudes confirmados de mayor monto. */
function crearPanelTop(alAbrirCaso) {
  const top = casosArchivados
    .filter((caso) => caso.resolucion === "fraude")
    .sort((uno, otro) => otro.monto - uno.monto)
    .slice(0, 10);

  const montoTop = top.reduce((suma, caso) => suma + caso.monto, 0);

  const encabezados = [
    ["#", "col-centro"],
    ["Beneficiario (Nombre-RUT)", null],
    ["Análisis Forense", "col-centro"],
    ["Validación Externa", "col-centro"],
    ["Patrones", "col-centro"],
    ["Scoring", "col-derecha"],
    ["Monto", "col-derecha"],
  ].map(([titulo, clase]) =>
    crear("th", { texto: titulo, clase, atributos: { scope: "col" } })
  );

  const tabla = crear("table", {
    clase: "tabla-casos",
    hijos: [
      crear("thead", { hijos: [crear("tr", { hijos: encabezados })] }),
      crear("tbody", {
        hijos: top.map((caso, indice) => crearFilaTop(caso, indice + 1, alAbrirCaso)),
      }),
    ],
  });

  return crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Top diez de fraudes detectados", "martillo", {
        texto: comoMoneda(montoTop),
        clase: "distintivo--critico",
      }),
      crear("div", {
        atributos: { style: "padding:2.4rem 2.4rem 0" },
        hijos: [
          crear("p", {
            clase: "panel__intro",
            atributos: { style: "margin-bottom:0" },
            texto:
              "Los diez siniestros de mayor monto confirmados como fraude. Seleccione una fila para revisar el expediente.",
          }),
        ],
      }),
      crear("div", { clase: "tabla-envoltura", hijos: [tabla] }),
    ],
  });
}

/* Cabecera común a los bloques de la vista. */
function crearCabeceraPanel(titulo, nombreIcono, distintivo) {
  return crear("header", {
    clase: "panel__cabecera",
    hijos: [
      crear("h3", {
        clase: "panel__titulo",
        hijos: [icono(nombreIcono, { tamano: 22 }), crear("span", { texto: titulo })],
      }),
      distintivo
        ? crear("span", {
            clase: ["distintivo", distintivo.clase],
            atributos: { style: "margin-left:auto" },
            texto: distintivo.texto,
          })
        : null,
    ],
  });
}

/**
 * Construye la vista de inteligencia archivada.
 * @param {object} opciones
 * @param {Function} opciones.alAbrirCaso
 * @returns {HTMLElement}
 */
export function crearVistaArchivo({ alAbrirCaso }) {
  const resumen = resumirArchivo();

  /* --- Curva de aprendizaje ------------------------------------------- */
  const panelCurva = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Curva de aprendizaje", "grafico", {
        texto: `${resumen.total} casos de entrenamiento`,
        clase: "distintivo--neutro",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          /* En pantalla estrecha se dibuja la variante vertical, que
             reparte los meses en filas en lugar de comprimir el eje. */
          (esPantallaEstrecha()
            ? crearGraficoAprendizajeVertical
            : crearGraficoAprendizaje)({
            historial: historialResoluciones,
            hitos: hitosModelo,
          }),
        ],
      }),
    ],
  });

  /* --- Señales anticipadas ---------------------------------------------- */
  const panelSenales = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Cómo está cambiando el fraude", "tendencia", {
        texto: "Proyección anual",
        clase: "distintivo--medio",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("p", {
            clase: "panel__intro",
            texto:
              "Comportamientos que el archivo permite anticipar: los defraudadores se adaptan a los umbrales de detección.",
          }),
          crear("div", { clase: "senales", hijos: senalesTempranas.map(crearSenal) }),
        ],
      }),
    ],
  });

  /* --- Patrones --------------------------------------------------------- */
  const panelPatrones = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Patrones que alimentan el scoring", "lista", {
        texto: `${patronesAprendidos.reduce((suma, p) => suma + p.detecciones, 0)} detecciones`,
        clase: "distintivo--critico-suave",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("p", {
            clase: "panel__intro",
            texto:
              "Los cuatro comportamientos que el modelo aprendió a reconocer, con su peso en el cálculo del scoring.",
          }),
          crear("div", {
            clase: "patrones",
            hijos: patronesAprendidos.map((patron) => crearTarjetaPatron(patron)),
          }),
        ],
      }),
    ],
  });

  /* --- Falsos positivos --------------------------------------------------
     El reverso de los patrones: por qué el modelo marca casos legítimos y
     cuánto ha corregido cada motivo desde que se reentrena con el archivo. */
  const ultimoMes = historialResoluciones[historialResoluciones.length - 1];
  const primerMes = historialResoluciones[0];

  const panelFalsos = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Por qué se producen los falsos positivos", "aviso", {
        texto: `${ultimoMes.falsosPositivos}% del total marcado`,
        clase: "distintivo--medio",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("p", {
            clase: "panel__intro",
            texto: `Casos legítimos que el modelo señaló como sospechosos. La tasa bajó del ${primerMes.falsosPositivos} % al ${ultimoMes.falsosPositivos} % a medida que el archivo enseñó a distinguir estos comportamientos del fraude real.`,
          }),
          crear("div", {
            clase: "patrones",
            hijos: causasFalsosPositivos.map((causa) =>
              crearTarjetaPatron(causa, {
                unidad: "casos revisados",
                etiquetaPeso: "Peso en las falsas alarmas",
              })
            ),
          }),
        ],
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
              crear("h1", { clase: "vista__titulo", texto: "Inteligencia archivada" }),
              crear("p", {
                clase: "vista__subtitulo",
                texto:
                  "Lo que el sistema aprendió de cada caso resuelto y cómo eso cambia lo que detecta hoy.",
              }),
            ],
          }),
          crear("div", {
            clase: "vista__meta",
            hijos: [
              crear("p", { clase: "vista__meta-titulo", texto: "Monto bloqueado" }),
              crear("p", {
                clase: ["vista__meta-estado", "dato-mono"],
                texto: comoMoneda(resumen.montoBloqueado),
              }),
            ],
          }),
        ],
      }),
      crearTitular(),
      panelCurva,
      /* Bajo la curva, lo que explica hacia dónde se mueve: primero cómo
         está cambiando el fraude, después qué reconoce el modelo y por qué
         a veces se equivoca. Cierra el listado de los mayores hallazgos. */
      panelSenales,
      panelPatrones,
      panelFalsos,
      crearPanelTop(alAbrirCaso),
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
