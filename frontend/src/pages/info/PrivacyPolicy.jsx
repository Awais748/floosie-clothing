import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Database, Lock } from "lucide-react";

const PrivacyPolicy = () => {
  const blocks = [
    {
      title: "Collected Data",
      text: "We collect form data you provide at checkout/account and automatic technical information such as browser and IP metadata.",
      icon: Database,
    },
    {
      title: "Usage",
      text: "Data is used only for order processing, support communication, service updates, and improving shopping experience.",
      icon: ShieldCheck,
    },
    {
      title: "Protection",
      text: "We do not sell or redistribute personal information. Policy and terms govern all submitted information.",
      icon: Lock,
    },
  ];
  const policyNotes = [
    "Information submitted on forms is used only for store operations and support workflows.",
    "Technical metadata can be used for fraud prevention and site performance monitoring.",
    "Access to customer information is limited to authorized personnel only.",
    "Policy updates may be published without prior separate notice.",
    "By using this website, users accept applicable privacy and terms policies.",
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.h1
        className="font-serif text-4xl md:text-5xl text-stone-900"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Privacy Policy
      </motion.h1>
      <motion.p
        className="mt-3 text-stone-600 max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        FLOSSIE takes all practical measures to protect personal information used
        for customer orders and support services.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {blocks.map((block, idx) => (
          <motion.div
            key={block.title}
            className="rounded-2xl p-5 border border-stone-200 bg-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + idx * 0.08 }}
          >
            <block.icon size={18} className="text-stone-500 mb-3" />
            <h2 className="text-lg font-semibold text-stone-900">{block.title}</h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{block.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 md:p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Additional Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {policyNotes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </motion.div>

      <p className="mt-7 text-xs text-stone-500">
        Policy contact: support@flossieclothing.com.pk
      </p>
    </section>
  );
};

export default PrivacyPolicy;
