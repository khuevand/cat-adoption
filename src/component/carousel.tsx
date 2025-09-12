"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Image from "next/image";

// Swiper core styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Cat = { src: string; alt: string; text: string; tags: string[] };

const cats: Cat[] = [
  { src: "/car1.png", alt: "Cat 1", text: "A sushi cat is ready to meet you!", tags: ["kitten", "playful", "indoor"] },
  { src: "/car2.png", alt: "Cat 2", text: "Another winter cat!", tags: ["adult", "calm", "vaccinated"] },
  { src: "/car3.png", alt: "Cat 3", text: "Have you seen a blueberry cat?", tags: ["special", "friendly"] },
  { src: "/car4.png", alt: "Cat 4", text: "Boo! Ghost cat here", tags: ["quiet", "good with kids"] },
  { src: "/car5.png", alt: "Cat 5", text: "Rainy day is coming soon", tags: ["senior", "bonded pair"] },
];

export default function CatCarousel() {
  return (
    <div className="items-center justify-center rounded-lg">
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={16}
        loop
        className="
          w-[360px]
          [--swiper-navigation-color:theme(colors.amber.600)]
          [--swiper-navigation-size:20px]
          [--swiper-pagination-color:theme(colors.amber.600)]
          [--swiper-pagination-bullet-inactive-color:theme(colors.gray.300)]
          [--swiper-pagination-bullet-inactive-opacity:1]
          [--swiper-pagination-bullet-horizontal-gap:10px]
        "
      >
        {cats.map((c) => (
          <SwiperSlide key={c.src}>
            <CatCard {...c} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function CatCard({ src, alt, text, tags }: Cat) {
  return (
    <div className="bg-[white] rounded-xl shadow-md overflow-hidden">
      <div
        className="grid place-items-center p-4"
        style={{ aspectRatio: "1 / 1" }}
      >
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          className="max-h-full w-auto object-contain"
          priority={false}
        />
      </div>

]      <div className="border-t border-gray-300 px-4 py-7 bg-white">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full text-xs font-medium
                         bg-amber-50 text-amber-700 border border-amber-200"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="px-2.5 mt-2 text-xs text-gray-600">{text}</div>
      </div>
    </div>
  );
}
