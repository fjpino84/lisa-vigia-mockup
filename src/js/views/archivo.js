/* =========================================================================
   LISA vigIA — Inteligencia archivada.
   El archivo no es un registro muerto: es lo que entrena al modelo. La vista
   se ordena en torno a esa idea — cuánto aprendió, qué casos recuperó, qué
   identidades reinciden y qué anticipa hacia adelante.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { comoMoneda, comoPorcentaje } from "../utils/formato.js";
import {
  casosArchivados,
  casosRecuperados,
  historialResoluciones,
  hitosModelo,
  patronesAprendidos,
  reincidentes,
  resumirArchivo,
  senalesTempranas,
} from "../data/inteligencia.js";
import { icono } from "../components/iconos.js";
import { crearGraficoAprendizaje } from "../components/graficoAprendizaje.js";

/* -------------------------------------------------------------------- */
/* Encabezado: la evolución del modelo                                   */
/* -------------------------------------------------------------------- */

/* Cifra destacada del titular, con su variación respecto del inicio. */
function crearCifraTitular({ etiqueta, valor, desde, mejora, invertido = false }) {
  const baja = mejora < 0;

  return crear("div", {
    clase: "titular__cifra",
    hijos: [
      crear("p", { clase: "etiqueta-campo", texto: etiqueta }),
      crear("p", { clase: "titular__valor", texto: valor }),
      crear("p", {
        clase: [
          "titular__variacion",
          /* En métricas invertidas, bajar es mejorar. */
          baja === invertido ? "titular__variacion--buena" : "titular__variacion--mala",
        ],
        hijos: [
          icono("tendencia", { tamano: 14 }),
          crear("span", { texto: `${desde} en diciembre` }),
        ],
      }),
    ],
  });
}

