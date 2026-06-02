import React, { useEffect, useRef, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck, MessageCircle } from "lucide-react";
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
        link: "/new-arrival", 
      },
      {
        title: "Dastaan Heritage",
        subtitle: "A Traditional Story",
        data: homeCollections.Dastaan,
        link: "/dastaan", 
      },
      {
        title: "Kohinoor Collection",
        subtitle: "Timeless Elegance",
        data: homeCollections.Kohinoor,
        link: "/kohinoor", 
      },
      {
        title: "Flossie Executive",
        subtitle: "Modern Professional",
        data: homeCollections.FlossieExecutive,
        link: "/flossie-executive", 
      },
      {
        title: "Customer Favorites",
        subtitle: "Restocked — Most Loved",
        data: homeCollections.CustomerFav,
        link: "/customer-fav", 
      },
      {
        title: "Safeera Collection",
        subtitle: "Elegant Everyday",
        data: homeCollections.Safeera,
        link: "/safeera", 
      },
      {
        title: "Velvet Collection",
        subtitle: "Luxurious Touch",
        data: homeCollections.Velvet,
        link: "/velvet", 
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

      <section className="mt-24 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#f8f4ef] border border-stone-200 p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
              FLOSSIE EDIT
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl text-stone-900 leading-tight">
              Elegance That Feels Effortless
            </h2>
            <p className="mt-4 text-stone-600 text-sm md:text-base leading-relaxed">
              Crafted for modern women who love timeless eastern wear, with graceful embroidery,
              flattering cuts, and premium finishing in every piece.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-9">
            {[
              {
                icon: <Sparkles size={16} className="text-stone-600" />,
                title: "Fine Embroidery",
                desc: "Elegant details inspired by timeless craft.",
              },
              {
                icon: <ShieldCheck size={16} className="text-stone-600" />,
                title: "Quality Checked",
                desc: "Designed and reviewed for premium finish.",
              },
              {
                icon: <Truck size={16} className="text-stone-600" />,
                title: "Smooth Delivery",
                desc: "Fast shipping with reliable order tracking.",
              },
              {
                icon: <MessageCircle size={16} className="text-stone-600" />,
                title: "Style Support",
                desc: "Help with sizing, orders, and outfit guidance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-stone-200 p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
                  {item.icon}
                </div>
                <h3 className="mt-3 text-stone-900 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-stone-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop-all"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-stone-800 transition-colors"
            >
              Shop The Collection <ArrowRight size={15} />
            </Link>
            <a
              href="https://wa.me/923084318888"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-stone-300 text-stone-800 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-white transition-colors"
            >
              WhatsApp Us <MessageCircle size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

export default Home;
