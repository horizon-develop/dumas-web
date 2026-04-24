import React from "react";
import RollingGallery from "../Animations/RollingGallery";

const BrandBanner: React.FC = () => {
  const brands = [
    "/assets/Brands/marca1.png",
    "/assets/Brands/marca2.png",
    "/assets/Brands/marca3.png",
    "/assets/Brands/marca4.png",
    "/assets/Brands/marca5.png",
  ];

  return (
    <div className="bg-[#8B0000] py-6 w-full">
      <div className="w-full">
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-white mb-1">
            Recomendamos estas marcas
          </div>
          <p className="text-gray-200 text-sm italic">
            Aliados estratégicos en cuidado veterinario
          </p>
        </div>

        <div className="flex w-fit gap-2 md:gap-4 px-1 md:px-2 overflow-x-auto">
          <RollingGallery 
            images={brands}
            autoplay={true}
            pauseOnHover={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandBanner;