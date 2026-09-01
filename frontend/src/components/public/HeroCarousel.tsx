'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    title: 'Your Best JAMB Score',
    subtitle: 'STARTS HERE.',
    description: 'Learn from experienced tutors, master past questions and prepare with confidence.',
    image: '/images/student-1.png',
  },
  {
    id: 2,
    title: 'Master Your',
    subtitle: 'EXAMINATIONS.',
    description: 'Access over 50,000 past questions, mock exams, and detailed explanations.',
    image: '/images/student-2.png',
  },
  {
    id: 3,
    title: 'Learn from the',
    subtitle: 'BEST TUTORS.',
    description: 'Our expert tutors provide personalized guidance and support to help you achieve your goals.',
    image: '/images/student-3.png',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden h-[70vh] min-h-[500px] max-h-[700px] md:h-[85vh] md:max-h-[800px]">
      {/* Full Width Background Image */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover object-center md:object-center"
            style={{ objectPosition: '60% 50%' }}
            priority={index === 0}
          />
          {/* Mobile: Full overlay for readability | Desktop: Left gradient only */}
          <div className="absolute inset-0 bg-black/50 md:hidden" />
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.10) 60%, transparent 80%)',
            }}
          />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 flex items-center">
          <div className="w-full max-w-[600px] text-center md:text-left mx-auto md:mx-0">

            {/* Small Badge - EXCELLENCE IN EDUCATION */}
            <div
              className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-4 mx-auto md:mx-0"
              style={{
                backgroundColor: '#FFD700',
                fontSize: '11px',
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '0.5px',
              }}
            >
              EXCELLENCE IN EDUCATION
            </div>

            {/* Main Headline */}
            <h1
              className="leading-none mb-2"
              style={{
                fontWeight: 800,
                lineHeight: 0.95,
              }}
            >
              <span
                className="block text-white"
                style={{ fontSize: 'clamp(32px, 8vw, 56px)' }}
              >
                {slide.title}
              </span>
              <span
                style={{
                  fontSize: 'clamp(36px, 9vw, 62px)',
                  color: '#FFD700',
                  display: 'block',
                }}
              >
                {slide.subtitle}
              </span>
            </h1>

            {/* Yellow Accent Line */}
            <div
              className="my-4 md:my-5 mx-auto md:mx-0"
              style={{
                width: '80px',
                height: '3px',
                backgroundColor: '#FFD700',
                borderRadius: '2px',
              }}
            />

            {/* Subtitle */}
            <p
              className="text-white mb-6 md:mb-8 mx-auto md:mx-0"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: '100%',
              }}
            >
              {slide.description}
            </p>

            {/* CTA Buttons - Stacked on mobile, side by side on desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center md:justify-start">
              {/* Primary Button - Yellow */}
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl transition-all hover:opacity-90 w-full sm:w-auto"
                style={{
                  backgroundColor: '#FFD700',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '14px 28px',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                }}
              >
                GET STARTED FREE
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Secondary Button - Transparent */}
              <Link
                href="/programs"
                className="inline-flex items-center justify-center rounded-xl transition-all hover:bg-white/10 w-full sm:w-auto"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '14px 28px',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                VIEW PROGRAMS
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, visible on md+ */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full items-center justify-center text-white hover:bg-white/15 transition-colors hidden md:flex"
        style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full items-center justify-center text-white hover:bg-white/15 transition-colors hidden md:flex"
        style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Mobile Navigation - Small arrows at bottom corners */}
      <div className="absolute bottom-20 left-4 z-30 md:hidden">
        <button
          onClick={prevSlide}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-20 right-4 z-30 md:hidden">
        <button
          onClick={nextSlide}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: index === currentSlide ? '24px' : '8px',
              height: '8px',
              backgroundColor: index === currentSlide ? '#FFD700' : 'rgba(255,255,255,0.4)',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter - Hidden on mobile */}
      <div
        className="absolute bottom-6 right-4 lg:right-8 z-30 text-xs hidden md:block"
        style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}
      >
        {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  );
}
