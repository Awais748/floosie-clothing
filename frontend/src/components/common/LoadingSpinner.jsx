import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ fullPage = false, small = false, white = false }) => {
  if (small) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`w-4 h-4 rounded-full border-2 border-transparent ${white ? "border-t-white" : "border-t-stone-900"} border-r-stone-200/30`}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? "min-h-[80vh]" : "py-12"}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-stone-100" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-stone-900"
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium"
      >
        Loading
      </motion.p>
    </div>
  );
};


export default LoadingSpinner;
