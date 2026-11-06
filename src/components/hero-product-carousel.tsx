"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero/iphone-16.webp",
    alt: "Black iPhone 16, front and back",
    name: "iPhone 16",
    eyebrow: "JUST ARRIVED",
    note: "Meet your next favorite.",
  },
  {
    src: "/images/hero/galaxy-s26.webp",
    alt: "Violet Samsung Galaxy S26, front and back",
    name: "Galaxy S26",
    eyebrow: "NEW ARRIVAL",
    note: "A brighter kind of smart.",
  },
  {
    src: "/images/hero/pixel-10.webp",
    alt: "Google Pixel 10, front and back",
    name: "Pixel 10",
    eyebrow: "MADE FOR YOU",
    note: "Thoughtful from every angle.",
  },
];

export function HeroProductCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <>
      <div className="hero-product" role="region" aria-label="Featured phones">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-product-stage">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeSlide.src}
              className="hero-product-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${activeIndex + 1} of ${slides.length}: ${activeSlide.name}`}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -22 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
            >
              <Image
                className="hero-product-photo"
                src={activeSlide.src}
                alt={activeSlide.alt}
                width={900}
                height={900}
                priority={activeIndex === 0}
                sizes="(max-width: 650px) 320px, 460px"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hero-phone-label" aria-live="polite">
          <span>{activeSlide.eyebrow}</span>
          <b>{activeSlide.name}</b>
          <small>{activeSlide.note}</small>
        </div>
        <div className="hero-spark spark-a" aria-hidden="true">{"\u2726"}</div>
        <div className="hero-spark spark-b" aria-hidden="true">{"\u2727"}</div>
        <div className="hero-carousel-controls" role="group" aria-label="Choose a featured phone">
          {slides.map((slide, index) => (
            <button
              key={slide.name}
              type="button"
              aria-label={`Show ${slide.name}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "active" : ""}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="hero-index" aria-hidden="true">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span><i /> 03
      </div>
    </>
  );
}
