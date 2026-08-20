/* =========================================================================
   LISA vigIA — Vista de inicio: indicadores de cartera y listados de casos.
   ========================================================================= */

import { crear } from "../utils/dom.js";
import { comoMoneda, comoPorcentaje } from "../utils/formato.js";
import { casos, casosCriticos, casosLevesLista } from "../data/casos.js";
import { icono } from "../components/iconos.js";
import { crearTablaCasos } from "../components/tablaCasos.js";

/* Caso que aparece resaltado por ser el de mayor puntaje. */
const ID_CASO_PRINCIPAL = "77940303";

/**
 * Calcula los indicadores que encabezan el panel.
 * @returns {object}
 */
function calcularIndicadores() {
  const montoTotal = casos.reduce((suma, caso) => suma + caso.monto, 0);
  const montoCritico = casosCriticos.reduce((suma, caso) => suma + caso.monto, 0);

  return {
    totalCasos: casos.length,
    totalCriticos: casosCriticos.length,
    montoTotal,
    montoCritico,
    porcentajeCasos: (casosCriticos.length / casos.length) * 100,
    porcentajeMonto: (montoCritico / montoTotal) * 100,
  };
}

/**
 * Anima un valor numérico desde cero hasta su cifra final.
 * @param {HTMLElement} elemento Nodo cuyo texto se actualiza.
 * @param {number} valorFinal
 * @param {Function} formatear Convierte el número en texto.
 */
function animarValor(elemento, valorFinal, formatear) {
  /* Se respeta la preferencia del sistema de reducir el movimiento. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elemento.textContent = formatear(valorFinal);
    return;
  }

  const duracion = 900;
  const inicio = performance.now();

  const paso = (ahora) => {
    const avance = Math.min((ahora - inicio) / duracion, 1);
    /* Curva de salida suave para que el contador desacelere al final. */
    const suavizado = 1 - (1 - avance) ** 3;

    elemento.textContent = formatear(valorFinal * suavizado);

    if (avance < 1) {
      window.requestAnimationFrame(paso);
    }
  };

  window.requestAnimationFrame(paso);
}

/* Tarjeta de recuento de casos críticos. */
function crearKpiCriticos(datos) {
  const valor = crear("p", { clase: ["kpi__valor", "kpi__valor--critico"], texto: "0" });
  animarValor(valor, datos.totalCriticos, (numero) => String(Math.round(numero)));

  return crear("article", {
    clase: ["kpi", "kpi--alerta"],
    hijos: [
      crear("div", {
        clase: "kpi__cabecera",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Total de casos críticos" }),
          icono("alerta", { tamano: 20, clase: "kpi__icono kpi__icono--alerta" }),
        ],
      }),
      valor,
      crear("p", {
        clase: "kpi__nota",
        texto: `de ${datos.totalCasos} casos activos en revisión`,
      }),
    ],
  });
}

/* Tarjeta del monto en riesgo, que ocupa doble ancho. */
function crearKpiMonto(datos) {
  const valor = crear("p", {
    clase: ["kpi__valor", "kpi__valor--monto", "kpi__valor--critico"],
    texto: comoMoneda(0),
  });
  animarValor(valor, datos.montoCritico, comoMoneda);

  return crear("article", {
    clase: ["kpi", "kpi--alerta", "kpi--ancho"],
    hijos: [
      crear("div", {
        clase: "kpi__cabecera",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Monto en riesgo (crítico)" }),
          crear("span", { clase: ["distintivo", "distintivo--critico"], texto: "Exposición crítica" }),
        ],
      }),
      valor,
      crear("p", {
        clase: ["kpi__nota", "kpi__nota--alerta"],
        hijos: [
          icono("tendencia", { tamano: 16 }),
          crear("span", { texto: `Concentrado en ${datos.totalCriticos} casos` }),
        ],
      }),
    ],
  });
}

/* Tarjeta de porcentaje con barra de progreso. */
function crearKpiPorcentaje(titulo, porcentaje) {
  const numero = crear("span", { clase: "kpi__porcentaje", texto: "0%" });
  animarValor(numero, porcentaje, comoPorcentaje);

  const relleno = crear("span", { clase: "barra__relleno" });
  relleno.style.width = "0%";

  /* La barra se llena en el cuadro siguiente para animar el ancho. */
  window.requestAnimationFrame(() => {
    relleno.style.width = `${porcentaje}%`;
  });

  return crear("article", {
    clase: "kpi",
    hijos: [
      crear("h3", { clase: "kpi__titulo", texto: titulo }),
      crear("div", {
        clase: "kpi__medida",
        hijos: [numero, crear("span", { clase: "barra", hijos: [relleno] })],
      }),
    ],
  });
}

