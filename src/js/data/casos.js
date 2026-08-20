/* =========================================================================
   LISA vigIA — Datos simulados de la cartera de siniestros.
   Toda la información es ficticia y existe únicamente para el prototipo.
   ========================================================================= */

/* Niveles del semáforo compartidos por listados y reportes. */
export const NIVEL = {
  ALTO: "alto",
  MEDIO: "medio",
  BAJO: "bajo",
};

/* Caso principal, con la evidencia completa descrita en el proyecto. */
const casoPrincipal = {
  id: "77940303",
  criticidad: "critico",
  puntaje: 98,
  beneficiario: "Ramiro Lucas Fiochi",
  rut: "24.543.309-9",
  monto: 905000,
  prestacion: "Psicología",
  documento: "Boleta de Honorarios N° 4761",
  numeroDocumento: "4761",
  fechaDocumento: "10/05/2024",
  prestador: "Fabián Rodríguez Díaz",
  rutPrestador: "11.005.560-2",
  numeroSiniestro: "77940303",
  fechaIngreso: "30/05/2024",
  semaforo: {
    forense: NIVEL.ALTO,
    validacion: NIVEL.ALTO,
    patrones: NIVEL.ALTO,
  },
  /* Evidencia detallada; solo el caso principal la trae completa. */
  evidencia: {
    forense: {
      visual: [
        {
          titulo: "Número de boleta",
          texto:
            "Inconsistencias en el número de boleta. Se detecta un salto secuencial anómalo respecto de la serie emitida por el prestador.",
        },
        {
          titulo: "Tipografía del monto",
          texto:
            "Anomalías tipográficas: se detecta una fuente distinta en el monto y en la fecha de emisión respecto del resto del documento.",
        },
        {
          titulo: "Fecha de emisión",
          texto:
            "Contradicción interna: el cuerpo de la boleta declara el 10 de mayo de 2024, mientras que la fecha y hora de emisión impresa al pie corresponden al 10/05/2021.",
        },
      ],
      metadatos: {
        creacion: "2021-08-15T14:32:00Z",
        modificacion: "2024-05-29T10:15:22Z",
        software: "Canva (Web Application)",
        conclusion:
          "El rastro digital no miente: el archivo fue creado originalmente en 2021, pero registra ediciones realizadas en Canva durante 2024 para alterar su validez.",
      },
      /* Zonas del documento marcadas por el detector visual.
         Las coordenadas son porcentajes sobre la imagen de la boleta. */
      marcas: [
        {
          x: 72.5,
          y: 10.5,
          ancho: 25,
          alto: 6.5,
          tipo: "visual",
          etiqueta: "N° 4761",
          detalle:
            "El número de boleta presenta un salto secuencial anómalo respecto de la serie emitida por el prestador y se aprecia un artefacto de edición sobre el último dígito.",
        },
        {
          x: 71.5,
          y: 37.5,
          ancho: 27,
          alto: 5.5,
          tipo: "visual",
          etiqueta: "Fecha declarada",
          detalle:
            "La fecha declarada (10 de mayo de 2024) no coincide con la fecha de emisión registrada al pie del documento (10/05/2021).",
        },
        {
          x: 71,
          y: 56,
          ancho: 27,
          alto: 9.5,
          tipo: "visual",
          etiqueta: "Monto alterado",
          detalle:
            "El monto de $905.000 se presenta en una tipografía distinta a la del resto del documento y sin el alineado propio del emisor original.",
        },
        {
          x: 18,
          y: 65,
          ancho: 36,
          alto: 5,
          tipo: "visual",
          etiqueta: "Fecha de emisión",
          detalle:
            "La emisión consigna el año 2021, tres años antes de la fecha declarada en el cuerpo de la boleta.",
        },
        {
          x: 7.5,
          y: 68.5,
          ancho: 58,
          alto: 9,
          tipo: "metadato",
          etiqueta: "Timbre SII",
          detalle:
            "El código de barras codifica un monto de $108.000, muy inferior a los $905.000 declarados en el documento.",
        },
      ],
    },
    validacion: [
      {
        fuente: "Agente SII",
        titulo: "Inconsistencia fiscal detectada",
        texto:
          "El monto real registrado en el código bidimensional es de $108.000, mientras que el documento presentado declara $905.000. La boleta no existe en los registros del SII.",
        montoDeclarado: 905000,
        montoReal: 108000,
      },
      {
        fuente: "Watchlist",
        titulo: "Alerta roja de identidad",
        texto:
          "El RUT del beneficiario cuenta con antecedentes previos de fraude en nuestra base de datos global.",
      },
    ],
    patrones: {
      desviacion: {
        promedio: 50000,
        texto:
          "El análisis estadístico muestra una alta desviación respecto del promedio histórico de $50.000 para este tipo de siniestro. Se identificaron 3 beneficiarios adicionales con una desviación similar.",
      },
      coalicion: {
        visitas: 15,
        dias: 7,
        texto:
          "Patrón de comportamiento sospechoso: el beneficiario visitó al mismo prestador 15 veces en solo 7 días. Se encontraron 4 pacientes con el mismo comportamiento sobre el mismo prestador.",
      },
    },
  },
};

