/**
 * Datos institucionales del estudio de la Dra. Paula Florencia Sardo.
 */
export const site = {
  name: "Paula Sardo",
  legalName: "Dra. Paula Florencia Sardo y asociadxs",
  tagline: "Estudio jurídico",
  description:
    "Asesoramiento jurídico integral, acompañamiento profesional y defensa de tus derechos. Atención personalizada en la Ciudad Autónoma de Buenos Aires y en la Provincia de Buenos Aires.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es_AR",
  contact: {
    email: "paula.f.sardo@gmail.com",
    phone: "+54 9 11 6660-2795",
    phoneHref: "tel:+5491166602795",
    whatsapp: "5491166602795",
    location: "Ciudad Autónoma de Buenos Aires y Provincia de Buenos Aires",
  },
} as const;

export const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Áreas" },
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
    name: "Dra. Paula Florencia Sardo",
    role: "Abogada",
    areas: [
      "Derecho Laboral",
      "Derecho de Familia",
      "Derecho Penal",
      "Derecho Civil y Daños",
      "Sucesiones",
    ],
    bio: "Asesoramiento jurídico integral, acompañamiento profesional y defensa de tus derechos, con atención personalizada en la Ciudad Autónoma de Buenos Aires y en la Provincia de Buenos Aires.",
    registration: "CPACF T° 152 F° 256 · CAAL T° V F° 69",
  },
];

export const values = [
  {
    title: "Claridad",
    text: "Explicamos cada paso en lenguaje simple, para que sepas qué está pasando y cuáles son tus opciones.",
  },
  {
    title: "Acompañamiento",
    text: "Cada consulta se atiende de forma personalizada, con tiempo para escuchar la situación antes de definir el camino.",
  },
  {
    title: "Defensa",
    text: "Representamos y defendemos tus derechos en las áreas del estudio, en CABA y en la Provincia de Buenos Aires.",
  },
] as const;

export const stats = [
  { value: "5", label: "áreas de práctica" },
  { value: "CPACF", label: "T° 152 F° 256" },
  { value: "CAAL", label: "T° V F° 69" },
] as const;
