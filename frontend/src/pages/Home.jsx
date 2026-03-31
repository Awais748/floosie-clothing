import React, { useEffect, useRef, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Package, ShieldCheck } from "lucide-react";
import { fetchHomeProducts } from "../context/features/product/productSlice";
import HeroSection from "../components/HeroSection";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Home = memo(() => {
  const dispatch = useDispatch();
  const { homeCollections, loading } = useSelector((state) => state.product);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      dispatch(fetchHomeProducts());
      fetchedRef.current = true;
    }
  }, [dispatch]);

  const sections = useMemo(
    () => [
      {
        title: "New Arrivals",
        subtitle: "Fresh Drops",
        data: homeCollections.NewArrivals,
        link: "/new-arrival", // ✅ Navbar se match
      },
      {
        title: "Dastaan Heritage",
        subtitle: "A Traditional Story",
        data: homeCollections.Dastaan,
        link: "/dastaan", // ✅ Fix: /collections/dastaan → /dastaan
      },
      {
        title: "Kohinoor Collection",
        subtitle: "Timeless Elegance",
        data: homeCollections.Kohinoor,
        link: "/kohinoor", // ✅ Fix: /collections/kohinoor → /kohinoor
      },
      {
        title: "Flossie Executive",
        subtitle: "Modern Professional",
        data: homeCollections.FlossieExecutive,
        link: "/flossie-executive", // ✅ Fix: /collections/flossie-executive → /flossie-executive
      },
      {
        title: "Customer Favorites",
        subtitle: "Restocked — Most Loved",
        data: homeCollections.CustomerFav,
        link: "/customer-fav", // ✅ Navbar se match
      },
    ],
    [homeCollections]
  );

  const isFirstLoad =
    loading && Object.values(homeCollections).every((arr) => arr.length === 0);

  if (isFirstLoad) return <LoadingSpinner fullPage />;

  return (
    <div>
      <HeroSection />

      <div className="bg-stone-50/30 py-16 space-y-24">
        {sections.map((section, index) => (
          <section key={index} className="max-w-7xl mx-auto px-4">
            <SectionHeading title={section.title} subtitle={section.subtitle} />

            <ProductGrid customProducts={section.data} hideHero />

            <div className="flex justify-center mt-10">
              <Link
                to={section.link}
                className="inline-block bg-stone-900 text-white text-[11px] font-medium px-8 py-3 uppercase tracking-[0.2em] hover:bg-stone-800 transition-all duration-300"
              >
                View All
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* Footer Feature Strip */}
      <section className="bg-stone-900 py-20 px-4 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              icon: <Package size={24} className="text-white/80" />,
              title: "Premium Craftsmanship",
              desc: "Every piece handcrafted with meticulous attention to traditional artistry.",
            },
            {
              icon: <ShieldCheck size={24} className="text-white/80" />,
              title: "Verified Quality",
              desc: "Rigorous checks ensure every garment meets our legacy of excellence.",
            },
            {
              icon: <ArrowRight size={24} className="text-white/80" />,
              title: "Global Delivery",
              desc: "Bringing the essence of FLOSSIE to your doorstep, anywhere in the world.",
            },
          ].map((feature, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.25em]">
                {feature.title}
              </h3>
              <p className="text-stone-400 text-[10px] tracking-widest leading-relaxed max-w-[240px] mx-auto">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-20 pt-12 border-t border-white/5 text-center">
          <p className="text-white/30 text-[9px] uppercase tracking-[0.5em] font-medium italic">
            Crafting Luxury · Since 2024
          </p>
        </div>
      </section>
    </div>
  );
});

export default Home;
