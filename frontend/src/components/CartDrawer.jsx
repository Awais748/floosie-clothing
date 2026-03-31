import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import {
  closeCart,
  removeFromCartAction,
  updateQuantityAction,
} from "../context/features/cart/cartSlice";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center">
                  <ShoppingBag size={18} className="text-stone-900" />
                </div>
                <div>
                  <h2 className="text-lg font-light tracking-tight text-stone-900">
                    Shopping Cart
                  </h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">
                    {items.length} {items.length === 1 ? "Item" : "Items"}{" "}
                    selected
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-stone-200" />
                  </div>
                  <div>
                    <h3 className="text-stone-900 font-light">
                      Your cart is empty
                    </h3>
                    <p className="text-stone-400 text-sm mt-1">
                      Add items to start shopping
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="mt-4 px-8 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-black transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    key={`${item.productId}-${item.size || ""}-${
                      item.color || ""
                    }`}
                    className="flex gap-4 group"
                  >
                    <div className="w-24 h-32 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0 border border-stone-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-light text-stone-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() =>
                              dispatch(
                                removeFromCartAction({
                                  productId: item.productId,
                                  size: item.size,
                                  color: item.color,
                                })
                              )
                            }
                            className="text-stone-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                          {item.category}
                        </p>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            {item.size && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 bg-stone-50 border border-stone-100 rounded-lg p-1">
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantityAction({
                                  productId: item.productId,
                                  size: item.size,
                                  color: item.color,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all text-stone-500 hover:text-stone-900"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantityAction({
                                  productId: item.productId,
                                  size: item.size,
                                  color: item.color,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all text-stone-500 hover:text-stone-900"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          {item.originalPrice &&
                          item.originalPrice > item.price ? (
                            <>
                              <p className="text-xs text-stone-400 line-through decoration-stone-300">
                                Rs.{" "}
                                {(
                                  item.originalPrice * item.quantity
                                ).toLocaleString()}
                              </p>
                              <p className="text-sm font-bold text-stone-900">
                                Rs.{" "}
                                {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-stone-900">
                              Rs.{" "}
                              {(
                                (item.price || 0) * (item.quantity || 1)
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-stone-50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Shipping</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900">
                      Calculated at checkout
                    </span>
                  </div>
                  <div className="h-px bg-stone-200 my-4" />
                  <div className="flex justify-between items-end">
                    <span className="text-stone-900 font-light uppercase tracking-[0.2em] text-xs">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-stone-900">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="w-full bg-stone-900 text-white rounded-xl py-4 text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
                >
                  Proceed to Checkout
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <p className="text-center text-[9px] text-stone-400 uppercase tracking-widest">
                  Secure Checkout · Worldwide Shipping
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
