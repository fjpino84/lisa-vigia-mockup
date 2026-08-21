/* =========================================================================
   LISA vigIA — Datos de apoyo para las secciones de análisis.
   Toda la información es ficticia y se deriva de la cartera de casos, de
   modo que las cifras de las distintas vistas concuerden entre sí.
   ========================================================================= */

import { casos, casosCriticos } from "./casos.js";

/* -------------------------------------------------------------------- */
/* Prestadores                                                           */
/* -------------------------------------------------------------------- */

/* Ficha de cada prestador que aparece en la cartera. El nivel de alerta
   resume cuánta concentración de casos críticos acumula. */
export const prestadores = [
  {
    id: "11.005.560-2",
    nombre: "Fabián Rodríguez Díaz",
    tipo: "Profesional independiente",
    especialidad: "Psicología y psicopedagogía",
    comuna: "Vitacura",
    antiguedad: "Desde 2019",
    alerta: "critica",
    nota:
      "Concentra la mayoría de los siniestros críticos de la cartera. Sus boletas presentan saltos de numeración y montos alterados de forma sistemática.",
  },
  {
    id: "77.003.412-9",
    nombre: "Centro Salud Integral Ltda.",
    tipo: "Centro médico",
    especialidad: "Multiespecialidad ambulatoria",
    comuna: "Providencia",
    antiguedad: "Desde 2015",
    alerta: "media",
    nota:
      "Volumen alto de prestaciones con montos dentro de rango. Dos casos críticos bajo revisión por documentación incompleta.",
  },
  {
    id: "76.221.905-1",
    nombre: "Clínica Los Andes SpA",
    tipo: "Clínica",
    especialidad: "Traumatología",
    comuna: "Las Condes",
    antiguedad: "Desde 2011",
    alerta: "media",
    nota:
      "Montos elevados propios de la especialidad. Se vigila la reiteración de sesiones en plazos breves.",
  },
  {
    id: "76.554.221-8",
    nombre: "Clínica Dental Norte",
    tipo: "Clínica",
    especialidad: "Odontología",
    comuna: "Recoleta",
    antiguedad: "Desde 2017",
    alerta: "baja",
    nota: "Sin hallazgos relevantes. Documentación consistente con el registro del SII.",
  },
  {
    id: "76.882.100-4",
    nombre: "Centro Óptico Sur",
    tipo: "Centro médico",
    especialidad: "Oftalmología",
    comuna: "San Miguel",
    antiguedad: "Desde 2020",
    alerta: "baja",
    nota: "Sin hallazgos relevantes. Montos por debajo del promedio del rubro.",
  },
];

/**
 * Resume la cartera agrupada por prestador.
 * @returns {object[]} Prestadores con sus casos, montos y criticidad.
 */
export function resumirPrestadores() {
  return prestadores
    .map((prestador) => {
      const propios = casos.filter((caso) => caso.rutPrestador === prestador.id);
      const criticos = propios.filter((caso) => caso.criticidad === "critico");
      const monto = propios.reduce((suma, caso) => suma + caso.monto, 0);
      const montoCritico = criticos.reduce((suma, caso) => suma + caso.monto, 0);

      /* El puntaje del prestador es el mayor de sus casos. */
      const puntajeMaximo = propios.reduce(
        (mayor, caso) => Math.max(mayor, caso.puntaje),
        0
      );

      return {
        ...prestador,
        casos: propios,
        totalCasos: propios.length,
        totalCriticos: criticos.length,
        monto,
        montoCritico,
        puntajeMaximo,
      };
    })
    .sort((uno, otro) => otro.montoCritico - uno.montoCritico);
}

/* -------------------------------------------------------------------- */
/* Herramientas forenses: cola de peritaje                               */
/* -------------------------------------------------------------------- */

