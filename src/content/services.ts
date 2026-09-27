/**
 * Fuente única de verdad de las áreas de práctica. Todo lo demás (páginas, sitemap,
 * buscador, asistente de IA, JSON-LD) se deriva de este archivo.
 */
export type ServiceIcon =
  | "scroll"
  | "users"
  | "briefcase"
  | "gavel"
  | "building"
  | "house"
  | "landmark"
  | "shield"
  | "shopping"
  | "receipt";

export type Faq = { question: string; answer: string };

export type Service = {
  slug: string;
  title: string;
  icon: ServiceIcon;
  short: string;
  summary: string;
  keywords: string[];
  cases: string[];
  faqs: Faq[];
};

export const services: Service[] = [
  {
    slug: "civil-y-contratos",
    title: "Civil y Contratos",
    icon: "scroll",
    short: "Contratos, incumplimientos y conflictos entre particulares.",
    summary:
      "Redactamos, revisamos y negociamos contratos para que te protejan de verdad. Y si algo sale mal, reclamamos el cumplimiento o la reparación que corresponde.",
    keywords: [
      "contrato",
      "incumplimiento",
      "deuda",
      "cobro",
      "pagaré",
      "carta documento",
      "prescripción",
      "vecino",
      "obligación",
    ],
    cases: [
      "Redacción y revisión de contratos",
      "Incumplimientos contractuales",
      "Cobro de deudas y ejecuciones",
      "Cartas documento e intimaciones",
      "Conflictos entre vecinos y consorcios",
      "Mediaciones prejudiciales",
    ],
    faqs: [
      {
        question: "¿Necesito un abogado para firmar un contrato?",
        answer:
          "No es obligatorio, pero una revisión previa evita cláusulas abusivas o ambiguas que después cuestan mucho más resolver.",
      },
      {
        question: "¿Qué hago si recibí una carta documento?",
        answer:
          "No la ignores: suele tener plazos. Traela a una consulta y definimos si conviene responder y en qué términos.",
      },
    ],
  },
  {
    slug: "familia-y-sucesiones",
    title: "Familia y Sucesiones",
    icon: "users",
    short: "Divorcios, alimentos, cuidado de hijos y herencias.",
    summary:
      "Acompañamos procesos familiares con sensibilidad y firmeza. Priorizamos acuerdos que protejan a los chicos y resolvemos sucesiones de forma ordenada.",
    keywords: [
      "divorcio",
      "separación",
      "alimentos",
      "cuota alimentaria",
      "hijos",
      "régimen de comunicación",
      "tenencia",
      "cuidado personal",
      "herencia",
      "sucesión",
      "testamento",
      "fallecimiento",
      "adopción",
      "violencia familiar",
    ],
    cases: [
      "Divorcio de común acuerdo o unilateral",
      "Cuota alimentaria y actualización",
      "Cuidado personal y régimen de comunicación",
      "Sucesiones y declaratoria de herederos",
      "Testamentos y planificación patrimonial",
      "Uniones convivenciales",
    ],
    faqs: [
      {
        question: "¿Cuánto demora un divorcio?",
        answer:
          "Si hay acuerdo sobre bienes e hijos, puede resolverse en pocos meses. Sin acuerdo, depende de los puntos en discusión.",
      },
      {
        question: "¿Es obligatorio iniciar la sucesión?",
        answer:
          "Es necesaria para transferir o vender los bienes del fallecido a nombre de los herederos. Cuanto antes se inicie, más simple suele ser.",
      },
    ],
  },
  {
    slug: "laboral",
    title: "Laboral",
    icon: "briefcase",
    short: "Despidos, indemnizaciones y trabajo no registrado.",
    summary:
      "Defendemos tus derechos laborales frente a despidos, diferencias salariales o accidentes. También asesoramos a empleadores para prevenir conflictos.",
    keywords: [
      "despido",
      "indemnización",
      "trabajo en negro",
      "no registrado",
      "art",
      "accidente laboral",
      "acoso laboral",
      "renuncia",
      "telegrama",
      "liquidación final",
      "empleador",
      "sueldo",
    ],
    cases: [
      "Despidos con o sin causa",
      "Trabajo no registrado o mal registrado",
      "Accidentes y enfermedades laborales (ART)",
      "Diferencias salariales y horas extra",
      "Acoso y violencia laboral",
      "Asesoramiento preventivo a empleadores",
    ],
    faqs: [
      {
        question: "Me despidieron, ¿qué hago primero?",
        answer:
          "No firmes nada sin asesorarte y guardá recibos, mensajes y cualquier prueba de la relación laboral. Los plazos para reclamar corren.",
      },
      {
        question: "¿Cuánto cuesta iniciar un reclamo laboral?",
        answer:
          "En la mayoría de los casos trabajamos con honorarios a resultado: cobrás vos y recién ahí cobramos nosotros.",
      },
    ],
  },
  {
    slug: "penal",
    title: "Penal",
    icon: "gavel",
    short: "Defensa penal, querellas y asistencia inmediata.",
    summary:
      "Defensa técnica desde el primer momento: detenciones, citaciones e imputaciones. También representamos a víctimas como querellantes.",
    keywords: [
      "denuncia",
      "detenido",
      "detención",
      "imputado",
      "citación",
      "indagatoria",
      "querella",
      "estafa",
      "robo",
      "delito",
      "causa penal",
      "excarcelación",
    ],
    cases: [
      "Defensa en causas penales",
      "Asistencia ante detenciones",
      "Querellas por víctimas",
      "Delitos económicos y estafas",
      "Delitos de tránsito",
      "Excarcelaciones y probation",
    ],
    faqs: [
      {
        question: "Me citaron a declarar, ¿tengo que ir con abogado?",
        answer:
          "Sí. Tenés derecho a contar con defensa antes de declarar y a no declarar si así lo decidís con tu abogado.",
      },
      {
        question: "¿Atienden urgencias fuera de horario?",
        answer:
          "Sí, contamos con guardia para detenciones y situaciones urgentes. Usá el teléfono de contacto.",
      },
    ],
  },
  {
    slug: "comercial-y-societario",
    title: "Comercial y Societario",
    icon: "building",
    short: "Sociedades, contratos comerciales y empresas.",
    summary:
      "Acompañamos a emprendedores y pymes desde la constitución de la sociedad hasta su crecimiento: contratos, socios, marcas y conflictos comerciales.",
    keywords: [
      "sociedad",
      "sas",
      "srl",
      "empresa",
      "pyme",
      "socios",
      "emprendimiento",
      "marca",
      "franquicia",
      "concurso",
      "quiebra",
      "acuerdo de socios",
    ],
    cases: [
      "Constitución de SAS, SRL y SA",
      "Acuerdos de socios",
      "Contratos comerciales y de distribución",
      "Registro de marcas",
      "Conflictos societarios",
      "Concursos y quiebras",
    ],
    faqs: [
      {
        question: "¿Qué tipo de sociedad me conviene?",
        answer:
          "Depende de la cantidad de socios, el capital y los planes de crecimiento. Lo analizamos en una consulta inicial.",
      },
      {
        question: "¿Por qué hacer un acuerdo de socios?",
        answer:
          "Porque define qué pasa ante desacuerdos, salidas o incorporaciones antes de que el conflicto exista.",
      },
    ],
  },
  {
    slug: "inmobiliario",
    title: "Inmobiliario",
    icon: "house",
    short: "Compraventas, alquileres, desalojos y escrituras.",
    summary:
      "Revisamos cada operación inmobiliaria para que compres, vendas o alquiles con seguridad. Y resolvemos conflictos entre propietarios e inquilinos.",
    keywords: [
      "alquiler",
      "inquilino",
      "propietario",
      "desalojo",
      "compraventa",
      "escritura",
      "boleto",
      "departamento",
      "casa",
      "terreno",
      "usucapión",
      "consorcio",
    ],
    cases: [
      "Boletos de compraventa y escrituración",
      "Contratos de locación",
      "Desalojos",
      "Usucapión",
      "Conflictos de consorcio y propiedad horizontal",
      "Due diligence de inmuebles",
    ],
    faqs: [
      {
        question: "¿Conviene que un abogado revise el boleto?",
        answer:
          "Sí. El boleto fija las condiciones de la operación; revisarlo antes de firmar evita sorpresas en la escrituración.",
      },
      {
        question: "¿Cuánto demora un desalojo?",
        answer:
          "Depende de la causal y de la jurisdicción. Te damos una estimación concreta al analizar el contrato y la situación.",
      },
    ],
  },
  {
    slug: "previsional",
    title: "Previsional",
    icon: "landmark",
    short: "Jubilaciones, pensiones y reajustes ante ANSES.",
    summary:
      "Tramitamos jubilaciones y pensiones y reclamamos reajustes de haberes. Te decimos con claridad qué te corresponde y cómo obtenerlo.",
    keywords: [
      "jubilación",
      "jubilarme",
      "pensión",
      "anses",
      "reajuste",
      "haberes",
      "aportes",
      "moratoria",
      "retiro",
      "invalidez",
      "viudez",
    ],
    cases: [
      "Trámites de jubilación",
      "Pensiones por fallecimiento",
      "Reajuste de haberes",
      "Reconocimiento de servicios y aportes",
      "Retiro por invalidez",
      "Reclamos administrativos y judiciales",
    ],
    faqs: [
      {
        question: "¿Puedo jubilarme si me faltan aportes?",
        answer:
          "Existen alternativas según tu situación. Analizamos tu historia laboral para encontrar la mejor opción disponible.",
      },
      {
        question: "¿Qué es un reajuste de haberes?",
        answer:
          "Es el reclamo para que tu jubilación se calcule o actualice correctamente cuando ANSES aplicó criterios que te perjudican.",
      },
    ],
  },
  {
    slug: "danos-y-perjuicios",
    title: "Daños y Perjuicios",
    icon: "shield",
    short: "Accidentes de tránsito, mala praxis y reparaciones.",
    summary:
      "Si sufriste un daño por culpa de otro, reclamamos una indemnización justa ante aseguradoras y responsables, con o sin juicio.",
    keywords: [
      "accidente",
      "choque",
      "tránsito",
      "lesiones",
      "seguro",
      "aseguradora",
      "mala praxis",
      "indemnización",
      "daño",
      "caída",
      "moto",
      "auto",
    ],
    cases: [
      "Accidentes de tránsito",
      "Reclamos a aseguradoras",
      "Mala praxis médica",
      "Lesiones y caídas en la vía pública",
      "Daño moral",
      "Daños a la propiedad",
    ],
    faqs: [
      {
        question: "Tuve un choque, ¿qué tengo que guardar?",
        answer:
          "Datos del otro conductor y su seguro, fotos, testigos, la denuncia policial si la hubo y todos los certificados médicos.",
      },
      {
        question: "¿Tengo que pagar para iniciar el reclamo?",
        answer:
          "Generalmente trabajamos con honorarios a resultado, sin costos iniciales para el cliente.",
      },
    ],
  },
  {
    slug: "defensa-del-consumidor",
    title: "Defensa del Consumidor",
    icon: "shopping",
    short: "Reclamos a empresas, bancos y servicios.",
    summary:
      "Hacemos valer la Ley de Defensa del Consumidor frente a empresas, bancos, prepagas, aerolíneas y proveedores de servicios que no cumplen.",
    keywords: [
      "consumidor",
      "empresa",
      "banco",
      "tarjeta",
      "prepaga",
      "obra social",
      "aerolínea",
      "vuelo",
      "garantía",
      "compra online",
      "reclamo",
      "servicio",
      "cobro indebido",
    ],
    cases: [
      "Reclamos a bancos y tarjetas",
      "Prepagas y obras sociales",
      "Vuelos cancelados o demorados",
      "Productos defectuosos y garantías",
      "Compras online",
      "Cobros indebidos de servicios",
    ],
    faqs: [
      {
        question: "¿Vale la pena reclamar por montos chicos?",
        answer:
          "Muchas veces sí: la ley prevé mecanismos ágiles y, en algunos casos, sanciones adicionales para la empresa.",
      },
      {
        question: "¿Primero tengo que reclamar a la empresa?",
        answer:
          "Es recomendable dejar constancia del reclamo. Guardá números de gestión, mails y capturas.",
      },
    ],
  },
  {
    slug: "tributario",
    title: "Tributario",
    icon: "receipt",
    short: "Impuestos, ARCA y planificación fiscal.",
    summary:
      "Asesoramos a personas y empresas en su situación fiscal, planes de pago, inspecciones y defensa ante intimaciones del fisco.",
    keywords: [
      "impuestos",
      "arca",
      "afip",
      "agip",
      "arba",
      "monotributo",
      "ganancias",
      "intimación fiscal",
      "inspección",
      "plan de pago",
      "embargo fiscal",
      "planificación fiscal",
    ],
    cases: [
      "Defensa ante inspecciones y determinaciones",
      "Intimaciones y ejecuciones fiscales",
      "Planificación fiscal",
      "Planes de pago y regularización",
      "Impuestos provinciales y municipales",
      "Asesoramiento a monotributistas",
    ],
    faqs: [
      {
        question: "Recibí una intimación de ARCA, ¿qué hago?",
        answer:
          "Revisá el plazo de respuesta y consultanos cuanto antes: una respuesta correcta a tiempo evita multas y embargos.",
      },
      {
        question: "¿Trabajan junto a mi contador?",
        answer: "Sí, coordinamos con tu contador para cubrir tanto lo contable como lo legal.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function serviceNumber(slug: string): string {
  const index = services.findIndex((s) => s.slug === slug);
  return String(index + 1).padStart(2, "0");
}

export const processSteps = [
  {
    title: "Consulta inicial",
    text: "Escuchamos tu situación y revisamos la documentación. Presencial o por videollamada.",
  },
  {
    title: "Diagnóstico y estrategia",
    text: "Te explicamos opciones, riesgos, plazos y honorarios por escrito, sin letra chica.",
  },
  {
    title: "Acción",
    text: "Negociamos, mediamos o litigamos según lo que más te convenga.",
  },
  {
    title: "Seguimiento",
    text: "Te mantenemos informado en cada avance hasta cerrar el caso.",
  },
] as const;