function crearTitular() {
  const primero = historialResoluciones[0];
  const ultimo = historialResoluciones[historialResoluciones.length - 1];

  const cifras = [
    {
      etiqueta: "Precisión actual",
      valor: comoPorcentaje(ultimo.precision),
      desde: comoPorcentaje(primero.precision),
      mejora: ultimo.precision - primero.precision,
    },
    {
      etiqueta: "Falsos positivos",
      valor: comoPorcentaje(ultimo.falsosPositivos),
      desde: comoPorcentaje(primero.falsosPositivos),
      mejora: ultimo.falsosPositivos - primero.falsosPositivos,
      invertido: true,
    },
    {
      etiqueta: "Días por caso",
      valor: String(ultimo.diasResolucion),
      desde: String(primero.diasResolucion),
      mejora: ultimo.diasResolucion - primero.diasResolucion,
      invertido: true,
    },
    {
      etiqueta: "Casos escapados",
      valor: String(ultimo.escapados),
      desde: String(primero.escapados),
      mejora: ultimo.escapados - primero.escapados,
      invertido: true,
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
              crear("span", { texto: " más de fraude que hace seis meses." }),
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
/* Hitos del modelo                                                      */
/* -------------------------------------------------------------------- */

/* Los hitos sí son una secuencia real: cada capacidad se apoya en la
   anterior, así que se numeran y se enlazan como una línea de tiempo. */
function crearLineaDeTiempo() {
  const pasos = hitosModelo.map((hito, indice) =>
    crear("li", {
      clase: "hito",
      hijos: [
        crear("span", { clase: "hito__marca", texto: String(indice + 1) }),
        crear("div", {
          clase: "hito__cuerpo",
          hijos: [
            crear("p", { clase: "hito__mes", texto: hito.mes }),
            crear("h4", { clase: "hito__titulo", texto: hito.titulo }),
            crear("p", { clase: "hito__descripcion", texto: hito.descripcion }),
            crear("p", {
              clase: "hito__precision",
              hijos: [
                crear("span", { clase: "etiqueta-campo", texto: "Precisión alcanzada " }),
                crear("strong", { texto: comoPorcentaje(hito.precision) }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  return crear("ol", { clase: "hitos", hijos: pasos });
}

/* -------------------------------------------------------------------- */
/* Casos recuperados                                                     */
/* -------------------------------------------------------------------- */

/* Muestra el antes y el después del scoring sobre un mismo caso. */
function crearTarjetaRecuperado(caso) {
  return crear("article", {
    clase: "recuperado",
    hijos: [
      crear("div", {
        clase: "recuperado__identidad",
        hijos: [
          crear("p", { clase: "recuperado__nombre", texto: caso.beneficiario }),
          crear("p", { clase: "recuperado__meta", texto: `${caso.rut} · ${caso.cierre}` }),
        ],
      }),
      crear("div", {
        clase: "recuperado__salto",
        hijos: [
          crear("span", {
            clase: ["puntaje", "puntaje--bajo", "recuperado__antes"],
            texto: String(caso.puntajeOriginal),
          }),
          icono("flechaDerecha", { tamano: 16, clase: "recuperado__flecha" }),
          crear("span", {
            clase: ["puntaje", "puntaje--alto"],
            texto: String(caso.puntajeActual),
          }),
        ],
      }),
      crear("div", {
        clase: "recuperado__pie",
        hijos: [
          crear("span", { clase: "marca-hallazgo", texto: caso.detectadoPor }),
          crear("span", {
            clase: ["dato-mono", "recuperado__monto"],
            texto: comoMoneda(caso.monto),
          }),
        ],
      }),
    ],
  });
}

/* -------------------------------------------------------------------- */
/* Reincidentes                                                          */
/* -------------------------------------------------------------------- */

function crearTarjetaReincidente(reincidente, alAbrirCaso) {
  return crear("article", {
    clase: "reincidente",
    hijos: [
      crear("div", {
        clase: "reincidente__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h4", { clase: "reincidente__nombre", texto: reincidente.nombre }),
              crear("p", {
                clase: "reincidente__meta",
                texto: `${reincidente.rol} · RUT ${reincidente.rut}`,
              }),
            ],
          }),
          crear("span", {
            clase: ["distintivo", "distintivo--critico"],
            texto: "Reincidente",
          }),
        ],
      }),
      crear("div", {
        clase: "reincidente__balance",
        hijos: [
          crear("div", {
            clase: "reincidente__lado",
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: "Confirmados en archivo" }),
              crear("p", {
                clase: ["reincidente__cifra", "reincidente__cifra--historica"],
                texto: String(reincidente.confirmados),
              }),
              crear("p", {
                clase: "reincidente__monto",
                texto: comoMoneda(reincidente.montoHistorico),
              }),
            ],
          }),
          crear("div", {
            clase: "reincidente__lado",
            hijos: [
              crear("p", { clase: "etiqueta-campo", texto: "Activos ahora" }),
              crear("p", {
                clase: ["reincidente__cifra", "reincidente__cifra--activa"],
                texto: String(reincidente.activos),
              }),
              crear("p", {
                clase: "reincidente__monto",
                texto: comoMoneda(reincidente.montoActivo),
              }),
            ],
          }),
        ],
      }),
      crear("p", { clase: "reincidente__nota", texto: reincidente.nota }),
      crear("button", {
        clase: ["boton", "boton--fantasma", "reincidente__accion"],
        atributos: { type: "button" },
        hijos: [
          crear("span", { texto: "Revisar caso activo" }),
          icono("flechaDerecha", { tamano: 16 }),
        ],
        eventos: { click: () => alAbrirCaso(reincidente.idCaso) },
      }),
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

function crearTarjetaPatron(patron) {
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
              crear("span", { texto: `${sube ? "+" : ""}${patron.tendencia}% semestral` }),
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

/* -------------------------------------------------------------------- */
/* Casos cerrados                                                        */
/* -------------------------------------------------------------------- */

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

/* Panel plegable con la tabla completa de casos cerrados. */
function crearPanelCasos() {
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

  dibujarTabla();

  return crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h3", {
            clase: "panel__titulo",
            hijos: [
              icono("archivo", { tamano: 22 }),
              crear("span", { texto: "Base de evidencia" }),
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
          crearGraficoAprendizaje({
            historial: historialResoluciones,
            hitos: hitosModelo,
          }),
        ],
      }),
    ],
  });

  /* --- Hitos y casos recuperados --------------------------------------- */
  const panelHitos = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Qué aprendió el modelo", "huella"),
      crear("div", { clase: "panel__cuerpo", hijos: [crearLineaDeTiempo()] }),
    ],
  });

  const panelRecuperados = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Casos que hoy no se escaparían", "visto", {
        texto: `${casosRecuperados.length} recuperados`,
        clase: "distintivo--ok",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("p", {
            clase: "panel__intro",
            texto:
              "Estos siniestros obtuvieron un scoring bajo cuando ingresaron y estuvieron a punto de pasar a liquidación. Con el modelo actual habrían sido críticos desde el primer día.",
          }),
          crear("div", {
            clase: "recuperados",
            hijos: casosRecuperados.map(crearTarjetaRecuperado),
          }),
        ],
      }),
    ],
  });

  /* --- Reincidentes ----------------------------------------------------- */
  const panelReincidentes = crear("section", {
    clase: "panel",
    hijos: [
      crearCabeceraPanel("Identidades reincidentes", "escudo", {
        texto: `${reincidentes.length} detectadas`,
        clase: "distintivo--critico",
      }),
      crear("div", {
        clase: "panel__cuerpo",
        hijos: [
          crear("p", {
            clase: "panel__intro",
            texto:
              "Cruce entre el archivo y la cartera activa: quienes ya tienen fraude confirmado y vuelven a aparecer en casos abiertos.",
          }),
          crear("div", {
            clase: "reincidentes",
            hijos: reincidentes.map((r) => crearTarjetaReincidente(r, alAbrirCaso)),
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
        texto: "Proyección semestral",
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
      crearCabeceraPanel("Patrones que alimentan el scoring", "lista"),
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
      panelHitos,
      panelRecuperados,
      panelReincidentes,
      panelSenales,
      panelPatrones,
      crearPanelCasos(),
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
