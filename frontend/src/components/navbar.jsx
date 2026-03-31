import { useState, useEffect, memo, useMemo } from "react";
import { Menu, X, Search, ShoppingCart, User, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/FLOSSIE_black_logo_6ba32254-9e65-4dab-a88a-b5d1b663f62a.avif";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../context/features/user/userSlice";
import { toggleCart, resetCart } from "../context/features/cart/cartSlice";
import CartDrawer from "./CartDrawer";

const announcements = [
  "FREE SHIPPING IN PAKISTAN & DELIVERING GLOBALLY",
  "NEW ARRIVALS: SUMMER COLLECTION 2026 IS HERE",
  "FLAT 10% OFF ON YOUR FIRST PURCHASE - USE CODE: FIRST10",
];

const Navbar = () => {

  const [open, setOpen] = useState(false);
  const [currentAnnoIndex, setCurrentAnnoIndex] = useState(0);
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { items } = useSelector((state) => state.cart);
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
    location.pathname
  );

  useEffect(() => {
    if (isAuthPage) return;
    const timer = setInterval(() => {
      setCurrentAnnoIndex((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAuthPage]);

  const cartCount = useMemo(
    () => items.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [items]
  );

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-50">
        {!isAuthPage && (
          <div className="w-full bg-stone-100 text-stone-800 text-center h-8 flex items-center justify-center overflow-hidden border-b border-stone-200">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentAnnoIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] font-medium px-4"
              >
                {announcements[currentAnnoIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        <nav className="w-full bg-white border-b border-stone-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
            {!isAuthPage && (
              <div className="flex items-center gap-4 md:gap-6">
                <button
                  onClick={() => setOpen(true)}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <Menu size={24} strokeWidth={1.5} />
                </button>
                <Search
                  size={22}
                  strokeWidth={1.5}
                  className="cursor-pointer"
                />
              </div>
            )}

            <Link
              to="/"
              className={`transition-all duration-300 ${
                isAuthPage
                  ? "mx-auto scale-125"
                  : "absolute left-1/2 -translate-x-1/2"
              }`}
            >
              <img
                src={logo}
                alt="Logo"
                className={`object-contain transition-all duration-300 ${
                  isAuthPage ? "h-12 md:h-15" : "h-10 md:h-12"
                }`}
              />
            </Link>

            {!isAuthPage && (
              <div className="flex items-center gap-4 md:gap-6">
                {user ? (
                  <div className="flex items-center gap-4 md:gap-6">
                    <Link
                      to="/order-status"
                      className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity"
                      title="My Orders"
                    >
                      <ShoppingBag size={22} strokeWidth={1.5} />
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      {user.Avatar ? (
                        <img
                          src={user.Avatar}
                          alt="Avatar"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <User size={22} strokeWidth={1.5} />
                      )}
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="hover:opacity-70 transition-opacity"
                  >
                    <User size={22} strokeWidth={1.5} />
                  </Link>
                )}

                <div 
                  onClick={() => dispatch(toggleCart())}
                  className="relative cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <ShoppingCart size={22} strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-stone-50">
              <span className="text-xs tracking-widest font-semibold uppercase">
                Menu
              </span>
              <X
                size={22}
                onClick={() => setOpen(false)}
                className="cursor-pointer hover:rotate-90 transition-transform"
              />
            </div>

            <ul className="flex flex-col pt-4">
              {[
                { name: "Home", path: "/" },
                { name: "New Arrivals", path: "/new-arrival" },
                { name: "Kohinoor", path: "/kohinoor" },
                { name: "Customer Favorites-RESTOCKED", path: "/customer-fav" },
                { name: "Flossie Executive", path: "/flossie-executive" },
                { name: "Safeera", path: "/safeera" },
                { name: "Velvet", path: "/velvet" },
                { name: "Dastaan", path: "/dastaan" },
                { name: "Track My Orders", path: "/order-status" },
                { name: "Shop All", path: "/shop-all" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="px-8 py-4 text-sm tracking-wide text-stone-600 hover:text-black hover:bg-stone-50 transition-all border-b border-stone-50/50"
                >
                  {item.name}
                </Link>
              ))}
            </ul>

            <div className="mt-auto p-8 border-t border-stone-50">
              {user ? (
                <button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(resetCart());
                    setOpen(false);
                  }}
                  className="w-full py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-black transition-colors cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-black transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
};

export default memo(Navbar);

