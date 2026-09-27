/**
 * Datos institucionales del estudio. PLACEHOLDERS: reemplazar por los datos reales
 * antes de publicar (ver README > "Personalizar contenido").
 */
export const site = {
  name: "Arce & Valdés",
  legalName: "Arce & Valdés Abogados",
  tagline: "Estudio jurídico",
  description:
    "Estudio jurídico en Buenos Aires. Asesoramiento y representación en derecho civil, familia, laboral, penal, comercial, inmobiliario, previsional, daños, consumidor y tributario.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es_AR",
  foundedYear: 2009,
  contact: {
    email: "consultas@arcevaldes.com.ar",
    phone: "+54 11 5555-0000",
    phoneHref: "tel:+541155550000",
    whatsapp: "5491155550000",
    address: {
      street: "Av. Corrientes 1234, Piso 8",
      city: "Ciudad Autónoma de Buenos Aires",
      region: "CABA",
      postalCode: "C1043",
      country: "AR",
    },
    hours: "Lunes a viernes, 9 a 18 h",
  },
  social: {
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
  },
} as const;

export const navigation = [
  { href: "/servicios", label: "Servicios" },
  { href: "/estudio", label: "Estudio" },
  { href: "/equipo", label: "Equipo" },
  { href: "/blog", label: "Novedades" },
  { href: "/contacto", label: "Contacto" },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  areas: string[];
  bio: string;
  registration: string;
};

export const team: TeamMember[] = [
  {
    name: "Dra. Lucía Arce",
    role: "Socia fundadora",
    areas: ["Familia y Sucesiones", "Civil y Contratos"],
    bio: "Más de 15 años acompañando a familias en procesos sensibles, con foco en la mediación y los acuerdos sostenibles.",
    registration: "CPACF T° 00 F° 000",
  },
  {
    name: "Dr. Martín Valdés",
    role: "Socio fundador",
    areas: ["Comercial y Societario", "Tributario"],
    bio: "Asesora a pymes y emprendedores en estructuración societaria, contratos comerciales y planificación fiscal.",
    registration: "CPACF T° 00 F° 000",
  },
  {
    name: "Dra. Paula Ríos",
    role: "Asociada senior",
    areas: ["Laboral", "Previsional"],
    bio: "Especialista en conflictos laborales individuales y en trámites y reclamos ante ANSES.",
    registration: "CPACF T° 00 F° 000",
  },
  {
    name: "Dr. Tomás Ferreyra",
    role: "Asociado",
    areas: ["Penal", "Daños y Perjuicios"],
    bio: "Defensa penal y querellas, con experiencia en accidentes de tránsito y responsabilidad civil.",
    registration: "CPACF T° 00 F° 000",
  },
];

export const values = [
  {
    title: "Claridad",
    text: "Explicamos cada paso en lenguaje simple. Sabés qué esperar, cuánto cuesta y cuánto demora.",
  },
  {
    title: "Estrategia",
    text: "Evaluamos el caso antes de litigar. Muchas veces el mejor resultado es un buen acuerdo.",
  },
  {
    title: "Compromiso",
    text: "Un abogado responsable de tu caso, con respuesta en menos de 24 horas hábiles.",
  },
] as const;

export const stats = [
  { value: "15+", label: "años de trayectoria" },
  { value: "2.400", label: "casos acompañados" },
  { value: "10", label: "áreas de práctica" },
  { value: "24 h", label: "tiempo de respuesta" },
] as const;