/* Resto de casos críticos de la cartera. */
const otrosCriticos = [
  {
    id: "77940311",
    criticidad: "critico",
    puntaje: 92,
    beneficiario: "Valeria S. Montero",
    rut: "18.234.901-K",
    monto: 870000,
    prestacion: "Kinesiología",
    documento: "Boleta de Honorarios N° 3120",
    numeroDocumento: "3120",
    fechaDocumento: "12/05/2024",
    prestador: "Fabián Rodríguez Díaz",
    rutPrestador: "11.005.560-2",
    numeroSiniestro: "77940311",
    fechaIngreso: "31/05/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.ALTO, patrones: NIVEL.ALTO },
  },
  {
    id: "77940318",
    criticidad: "critico",
    puntaje: 87,
    beneficiario: "Carlos G. Altamirano",
    rut: "12.981.442-3",
    monto: 812000,
    prestacion: "Psicología",
    documento: "Boleta de Honorarios N° 4772",
    numeroDocumento: "4772",
    fechaDocumento: "09/05/2024",
    prestador: "Fabián Rodríguez Díaz",
    rutPrestador: "11.005.560-2",
    numeroSiniestro: "77940318",
    fechaIngreso: "29/05/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.ALTO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940324",
    criticidad: "critico",
    puntaje: 85,
    beneficiario: "Elena M. Rojas",
    rut: "15.772.109-8",
    monto: 795000,
    prestacion: "Fonoaudiología",
    documento: "Boleta de Honorarios N° 2288",
    numeroDocumento: "2288",
    fechaDocumento: "14/05/2024",
    prestador: "Fabián Rodríguez Díaz",
    rutPrestador: "11.005.560-2",
    numeroSiniestro: "77940324",
    fechaIngreso: "01/06/2024",
    semaforo: { forense: NIVEL.MEDIO, validacion: NIVEL.ALTO, patrones: NIVEL.ALTO },
  },
  {
    id: "77940330",
    criticidad: "critico",
    puntaje: 83,
    beneficiario: "Ignacio R. Bravo",
    rut: "16.441.238-5",
    monto: 910000,
    prestacion: "Traumatología",
    documento: "Boleta de Honorarios N° 5510",
    numeroDocumento: "5510",
    fechaDocumento: "07/05/2024",
    prestador: "Clínica Los Andes SpA",
    rutPrestador: "76.221.905-1",
    numeroSiniestro: "77940330",
    fechaIngreso: "28/05/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.MEDIO, patrones: NIVEL.ALTO },
  },
  {
    id: "77940337",
    criticidad: "critico",
    puntaje: 81,
    beneficiario: "Patricia L. Cárdenas",
    rut: "13.908.554-7",
    monto: 878000,
    prestacion: "Psiquiatría",
    documento: "Boleta de Honorarios N° 1904",
    numeroDocumento: "1904",
    fechaDocumento: "18/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940337",
    fechaIngreso: "02/06/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.ALTO, patrones: NIVEL.MEDIO },
  },
  {
    id: "77940342",
    criticidad: "critico",
    puntaje: 79,
    beneficiario: "Sebastián A. Núñez",
    rut: "17.552.640-2",
    monto: 845000,
    prestacion: "Kinesiología",
    documento: "Boleta de Honorarios N° 3341",
    numeroDocumento: "3341",
    fechaDocumento: "21/05/2024",
    prestador: "Fabián Rodríguez Díaz",
    rutPrestador: "11.005.560-2",
    numeroSiniestro: "77940342",
    fechaIngreso: "03/06/2024",
    semaforo: { forense: NIVEL.MEDIO, validacion: NIVEL.ALTO, patrones: NIVEL.ALTO },
  },
  {
    id: "77940349",
    criticidad: "critico",
    puntaje: 77,
    beneficiario: "Camila F. Vergara",
    rut: "19.220.884-4",
    monto: 803000,
    prestacion: "Nutrición",
    documento: "Boleta de Honorarios N° 2755",
    numeroDocumento: "2755",
    fechaDocumento: "22/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940349",
    fechaIngreso: "04/06/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.MEDIO, patrones: NIVEL.MEDIO },
  },
  {
    id: "77940355",
    criticidad: "critico",
    puntaje: 75,
    beneficiario: "Rodrigo E. Salinas",
    rut: "14.100.377-6",
    monto: 762000,
    prestacion: "Traumatología",
    documento: "Boleta de Honorarios N° 6018",
    numeroDocumento: "6018",
    fechaDocumento: "24/05/2024",
    prestador: "Clínica Los Andes SpA",
    rutPrestador: "76.221.905-1",
    numeroSiniestro: "77940355",
    fechaIngreso: "05/06/2024",
    semaforo: { forense: NIVEL.MEDIO, validacion: NIVEL.ALTO, patrones: NIVEL.MEDIO },
  },
  {
    id: "77940361",
    criticidad: "critico",
    puntaje: 73,
    beneficiario: "Daniela P. Aguirre",
    rut: "20.117.593-1",
    monto: 970000,
    prestacion: "Psicología",
    documento: "Boleta de Honorarios N° 4788",
    numeroDocumento: "4788",
    fechaDocumento: "26/05/2024",
    prestador: "Fabián Rodríguez Díaz",
    rutPrestador: "11.005.560-2",
    numeroSiniestro: "77940361",
    fechaIngreso: "06/06/2024",
    semaforo: { forense: NIVEL.ALTO, validacion: NIVEL.MEDIO, patrones: NIVEL.ALTO },
  },
];

