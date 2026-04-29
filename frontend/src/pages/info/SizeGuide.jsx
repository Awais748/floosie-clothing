import React from "react";
import { motion } from "framer-motion";
import { Ruler, Shirt, UserRound } from "lucide-react";

const SizeGuide = () => {
  const sizeTips = [
    "Take measurements over light clothing for better accuracy.",
    "Do not pull the measuring tape too tight; keep it level.",
    "For stitched outfits, always prioritize body measurements over usual ready-to-wear size assumptions.",
    "If uncertain between two sizes, discuss preferred fit (regular/relaxed) with support before ordering.",
    "Recheck all measurements before final checkout.",
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.h1
        className="font-serif text-4xl md:text-5xl text-stone-900"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Size Guide
      </motion.h1>
      <motion.p
        className="mt-3 text-stone-600 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Use the official FLOSSIE chart and measure carefully before confirming stitched orders.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-4 mt-7">
        {[
          {
            title: "Measure Right",
            text: "Use a soft tape for bust, waist, and hips while standing straight.",
            icon: Ruler,
          },
          {
            title: "Match Chart",
            text: "Compare measurements against size chart before adding to cart.",
            icon: Shirt,
          },
          {
            title: "Need Help",
            text: "Contact support for personalized fit suggestions before order confirmation.",
            icon: UserRound,
          },
        ].map((card, idx) => (
          <motion.div
            key={card.title}
            className="rounded-2xl border border-stone-200 p-5 bg-white"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <card.icon size={18} className="text-stone-500 mb-3" />
            <h2 className="font-semibold text-stone-900">{card.title}</h2>
            <p className="text-sm text-stone-600 mt-2">{card.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Pro Fit Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {sizeTips.map((tip) => (
            <li key={tip}>- {tip}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default SizeGuide;
