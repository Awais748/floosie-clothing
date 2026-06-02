import { createElement } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Music2,
  Pin,
} from "lucide-react";

const customerCareLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQs", to: "/faqs" },
  { label: "Track Your Order", to: "/order-status" },
];

const shopLinks = [
  { label: "New Arrivals", to: "/new-arrival", highlight: true },
  { label: "Kohinoor", to: "/kohinoor" },
  { label: "Flossie Executive", to: "/flossie-executive" },
  { label: "Velvet", to: "/velvet" },
  { label: "Shop All", to: "/shop-all" },
  { label: "Safeera", to: "/safeera" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Return & Exchange", to: "/return-exchange" },
  { label: "Delivery Policy", to: "/delivery-policy" },
  { label: "Size Guide", to: "/size-guide" },
  { label: "Terms of service", to: "/terms" },
];

const socials = [
  { icon: Facebook, href: "https://facebook.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Pin, href: "https://pinterest.com" },
  { icon: Youtube, href: "https://youtube.com" },
  { icon: Music2, href: "https://tiktok.com" },
  { icon: MessageCircle, href: "https://wa.me/923084318888" },
];

const Footer = () => {
  return (
    <>
      <footer className="bg-[#151515] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 md:gap-10">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/95 mb-5">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-[20px] sm:text-[17px] md:text-[18px] leading-snug font-light font-serif text-white/90">
              {customerCareLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://wa.me/923084318888"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1"
                >
                  WhatsApp: +92 308 4318888
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923084318888"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1"
                >
                  Join WhatsApp Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/95 mb-5">
              Shop
            </h3>
            <ul className="space-y-2.5 text-[20px] sm:text-[17px] md:text-[18px] leading-snug font-light font-serif text-white/90">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`inline-block transition-all duration-200 hover:translate-x-1 ${
                      item.highlight
                        ? "text-red-500 font-medium hover:text-red-400"
                        : "hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/95 mb-5">
              Our Policies
            </h3>
            <ul className="space-y-2.5 text-[20px] sm:text-[17px] md:text-[18px] leading-snug font-light font-serif text-white/90">
              {policyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/95 mb-5">
              Newsletter
            </h3>
            <p className="text-[19px] sm:text-[17px] md:text-[18px] leading-snug font-light font-serif text-white/90 max-w-sm">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="mt-6 max-w-sm">
              <input
                type="email"
                placeholder="E-mail"
                className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-white text-sm outline-none transition-colors focus:border-white/60 hover:border-white/40 placeholder:text-white/55"
              />
              <button
                type="button"
                className="mt-3.5 bg-white text-black text-sm tracking-[0.03em] px-7 py-2.5 hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-200"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5 text-white/85">
            {socials.map(({ icon, href }, index) => (
              <a
                key={index}
                href={href}
                className="hover:text-white hover:-translate-y-0.5 transition-all duration-200"
                target="_blank"
                rel="noreferrer"
              >
                {createElement(icon, { size: 18, strokeWidth: 1.6 })}
              </a>
            ))}
          </div>
          <p className="text-white/75 text-xs tracking-[0.06em]">© 2026 - FLOSSIE</p>
        </div>
      </footer>

      <a
        href="https://wa.me/923084318888"
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-4 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 z-40"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={27} strokeWidth={2.2} />
      </a>
    </>
  );
};

export default Footer;
