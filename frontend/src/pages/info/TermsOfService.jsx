import React from "react";
import { motion } from "framer-motion";

const TermsOfService = () => {
  const panels = [
    {
      title: "Use Of Service",
      bullets: [
        "You must be of legal age and use the website lawfully.",
        "Unlawful use, abuse, or policy violations may lead to service denial.",
      ],
    },
    {
      title: "Orders, Pricing, Availability",
      bullets: [
        "Prices and availability can change without prior notice.",
        "Orders may be canceled in stock, payment, or pricing exception scenarios.",
      ],
    },
    {
      title: "Liability & Updates",
      bullets: [
        "Service content is provided as-is and may be updated over time.",
        "Continued usage after updates means acceptance of revised terms.",
      ],
    },
  ];
  const legalNotes = [
    "Content on the website is provided for general information and may be updated periodically.",
    "Third-party links and tools may have separate terms; users should review those independently.",
    "Any violation of acceptable usage may result in immediate restriction or termination of access.",
    "All rights, protections, and limitations apply to the fullest extent permitted by applicable law.",
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.div
        className="rounded-2xl border border-stone-900 bg-stone-900 text-white p-6 md:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-white/80 max-w-3xl">
          Accessing this website and placing an order means you agree to FLOSSIE's
          official terms and policy framework.
        </p>
      </motion.div>

      <div className="mt-7 grid gap-4">
        {panels.map((panel, idx) => (
          <motion.article
            key={panel.title}
            className="rounded-xl border border-stone-200 p-5 bg-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + idx * 0.07 }}
          >
            <h2 className="text-lg font-semibold text-stone-900">{panel.title}</h2>
            <ul className="mt-2 space-y-2">
              {panel.bullets.map((bullet) => (
                <li key={bullet} className="text-sm text-stone-600 leading-relaxed">
                  - {bullet}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="mt-7 rounded-xl border border-stone-200 bg-stone-50 p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Legal Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-stone-700 leading-relaxed">
          {legalNotes.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </motion.div>

      <p className="mt-6 text-xs text-stone-500">
        For legal/policy queries: flossieclothingpk@gmail.com
      </p>
    </section>
  );
};

export default TermsOfService;