/* Documentos en distintas fases del análisis documental. */
export const colaDocumental = [
  {
    id: "DOC-4761",
    documento: "Boleta de Honorarios N° 4761",
    beneficiario: "Ramiro Lucas Fiochi",
    idCaso: "77940303",
    estado: "concluido",
    veredicto: "adulterado",
    confianza: 98,
    hallazgos: ["Numeración", "Tipografía", "Fecha", "Timbre SII"],
    software: "Canva (Web Application)",
  },
  {
    id: "DOC-3120",
    documento: "Boleta de Honorarios N° 3120",
    beneficiario: "Valeria S. Montero",
    idCaso: "77940311",
    estado: "concluido",
    veredicto: "adulterado",
    confianza: 94,
    hallazgos: ["Numeración", "Timbre SII"],
    software: "Adobe Photoshop",
  },
  {
    id: "DOC-4772",
    documento: "Boleta de Honorarios N° 4772",
    beneficiario: "Carlos G. Altamirano",
    idCaso: "77940318",
    estado: "concluido",
    veredicto: "adulterado",
    confianza: 89,
    hallazgos: ["Tipografía", "Monto"],
    software: "Canva (Web Application)",
  },
  {
    id: "DOC-5510",
    documento: "Boleta de Honorarios N° 5510",
    beneficiario: "Ignacio R. Bravo",
    idCaso: "77940330",
    estado: "analizando",
    veredicto: null,
    confianza: null,
    hallazgos: ["Numeración"],
    software: null,
  },
  {
    id: "DOC-1904",
    documento: "Boleta de Honorarios N° 1904",
    beneficiario: "Patricia L. Cárdenas",
    idCaso: "77940337",
    estado: "analizando",
    veredicto: null,
    confianza: null,
    hallazgos: ["Metadatos"],
    software: null,
  },
  {
    id: "DOC-8802",
    documento: "Boleta de Honorarios N° 8802",
    beneficiario: "Juan P. Silva",
    idCaso: "77940402",
    estado: "concluido",
    veredicto: "legitimo",
    confianza: 96,
    hallazgos: [],
    software: null,
  },
  {
    id: "DOC-1177",
    documento: "Boleta de Honorarios N° 1177",
    beneficiario: "Ana C. Morales",
    idCaso: "77940408",
    estado: "concluido",
    veredicto: "legitimo",
    confianza: 99,
    hallazgos: [],
    software: null,
  },
  {
    id: "DOC-2755",
    documento: "Boleta de Honorarios N° 2755",
    beneficiario: "Camila F. Vergara",
    idCaso: "77940349",
    estado: "en_cola",
    veredicto: null,
    confianza: null,
    hallazgos: [],
    software: null,
  },
  {
    id: "DOC-6018",
    documento: "Boleta de Honorarios N° 6018",
    beneficiario: "Rodrigo E. Salinas",
    idCaso: "77940355",
    estado: "en_cola",
    veredicto: null,
    confianza: null,
    hallazgos: [],
    software: null,
  },
];

/* Verificadores que componen el laboratorio documental. */
export const verificadores = [
  {
    id: "visual",
    nombre: "Detección visual",
    icono: "forense",
    descripcion:
      "Compara el documento con la plantilla legítima del emisor y señala diferencias de tipografía, alineación y numeración.",
    procesados: 1284,
    deteccion: 92,
    estado: "activo",
  },
  {
    id: "metadatos",
    nombre: "Lector de metadatos",
    icono: "huella",
    descripcion:
      "Extrae fechas de creación y modificación, y el programa con que se editó el archivo por última vez.",
    procesados: 1284,
    deteccion: 87,
    estado: "activo",
  },
  {
    id: "timbre",
    nombre: "Verificador de timbre SII",
    icono: "escudo",
    descripcion:
      "Decodifica el código bidimensional y contrasta el monto y el folio con el registro del Servicio de Impuestos Internos.",
    procesados: 1102,
    deteccion: 99,
    estado: "activo",
  },
  {
    id: "watchlist",
    nombre: "Cruce con watchlist",
    icono: "lista",
    descripcion:
      "Contrasta los RUT de beneficiario y prestador con la base de antecedentes de fraude del sector.",
    procesados: 1284,
    deteccion: 78,
    estado: "activo",
  },
];

/* -------------------------------------------------------------------- */
/* Inteligencia archivada: casos resueltos                               */
/* -------------------------------------------------------------------- */

/* Historial de resoluciones de los últimos seis meses. Cada mes registra
   además cómo se comportó el modelo, para poder trazar su aprendizaje. */
