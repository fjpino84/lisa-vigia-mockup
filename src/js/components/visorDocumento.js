/* =========================================================================
   LISA vigIA — Visor del documento periciado.
   Muestra la boleta de honorarios aportada por el beneficiario y superpone
   las zonas señaladas por el detector visual. Cada marca es interactiva:
   al posar el puntero sobre ella se describe el hallazgo asociado.
   ========================================================================= */

import { crear } from "../utils/dom.js";

/* Colores por tipo de marca, alineados con la leyenda del visor. */
const COLOR_MARCA = {
  visual: "#e5484d",
  metadato: "#7c6ce0",
};

/**
 * Construye el visor con la boleta y sus marcas de anomalía.
 * @param {object} opciones
 * @param {object} opciones.caso Caso cuyo documento se representa.
 * @param {object[]} opciones.marcas Zonas detectadas como anómalas.
 * @returns {HTMLElement}
 */
export function crearVisorDocumento({ caso, marcas }) {
  const imagen = crear("img", {
    clase: "documento__imagen",
    atributos: {
      src: "assets/boleta-4761.png",
      alt: `${caso.documento} presentada por ${caso.beneficiario}, con las zonas señaladas por el análisis forense.`,
      loading: "lazy",
    },
  });

  const capa = crear("div", { clase: "documento__capa" });

  /* Descripción del hallazgo que se muestra bajo el documento. */
  const detalle = crear("p", {
    clase: "documento__detalle",
    texto: "Pase el puntero sobre una zona marcada para ver el hallazgo.",
  });

  const textoInicial = detalle.textContent;

  marcas.forEach((marca) => {
    const color = COLOR_MARCA[marca.tipo] ?? COLOR_MARCA.visual;

    const zona = crear("button", {
      clase: ["documento__marca", `documento__marca--${marca.tipo}`],
      atributos: {
        type: "button",
        "aria-label": `${marca.etiqueta}: ${marca.detalle}`,
      },
    });

    /* Las coordenadas vienen en porcentaje sobre la imagen original. */
    zona.style.left = `${marca.x}%`;
    zona.style.top = `${marca.y}%`;
    zona.style.width = `${marca.ancho}%`;
    zona.style.height = `${marca.alto}%`;
    zona.style.borderColor = color;
    zona.style.backgroundColor = `${color}22`;

    const etiqueta = crear("span", { clase: "documento__etiqueta", texto: marca.etiqueta });
    etiqueta.style.backgroundColor = color;
    zona.appendChild(etiqueta);

    /* Al enfocar o apuntar la zona se describe el hallazgo debajo. */
    const describir = () => {
      detalle.textContent = `${marca.etiqueta}: ${marca.detalle}`;
      detalle.classList.add("esta-activo");
    };

    const restaurar = () => {
      detalle.textContent = textoInicial;
      detalle.classList.remove("esta-activo");
    };

    zona.addEventListener("mouseenter", describir);
    zona.addEventListener("focus", describir);
    zona.addEventListener("mouseleave", restaurar);
    zona.addEventListener("blur", restaurar);

    /* El botón no envía formularios ni navega: solo describe. */
    zona.addEventListener("click", (evento) => {
      evento.preventDefault();
      describir();
    });

    capa.appendChild(zona);
  });

  const visor = crear("figure", {
    clase: "documento",
    hijos: [imagen, capa],
  });

  const leyenda = crear("figcaption", {
    clase: "documento__pie",
    hijos: [
      crear("span", {
        clase: "documento__leyenda",
        hijos: [
          crear("span", { clase: "documento__muestra" }),
          crear("span", { texto: "Anomalía visual" }),
        ],
      }),
      crear("span", {
        clase: "documento__leyenda",
        hijos: [
          crear("span", { clase: ["documento__muestra", "documento__muestra--meta"] }),
          crear("span", { texto: "Capa editada" }),
        ],
      }),
      crear("span", {
        clase: "documento__origen",
        texto: `${caso.documento} · ${caso.fechaDocumento}`,
      }),
    ],
  });

  return crear("div", { hijos: [visor, leyenda, detalle] });
}
