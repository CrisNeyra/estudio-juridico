/**
 * Fuente única de verdad de las áreas de práctica. Todo lo demás (páginas, sitemap,
 * buscador, asistente de IA, JSON-LD) se deriva de este archivo.
 */
export type ServiceIcon = "scroll" | "users" | "briefcase" | "gavel" | "shield";

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
    slug: "laboral",
    title: "Derecho Laboral",
    icon: "briefcase",
    short: "Asesoramiento y representación de trabajadores en conflictos laborales.",
    summary:
      "Asesoramiento y representación de trabajadores en conflictos laborales, con atención personalizada en cada etapa del reclamo.",
    keywords: [
      "despido",
      "indemnización",
      "trabajo no registrado",
      "trabajo en negro",
      "accidente laboral",
      "art",
      "seclo",
      "sueldo",
      "salario",
      "acoso laboral",
      "violencia laboral",
      "acuerdo laboral",
    ],
    cases: [
      "Despidos e indemnizaciones",
      "Trabajo no registrado",
      "Accidentes laborales y ART",
      "Acuerdos laborales y SECLO",
      "Reclamos salariales",
      "Acoso y violencia laboral",
    ],
    faqs: [
      {
        question: "Me despidieron, ¿qué conviene hacer primero?",
        answer:
          "No firmes nada sin asesorarte y guardá recibos, mensajes y cualquier prueba de la relación laboral. En la consulta revisamos tu situación y los pasos posibles.",
      },
      {
        question: "¿Atienden accidentes de trabajo y reclamos ante la ART?",
        answer:
          "Sí. Acompañamos accidentes laborales y gestiones vinculadas a la ART, además de despidos, trabajo no registrado y reclamos salariales.",
      },
    ],
  },
  {
    slug: "familia",
    title: "Derecho de Familia",
    icon: "users",
    short: "Acompañamiento jurídico en situaciones familiares, con atención personalizada.",
    summary:
      "Acompañamiento jurídico en situaciones familiares que requieren atención profesional y personalizada.",
    keywords: [
      "divorcio",
      "alimentos",
      "cuota alimentaria",
      "cuidado personal",
      "régimen de comunicación",
      "tenencia",
      "hijos",
      "compensación económica",
      "apellido",
      "cese de alimentos",
    ],
    cases: [
      "Cuota alimentaria",
      "Divorcios",
      "Régimen de comunicación y cuidado personal",
      "Compensación económica",
      "Modificación y cese de alimentos",
      "Cambio de apellido",
    ],
    faqs: [
      {
        question: "¿Puedo consultar por alimentos o por el cuidado de mis hijos?",
        answer:
          "Sí. El estudio acompaña cuota alimentaria, modificación o cese de alimentos, régimen de comunicación y cuidado personal.",
      },
      {
        question: "¿El divorcio se atiende de forma personalizada?",
        answer:
          "Sí. Cada situación familiar se escucha con tiempo, para definir el camino más adecuado antes de avanzar.",
      },
    ],
  },
  {
    slug: "penal",
    title: "Derecho Penal",
    icon: "gavel",
    short: "Acompañamiento en procesos penales, con atención a los derechos de las víctimas.",
    summary:
      "Asesoramiento y acompañamiento jurídico en procesos penales, con especial atención a los derechos de las víctimas.",
    keywords: [
      "víctima",
      "querella",
      "denuncia",
      "causa penal",
      "ejecución penal",
      "defensa",
      "delito",
      "imputado",
      "derechos y garantías",
    ],
    cases: [
      "Asistencia y representación de víctimas",
      "Querellas y denuncias penales",
      "Seguimiento de causas judiciales",
      "Ejecución penal",
      "Asesoramiento sobre derechos y garantías",
      "Defensa",
    ],
    faqs: [
      {
        question: "¿Acompañan a víctimas de un delito?",
        answer:
          "Sí. El estudio brinda asistencia y representación de víctimas, querellas, denuncias y seguimiento de la causa.",
      },
      {
        question: "¿También hay defensa penal?",
        answer:
          "Sí. Además del acompañamiento a víctimas, el estudio asesora y defiende en procesos penales, con información sobre derechos y garantías.",
      },
    ],
  },
  {
    slug: "civil-y-danos",
    title: "Derecho Civil y Daños",
    icon: "shield",
    short: "Accidentes de tránsito, aseguradoras, mediaciones y daños.",
    summary:
      "Reclamos por accidentes de tránsito y otros daños, gestiones ante compañías aseguradoras, mediaciones y acuerdos.",
    keywords: [
      "accidente",
      "tránsito",
      "choque",
      "aseguradora",
      "seguro",
      "mediación",
      "daños y perjuicios",
      "daños",
      "acuerdo extrajudicial",
    ],
    cases: [
      "Accidentes de tránsito",
      "Reclamos ante compañías aseguradoras",
      "Mediaciones",
      "Daños y perjuicios",
      "Acuerdos extrajudiciales",
    ],
    faqs: [
      {
        question: "Tuve un accidente de tránsito, ¿qué puedo hacer?",
        answer:
          "Guardá fotos, datos del otro vehículo, el parte y cualquier comunicación de la aseguradora. En la consulta vemos el reclamo y si conviene una mediación o un acuerdo.",
      },
      {
        question: "¿Trabajan con compañías de seguros?",
        answer:
          "Sí. Acompañamos reclamos ante compañías aseguradoras, mediaciones y acuerdos extrajudiciales.",
      },
    ],
  },
  {
    slug: "sucesiones",
    title: "Sucesiones y Derechos Patrimoniales",
    icon: "scroll",
    short: "Sucesiones, declaratorias de herederos y derechos posesorios.",
    summary:
      "Acompañamiento en sucesiones, declaratorias de herederos, cesiones de derechos y asesoramiento sobre derechos posesorios.",
    keywords: [
      "sucesión",
      "herencia",
      "herederos",
      "declaratoria",
      "cesión de derechos",
      "posesión",
      "posesorio",
      "fallecimiento",
      "bienes",
    ],
    cases: [
      "Sucesiones",
      "Declaratorias de herederos",
      "Cesiones de derechos",
      "Asesoramiento sobre derechos posesorios",
    ],
    faqs: [
      {
        question: "¿Cuándo conviene iniciar una sucesión?",
        answer:
          "Cuando hace falta determinar quiénes son los herederos o disponer de los bienes de una persona fallecida. En la consulta revisamos la documentación y el estado de los bienes.",
      },
      {
        question: "¿Asesoran sobre derechos posesorios?",
        answer:
          "Sí. Además de sucesiones y declaratorias de herederos, el estudio asesora sobre cesiones de derechos y derechos posesorios.",
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
    text: "Te explicamos opciones, riesgos y próximos pasos, con lenguaje claro.",
  },
  {
    title: "Acción",
    text: "Negociamos, mediamos o representamos según lo que más te convenga.",
  },
  {
    title: "Seguimiento",
    text: "Te mantenemos al tanto de cada avance hasta cerrar el caso.",
  },
] as const;
