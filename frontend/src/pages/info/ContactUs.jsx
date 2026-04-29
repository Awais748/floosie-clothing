import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";

const ContactUs = () => {
  const channels = [
    {
      title: "Call Us",
      value: "+92 321 900 2222",
      caption: "Monday to Friday, 9:00 AM to 6:00 PM",
      icon: Phone,
    },
    {
      title: "Primary Email",
      value: "support@flossieclothing.com.pk",
      caption: "For orders, deliveries, and product help",
      icon: Mail,
    },
    {
      title: "Alternative Email",
      value: "flossieclothingpk@gmail.com",
      caption: "Use if primary support line is busy",
      icon: MessageCircle,
    },
  ];
  const supportTopics = [
    "Order placement assistance",
    "Payment confirmation and verification",
    "Delivery timeline and tracking updates",
    "Return and exchange guidance",
    "Size and product selection support",
    "Incorrect, missing, or damaged item reporting",
  ];

  const howToReach = [
    {
      step: "Step 1",
      detail: "Share your order number and registered contact details.",
    },
    {
      step: "Step 2",
      detail: "Explain your request clearly (order status, exchange, size help, etc.).",
    },
    {
      step: "Step 3",
      detail: "Support team verifies and provides next action quickly.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
      <motion.div
        className="rounded-3xl bg-stone-900 text-white p-7 md:p-10"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl">Contact Us</h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Share your order number for the fastest response. Our support team helps
          with order status, exchange guidance, and delivery updates.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm text-white/80">
          <Clock size={15} />
          Email support is available 24/7
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {channels.map((item, idx) => (
          <motion.article
            key={item.title}
            className="rounded-2xl border border-stone-200 p-5 bg-white"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 + idx * 0.07 }}
          >
            <item.icon size={18} className="text-stone-500 mb-3" />
            <h2 className="font-semibold text-stone-900">{item.title}</h2>
            <p className="mt-2 text-sm text-stone-700 break-all">{item.value}</p>
            <p className="mt-1 text-xs text-stone-500">{item.caption}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="grid md:grid-cols-2 gap-5 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-2xl border border-stone-200 p-5 bg-stone-50">
          <h3 className="font-serif text-2xl text-stone-900">Support Topics</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {supportTopics.map((topic) => (
              <li key={topic}>- {topic}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 p-5 bg-white">
          <h3 className="font-serif text-2xl text-stone-900">How To Reach Faster</h3>
          <ul className="mt-3 space-y-3">
            {howToReach.map((item) => (
              <li key={item.step} className="text-sm text-stone-700">
                <span className="font-semibold text-stone-900">{item.step}:</span>{" "}
                {item.detail}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactUs;
