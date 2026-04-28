import HeroSection from "@/shared/components/HeroSection";
import CategorySection from "@/shared/components/CategorySection";
import SlidableBanner from "@/shared/components/SlidableBanner";
import ProfileAttention from "@/shared/components/ProfileAttention";
import BrandBanner from "@/shared/components/BrandBanner";

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
