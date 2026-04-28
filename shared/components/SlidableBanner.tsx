"use client";

import { useEffect, useRef } from "react";

const IMAGES = [
  "/assets/Offers/promo-04.webp",
  "/assets/Offers/promo-05.webp",
  "/assets/Offers/promo-06.webp",
];

const SlidableBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const children = Array.from(content.children);
    const totalWidth = children.reduce(
      (acc, child) => acc + child.getBoundingClientRect().width + 8,
      0
    );

    children.forEach((child) => content.appendChild(child.cloneNode(true)));

    const animation = content.animate(
      [{ transform: "translateX(0%)" }, { transform: `translateX(-${totalWidth}px)` }],
      { duration: totalWidth * (window.innerWidth < 768 ? 40 : 50), iterations: Infinity }
    );

    return () => animation.cancel();
  }, []);

  return (
    <div className="bg-[#8B0000] py-8 md:py-12 overflow-hidden w-full">
      <div className="text-center mb-4 md:mb-6 px-2 md:px-4">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">¡Ofertas para ti!</h2>
        <p className="text-gray-200 text-xs md:text-sm">Descubre nuestras promociones especiales</p>
      </div>

      <div ref={containerRef} className="relative w-full overflow-hidden">
        <div ref={contentRef} className="flex w-fit gap-2 md:gap-4 px-1 md:px-2">
          {IMAGES.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] h-[114px] md:w-[320px] md:h-[183px] rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <img src={img} className="w-full h-full object-cover" loading="lazy" alt="Oferta especial" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidableBanner;
