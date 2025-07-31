"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Zap from "@/components/icons/Gemini";
import Star from "@/components/icons/LightningBolt2";

interface OtherSellersCarouselProps {
  sellers: number[];
}

export default function OtherSellersCarousel({ sellers }: OtherSellersCarouselProps) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-4">Other Sellers of This Stone</h2>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="relative"
      >
        {sellers.map((_, i) => (
          <SwiperSlide key={i}>
            <div className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
              {/* Image Section */}
              <div className="relative">
                <img
                  src={`https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins${i}`}
                  alt={`Negro Marquina Travertine Block ${i + 1}`}
                  className="w-full h-48 object-cover"
                />
                {/* Overlay Icons */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <div className="bg-white rounded-lg shadow-md p-2 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-2 flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-4 flex flex-col gap-3">
                {/* Seller Info and Colors */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇬🇧</span>
                    <span className="font-semibold text-sm text-foreground">Grand Stone Enterprise</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-black border border-gray-300" />
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
                    <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>
                
                {/* Product Name */}
                <div className="font-bold text-base text-foreground leading-tight">
                  Negro Marquina Travertine Blocks
                </div>
                
                {/* Specification Pills */}
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1">
                    280×220×200 cm
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1">
                    Bush-Hammered
                  </span>
                </div>
                
                {/* Price and Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-xl text-foreground">$10,000</span>
                    <span className="text-sm text-muted-foreground">/kg</span>
                  </div>
                  <span className="text-sm text-muted-foreground">1 Hours Ago</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev !w-10 !h-10 !bg-white/90 hover:!bg-white !shadow-lg !rounded-full !text-gray-700 after:!text-lg" />
        <div className="swiper-button-next !w-10 !h-10 !bg-white/90 hover:!bg-white !shadow-lg !rounded-full !text-gray-700 after:!text-lg" />
      </Swiper>
    </div>
  );
} 