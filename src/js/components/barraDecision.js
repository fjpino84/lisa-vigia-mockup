/* =========================================================================
   LISA vigIA — Barra de decisión del analista.
   Concentra las tres acciones de cierre: emitir el reporte en PDF, enviarlo
   por correo y resolver si el caso continúa a liquidación o se deriva a
   investigación por fraude.
   ========================================================================= */

import { crear, reemplazar } from "../utils/dom.js";
import { comoMoneda, esCorreoValido, marcaDeTiempo } from "../utils/formato.js";
import { icono } from "./iconos.js";
import { abrirModal, cerrarModal, confirmar } from "./modal.js";
import { mostrarAviso } from "./avisos.js";

/* Nombre sugerido del archivo al guardar el reporte. */
function nombreArchivo(caso) {
  return `LISA-vigIA_Caso-${caso.numeroSiniestro}_${caso.beneficiario.replace(/\s+/g, "-")}.pdf`;
}

/**
 * Abre el diálogo de impresión del navegador.
 * El usuario elige "Guardar como PDF" como destino; la hoja de impresión
 * ya adapta el reporte al formato A4.
 * @param {object} caso
 */
function emitirReporte(caso) {
  confirmar({
    titulo: "Emitir reporte en PDF",
    nombreIcono: "imprimir",
    mensaje:
      "Se abrirá el cuadro de impresión del navegador con el reporte completo del caso. Elija \"Guardar como PDF\" en el destino para descargar el documento.",
    textoConfirmar: "Generar reporte",
    textoCancelar: "Cancelar",
    alConfirmar: () => {
      mostrarAviso({
        titulo: "Preparando el reporte",
        texto: `Documento ${nombreArchivo(caso)}`,
      });

      /* Se espera al cierre de la transición del modal antes de imprimir. */
      window.setTimeout(() => window.print(), 260);
    },
  });
}

/**
 * Abre el formulario de envío del reporte por correo.
 * @param {object} caso
 */
function enviarPorCorreo(caso) {
  const campoCorreo = crear("input", {
    clase: "campo__control",
    atributos: {
      type: "email",
      id: "correo-destino",
      name: "correo",
      placeholder: "analista@aseguradora.cl",
      autocomplete: "email",
      required: "required",
    },
  });

  const campoMensaje = crear("textarea", {
    clase: "campo__control",
    atributos: { id: "correo-mensaje", name: "mensaje", rows: "3" },
    texto: `Adjunto el reporte forense del siniestro N° ${caso.numeroSiniestro} correspondiente a ${caso.beneficiario}, con un scoring de riesgo de ${caso.puntaje}/100.`,
  });

  const error = crear("p", { clase: "campo__error", atributos: { role: "alert" } });

  const formulario = crear("form", {
    atributos: { novalidate: "novalidate", id: "formulario-correo" },
    hijos: [
      crear("div", {
        clase: "campo",
        hijos: [
          crear("label", {
            clase: "etiqueta-campo",
            texto: "Destinatario",
            atributos: { for: "correo-destino" },
          }),
          campoCorreo,
          error,
        ],
      }),
      crear("div", {
        clase: "campo",
        atributos: { style: "margin-top:1.6rem" },
        hijos: [
          crear("label", {
            clase: "etiqueta-campo",
            texto: "Mensaje",
            atributos: { for: "correo-mensaje" },
          }),
          campoMensaje,
        ],
      }),
      crear("div", {
        clase: "adjunto",
        atributos: { style: "margin-top:1.6rem" },
        hijos: [icono("documento", { tamano: 18 }), crear("span", { texto: nombreArchivo(caso) })],
      }),
    ],
  });

  /* El envío se valida en el DOM: sin alert ni validación nativa. */
  const alEnviar = (evento) => {
    evento.preventDefault();

    const destino = campoCorreo.value.trim();

    if (destino === "") {
      error.textContent = "Indique una dirección de correo.";
      campoCorreo.focus();
      return;
    }

    if (!esCorreoValido(destino)) {
      error.textContent = "La dirección indicada no tiene un formato válido.";
      campoCorreo.focus();
      return;
    }

    error.textContent = "";
    cerrarModal();

    mostrarAviso({
      tipo: "exito",
      titulo: "Reporte enviado",
      texto: `Se envió a ${destino} el ${marcaDeTiempo()}`,
    });
  };

  formulario.addEventListener("submit", alEnviar);

  const botonCancelar = crear("button", {
    clase: ["boton", "boton--fantasma"],
    atributos: { type: "button" },
    texto: "Cancelar",
    eventos: { click: cerrarModal },
  });

  const botonEnviar = crear("button", {
    clase: ["boton", "boton--primario"],
    atributos: { type: "submit", form: "formulario-correo" },
    hijos: [icono("correo", { tamano: 16 }), crear("span", { texto: "Enviar reporte" })],
  });

  abrirModal({
    titulo: "Enviar reporte por correo",
    nombreIcono: "correo",
    cuerpo: [
      crear("p", {
        texto: `Se enviará el reporte completo del siniestro N° ${caso.numeroSiniestro} por ${comoMoneda(caso.monto)}.`,
      }),
      formulario,
    ],
    acciones: [botonCancelar, botonEnviar],
  });
}