/* Casos de baja criticidad; se muestran en el listado secundario. */
const casosLeves = [
  {
    id: "77940402",
    criticidad: "leve",
    puntaje: 28,
    beneficiario: "Juan P. Silva",
    rut: "19.112.334-5",
    monto: 480000,
    prestacion: "Dental",
    documento: "Boleta de Honorarios N° 8802",
    numeroDocumento: "8802",
    fechaDocumento: "03/05/2024",
    prestador: "Clínica Dental Norte",
    rutPrestador: "76.554.221-8",
    numeroSiniestro: "77940402",
    fechaIngreso: "25/05/2024",
    semaforo: { forense: NIVEL.MEDIO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940408",
    criticidad: "leve",
    puntaje: 15,
    beneficiario: "Ana C. Morales",
    rut: "22.441.980-2",
    monto: 320000,
    prestacion: "Oftalmología",
    documento: "Boleta de Honorarios N° 1177",
    numeroDocumento: "1177",
    fechaDocumento: "05/05/2024",
    prestador: "Centro Óptico Sur",
    rutPrestador: "76.882.100-4",
    numeroSiniestro: "77940408",
    fechaIngreso: "26/05/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940415",
    criticidad: "leve",
    puntaje: 12,
    beneficiario: "Luis H. Castro",
    rut: "14.654.122-1",
    monto: 275000,
    prestacion: "Kinesiología",
    documento: "Boleta de Honorarios N° 4410",
    numeroDocumento: "4410",
    fechaDocumento: "06/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940415",
    fechaIngreso: "27/05/2024",
    semaforo: { forense: NIVEL.MEDIO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940421",
    criticidad: "leve",
    puntaje: 10,
    beneficiario: "Marta G. Soto",
    rut: "17.889.001-K",
    monto: 198000,
    prestacion: "Nutrición",
    documento: "Boleta de Honorarios N° 2093",
    numeroDocumento: "2093",
    fechaDocumento: "08/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940421",
    fechaIngreso: "28/05/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940428",
    criticidad: "leve",
    puntaje: 9,
    beneficiario: "Óscar D. Peña",
    rut: "11.443.775-3",
    monto: 165000,
    prestacion: "Dental",
    documento: "Boleta de Honorarios N° 8815",
    numeroDocumento: "8815",
    fechaDocumento: "09/05/2024",
    prestador: "Clínica Dental Norte",
    rutPrestador: "76.554.221-8",
    numeroSiniestro: "77940428",
    fechaIngreso: "29/05/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940433",
    criticidad: "leve",
    puntaje: 8,
    beneficiario: "Isidora V. Lagos",
    rut: "21.006.918-7",
    monto: 142000,
    prestacion: "Fonoaudiología",
    documento: "Boleta de Honorarios N° 3390",
    numeroDocumento: "3390",
    fechaDocumento: "11/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940433",
    fechaIngreso: "30/05/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940440",
    criticidad: "leve",
    puntaje: 7,
    beneficiario: "Tomás I. Reyes",
    rut: "18.775.204-9",
    monto: 128000,
    prestacion: "Oftalmología",
    documento: "Boleta de Honorarios N° 1188",
    numeroDocumento: "1188",
    fechaDocumento: "13/05/2024",
    prestador: "Centro Óptico Sur",
    rutPrestador: "76.882.100-4",
    numeroSiniestro: "77940440",
    fechaIngreso: "31/05/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940447",
    criticidad: "leve",
    puntaje: 6,
    beneficiario: "Fernanda J. Ortiz",
    rut: "16.332.847-0",
    monto: 115000,
    prestacion: "Nutrición",
    documento: "Boleta de Honorarios N° 2101",
    numeroDocumento: "2101",
    fechaDocumento: "15/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940447",
    fechaIngreso: "01/06/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940452",
    criticidad: "leve",
    puntaje: 5,
    beneficiario: "Andrés M. Fuentes",
    rut: "13.221.660-4",
    monto: 98000,
    prestacion: "Kinesiología",
    documento: "Boleta de Honorarios N° 4425",
    numeroDocumento: "4425",
    fechaDocumento: "17/05/2024",
    prestador: "Centro Salud Integral Ltda.",
    rutPrestador: "77.003.412-9",
    numeroSiniestro: "77940452",
    fechaIngreso: "02/06/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
  {
    id: "77940459",
    criticidad: "leve",
    puntaje: 4,
    beneficiario: "Rosa E. Miranda",
    rut: "10.556.093-2",
    monto: 85000,
    prestacion: "Dental",
    documento: "Boleta de Honorarios N° 8830",
    numeroDocumento: "8830",
    fechaDocumento: "19/05/2024",
    prestador: "Clínica Dental Norte",
    rutPrestador: "76.554.221-8",
    numeroSiniestro: "77940459",
    fechaIngreso: "03/06/2024",
    semaforo: { forense: NIVEL.BAJO, validacion: NIVEL.BAJO, patrones: NIVEL.BAJO },
  },
];

/* Cartera completa: 10 casos críticos y 10 leves. */
export const casos = [casoPrincipal, ...otrosCriticos, ...casosLeves];

export const casosCriticos = casos.filter((caso) => caso.criticidad === "critico");
export const casosLevesLista = casos.filter((caso) => caso.criticidad === "leve");

/**
 * Recupera un caso por su identificador.
 * @param {string} id
 * @returns {object|undefined}
 */
export function obtenerCaso(id) {
  return casos.find((caso) => caso.id === id);
}

/* -------------------------------------------------------------------- */
/* Series para el gráfico de desviación                                  */
/* -------------------------------------------------------------------- */

/* Población de referencia: siniestros dentro del rango esperado. */
export const poblacionHistorica = [
  { nombre: "Marcela T. Ríos", rut: "15.009.221-4", documento: "Boleta de Honorarios", monto: 42000, prestacion: "Psicología", fecha: "04/05/2024" },
  { nombre: "Jorge A. Herrera", rut: "12.334.556-8", documento: "Boleta de Honorarios", monto: 48500, prestacion: "Psicología", fecha: "05/05/2024" },
  { nombre: "Paula N. Escobar", rut: "18.221.443-9", documento: "Boleta de Honorarios", monto: 51000, prestacion: "Psicología", fecha: "06/05/2024" },
  { nombre: "Cristián B. Muñoz", rut: "14.667.201-2", documento: "Boleta de Honorarios", monto: 39000, prestacion: "Psicología", fecha: "07/05/2024" },
  { nombre: "Verónica S. Pinto", rut: "16.884.330-5", documento: "Boleta de Honorarios", monto: 55500, prestacion: "Psicología", fecha: "08/05/2024" },
  { nombre: "Héctor M. Vidal", rut: "11.998.774-1", documento: "Boleta de Honorarios", monto: 46000, prestacion: "Psicología", fecha: "09/05/2024" },
  { nombre: "Lorena I. Cáceres", rut: "17.334.008-K", documento: "Boleta de Honorarios", monto: 58000, prestacion: "Psicología", fecha: "10/05/2024" },
  { nombre: "Felipe R. Donoso", rut: "13.776.542-6", documento: "Boleta de Honorarios", monto: 44500, prestacion: "Psicología", fecha: "11/05/2024" },
  { nombre: "Sofía A. Navarro", rut: "19.443.881-3", documento: "Boleta de Honorarios", monto: 53000, prestacion: "Psicología", fecha: "12/05/2024" },
  { nombre: "Mauricio L. Tapia", rut: "12.110.937-7", documento: "Boleta de Honorarios", monto: 61000, prestacion: "Psicología", fecha: "13/05/2024" },
  { nombre: "Claudia E. Bustos", rut: "15.552.114-0", documento: "Boleta de Honorarios", monto: 37500, prestacion: "Psicología", fecha: "14/05/2024" },
  { nombre: "Nicolás F. Gallardo", rut: "18.009.663-8", documento: "Boleta de Honorarios", monto: 49000, prestacion: "Psicología", fecha: "15/05/2024" },
  { nombre: "Antonia G. Cortés", rut: "20.334.775-1", documento: "Boleta de Honorarios", monto: 56500, prestacion: "Psicología", fecha: "16/05/2024" },
  { nombre: "Gonzalo P. Riquelme", rut: "13.008.442-9", documento: "Boleta de Honorarios", monto: 41000, prestacion: "Psicología", fecha: "17/05/2024" },
  { nombre: "Javiera M. Sepúlveda", rut: "19.775.330-4", documento: "Boleta de Honorarios", monto: 52500, prestacion: "Psicología", fecha: "18/05/2024" },
  { nombre: "Álvaro D. Contreras", rut: "14.221.908-2", documento: "Boleta de Honorarios", monto: 47000, prestacion: "Psicología", fecha: "19/05/2024" },
  { nombre: "Beatriz H. Miranda", rut: "16.554.077-5", documento: "Boleta de Honorarios", monto: 59500, prestacion: "Psicología", fecha: "20/05/2024" },
  { nombre: "Esteban V. Araya", rut: "11.443.226-K", documento: "Boleta de Honorarios", monto: 43000, prestacion: "Psicología", fecha: "21/05/2024" },
];

/* Los cuatro casos que escapan de la desviación esperada. */
export const casosAtipicos = [
  { idCaso: "77940303", nombre: "Ramiro Lucas Fiochi", rut: "24.543.309-9", documento: "Boleta de Honorarios", monto: 905000, prestacion: "Psicología", fecha: "10/05/2024", esCasoActual: true },
  { idCaso: "77940311", nombre: "Valeria S. Montero", rut: "18.234.901-K", documento: "Boleta de Honorarios", monto: 870000, prestacion: "Kinesiología", fecha: "12/05/2024" },
  { idCaso: "77940318", nombre: "Carlos G. Altamirano", rut: "12.981.442-3", documento: "Boleta de Honorarios", monto: 812000, prestacion: "Psicología", fecha: "09/05/2024" },
  { idCaso: "77940324", nombre: "Elena M. Rojas", rut: "15.772.109-8", documento: "Boleta de Honorarios", monto: 795000, prestacion: "Fonoaudiología", fecha: "14/05/2024" },
];

/* -------------------------------------------------------------------- */
/* Red de coalición                                                      */
/* -------------------------------------------------------------------- */

/* Prestador en el centro y pacientes que lo visitan de forma anómala. */
export const redCoalicion = {
  prestador: {
    id: "prestador",
    nombre: "Fabián Rodríguez Díaz",
    rut: "11.005.560-2",
    tipo: "prestador",
  },
  pacientes: [
    { id: "77940303", nombre: "Ramiro Lucas Fiochi", rut: "24.543.309-9", visitas: 15, dias: 7, monto: 905000, esCasoActual: true },
    { id: "77940311", nombre: "Valeria S. Montero", rut: "18.234.901-K", visitas: 14, dias: 7, monto: 870000 },
    { id: "77940318", nombre: "Carlos G. Altamirano", rut: "12.981.442-3", visitas: 13, dias: 8, monto: 812000 },
    { id: "77940342", nombre: "Sebastián A. Núñez", rut: "17.552.640-2", visitas: 12, dias: 6, monto: 845000 },
    { id: "77940361", nombre: "Daniela P. Aguirre", rut: "20.117.593-1", visitas: 15, dias: 9, monto: 970000 },
  ],
};
