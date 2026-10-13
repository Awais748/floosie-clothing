import React, { useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../context/features/product/productSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Heart } from "lucide-react";
import { addToCart } from "../context/features/cart/cartSlice";
import {
  toggleGuestFavorite,
  addFavoriteAPI,
  removeFavoriteAPI,
} from "../context/features/wishlist/wishlistSlice";
import LoadingSpinner from "./common/LoadingSpinner";

const categoryLabels = {
  Kohinoor: "Kohinoor Collection",
  FlossieExecutive: "Flossie Executive",
  Safeera: "Safeera Collection",
  Velvet: "Velvet Collection",
  Dastaan: "Dastaan Heritage",
};

const ProductGrid = memo(
  ({
    category,
    customerFav,
    newArrival,
    title,
    subtitle,
    customProducts,
    hideHero,
  }) => {
    const dispatch = useDispatch();
    const {
      products: reduxProducts,
      listLoading,
      page,
      totalPages,
    } = useSelector((state) => state.product);

    const { user, token } = useSelector((state) => state.user);
    const { favorites } = useSelector((state) => state.wishlist);

    const isFavorited = (productId) => favorites.includes(productId);

    const handleToggleFavorite = (e, productId) => {
      e.preventDefault();
      e.stopPropagation();
      if (token) {
        // Logged-in: toggle via API
        if (isFavorited(productId)) {
          dispatch(removeFavoriteAPI(productId));
        } else {
          dispatch(addFavoriteAPI(productId));
        }
      } else {
        // Guest: toggle in localStorage
        dispatch(toggleGuestFavorite(productId));
      }
    };

    const products = customProducts ?? reduxProducts;

    // ⚡ page dependency add kiya — page change pe refetch hoga
    useEffect(() => {
      if (customProducts === undefined) {
        dispatch(
          fetchProducts({ category, customerFav, newArrival, page, limit: 12 })
        );
      }
    }, [category, customerFav, newArrival, customProducts, dispatch, page]);

    const pageTitle =
      title || (category ? categoryLabels[category] : "All Products");
    const pageSubtitle =
      subtitle ||
      (customerFav
        ? "Hand-picked favorites from every collection"
        : newArrival
        ? "Fresh drops you don't want to miss"
        : "Browse our curated selections");

    const handlePageChange = (newPage) => {
      dispatch(
        fetchProducts({
          category,
          customerFav,
          newArrival,
          page: newPage,
          limit: 12,
        })
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <div
        className={hideHero ? "" : "min-h-[calc(100dvh-80px)] bg-stone-50/30"}
      >
        {/* Hero Header */}
        {!hideHero && (
          <div className="bg-gradient-to-b from-stone-100/50 to-transparent pt-10 sm:pt-16 pb-6 sm:pb-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 italic mb-3"
              >
                {pageTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-stone-400 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium"
              >
                {pageSubtitle}
              </motion.p>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 ${
            hideHero ? "" : "pb-16"
          }`}
        >
          {listLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-stone-300" />
              </div>
              <h3 className="text-lg font-light text-stone-900 mb-2">
                No products yet
              </h3>
              <p className="text-stone-400 text-sm">
                This collection is coming soon
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Link to={`/product/${product._id}`} className="block">
                      <div className="aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden relative mb-3">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-full h-full group/img overflow-hidden">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              loading="lazy"
                              className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
                                product.images[1]
                                  ? "group-hover:opacity-0 group-hover:scale-110"
                                  : "group-hover:scale-105"
                              }`}
                            />
                            {product.images[1] && (
                              <img
                                src={product.images[1]}
                                alt={`${product.name} alternate`}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out scale-110 group-hover:scale-100"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={40} className="text-stone-200" />
                          </div>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          {product.isNewArrival && (
                            <span className="bg-stone-900 text-white text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full">
                              New
                            </span>
                          )}
                          {product.salePrice &&
                            product.salePrice < product.price && (
                              <span className="bg-red-500 text-white text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full">
                                Sale
                              </span>
                            )}
                        </div>

                        {/* Heart / Wishlist button */}
                        <motion.button
                          onClick={(e) => handleToggleFavorite(e, product._id)}
                          whileTap={{ scale: 0.85 }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group/heart cursor-pointer"
                          aria-label={isFavorited(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <motion.div
                            animate={{ 
                              scale: isFavorited(product._id) ? [1, 1.4, 1] : 1,
                              color: isFavorited(product._id) ? "#ef4444" : "#a8a29e",
                            }}
                            transition={{ 
                              duration: 0.4, 
                              type: "spring", 
                              bounce: 0.5 
                            }}
                            className="flex items-center justify-center"
                          >
                            <Heart 
                              size={16} 
                              className={`transition-colors duration-200 ${isFavorited(product._id) ? "fill-red-500 text-red-500" : "text-stone-400 group-hover/heart:text-red-400"}`} 
                              strokeWidth={isFavorited(product._id) ? 0 : 2}
                            />
                          </motion.div>
                        </motion.button>

                        <div className="absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 translate-y-0 md:translate-y-4 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              dispatch(
                                addToCart({
                                  productId: product._id,
                                  name: product.name,
                                  price: product.salePrice || product.price,
                                  originalPrice: product.price,
                                  category: product.category,
                                  image: product.images[0],
                                })
                              );
                            }}
                            className="w-full bg-white/95 text-stone-900 py-2.5 md:py-3 rounded-lg text-[9px] md:text-[10px] uppercase tracking-widest font-bold shadow-xl hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Plus size={14} />
                            <span className="hidden xs:inline">
                              Add to Cart
                            </span>
                            <span className="xs:hidden">Add</span>
                          </button>
                        </div>
                      </div>

                      <div className="px-1">
                        <h3 className="text-[12px] md:text-sm font-light text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {product.salePrice &&
                          product.salePrice < product.price ? (
                            <>
                              <span className="text-[12px] md:text-sm font-medium text-stone-900">
                                Rs. {product.salePrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] md:text-xs text-stone-400 line-through">
                                Rs. {product.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-[12px] md:text-sm font-medium text-stone-900">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* ✅ Pagination — sirf tab dikhao jab customProducts nahi aur pages 1 se zyada ho */}
              {!customProducts && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-stone-200 rounded-lg hover:bg-stone-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={`w-9 h-9 text-[11px] font-bold rounded-lg border transition-all ${
                          num === page
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 hover:border-stone-900 text-stone-600"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-stone-200 rounded-lg hover:bg-stone-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

export default ProductGrid;
