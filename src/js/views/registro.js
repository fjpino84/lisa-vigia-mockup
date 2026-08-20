/* =========================================================================
   LISA vigIA — Registro de casos: cartera completa con filtros y búsqueda.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { casos } from "../data/casos.js";
import { icono } from "../components/iconos.js";
import { crearTablaCasos } from "../components/tablaCasos.js";

/* Filtros disponibles sobre la cartera. */
const FILTROS = [
  { id: "todos", etiqueta: "Todos" },
  { id: "critico", etiqueta: "Críticos" },
  { id: "leve", etiqueta: "Leves" },
];

/**
 * Construye la vista del registro completo de casos.
 * @param {object} opciones
 * @param {Function} opciones.alAbrirCaso
 * @param {string} [opciones.busqueda] Texto inicial del filtro.
 * @returns {HTMLElement}
 */
export function crearVistaRegistro({ alAbrirCaso, busqueda = "" }) {
  let filtroActivo = "todos";
  let textoBusqueda = busqueda;

  const contenedorTabla = crear("div");
  const resumen = crear("p", { clase: "vista__subtitulo" });

  /* Aplica filtro y búsqueda sobre la cartera y redibuja la tabla. */
  const actualizar = () => {
    const termino = textoBusqueda.trim().toLowerCase();

    const filtrados = casos.filter((caso) => {
      const coincideFiltro = filtroActivo === "todos" || caso.criticidad === filtroActivo;

      const coincideTexto =
        termino === "" ||
        caso.beneficiario.toLowerCase().includes(termino) ||
        caso.rut.toLowerCase().includes(termino) ||
        caso.numeroSiniestro.includes(termino);

      return coincideFiltro && coincideTexto;
    });

    resumen.textContent =
      termino === ""
        ? `${filtrados.length} casos en la cartera.`
        : `${filtrados.length} casos coinciden con "${textoBusqueda}".`;

    if (filtrados.length === 0) {
      reemplazar(
        contenedorTabla,
        crear("div", {
          clase: "estado-vacio",
          texto: "No se encontraron casos con los criterios indicados.",
        })
      );
      return;
    }

    reemplazar(
      contenedorTabla,
      crearTablaCasos({ casos: filtrados, alAbrirCaso })
    );
  };

  const botonesFiltro = FILTROS.map((filtro) =>
    crear("button", {
      clase: ["boton", filtro.id === "todos" ? "boton--primario" : "boton--fantasma"],
      atributos: { type: "button" },
      texto: filtro.etiqueta,
      datos: { filtro: filtro.id },
    })
  );

  /* Un único manejador controla el estado visual de los tres botones. */
  botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
      filtroActivo = boton.dataset.filtro;

      botonesFiltro.forEach((otro) => {
        const esActivo = otro.dataset.filtro === filtroActivo;
        otro.classList.toggle("boton--primario", esActivo);
        otro.classList.toggle("boton--fantasma", !esActivo);
      });

      actualizar();
    });
  });

  const entrada = crear("input", {
    clase: "campo__control",
    atributos: {
      type: "search",
      value: textoBusqueda,
      placeholder: "Filtrar por nombre, RUT o N° de siniestro…",
      "aria-label": "Filtrar la cartera de casos",
    },
    eventos: {
      input: (evento) => {
        textoBusqueda = evento.target.value;
        actualizar();
      },
    },
  });

  const controles = crear("div", {
    clase: "panel__cabecera",
    hijos: [
      crear("h2", {
        clase: "panel__titulo",
        hijos: [icono("carpeta", { tamano: 22 }), crear("span", { texto: "Cartera completa" })],
      }),
      crear("div", {
        atributos: { style: "margin-left:auto;display:flex;gap:0.8rem;flex-wrap:wrap" },
        hijos: botonesFiltro,
      }),
    ],
  });

  const panel = crear("section", {
    clase: "panel",
    hijos: [
      controles,
      crear("div", {
        atributos: { style: "padding:1.6rem 2.4rem 0" },
        hijos: [entrada],
      }),
      contenedorTabla,
    ],
  });

  actualizar();

  return crear("div", {
    clase: "vista",
    hijos: [
      crear("header", {
        clase: "vista__cabecera",
        hijos: [
          crear("div", {
            hijos: [
              crear("h1", { clase: "vista__titulo", texto: "Registro de casos" }),
              resumen,
            ],
          }),
        ],
      }),
      panel,
    ],
  });
}
