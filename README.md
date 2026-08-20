# LISA vigIA

Prototipo navegable de la plataforma con la que un analista de siniestros revisa
la evidencia de fraude de los casos que llegan a su compañía de seguros.

Es un **mockup funcional**: la interfaz responde por completo (navegación,
filtros, gráficos, modales, decisiones), pero no existe servidor ni base de
datos detrás. Todos los datos son ficticios y viven en `src/js/data/casos.js`.

## Cómo ejecutarlo

La aplicación usa módulos ES, que el navegador no carga desde `file://`. Hace
falta un servidor estático:

```bash
# Con Node instalado, desde la carpeta del proyecto
npx serve .

# Alternativa con Python
python -m http.server 4173
```

Después se abre `http://localhost:4173` en el navegador.

## Recorrido sugerido

1. **Centro de mando**: indicadores de la cartera y los dos listados de casos.
2. Se abre el caso de **Ramiro Lucas Fiochi** (scoring 98) desde la tabla.
3. En el reporte se recorren las tres secciones de evidencia:
   - Análisis forense del documento, con la boleta y sus zonas marcadas.
   - Validación con el SII y la watchlist interna.
   - Patrones de comportamiento, con los gráficos de desviación y coalición.
4. Desde la barra inferior se emite el PDF, se envía por correo o se resuelve
   el destino del siniestro.

Solo el caso 77940303 tiene expediente forense completo; el resto comparte la
ficha y el scoring, tal como corresponde a un prototipo.

## Estructura

```
index.html              Punto de entrada; solo enlaza estilos y el módulo raíz
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

## Alcance

Los módulos Análisis de red, Herramientas forenses e Inteligencia archivada
aparecen en la navegación pero no forman parte del prototipo: muestran una vista
informativa que lo indica.
