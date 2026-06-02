import React from "react";
import { motion } from "framer-motion";
import { Truck, Globe, Clock3 } from "lucide-react";

const DeliveryPolicy = () => {
  const schedule = [
    { lane: "Within Pakistan", type: "Unstitched", time: "3 to 5 Business Days" },
    { lane: "Within Pakistan", type: "Stitched", time: "10 to 15 Business Days" },
    { lane: "Outside Pakistan", type: "Unstitched", time: "5 to 7 Business Days" },
    { lane: "Outside Pakistan", type: "Stitched", time: "20 to 25 Business Days" },
  ];
  const notes = [
    "All stitched orders are made-to-order and may require additional preparation time.",
    "Customers should check spam/junk folders for shipping confirmation messages.",
    "Customs clearance delays are outside FLOSSIE operational control.",
    "Incorrect address submissions can impact delivery timeline and success.",
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <motion.div
        className="flex items-center gap-2 text-stone-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Truck size={15} /> Delivery Policy
      </motion.div>
      <motion.h1
        className="font-serif text-4xl md:text-5xl text-stone-900 mt-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shipping Timeline
      </motion.h1>

      <div className="mt-8 rounded-2xl border border-stone-200 overflow-hidden">
        {schedule.map((item, idx) => (
          <motion.div
            key={`${item.lane}-${item.type}`}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 md:p-5 border-b border-stone-100 last:border-b-0 bg-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <p className="font-medium text-stone-900">{item.lane}</p>
            <p className="text-stone-600">{item.type}</p>
            <p className="text-stone-700 font-semibold">{item.time}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Clock3 size={16} className="text-stone-600" />
          <p className="mt-2 text-sm text-stone-700">Tracking details are sent once your order is dispatched.</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Globe size={16} className="text-stone-600" />
          <p className="mt-2 text-sm text-stone-700">International shipping charges are calculated at checkout.</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Truck size={16} className="text-stone-600" />
          <p className="mt-2 text-sm text-stone-700">Delivery to India and Bangladesh is currently unavailable.</p>
        </div>
      </div>

      <motion.div
        className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 md:p-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <h3 className="font-serif text-2xl text-stone-900">Important Delivery Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {notes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default DeliveryPolicy;
