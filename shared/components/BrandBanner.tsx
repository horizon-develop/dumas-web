import RollingGallery from "./Animations/RollingGallery";

const BRANDS = [
  "/assets/Brands/marca1.png",
  "/assets/Brands/marca2.png",
  "/assets/Brands/marca3.png",
  "/assets/Brands/marca4.png",
  "/assets/Brands/marca5.png",
];

const BrandBanner = () => {
  return (
    <div className="bg-[#8B0000] py-6 w-full">
      <div className="text-center mb-4">
        <p className="text-xl font-bold text-white mb-1">Recomendamos estas marcas</p>
        <p className="text-gray-200 text-sm italic">Aliados estratégicos en cuidado veterinario</p>
      </div>
      <RollingGallery images={BRANDS} autoplay pauseOnHover />
    </div>
  );
};

export default BrandBanner;
