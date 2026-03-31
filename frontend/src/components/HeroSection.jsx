import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import herobanner1 from "../assets/herobanner1.webp";
import herobanner2 from "../assets/herobanner2.webp";
import herobannermob1 from "../assets/herobannermob1.webp";
import herobannermob2 from "../assets/herobannermob2.webp";

const slides = [
  { desktop: herobanner1, mobile: herobannermob1 },
  { desktop: herobanner2, mobile: herobannermob2 },
];

const HeroSection = React.memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[82vh] bg-black overflow-hidden font-serif">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          <img
            src={
              isMobile
                ? slides[currentIndex].mobile
                : slides[currentIndex].desktop
            }
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center sm:object-top"
          />
        </motion.div>
      </AnimatePresence>

      {/* Circular Indicators - Responsive positioning */}
      <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 md:right-6 md:bottom-6 lg:right-8 lg:bottom-8 z-20 flex flex-row gap-2.5 sm:gap-3 md:gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative cursor-pointer touch-manipulation group focus:outline-none"
            aria-label={`Go to slide ${index + 1}`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              className="-rotate-90 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
            >
              <circle
                cx="6"
                cy="6"
                r="5"
                fill="none"
                stroke="white"
                strokeOpacity={currentIndex === index ? "0.7" : "0.35"}
                strokeWidth="1.5"
              />
              {currentIndex === index && (
                <motion.circle
                  key={`progress-${currentIndex}`}
                  cx="6"
                  cy="6"
                  r="5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  style={{
                    strokeDasharray: "31.4159",
                    strokeDashoffset: 0,
                  }}
                />
              )}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
});

export default HeroSection;
