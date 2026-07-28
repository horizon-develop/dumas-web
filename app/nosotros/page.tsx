import type { Metadata } from "next";
import AboutUs from "@/shared/components/AboutUs";
import JsonLd from "@/shared/components/JsonLd";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/shared/config/site";

const title = "Quiénes somos";
const description =
  "Dumas Distribuciones es una distribuidora mayorista de productos veterinarios y pet care con base en Corrientes, especializada en abastecer petshops, veterinarias y forrajerías.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/nosotros" },
  openGraph: {
    type: "website",
    url: "/nosotros",
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
    { "@type": "ListItem", position: 2, name: "Quiénes somos", item: `${SITE_URL}/nosotros` },
  ],
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE_URL}/nosotros`,
  name: `${title} — ${SITE_NAME}`,
  description,
  mainEntity: { "@id": `${SITE_URL}/#organization` },
};

export default function NosotrosPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={aboutSchema} />
      <AboutUs />
    </>
  );
}