export const historialResoluciones = [
  {
    mes: "Diciembre 2023",
    abreviatura: "Dic",
    fraude: 6,
    liberados: 22,
    montoBloqueado: 3120000,
    precision: 62,
    falsosPositivos: 31,
    diasResolucion: 14.2,
    escapados: 9,
  },
  {
    mes: "Enero 2024",
    abreviatura: "Ene",
    fraude: 9,
    liberados: 27,
    montoBloqueado: 4890000,
    precision: 68,
    falsosPositivos: 26,
    diasResolucion: 12.6,
    escapados: 7,
  },
  {
    mes: "Febrero 2024",
    abreviatura: "Feb",
    fraude: 7,
    liberados: 31,
    montoBloqueado: 3640000,
    precision: 74,
    falsosPositivos: 21,
    diasResolucion: 10.1,
    escapados: 6,
  },
  {
    mes: "Marzo 2024",
    abreviatura: "Mar",
    fraude: 12,
    liberados: 29,
    montoBloqueado: 6710000,
    precision: 81,
    falsosPositivos: 16,
    diasResolucion: 7.8,
    escapados: 4,
  },
  {
    mes: "Abril 2024",
    abreviatura: "Abr",
    fraude: 15,
    liberados: 34,
    montoBloqueado: 8250000,
    precision: 88,
    falsosPositivos: 11,
    diasResolucion: 5.4,
    escapados: 2,
  },
  {
    mes: "Mayo 2024",
    abreviatura: "May",
    fraude: 18,
    liberados: 30,
    montoBloqueado: 9930000,
    precision: 94,
    falsosPositivos: 6,
    diasResolucion: 3.1,
    escapados: 1,
  },
];

/* -------------------------------------------------------------------- */
/* Evolución del modelo                                                  */
/* -------------------------------------------------------------------- */

/* Hitos del entrenamiento: qué aprendió el modelo y cuándo. Cada hito se
   asocia al mes en que entró en producción. */
export const hitosModelo = [
  {
    mes: "Diciembre 2023",
    abreviatura: "Dic",
    titulo: "Puesta en marcha",
    descripcion:
      "El modelo parte solo con reglas de monto y validación de folio. Detecta los casos más burdos y descarta poco.",
    precision: 62,
  },
  {
    mes: "Febrero 2024",
    abreviatura: "Feb",
    titulo: "Lectura de metadatos",
    descripcion:
      "Se incorpora el análisis del rastro digital del archivo. Aparecen las primeras ediciones hechas con herramientas de diseño.",
    precision: 74,
  },
  {
    mes: "Marzo 2024",
    abreviatura: "Mar",
    titulo: "Detección visual",
    descripcion:
      "El comparador de plantillas empieza a señalar diferencias de tipografía y numeración que ningún revisor humano alcanzaba a ver.",
    precision: 81,
  },
  {
    mes: "Abril 2024",
    abreviatura: "Abr",
    titulo: "Análisis de coalición",
    descripcion:
      "El modelo deja de mirar siniestros aislados y empieza a cruzar vínculos entre beneficiarios y prestadores.",
    precision: 88,
  },
  {
    mes: "Mayo 2024",
    abreviatura: "May",
    titulo: "Realimentación del archivo",
    descripcion:
      "Cada caso resuelto reentrena el scoring. El modelo reconoce hoy patrones que hace seis meses dejaba pasar.",
    precision: 94,
  },
];

/* Casos que el modelo dejó pasar en su día y que hoy sí detectaría.
   Sostienen la afirmación de que el sistema aprende de lo resuelto. */
export const casosRecuperados = [
  {
    beneficiario: "Gustavo M. Iturra",
    rut: "13.442.907-5",
    monto: 780000,
    puntajeOriginal: 41,
    puntajeActual: 96,
    detectadoPor: "Lectura de metadatos",
    cierre: "28/04/2024",
  },
  {
    beneficiario: "Carla S. Bravo",
    rut: "17.220.114-8",
    monto: 690000,
    puntajeOriginal: 38,
    puntajeActual: 91,
    detectadoPor: "Análisis de coalición",
    cierre: "22/04/2024",
  },
  {
    beneficiario: "Alejandra P. Vidal",
    rut: "14.330.226-K",
    monto: 910000,
    puntajeOriginal: 45,
    puntajeActual: 94,
    detectadoPor: "Detección visual",
    cierre: "03/04/2024",
  },
];

/* -------------------------------------------------------------------- */
/* Reincidencia                                                          */
/* -------------------------------------------------------------------- */

/* Identidades con casos confirmados en el archivo que vuelven a aparecer
   en la cartera activa. Es el cruce que justifica conservar el histórico. */
