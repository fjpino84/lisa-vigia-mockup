/* =========================================================================
   LISA vigIA — Empaquetador para publicación.
   Reúne el CSS, los módulos JavaScript y las imágenes en un único archivo
   HTML autocontenido, apto para compartir por enlace o subir a cualquier
   alojamiento estático sin necesidad de servidor de módulos.

   Uso:  node empaquetar.js
   Sale: lisa-vigia.html
   ========================================================================= */

const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, "lisa-vigia.html");

/* Orden en el que se concatenan las hojas de estilo. */
const ESTILOS = [
  "src/css/base.css",
  "src/css/layout.css",
  "src/css/componentes.css",
  "src/css/reporte.css",
  "src/css/secciones.css",
  "src/css/impresion.css",
];

/* Imágenes que la interfaz referencia por ruta relativa. */
const IMAGENES = ["assets/lisa-logo.png", "assets/boleta-4761.png"];

const leer = (relativa) => fs.readFileSync(path.join(RAIZ, relativa), "utf8");

/* ------------------------------------------------------------------ */
/* Resolución de módulos                                               */
/* ------------------------------------------------------------------ */

/* Los módulos se aplanan en un solo ámbito: se recorren en profundidad
   para que cada dependencia quede escrita antes que quien la usa. */
const visitados = new Set();
const ordenados = [];

function recorrer(relativa) {
  const normalizada = relativa.replace(/\\/g, "/");
  if (visitados.has(normalizada)) {
    return;
  }
  visitados.add(normalizada);

  const codigo = leer(normalizada);
  const carpeta = path.dirname(normalizada);

  /* Primero las dependencias, después el propio módulo. */
  const patron = /^\s*import\s+[^;]*?from\s+["']([^"']+)["'];?/gm;
  let coincidencia;

  while ((coincidencia = patron.exec(codigo)) !== null) {
    const destino = path
      .join(carpeta, coincidencia[1])
      .replace(/\\/g, "/");
    recorrer(destino);
  }

  ordenados.push({ ruta: normalizada, codigo });
}

recorrer("src/js/app.js");

/* Cada módulo se envuelve en su propia función para conservar el ámbito
   privado que tenía como módulo: así dos archivos pueden declarar
   constantes con el mismo nombre sin interferir entre sí. Lo exportado se
   publica en un registro compartido, y lo importado se toma de él. */

/* Extrae los nombres que un módulo exporta. */
function nombresExportados(codigo) {
  const nombres = new Set();

  const declaraciones = /^\s*export\s+(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let coincidencia;
  while ((coincidencia = declaraciones.exec(codigo)) !== null) {
    nombres.add(coincidencia[1]);
  }

  const listas = /^\s*export\s*\{([^}]*)\};?/gm;
  while ((coincidencia = listas.exec(codigo)) !== null) {
    coincidencia[1]
      .split(",")
      .map((parte) => parte.trim().split(/\s+as\s+/).pop().trim())
      .filter(Boolean)
      .forEach((nombre) => nombres.add(nombre));
  }

  return [...nombres];
}

/* Extrae los nombres que un módulo importa de otros. */
function nombresImportados(codigo) {
  const nombres = new Set();
  const patron = /^\s*import\s*\{([^}]*)\}\s*from\s*["'][^"']+["'];?/gm;
  let coincidencia;

  while ((coincidencia = patron.exec(codigo)) !== null) {
    coincidencia[1]
      .split(",")
      .map((parte) => parte.trim().split(/\s+as\s+/).pop().trim())
      .filter(Boolean)
      .forEach((nombre) => nombres.add(nombre));
  }

  return [...nombres];
}

/* Envuelve un módulo, resolviendo sus importaciones desde el registro. */
function envolver(ruta, codigo) {
  const importados = nombresImportados(codigo);
  const exportados = nombresExportados(codigo);

  const cuerpo = codigo
    .replace(/^\s*import\s+[^;]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*export\s+(?=(const|let|function|class)\b)/gm, "")
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, "");

  const entrada = importados.length
    ? `  const { ${importados.join(", ")} } = REGISTRO;\n`
    : "";

  const salida = exportados.length
    ? `\n  Object.assign(REGISTRO, { ${exportados.join(", ")} });`
    : "";

  return `/* ===== ${ruta} ===== */\n(() => {\n${entrada}${cuerpo}${salida}\n})();`;
}

/* ------------------------------------------------------------------ */
/* Recursos incrustados                                                */
/* ------------------------------------------------------------------ */

/* Las imágenes viajan como URI de datos para que el archivo sea autónomo. */
const recursos = {};

IMAGENES.forEach((relativa) => {
  const binario = fs.readFileSync(path.join(RAIZ, relativa));
  recursos[relativa] = `data:image/png;base64,${binario.toString("base64")}`;
});

const mapaRecursos = `
/* Rutas de imagen sustituidas por su contenido incrustado. */
const RECURSOS = ${JSON.stringify(recursos, null, 2)};
`;

/* El paquete conserva las rutas originales en el código: se traducen aquí. */
const parcheImagenes = `
/* Toda imagen creada con una ruta conocida recibe su versión incrustada. */
const crearElementoOriginal = document.createElement.bind(document);
document.createElement = (etiqueta, opciones) => {
  const elemento = crearElementoOriginal(etiqueta, opciones);

  if (etiqueta.toLowerCase() === "img") {
    const asignarSrc = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "src"
    );

    Object.defineProperty(elemento, "src", {
      get() {
        return asignarSrc.get.call(this);
      },
      set(valor) {
        asignarSrc.set.call(this, RECURSOS[valor] ?? valor);
      },
      configurable: true,
    });
  }

  return elemento;
};

/* setAttribute("src", …) sigue la misma sustitución. */
const ponerAtributoOriginal = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (nombre, valor) {
  if (nombre === "src" && RECURSOS[valor]) {
    return ponerAtributoOriginal.call(this, nombre, RECURSOS[valor]);
  }
  return ponerAtributoOriginal.call(this, nombre, valor);
};
`;

/* ------------------------------------------------------------------ */
/* Composición del archivo                                             */
/* ------------------------------------------------------------------ */

const css = ESTILOS.map(
  (relativa) => `/* ===== ${relativa} ===== */\n${leer(relativa)}`
).join("\n\n");

const js = ordenados
  .map(({ ruta, codigo }) => envolver(ruta, codigo))
  .join("\n\n");

const html = `<title>LISA vigIA</title>

<style>
${css}
</style>

<script>
${mapaRecursos}
${parcheImagenes}

/* Los módulos del proyecto. Cada uno conserva su ámbito privado y comparte
   lo que exporta a través de este registro. El arranque espera a que el
   documento tenga cuerpo, ya que el paquete se ejecuta desde la cabecera. */
const arrancar = () => {
const REGISTRO = {};

${js}
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", arrancar);
} else {
  arrancar();
}
</script>
`;

fs.writeFileSync(SALIDA, html, "utf8");

const kb = Math.round(fs.statSync(SALIDA).size / 1024);
console.log(`Paquete generado: lisa-vigia.html (${kb} KB)`);
console.log(`Módulos incluidos: ${ordenados.length}`);
console.log(`Hojas de estilo:   ${ESTILOS.length}`);
console.log(`Imágenes:          ${IMAGENES.length}`);
