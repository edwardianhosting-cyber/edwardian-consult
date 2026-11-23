'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Atom, FlaskConical, Palette, Music, Compass, Award } from 'lucide-react';

interface CreativeFrameProps {
  images: { src: string; alt: string }[];
  className?: string;
}

export default function CreativeFrame({ images, className = '' }: CreativeFrameProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [miniIndex, setMiniIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setMiniIndex((i) => (i + 1) % images.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const icons = [GraduationCap, BookOpen, Atom, FlaskConical, Palette, Music, Compass, Award];

  return (
    <div className={`relative ${className}`}>
      {/* Animated gradient border */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent-400 via-primary-500 to-accent-400 opacity-60 blur-sm animate-gradient-rotate" />
      
      {/* Floating academic icons around the frame */}
      {icons.slice(0, 4).map((Icon, i) => (
        <div
          key={i}
          className="absolute z-20 animate-float-icon"
          style={{
            top: i === 0 ? '-12px' : i === 1 ? '-12px' : 'auto',
            bottom: i === 2 ? '-12px' : i === 3 ? '-12px' : 'auto',
            left: i === 0 || i === 2 ? '-12px' : 'auto',
            right: i === 1 || i === 3 ? '-12px' : 'auto',
            animationDelay: `${i * 0.5}s`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-accent-400">
            <Icon className="w-4 h-4 text-primary-600" />
          </div>
        </div>
      ))}

      {/* Main frame */}
      <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 group">
        <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl group-hover:rotate-0 transition-transform duration-500" />
        <div className="relative overflow-hidden h-[280px] sm:h-[320px]">
          {images.map((image, index) => (
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

        {/* Mini carousel thumbnails at edges */}
        <div className="absolute bottom-2 left-2 z-10 flex gap-1">
          {images.slice(0, 3).map((img, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                i === miniIndex % images.length ? 'border-accent-400 scale-110' : 'border-white/50 opacity-60'
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Pulsing glow */}
        <div className="absolute inset-0 rounded-2xl animate-pulse-glow pointer-events-none" />
      </div>

    </div>
  );
}
