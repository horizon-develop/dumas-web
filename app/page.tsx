import type { Metadata } from "next";
import HeroSection from "@/shared/components/HeroSection";
import CategorySection from "@/shared/components/CategorySection";
import SlidableBanner from "@/shared/components/SlidableBanner";
import ProfileAttention from "@/shared/components/ProfileAttention";
import BrandBanner from "@/shared/components/BrandBanner";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | ${SITE_TAGLINE} en Corrientes`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE} en Corrientes`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <SlidableBanner />
      <ProfileAttention />
      <BrandBanner />
    </main>
  );
}
