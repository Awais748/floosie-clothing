import React, { memo } from "react";
import { motion } from "framer-motion";

const SectionHeading = memo(({ title, subtitle }) => {
  return (
    <div className="text-center mb-8 relative">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-xl md:text-3xl font-medium tracking-wide text-stone-900 uppercase inline-block relative px-4"
      >
        {title}
        {subtitle && (
          <>
            <span className="mx-2 md:mx-3 text-stone-400 font-light">|</span>
            {subtitle}
          </>
        )}
      </motion.h2>
    </div>
  );
});

export default SectionHeading;
