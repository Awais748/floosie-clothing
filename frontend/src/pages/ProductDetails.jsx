import React, { useEffect, useState, memo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Package,
  Star,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  fetchProductById,
  clearCurrentProduct,
} from "../context/features/product/productSlice";
import { addToCart } from "../context/features/cart/cartSlice";

// Schema categories: "Kohinoor" | "FlossieExecutive" | "Safeera" | "Velvet" | "Dastaan"
const CATEGORY_ROUTES = {
  Kohinoor: "/kohinoor",
  FlossieExecutive: "/flossie-executive",
  Safeera: "/safeera",
  Velvet: "/velvet",
  Dastaan: "/dastaan",
};

const COLOR_MAP = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#FF0000",
  Navy: "#000080",
  Maroon: "#800000",
  Emerald: "#046307",
  Gold: "#D4AF37",
  Beige: "#F5F5DC",
  Pink: "#FFC0CB",
  Lavender: "#E6E6FA",
};

const LIGHT_COLORS = new Set(["White", "Gold", "Beige", "Pink", "Lavender"]);

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentProduct: product,
    loading,
    error,
  } = useSelector((state) => state.product);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const fetchedIdRef = useRef(null);

  useEffect(() => {
    if (fetchedIdRef.current !== id) {
      dispatch(fetchProductById(id));
      fetchedIdRef.current = id;
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  // ── Derived values ──────────────────────────────────────────────
  const isOnSale =
    product?.salePrice != null && product.salePrice < product.price;
  const displayPrice = isOnSale ? product.salePrice : product?.price;
  const isOutOfStock = product?.stock === 0;
  const categoryRoute = product
    ? CATEGORY_ROUTES[product.category] ?? `/${product.category.toLowerCase()}`
    : "#";

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: displayPrice,
        originalPrice: product.price,
        category: product.category,
        image: product.images?.[0],
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    );
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    navigate("/checkout", {
      state: {
        buyItNowItem: {
          productId: product._id,
          name: product.name,
          price: displayPrice,
          originalPrice: product.price,
          category: product.category,
          image: product.images?.[0],
          quantity,
          size: selectedSize,
          color: selectedColor,
        },
      },
    });
  };

  // ── Loading / error states ──────────────────────────────────────
  if (loading || (!product && !error)) {
    return <LoadingSpinner fullPage />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
          <Package size={32} className="text-stone-300" />
        </div>
        <h2 className="text-2xl font-light text-stone-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-stone-400 mb-8 max-w-xs">
          The product you are looking for might have been removed or is
          temporarily unavailable.
        </p>
        <Link
          to="/shop-all"
          className="px-8 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-lg hover:bg-black transition-all"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400">
        <Link to="/" className="hover:text-stone-900 transition-colors">
          Home
        </Link>
        <ChevronRight size={10} />
        <Link
          to={categoryRoute}
          className="hover:text-stone-900 transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight size={10} />
        <span className="text-stone-900 font-medium truncate">
          {product.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 lg:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          {/* ── Left: Image Gallery ── */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-[3/4] w-16 sm:w-20 md:w-full rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === idx
                        ? "border-stone-900 shadow-md scale-95"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 aspect-[1/1.2] sm:aspect-[3/4] relative bg-stone-50 rounded-2xl overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  src={product.images?.[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && (
                  <span className="bg-stone-900 text-white text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-lg">
                    New Arrival
                  </span>
                )}
                {isOnSale && (
                  <span className="bg-red-500 text-white text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Special Offer
                  </span>
                )}
                {product.isCustomerFavorite && (
                  <span className="bg-amber-500 text-white text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star size={9} fill="white" /> Favourite
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-stone-400 text-white text-[9px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="space-y-6 lg:sticky lg:top-32">
              {/* Title & meta */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight leading-tight italic">
                  {product.name}
                </h1>
                <p className="text-xs text-stone-400 mt-2 tracking-widest uppercase font-medium">
                  SKU: {product.code}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                {isOnSale ? (
                  <>
                    <span className="text-3xl font-bold text-stone-900">
                      Rs. {product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-stone-400 line-through decoration-stone-300">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                      {Math.round(
                        ((product.price - product.salePrice) / product.price) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-stone-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="h-px bg-stone-100" />

              {/* Description — from schema field */}
              <div className="space-y-4">
                {product.description ? (
                  <p className="text-base text-stone-600 leading-relaxed font-light">
                    {product.description}
                  </p>
                ) : null}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-900">
                        Select Size
                      </p>
                      <button className="text-[9px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[50px] h-10 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            selectedSize === size
                              ? "bg-stone-900 text-white border-stone-900 shadow-md"
                              : "bg-white text-stone-500 border-stone-100 hover:border-stone-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-900">
                      Color:{" "}
                      <span className="text-stone-400 font-medium">
                        {selectedColor}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color, i) => {
                        const hex = COLOR_MAP[color] ?? "#e7e5e4";
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center relative ${
                              selectedColor === color
                                ? "ring-2 ring-stone-900 ring-offset-2 scale-110"
                                : "border-stone-100 hover:scale-110"
                            }`}
                            style={{ backgroundColor: hex }}
                            title={color}
                          >
                            {selectedColor === color && (
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  LIGHT_COLORS.has(color)
                                    ? "bg-black"
                                    : "bg-white"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock indicator */}
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold pt-2">
                    Only {product.stock} left in stock!
                  </p>
                )}
              </div>

              {/* Quantity & CTA */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-4">
                    {/* Quantity selector */}
                    <div className="flex items-center justify-between gap-4 bg-stone-50 border border-stone-100 rounded-xl p-2 px-4 shrink-0 grow sm:grow-0">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={isOutOfStock}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-all text-stone-500 hover:text-stone-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center text-lg font-medium text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((q) => Math.min(product.stock, q + 1))
                        }
                        disabled={isOutOfStock || quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-all text-stone-500 hover:text-stone-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="flex-1 bg-white text-stone-900 border border-stone-100 rounded-xl py-4 h-16 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold shadow-sm hover:bg-stone-50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      <ShoppingBag size={18} />
                      <span className="hidden xs:inline">Add to Cart</span>
                      <span className="xs:hidden">Add</span>
                    </button>
                  </div>

                  {/* Buy It Now */}
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full bg-slate-900 text-white rounded-xl py-4 h-16 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold shadow-2xl shadow-slate-200 hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isOutOfStock ? "Out of Stock" : "Buy It Now"}
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 pt-8">
                <div className="flex items-center gap-3 p-4 bg-stone-50/50 rounded-xl border border-stone-100/50">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-900">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">
                      Global Shipping
                    </h4>
                    <p className="text-[9px] text-stone-400 mt-1 uppercase">
                      Tracked deliveries worldwide
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-stone-50/50 rounded-xl border border-stone-100/50">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-900">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">
                      Easy Returns
                    </h4>
                    <p className="text-[9px] text-stone-400 mt-1 uppercase">
                      within 7 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductDetails);