/* Tarjeta del monto total detectado en toda la cartera. */
function crearKpiTotal(datos) {
  const valor = crear("p", {
    clase: ["kpi__valor", "kpi__valor--monto"],
    texto: comoMoneda(0),
  });
  animarValor(valor, datos.montoTotal, comoMoneda);

  return crear("article", {
    clase: "kpi",
    hijos: [
      crear("div", {
        clase: "kpi__cabecera",
        hijos: [
          crear("h3", { clase: "kpi__titulo", texto: "Monto total detectado" }),
          icono("grafico", { tamano: 20, clase: "kpi__icono" }),
        ],
      }),
      valor,
      crear("p", { clase: "kpi__nota", texto: "Suma de todos los niveles de riesgo" }),
    ],
  });
}

/* Panel contenedor de un listado de casos. */
function crearPanelListado({ titulo, nombreIcono, distintivo, claseDistintivo, tabla }) {
  return crear("section", {
    clase: "panel",
    hijos: [
      crear("header", {
        clase: "panel__cabecera",
        hijos: [
          crear("h2", {
            clase: "panel__titulo",
            hijos: [icono(nombreIcono, { tamano: 22 }), crear("span", { texto: titulo })],
          }),
          crear("span", {
            clase: ["distintivo", claseDistintivo],
            texto: distintivo,
            atributos: { style: "margin-left:auto" },
          }),
        ],
      }),
      tabla,
    ],
  });
}

/**
 * Construye la vista completa del panel inicial.
 * @param {object} opciones
 * @param {Function} opciones.alAbrirCaso Navega al reporte del caso.
 * @returns {HTMLElement}
 */
export function crearVistaDashboard({ alAbrirCaso }) {
  const datos = calcularIndicadores();

  const cabecera = crear("header", {
    clase: "vista__cabecera",
    hijos: [
      crear("div", {
        hijos: [
          crear("h1", { clase: "vista__titulo", texto: "Protocolo de detección de fraude" }),
          crear("p", {
            clase: "vista__subtitulo",
            texto: "Evaluación de riesgo en tiempo real y resumen del análisis forense.",
          }),
        ],
      }),
      crear("div", {
        clase: "vista__meta",
        hijos: [
          crear("p", { clase: "vista__meta-titulo", texto: "Último escaneo" }),
          crear("p", {
            clase: "vista__meta-estado",
            hijos: [
              crear("span", { clase: "vista__meta-punto" }),
              crear("span", { texto: "CANALIZACIÓN ACTIVA" }),
            ],
          }),
        ],
      }),
    ],
  });

  const indicadores = crear("section", {
    clase: "indicadores",
    atributos: { "aria-label": "Indicadores de la cartera" },
    hijos: [
      crearKpiCriticos(datos),
      crearKpiMonto(datos),
      crearKpiPorcentaje("Casos críticos sobre el total", datos.porcentajeCasos),
      crearKpiPorcentaje("Monto crítico sobre el total", datos.porcentajeMonto),
      crearKpiTotal(datos),
    ],
  });

  const panelCriticos = crearPanelListado({
    titulo: "Casos críticos",
    nombreIcono: "martillo",
    distintivo: "Acción inmediata requerida",
    claseDistintivo: "distintivo--critico",
    tabla: crearTablaCasos({
      casos: casosCriticos,
      idDestacado: ID_CASO_PRINCIPAL,
      alAbrirCaso,
    }),
  });

  const panelLeves = crearPanelListado({
    titulo: "Casos leves",
    nombreIcono: "lista",
    distintivo: "Baja criticidad",
    claseDistintivo: "distintivo--neutro",
    tabla: crearTablaCasos({ casos: casosLevesLista, compacta: true, alAbrirCaso }),
  });

  const listados = crear("div", { clase: "listados", hijos: [panelCriticos, panelLeves] });

  return crear("div", {
    clase: "vista",
    hijos: [cabecera, indicadores, listados],
  });
}
