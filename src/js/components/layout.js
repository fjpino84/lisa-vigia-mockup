/* =========================================================================
   LISA vigIA — Armazón persistente: barra lateral y cabecera superior.
   El contenedor de vistas es el único fragmento que se reemplaza al navegar.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { alternarTema, esTemaClaro } from "../utils/tema.js";
import { icono } from "./iconos.js";
import { mostrarAviso } from "./avisos.js";

/* Secciones de la navegación principal. */
export const SECCIONES = [
  { id: "panel", etiqueta: "Centro de mando", nombreIcono: "panel" },
  { id: "casos", etiqueta: "Registro de casos", nombreIcono: "carpeta" },
  { id: "red", etiqueta: "Análisis de red", nombreIcono: "red" },
  { id: "forense", etiqueta: "Herramientas forenses", nombreIcono: "forense" },
  { id: "archivo", etiqueta: "Inteligencia archivada", nombreIcono: "archivo" },
];

/**
 * Construye el armazón de la aplicación.
 * @param {object} opciones
 * @param {Function} opciones.alNavegar Recibe el id de la sección elegida.
 * @param {Function} opciones.alBuscar Recibe el texto buscado.
 * @returns {object} Referencias a los nodos que la aplicación actualiza.
 */
export function crearArmazon({ alNavegar, alBuscar }) {
  /* ---------------------------------------------------------------- */
  /* Barra lateral                                                     */
  /* ---------------------------------------------------------------- */

  /* El vigía encabeza la barra; la onda de LISA acompaña al nombre debajo,
     de modo que se lea vigIA como producto dentro de LISA. */
  const marca = crear("div", {
    clase: "sidebar__marca",
    hijos: [
      crear("img", {
        clase: "sidebar__vigia",
        atributos: { src: "assets/vigia-logo.png", alt: "Logotipo de vigIA" },
      }),
      crear("div", {
        clase: "sidebar__identidad",
        hijos: [
          crear("p", {
            clase: "sidebar__nombre",
            hijos: [
              crear("img", {
                clase: "sidebar__logo",
                atributos: { src: "assets/lisa-logo.png", alt: "" },
              }),
              crear("span", { texto: "LISA vigIA" }),
            ],
          }),
          crear("p", {
            clase: "sidebar__estado",
            hijos: [
              crear("span", { clase: "sidebar__punto" }),
              crear("span", { texto: "Nivel de vigilancia: alto" }),
            ],
          }),
        ],
      }),
    ],
  });

  const botonNueva = crear("button", {
    clase: "sidebar__accion",
    atributos: { type: "button" },
    hijos: [icono("mas", { tamano: 18 }), crear("span", { texto: "Nueva investigación" })],
    eventos: {
      click: () =>
        mostrarAviso({
          titulo: "Nueva investigación",
          texto: "La creación de expedientes no está habilitada en el prototipo.",
        }),
    },
  });

  const enlaces = SECCIONES.map((seccion) =>
    crear("button", {
      clase: "sidebar__enlace",
      atributos: { type: "button" },
      datos: { seccion: seccion.id },
      hijos: [
        icono(seccion.nombreIcono, { tamano: 20 }),
        crear("span", { texto: seccion.etiqueta }),
      ],
      eventos: { click: () => alNavegar(seccion.id) },
    })
  );

  const navegacion = crear("nav", {
    clase: "sidebar__nav",
    atributos: { "aria-label": "Navegación principal" },
    hijos: enlaces,
  });

  const pie = crear("div", {
    clase: "sidebar__pie",
    hijos: [
      crear("button", {
        clase: "sidebar__enlace",
        atributos: { type: "button" },
        hijos: [icono("huella", { tamano: 20 }), crear("span", { texto: "Registro de auditoría" })],
        eventos: {
          click: () =>
            mostrarAviso({
              titulo: "Registro de auditoría",
              texto: "Disponible en la versión completa de la plataforma.",
            }),
        },
      }),
      crear("button", {
        clase: "sidebar__enlace",
        atributos: { type: "button" },
        hijos: [icono("salir", { tamano: 20 }), crear("span", { texto: "Cerrar sesión" })],
        eventos: {
          click: () =>
            mostrarAviso({ titulo: "Sesión", texto: "El cierre de sesión está simulado." }),
        },
      }),
    ],
  });

  const botonCerrarMenu = crear("button", {
    clase: "sidebar__cerrar",
    atributos: { type: "button", "aria-label": "Cerrar el menú" },
    hijos: [icono("cerrar", { tamano: 18 })],
  });

  const sidebar = crear("aside", {
    clase: "sidebar",
    hijos: [botonCerrarMenu, marca, botonNueva, navegacion, pie],
  });

  /* ---------------------------------------------------------------- */
  /* Cabecera superior                                                 */
  /* ---------------------------------------------------------------- */

  const botonMenu = crear("button", {
    clase: "menu-movil",
    atributos: { type: "button", "aria-label": "Abrir el menú", "aria-expanded": "false" },
    hijos: [icono("menu", { tamano: 20 })],
  });

  const entradaBusqueda = crear("input", {
    clase: "topbar__input",
    atributos: {
      type: "search",
      name: "busqueda",
      placeholder: "Buscar beneficiario, RUT o N° de caso…",
      "aria-label": "Buscar en la cartera de siniestros",
    },
  });

  const formularioBusqueda = crear("form", {
    clase: "topbar__buscador",
    atributos: { role: "search" },
    hijos: [icono("lupa", { tamano: 18 }), entradaBusqueda],
    eventos: {
      submit: (evento) => {
        evento.preventDefault();
        alBuscar(entradaBusqueda.value.trim());
      },
    },
  });

  /* Botones decorativos de la cabecera, con feedback en el DOM. */
  const crearBotonTopbar = (nombreIcono, etiqueta, conNotificacion = false) =>
    crear("button", {
      clase: "topbar__boton",
      atributos: { type: "button", "aria-label": etiqueta },
      hijos: [
        icono(nombreIcono, { tamano: 20 }),
        conNotificacion ? crear("span", { clase: "topbar__notificacion" }) : null,
      ],
      eventos: {
        click: () =>
          mostrarAviso({ titulo: etiqueta, texto: "Sección no habilitada en el prototipo." }),
      },
    });

  /* Interruptor entre el modo nocturno y el diurno. El icono anticipa el
     tema al que se cambiará, no el que está activo. */
  const botonTema = crear("button", {
    clase: ["topbar__boton", "topbar__boton--tema"],
    atributos: { type: "button" },
  });

  const pintarBotonTema = () => {
    const claro = esTemaClaro();
    const destino = claro ? "modo nocturno" : "modo diurno";

    reemplazar(botonTema, icono(claro ? "luna" : "sol", { tamano: 20 }));
    botonTema.setAttribute("aria-label", `Cambiar a ${destino}`);
    botonTema.setAttribute("title", `Cambiar a ${destino}`);
  };

  botonTema.addEventListener("click", () => {
    const tema = alternarTema();
    pintarBotonTema();

    mostrarAviso({
      titulo: tema === "claro" ? "Modo diurno" : "Modo nocturno",
      texto: "La preferencia se recordará en este navegador.",
    });
  });

  pintarBotonTema();

  const topbar = crear("header", {
    clase: "topbar",
    hijos: [
      botonMenu,
      crear("p", { clase: "topbar__titulo", texto: "LISA vigIA · ANALÍTICA DE FRAUDE" }),
      formularioBusqueda,
      crear("div", {
        clase: "topbar__acciones",
        hijos: [
          botonTema,
          crearBotonTopbar("campana", "Notificaciones", true),
          crearBotonTopbar("ayuda", "Ayuda"),
          crearBotonTopbar("ajustes", "Configuración"),
          crear("div", {
            clase: "topbar__avatar",
            atributos: { title: "Analista de siniestros", "aria-label": "Analista de siniestros" },
            texto: "AS",
          }),
        ],
      }),
    ],
  });

  /* ---------------------------------------------------------------- */
  /* Menú móvil                                                        */
  /* ---------------------------------------------------------------- */

  const velo = crear("div", { clase: "velo-menu", atributos: { "aria-hidden": "true" } });

  const cerrarMenu = () => {
    sidebar.classList.remove("esta-abierta");
    velo.classList.remove("esta-visible");
    botonMenu.setAttribute("aria-expanded", "false");
  };

  botonMenu.addEventListener("click", () => {
    sidebar.classList.add("esta-abierta");
    velo.classList.add("esta-visible");
    botonMenu.setAttribute("aria-expanded", "true");
  });

  botonCerrarMenu.addEventListener("click", cerrarMenu);
  velo.addEventListener("click", cerrarMenu);

  /* Al elegir una sección el menú se repliega en pantallas pequeñas. */
  enlaces.forEach((enlace) => enlace.addEventListener("click", cerrarMenu));

  /* ---------------------------------------------------------------- */
  /* Composición                                                       */
  /* ---------------------------------------------------------------- */

  const contenedorVista = crear("main", { atributos: { id: "contenido" } });

  const principal = crear("div", {
    clase: "principal",
    hijos: [topbar, contenedorVista],
  });

  const app = crear("div", { clase: "app", hijos: [sidebar, principal] });

  return {
    app,
    velo,
    contenedorVista,
    entradaBusqueda,
    /* Marca visualmente la sección activa en la navegación. */
    marcarSeccion(id) {
      enlaces.forEach((enlace) => {
        if (enlace.dataset.seccion === id) {
          enlace.setAttribute("aria-current", "page");
        } else {
          enlace.removeAttribute("aria-current");
        }
      });
    },
  };
}