export const reincidentes = [
  {
    nombre: "Fabián Rodríguez Díaz",
    rut: "11.005.560-2",
    rol: "Prestador",
    confirmados: 3,
    activos: 6,
    montoHistorico: 2380000,
    montoActivo: 5197000,
    idCaso: "77940303",
    nota:
      "Tres siniestros confirmados como fraude entre marzo y abril. Vuelve a aparecer en seis casos críticos de la cartera actual.",
  },
  {
    nombre: "Centro Salud Integral Ltda.",
    rut: "77.003.412-9",
    rol: "Prestador",
    confirmados: 1,
    activos: 2,
    montoHistorico: 615000,
    montoActivo: 1681000,
    idCaso: "77940337",
    nota:
      "Un caso de coalición confirmado en marzo. Mantiene dos siniestros críticos bajo revisión.",
  },
  {
    nombre: "Clínica Los Andes SpA",
    rut: "76.221.905-1",
    rol: "Prestador",
    confirmados: 1,
    activos: 2,
    montoHistorico: 845000,
    montoActivo: 1672000,
    idCaso: "77940330",
    nota:
      "Un siniestro con monto fuera de rango confirmado en abril. Dos casos activos con el mismo perfil.",
  },
];

/* -------------------------------------------------------------------- */
/* Señales anticipadas                                                   */
/* -------------------------------------------------------------------- */

/* Comportamientos que el archivo permite anticipar antes de que un caso
   escale a crítico. */
export const senalesTempranas = [
  {
    titulo: "Repunte de ediciones con Canva",
    detalle:
      "Los documentos alterados con herramientas de diseño en línea crecieron 18 % en el semestre. Es hoy el patrón dominante.",
    nivel: "alto",
    variacion: 18,
  },
  {
    titulo: "Coaliciones más pequeñas",
    detalle:
      "Los grupos detectados pasaron de ocho a cuatro integrantes promedio: se fragmentan para pasar bajo el umbral de alerta.",
    nivel: "alto",
    variacion: 9,
  },
  {
    titulo: "Montos más cercanos al promedio",
    detalle:
      "Las desviaciones extremas caen 4 %. Los montos se acercan al rango esperado para evitar la alarma estadística.",
    nivel: "medio",
    variacion: -4,
  },
];

/* Casos cerrados que sirven de referencia para el modelo de scoring. */
export const casosArchivados = [
  {
    id: "77939841",
    beneficiario: "Gustavo M. Iturra",
    rut: "13.442.907-5",
    monto: 780000,
    prestacion: "Psicología",
    prestador: "Fabián Rodríguez Díaz",
    resolucion: "fraude",
    puntaje: 96,
    cierre: "28/04/2024",
    patron: "Documento adulterado",
  },
  {
    id: "77939866",
    beneficiario: "Carla S. Bravo",
    rut: "17.220.114-8",
    monto: 690000,
    prestacion: "Kinesiología",
    prestador: "Fabián Rodríguez Díaz",
    resolucion: "fraude",
    puntaje: 91,
    cierre: "22/04/2024",
    patron: "Coalición con prestador",
  },
  {
    id: "77939903",
    beneficiario: "Rodrigo A. Peña",
    rut: "12.887.330-1",
    monto: 845000,
    prestacion: "Traumatología",
    prestador: "Clínica Los Andes SpA",
    resolucion: "fraude",
    puntaje: 88,
    cierre: "15/04/2024",
    patron: "Monto fuera de rango",
  },
  {
    id: "77939927",
    beneficiario: "Mónica L. Farías",
    rut: "16.009.554-3",
    monto: 320000,
    prestacion: "Nutrición",
    prestador: "Centro Salud Integral Ltda.",
    resolucion: "liberado",
    puntaje: 34,
    cierre: "11/04/2024",
    patron: "Sin hallazgos",
  },
  {
    id: "77939945",
    beneficiario: "Diego R. Salas",
    rut: "18.554.008-7",
    monto: 275000,
    prestacion: "Dental",
    prestador: "Clínica Dental Norte",
    resolucion: "liberado",
    puntaje: 18,
    cierre: "08/04/2024",
    patron: "Sin hallazgos",
  },
  {
    id: "77939970",
    beneficiario: "Alejandra P. Vidal",
    rut: "14.330.226-K",
    monto: 910000,
    prestacion: "Psiquiatría",
    prestador: "Fabián Rodríguez Díaz",
    resolucion: "fraude",
    puntaje: 94,
    cierre: "03/04/2024",
    patron: "Documento adulterado",
  },
  {
    id: "77939998",
    beneficiario: "Manuel E. Cortés",
    rut: "11.776.443-2",
    monto: 198000,
    prestacion: "Oftalmología",
    prestador: "Centro Óptico Sur",
    resolucion: "liberado",
    puntaje: 12,
    cierre: "29/03/2024",
    patron: "Sin hallazgos",
  },
  {
    id: "77940012",
    beneficiario: "Paulina G. Rojas",
    rut: "19.887.221-4",
    monto: 615000,
    prestacion: "Fonoaudiología",
    prestador: "Centro Salud Integral Ltda.",
    resolucion: "fraude",
    puntaje: 82,
    cierre: "25/03/2024",
    patron: "Coalición con prestador",
  },
];

