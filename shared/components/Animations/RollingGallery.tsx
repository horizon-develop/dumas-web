import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType, SwiperOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/autoplay";


declare module "swiper/types" {
  interface SwiperOptions {
    loopedslides?: number;
  }
}

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[];
}

const RollingGallery: React.FC<RollingGalleryProps> = ({
  autoplay = true,
  pauseOnHover = true,
  images = [],
}) => {
  const swiperRef = useRef<SwiperType | undefined>(undefined);
  const duplicatedImages = [...images, ...images, ...images, ...images]; 

  const swiperParams: SwiperOptions = {
    modules: [Autoplay],
    spaceBetween: 30,
    slidesPerView: "auto",
    loop: true,
    loopedslides: images.length, 
    autoplay: autoplay ? {
      delay: 0, 
      disableOnInteraction: false,
      pauseOnMouseEnter: pauseOnHover,
    } : false,
    speed: 5000, 
    breakpoints: {
      320: { slidesPerView: 2 },
      640: { slidesPerView: 3, spaceBetween: 40 },
      1024: { slidesPerView: 5, spaceBetween: 50 }
    },
    on: {
      init: (swiper) => {
        swiperRef.current = swiper;
      }
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-[48px] z-10 bg-gradient-to-l from-transparent to-[#8B0000]" />
      <div className="absolute top-0 right-0 h-full w-[48px] z-10 bg-gradient-to-r from-transparent to-[#8B0000]" />
      
      <Swiper {...swiperParams} className="!overflow-visible">
        {duplicatedImages.map((url, i) => (
          <SwiperSlide 
            key={`${url}-${i}`} 
            className="!w-auto !transition-transform !duration-500"
          >
            <div className="flex h-[140px] items-center justify-center p-2">
              <img
                src={url}
                alt={`Marca ${i + 1}`}
                className="h-[100px] w-[200px] rounded-lg border-2 border-white object-contain sm:h-[80px] sm:w-[160px]"
                loading="lazy"
                draggable="false"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RollingGallery;