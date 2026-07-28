import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import JsonLd from "@/shared/components/JsonLd";
import {
  BRAND_COLOR,
  CONTACT,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIALS,
} from "@/shared/config/site";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "distribuidora mayorista veterinaria",
    "productos veterinarios por mayor",
    "pet care mayorista",
    "alimento balanceado mayorista",
    "proveedor petshop",
    "distribuidora Corrientes",
    "insumos veterinaria",
    "forrajería mayorista",
    "Dumas Distribuciones",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  image: `${SITE_URL}${OG_IMAGE.url}`,
  description: SITE_DESCRIPTION,
  telephone: CONTACT.telephone,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.streetAddress,
    addressLocality: CONTACT.addressLocality,
    addressRegion: CONTACT.addressRegion,
    postalCode: CONTACT.postalCode,
    addressCountry: CONTACT.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: CONTACT.latitude,
    longitude: CONTACT.longitude,
  },
  areaServed: {
    "@type": "Country",
    name: "Argentina",
  },
  sameAs: SOCIALS,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "es-AR",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={lato.className}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <SpeedInsights />
      </body>
    </html>
  );
}