/* Patrones de fraude confirmados que alimentan el modelo de scoring. */
export const patronesAprendidos = [
  {
    nombre: "Documento adulterado",
    descripcion:
      "Boletas editadas con herramientas de diseño para elevar el monto declarado respecto del timbre electrónico.",
    detecciones: 34,
    tendencia: 18,
    peso: 42,
  },
  {
    nombre: "Coalición con prestador",
    descripcion:
      "Grupos de beneficiarios que concentran visitas reiteradas sobre un mismo prestador en plazos muy breves.",
    detecciones: 21,
    tendencia: 9,
    peso: 28,
  },
  {
    nombre: "Monto fuera de rango",
    descripcion:
      "Prestaciones cuyo monto se aparta varias desviaciones del promedio histórico de su especialidad.",
    detecciones: 17,
    tendencia: -4,
    peso: 19,
  },
  {
    nombre: "Identidad en watchlist",
    descripcion:
      "RUT con antecedentes previos de fraude en la base compartida del sector asegurador.",
    detecciones: 8,
    tendencia: 2,
    peso: 11,
  },
];

/**
 * Calcula el resumen del histórico de resoluciones.
 * @returns {object}
 */
export function resumirArchivo() {
  const fraude = historialResoluciones.reduce((suma, mes) => suma + mes.fraude, 0);
  const liberados = historialResoluciones.reduce(
    (suma, mes) => suma + mes.liberados,
    0
  );
  const montoBloqueado = historialResoluciones.reduce(
    (suma, mes) => suma + mes.montoBloqueado,
    0
  );

  return {
    fraude,
    liberados,
    total: fraude + liberados,
    montoBloqueado,
    tasaFraude: (fraude / (fraude + liberados)) * 100,
  };
}

/**
 * Resume el estado de la cola documental.
 * @returns {object}
 */
export function resumirCola() {
  const contar = (estado) =>
    colaDocumental.filter((documento) => documento.estado === estado).length;

  return {
    concluidos: contar("concluido"),
    analizando: contar("analizando"),
    enCola: contar("en_cola"),
    adulterados: colaDocumental.filter((d) => d.veredicto === "adulterado").length,
    total: colaDocumental.length,
  };
}

/**
 * Construye la red completa de la cartera: prestadores y beneficiarios.
 * @returns {object} Nodos y vínculos listos para dibujar.
 */
export function construirRedCartera() {
  const resumen = resumirPrestadores().filter((prestador) => prestador.totalCasos > 0);

  const nodosPrestador = resumen.map((prestador) => ({
    id: prestador.id,
    etiqueta: prestador.nombre,
    tipo: "prestador",
    alerta: prestador.alerta,
    casos: prestador.totalCasos,
    criticos: prestador.totalCriticos,
    monto: prestador.monto,
  }));

  const vinculos = [];
  const nodosBeneficiario = [];

  resumen.forEach((prestador) => {
    prestador.casos.forEach((caso) => {
      nodosBeneficiario.push({
        id: caso.id,
        etiqueta: caso.beneficiario,
        rut: caso.rut,
        tipo: "beneficiario",
        criticidad: caso.criticidad,
        puntaje: caso.puntaje,
        monto: caso.monto,
        prestador: prestador.id,
      });

      vinculos.push({
        origen: prestador.id,
        destino: caso.id,
        criticidad: caso.criticidad,
      });
    });
  });

  return { nodosPrestador, nodosBeneficiario, vinculos, totalCriticos: casosCriticos.length };
}