/**
 * Construye la barra de decisión del reporte.
 * @param {object} opciones
 * @param {object} opciones.caso
 * @returns {HTMLElement}
 */
export function crearBarraDecision({ caso }) {
  const barra = crear("section", { clase: ["decision", "no-imprimir"] });

  /* Sustituye la barra por el resultado una vez tomada la decisión. */
  const mostrarResolucion = (tipo) => {
    const esFraude = tipo === "fraude";

    const resultado = crear("div", {
      clase: ["resuelto", esFraude ? "resuelto--fraude" : "resuelto--liquidacion"],
      hijos: [
        icono(esFraude ? "alerta" : "visto", { tamano: 20 }),
        crear("div", {
          hijos: [
            crear("p", {
              atributos: { style: "font-weight:600" },
              texto: esFraude
                ? "Caso derivado a investigación por fraude"
                : "Caso liberado para continuar a liquidación",
            }),
            crear("p", {
              atributos: { style: "font-size:1.2rem;opacity:.8" },
              texto: `Resolución registrada el ${marcaDeTiempo()}`,
            }),
          ],
        }),
      ],
    });

    reemplazar(barra, resultado);
  };

  const botonPdf = crear("button", {
    clase: ["boton", "boton--fantasma"],
    atributos: { type: "button" },
    hijos: [icono("imprimir", { tamano: 16 }), crear("span", { texto: "Emitir PDF" })],
    eventos: { click: () => emitirReporte(caso) },
  });

  const botonCorreo = crear("button", {
    clase: ["boton", "boton--fantasma"],
    atributos: { type: "button" },
    hijos: [icono("correo", { tamano: 16 }), crear("span", { texto: "Enviar por correo" })],
    eventos: { click: () => enviarPorCorreo(caso) },
  });

  const botonLiquidacion = crear("button", {
    clase: ["boton", "boton--exito"],
    atributos: { type: "button" },
    hijos: [icono("visto", { tamano: 16 }), crear("span", { texto: "No es fraude, continuar" })],
    eventos: {
      click: () =>
        confirmar({
          titulo: "Continuar a liquidación",
          nombreIcono: "visto",
          mensaje: `Confirme que el siniestro N° ${caso.numeroSiniestro} de ${caso.beneficiario} no presenta indicios de fraude y puede continuar su procesamiento normal.`,
          textoConfirmar: "Confirmar y liberar",
          estiloConfirmar: "boton--exito",
          alConfirmar: () => {
            mostrarResolucion("liquidacion");
            mostrarAviso({
              tipo: "exito",
              titulo: "Caso liberado",
              texto: "El siniestro continúa el flujo de liquidación.",
            });
          },
        }),
    },
  });

  const botonFraude = crear("button", {
    clase: ["boton", "boton--peligro"],
    atributos: { type: "button" },
    hijos: [icono("alerta", { tamano: 16 }), crear("span", { texto: "Confirmar fraude" })],
    eventos: {
      click: () =>
        confirmar({
          titulo: "Derivar a investigación por fraude",
          nombreIcono: "alerta",
          mensaje: `El siniestro N° ${caso.numeroSiniestro} quedará bloqueado y será derivado a la unidad de investigación. Esta acción detiene el pago.`,
          textoConfirmar: "Derivar el caso",
          estiloConfirmar: "boton--peligro",
          alConfirmar: () => {
            mostrarResolucion("fraude");
            mostrarAviso({
              tipo: "alerta",
              titulo: "Caso derivado",
              texto: "El siniestro fue bloqueado y enviado a investigación.",
            });
          },
        }),
    },
  });

  const texto = crear("div", {
    clase: "decision__texto",
    hijos: [
      crear("h2", { clase: "decision__titulo", texto: "Decisión del analista" }),
      crear("p", {
        clase: "decision__ayuda",
        texto:
          "Emita el reporte, compártalo con el equipo o resuelva el destino del siniestro.",
      }),
    ],
  });

  const acciones = crear("div", {
    clase: "decision__acciones",
    hijos: [botonPdf, botonCorreo, botonLiquidacion, botonFraude],
  });

  barra.appendChild(texto);
  barra.appendChild(acciones);

  return barra;
}
