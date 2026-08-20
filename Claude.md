Proyecto:
Aplicación web para Aseguradoras para revisar evidencias de fraude en siniestros.

Rol del agente:
Desarrollador web con 12 años de experiencia.

Objetivo:
Crear una aplicación web no funcional (mockup) para que los analistas de siniestros puedan revisar la evidencia de fraude de los siniestros que pasan por sus compañías de seguros

Funcionalidades de la aplicación:
- Pagina de inicio con Dashboard y casos críticos. 
    - El dashboard deberá tener el resultado de los casos  más críticos según el scoring de riesgo asignado. El dashboard debe mostrar la cantidad de casos y el monto en $ que está en riesgo, % se casos críticos/sobre total de casos detectados. %de monto critico, sobre monto total detectado. Monto total en $. Como es un mock up, digamos que hay 10 casos críticos de 20, que representan 
    - Luego debajo de eso, deben haber dos listados de casos:
    - Casos críticos: en cada fila debe decir el nombre-rut del beneficiario. Un semáforo para tres criterios de evaluación Análisis Forence de Documentos – Validación Externa/Interna – Análisis de Patrones de comportamiento. Mientras mas rojos, mas critico. Este sería el scoring de riesgo. El scoring debe ir al final como una nota de 1 a 100, siendo 100 lo más riesgoso.
    - Casos leves: Igual al anterior, pero que indique que son de baja criticidad.
    - Los analistas podrán acceder a los casos críticos y leves para revisar toda la evidencia.
    - Un vez analizado el caso, en analista podrá decidir si el caso continúa para liquidación o si imprime en PDF un reporte del caso
    
Reporte del caso:
- El caso debe tener: Nombre rut monto prestador prestación. Como es un caso falso usa mis datos:
    - Beneficiario: Ramiro Lucas Fiochi
    - Rut: 24.543.309-9
    - Boleta de Honorarios N°: 4761
    - Monto: $ 905.000 
    - Prestación Psicología
    - Fecha boleta: 10/05/2024
    - Prestador: Fabián Rodriguez Díaz
    - Rut: 11.005.560-2
    - N° de Siniestro. 77940303
    - Fecha de ingreso de siniestro: 30/05/2024
- En el lado superior dereche debe haber un circulo rojo indicando alta probabilidad de fraude. 
- Luego el reporte se separa en tres secciones:
- Analisis Forence del Documento / semáforo rojo:
    Acá debe haber una foto del documento y a la derecha de este mismo un análisis detallado de los hallazgos:
    -	LLM Detección Visual: Debe decir que hay inconsistencia visuales en el numero de boleta, el Font del monto y la fecha de emisión.
    -	Metadata: El rastro digital no miente. El archivo fue originalmente creado en 2021, pero detectamos ediciones fraudulentas realizadas en Canva en 2024 para alterar su validez.


- Validación con Fuentes Externas/Internas: Semáforo Rojo: 
    -	AGENTE SII: Inconsistencia fiscal detectada. El monto real registrado en código bidemensional es de $108,000, mientras que el documento presentado declara $905,000. Boleta no existe en SII.
    -	WATCHLIST: Alerta roja de identidad. El RUT del beneficiario cuenta con antecedentes previos de fraude en nuestra base de datos global.

- Análisis de Patrones de Comportamiento/Semaforo rojo:
    - DESVIACIÓN: Análisis estadístico muestra una alta desviación del promedio histórico de $50,000 para este tipo de siniestro. Indicar que hay 3 clientes más con desviación similar y darle acceso para revisar los otros casos. Crea un grafico que muestre la desviación estándar y como estos cuatro casos se escapan de esta desviación. Al pasar por encima del grafico, en cada punto, debe mostrar los siguientes datos: Nombre Beneficiario: Rut: Tipo de Documento Monto Prestación fecha.
    - COALICIÓN: Patrón de comportamiento sospechoso: El beneficiario visitó al mismo proveedor 15 veces en solo 7 días, encontramos 4 pacientes similares con el mismo comportamiento. Idea un grafico interesante para mostrar este hallazgo y que se vea como lo asocia al resto de pacientes. 
- El analista, con la información podrá pedirle a la herramienta que emita un reporte ordenado en PDF con toda la información y luego enviarlo por correo. 
- EL analista podrá determinar si el caso no es fraude y darle continuar para que se termine de procesar. 

Stack de tecnologia:
- HTML5
- CSS3 (con tailwind)
- JavaScript
- React

Preferencias generales:
- Todos los textos visibles en la web deben estar en español.

Preferencias de diseño:
- Basate en el documento HTML del diseño que tienes en la carpeta design del proyecto. Me encanta ese diseño
- Usa el logo de Lisa en el sidebar.
- Llama a la app LISA vigIA (por IA)

Preferencias de estilos:
- Colores (los del diseño)
- Uso de medidas en rem, usando un font-size base de 10px
- Uso de HTML5 y CSS3 nativo.
- Uso de buenas practicas de maquetación css y si es necesario usa flexbox y css grid layout.
- Que la webapp sea responsive.

Preferencias de código:
- No añadas dependencias externas.
- HTML debe ser semantico.
- Usa siempre let o const, y no uses nunca var.
- No uses alert, confirm o prompt, todo el feedback debe ser visual en el dom.
- Toda alerta o ventana modal que aparezca debe tener el mismo estilo que la web.
- No uses innerHTML, todo el contenido debe ser insertado con appendChild o previamente creando un elemento con document.createElement
- Cuidado con olvidar prevenir el default en los eventos submit o click.
- Prioriza el código legible y mantenible.
- Pririza que el codigo sea sencillo de entender.
- Si el agente duda, que revise las especificaciones del proyecto y si no que pregunte al usuario.

Estructura de archivos:
- carpeta (design)
- carpeta (logo)
- CLAUDE.md
- estructura de ficheros más adecuada para proyectos de react (lo elige el agente de ia)



