'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt: string }[];
  label: string;
  className: string;
}

function ImageCarousel({ images, label, className }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState(images);

  useEffect(() => {
    // Shuffle images for this instance (Fisher-Yates)
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledImages(shuffled);
    // Random starting index
    setActiveIndex(Math.floor(Math.random() * shuffled.length));
  }, [images]);

  useEffect(() => {
    if (shuffledImages.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % shuffledImages.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [shuffledImages.length]);

  const displayImages = shuffledImages.length > 0 ? shuffledImages : images;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
    >
      {displayImages.map((image, index) => (
        <div
          key={image.src + index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>
      ))}
    </div>
  );
}

export function AboutHeroCarousel() {
  const heroImages = [
    { src: '/images/student-1.png', alt: 'Student preparing for examinations' },
    { src: '/images/student-2.png', alt: 'Tutor guiding students through exam preparation' },
    { src: '/images/student-3.png', alt: 'Students learning together' },
  ];

  return (
    <ImageCarousel
      images={heroImages}
      label="About Edwardian image carousel"
      className="h-[320px] min-h-[320px] md:h-[360px] md:min-h-[360px]"
    />
  );
}

export function StoryImageCarousel({ images }: { images?: { src: string; alt: string }[] }) {
  const storyImages = images && images.length > 0 ? images : [];

  return (
    <ImageCarousel
      images={storyImages}
      label="Edwardian photo gallery"
      className="h-[300px] sm:h-[380px]"
    />
  );
}
