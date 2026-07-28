import type { Metadata } from "next";
import ContactPage from "@/shared/components/ContactPage";
import JsonLd from "@/shared/components/JsonLd";
import { CONTACT, OG_IMAGE, SITE_NAME, SITE_URL } from "@/shared/config/site";

const title = "Contacto";
const description =
  "Contactá a Dumas Distribuciones en Corrientes. Escribinos por WhatsApp o dejanos tu consulta para operar como cliente mayorista.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contacto" },
  openGraph: {
    type: "website",
    url: "/contacto",
    siteName: SITE_NAME,
    title,
    description,
    images: [OG_IMAGE],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Contacto", item: `${SITE_URL}/contacto` },
  ],
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${SITE_URL}/contacto`,
  name: `${title} — ${SITE_NAME}`,
  description,
  mainEntity: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    telephone: CONTACT.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.addressCountry,
    },
  },
};

export default function ContactoPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={contactSchema} />
      <ContactPage />
    </>
  );
}
