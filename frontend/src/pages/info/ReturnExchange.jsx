import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ReturnExchange = () => {
  const eligible = [
    "Unused item with original labels and tags",
    "Exchange requested within 14 days of delivery",
    "Wrong item delivered or product received faulty/damaged",
  ];

  const notEligible = [
    "Processed orders for refund requests",
    "Sale items unless wrong or faulty article was delivered",
    "International exchange requests for reasons other than wrong/faulty delivery",
  ];
  const processFlow = [
    "Email or call customer support with order number and issue detail.",
    "Support team verifies eligibility under policy conditions.",
    "If approved, exchange instructions are shared by customer care.",
    "Replacement is arranged according to stock availability.",
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.h1
        className="font-serif text-4xl md:text-5xl text-stone-900"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Return & Exchange
      </motion.h1>
      <motion.p
        className="mt-3 text-stone-600 max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Exchange requests are handled according to official FLOSSIE online store policy.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <motion.div
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-emerald-700 font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> Eligible Cases
          </h2>
          <ul className="mt-3 space-y-2">
            {eligible.map((item) => (
              <li key={item} className="text-sm text-emerald-900">- {item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-amber-700 font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> Not Eligible
          </h2>
          <ul className="mt-3 space-y-2">
            {notEligible.map((item) => (
              <li key={item} className="text-sm text-amber-900">- {item}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 rounded-2xl border border-stone-200 bg-white p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Exchange Process</h3>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {processFlow.map((step, idx) => (
            <li key={step}>
              <span className="font-semibold text-stone-900">{idx + 1}.</span> {step}
            </li>
          ))}
        </ul>
      </motion.div>

      <p className="mt-6 text-sm text-stone-600">
        Exchange support: <span className="font-medium">flossieclothingpk@gmail.com</span> |
        {" "}
        <span className="font-medium">(+92) 311-1368111</span>
      </p>
    </section>
  );
};

export default ReturnExchange;
