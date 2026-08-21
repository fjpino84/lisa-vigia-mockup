# LISA vigIA

**Ver en línea: https://fjpino84.github.io/lisa-vigia-mockup/**

Prototipo navegable de la plataforma con la que un analista de siniestros revisa
la evidencia de fraude de los casos que llegan a su compañía de seguros.

Es un **mockup funcional**: la interfaz responde por completo (navegación,
filtros, gráficos, modales, decisiones), pero no existe servidor ni base de
datos detrás. Todos los datos son ficticios y viven en `src/js/data/casos.js`.

## Cómo verlo

**En línea.** El prototipo está publicado en
<https://fjpino84.github.io/lisa-vigia-mockup/>. No requiere instalar nada ni
tener cuenta de ningún servicio.

**Sin servidor, en local.** El archivo `lisa-vigia.html` reúne todo el proyecto
en una sola página y se abre con doble clic. Es también el archivo apto para
enviar por correo. Se regenera con `node empaquetar.js` cada vez que cambia el
código fuente.

**Con servidor, para desarrollar.** El `index.html` del proyecto usa módulos ES,
que el navegador no carga desde `file://`. Hace falta un servidor estático:

```bash
# Con Node instalado, desde la carpeta del proyecto
npx serve .

# Alternativa con Python
python -m http.server 4173
```

Después se abre `http://localhost:4173` en el navegador. En Windows, el archivo
`abrir-lisa.bat` hace ambos pasos con doble clic.

## Recorrido sugerido

1. **Centro de mando**: indicadores de la cartera y los dos listados de casos.
2. Se abre el caso de **Ramiro Lucas Fiochi** (scoring 98) desde la tabla.
3. En el reporte se recorren las tres secciones de evidencia:
   - Análisis forense del documento, con la boleta y sus zonas marcadas.
   - Validación con el SII y la watchlist interna.
   - Patrones de comportamiento, con los gráficos de desviación y coalición.
4. Desde la barra inferior se emite el PDF, se envía por correo o se resuelve
   el destino del siniestro.

## Estructura

```
index.html              Punto de entrada; solo enlaza estilos y el módulo raíz
lisa-vigia.html         Todo el proyecto en una página, generado y autocontenido
empaquetar.js           Genera lisa-vigia.html a partir del código fuente
abrir-lisa.bat          Lanzador local para Windows
assets/                 Logotipo y boleta empleados por la interfaz
Design/                 Referencias visuales de partida
Logo/                   Logotipo original
src/
  css/
    base.css            Reset, variables de color y tipografía (1rem = 10px)
    layout.css          Barra lateral, cabecera y contenedor de vistas
    componentes.css     Paneles, indicadores, tablas, modales y avisos
    reporte.css         Ficha del caso, secciones de evidencia y gráficos
    impresion.css       Hoja A4 para "Guardar como PDF"
  js/
    app.js              Arranque y navegación entre vistas
    data/casos.js       Cartera simulada de 20 siniestros
    utils/              Construcción de DOM y formato de cifras
    components/         Piezas reutilizables de la interfaz
    views/              Panel, registro, reporte y secciones pendientes
```

## Decisiones técnicas

- **Sin dependencias externas.** No hay framework, ni librería de gráficos, ni
  build. Los dos gráficos y los iconos son SVG construidos a mano.
- **El PDF sale de la hoja de impresión.** `impresion.css` reformatea el reporte
  a A4 con fondo claro y sin navegación; el botón abre el diálogo del navegador,
  donde se elige "Guardar como PDF".
- **Nada de `alert`, `confirm` ni `prompt`.** Toda respuesta ocurre en el DOM:
  modales propios y avisos flotantes con el estilo de la aplicación.
- **Sin `innerHTML`.** Cada nodo se crea con `document.createElement` a través
  de las utilidades de `src/js/utils/dom.js`.
- **Medidas en `rem`** sobre una raíz al 62.5%, de modo que `1rem` equivale a
  10px.

## Las cinco secciones

- **Centro de mando**: indicadores de la cartera y los dos listados de casos.
- **Registro de casos**: la cartera completa, con filtros y búsqueda.
- **Análisis de red**: los vínculos entre prestadores y beneficiarios de toda la
  cartera. Revela que un solo prestador concentra el 60 % de los casos críticos,
  algo que no se aprecia revisando los casos de uno en uno.
- **Herramientas forenses**: el laboratorio documental, con el estado de los
  cuatro verificadores automáticos y la cola de peritaje.
- **Inteligencia archivada**: el histórico de resoluciones de los últimos seis
  meses y los patrones de fraude confirmados que alimentan el scoring.

## Alcance

Solo el caso 77940303 cuenta con expediente forense completo. El resto comparte
la ficha y el scoring, como corresponde a un prototipo.
