import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Faqs = () => {
  const [active, setActive] = useState(0);
  const faqItems = [
    {
      q: "How do I place an order with Cash on Delivery?",
      a: "Add products to cart, proceed to checkout, complete contact and shipping details, then select Cash on Delivery if available and place your order.",
    },
    {
      q: "How can I verify my order is confirmed?",
      a: "You will receive an order confirmation through email and SMS after successful placement.",
    },
    {
      q: "What are delivery charges?",
      a: "Shipping is free for Pakistan orders. International shipping is calculated at checkout.",
    },
    {
      q: "Can I change shipping address after ordering?",
      a: "Address changes are only possible before dispatch. Contact customer care immediately.",
    },
    {
      q: "What if a product is unavailable or there is a discrepancy?",
      a: "Support first checks replacement availability. If unavailable, a store voucher may be issued according to policy.",
    },
    {
      q: "Can I place an order without creating an account?",
      a: "Yes. Account creation is optional and not required for checkout completion.",
    },
    {
      q: "Which payment methods are accepted?",
      a: "FLOSSIE supports card payments and Cash on Delivery where applicable.",
    },
    {
      q: "What should I do if I do not receive a confirmation email?",
      a: "Please check spam/junk folder first, then contact support with your phone number and order details.",
    },
    {
      q: "Can orders be canceled after placement?",
      a: "Cancellation depends on processing stage. Orders already dispatched follow exchange policy terms.",
    },
    {
      q: "Is my personal information secure?",
      a: "Yes. Customer information is kept confidential and handled under FLOSSIE privacy policy controls.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.h1
        className="font-serif text-4xl md:text-5xl text-stone-900"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        FAQs
      </motion.h1>
      <motion.p
        className="mt-3 text-stone-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
      >
        Quick answers to the most common customer questions.
      </motion.p>

      <div className="mt-8 space-y-3">
        {faqItems.map((item, idx) => {
          const open = active === idx;
          return (
            <motion.div
              key={item.q}
              className="rounded-xl border border-stone-200 bg-white overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.05 }}
            >
              <button
                onClick={() => setActive(open ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-stone-900">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-4 pb-4 text-sm text-stone-600 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Need More Help?</h3>
        <p className="mt-2 text-sm text-stone-700 leading-relaxed">
          If your question is not listed here, contact support with your order number and
          issue details so the team can assist quickly and accurately.
        </p>
      </motion.div>
    </section>
  );
};

export default Faqs;
