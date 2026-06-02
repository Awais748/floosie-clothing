import React from "react";
import { motion } from "framer-motion";
import { Gem, Palette, Sparkles } from "lucide-react";

const AboutUs = () => {
  const cards = [
    {
      title: "Brand Identity",
      text: "FLOSSIE is built around eastern elegance with a contemporary fashion direction for modern women.",
      icon: Gem,
    },
    {
      title: "Design Language",
      text: "Our statement embroidery combines floral artistry, rich textures, and signature embellishments.",
      icon: Palette,
    },
    {
      title: "Craft Promise",
      text: "Every article is shaped with detail-focused craftsmanship to deliver a premium finish.",
      icon: Sparkles,
    },
  ];
  const storyBlocks = [
    {
      heading: "How FLOSSIE Started",
      body: "FLOSSIE began with a clear purpose: to create embroidered eastern wear that balances tradition with contemporary confidence. The brand philosophy has always centered around quality, detail, and the emotional experience of dressing for meaningful moments.",
    },
    {
      heading: "What Makes Us Different",
      body: "Every FLOSSIE collection is shaped by textile depth, hand-finish focus, and statement embroidery composition. We do not design for trends alone; we design for presence, comfort, and lasting wardrobe value.",
    },
    {
      heading: "Design Direction",
      body: "From soft festive tones to stronger metallic and earthy palettes, each range is curated to serve different moods and occasions. Silhouettes are crafted to feel elegant, versatile, and practical for real celebrations.",
    },
    {
      heading: "Our Craft Values",
      body: "Precision, finesse, and consistency guide the way every article is developed. From concept to finishing, FLOSSIE teams focus on stitching quality, fabric behavior, and visual harmony in embroidery placement.",
    },
  ];

  const promiseList = [
    "Premium quality fabrics selected for drape, texture, and comfort.",
    "Signature detailing inspired by floral motifs and eastern craft heritage.",
    "Versatile collections designed for festive, formal, and occasional wear.",
    "Customer-first support for sizing, order guidance, and policy clarity.",
    "A long-term focus on building trust through consistency and transparency.",
  ];

  return (
    <section className="bg-gradient-to-b from-stone-100 to-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <motion.p
          className="text-[11px] tracking-[0.24em] uppercase text-stone-500"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Crafting Luxury For You
        </motion.p>
        <motion.h1
          className="font-serif text-4xl md:text-6xl text-stone-900 mt-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          About FLOSSIE
        </motion.h1>

        <motion.div
          className="mt-8 border-l-2 border-stone-300 pl-5 md:pl-6 max-w-3xl"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-stone-700 text-base md:text-lg leading-relaxed">
            FLOSSIE houses one of the most sought-after embroidered fabric
            collections for women, blending ethnic soul with contemporary style.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {cards.map((item, idx) => (
            <motion.article
              key={item.title}
              className="rounded-2xl bg-white border border-stone-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 + idx * 0.08 }}
            >
              <item.icon size={18} className="text-stone-500 mb-3" />
              <h2 className="font-serif text-2xl text-stone-900">{item.title}</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{item.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {storyBlocks.map((item, idx) => (
            <motion.article
              key={item.heading}
              className="rounded-2xl border border-stone-200 bg-white p-6"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 + idx * 0.08 }}
            >
              <h3 className="font-serif text-2xl text-stone-900">{item.heading}</h3>
              <p className="mt-3 text-stone-600 leading-relaxed text-sm md:text-base">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="mt-10 rounded-2xl bg-stone-900 text-white p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
        >
          <h3 className="font-serif text-3xl">Our Promise To You</h3>
          <ul className="mt-4 space-y-2 text-white/90 text-sm md:text-base">
            {promiseList.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="mt-5 text-white/70 text-sm">
            FLOSSIE is committed to crafting luxury that feels personal, expressive, and dependable.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
