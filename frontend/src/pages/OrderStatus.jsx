import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../context/features/user/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";

const OrderStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userOrders, loading, error } = useSelector(
    (state) => state.user
  );

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!didFetchRef.current) {
      dispatch(fetchUserOrders());
      didFetchRef.current = true;
    }
  }, [user, dispatch, navigate]);
  if (loading && userOrders.length === 0) return <LoadingSpinner fullPage />;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case "Shipped":
        return <Truck className="text-blue-500" size={20} />;
      case "Processing":
        return <Package className="text-indigo-500" size={20} />;
      default:
        return <Clock className="text-amber-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Processing":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-black hover:border-black transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
                Track My Orders
              </h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1 font-bold">
                View & Track your purchases
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by Order ID..."
              className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-600 outline-none focus:ring-2 focus:ring-stone-200 w-full sm:w-64 transition-all pr-10"
            />
            <Search
              className="absolute right-3 top-2.5 text-stone-300"
              size={16}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] uppercase tracking-widest font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {userOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center border border-stone-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-stone-200" />
            </div>
            <h3 className="text-lg font-light text-stone-900">
              No orders found
            </h3>
            <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto">
              You haven't placed any orders yet. Start shopping to see your
              order history.
            </p>
            <Link
              to="/shop-all"
              className="inline-block mt-8 px-8 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-lg hover:bg-black transition-all shadow-lg"
            >
              Explore Collections
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group"
              >
                {/* Order Status Header */}
                <div className="px-6 py-4 bg-stone-50/50 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
                        Status
                      </p>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
                      Order ID
                    </p>
                    <p className="text-xs font-bold text-stone-900 mt-1">
                      #{order._id?.slice(-12).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
                      Placed On
                    </p>
                    <p className="text-xs font-bold text-stone-900 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
                      Total
                    </p>
                    <p className="text-sm font-black text-stone-900 mt-1 tracking-tight">
                      Rs. {order.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-16 h-20 bg-stone-50 rounded-lg overflow-hidden border border-stone-100 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">
                              Qty: {item.quantity} · {item.size || "N/A"} ·{" "}
                              {item.color || "N/A"}
                            </p>
                            <p className="text-[11px] font-black text-stone-900 mt-1">
                              Rs. {item.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <h5 className="text-[10px] text-stone-400 uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                        <Truck size={12} /> Shipping Destination
                      </h5>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-stone-900">
                          {order.shippingDetails?.fullName}
                        </p>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                          {order.shippingDetails?.address}
                          <br />
                          {order.shippingDetails?.city},{" "}
                          {order.shippingDetails?.state}{" "}
                          {order.shippingDetails?.zip}
                        </p>
                        <div className="pt-2 border-t border-stone-200/50 mt-2">
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                            Payment Method
                          </p>
                          <p className="text-[11px] font-black text-stone-900">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline (Visual Only for now) */}
                  <div className="mt-8 pt-6 border-t border-stone-50">
                    <div className="flex items-center justify-between text-stone-300">
                      {[
                        {
                          label: "Ordered",
                          date: new Date(order.createdAt).toLocaleDateString(),
                          active: true,
                        },
                        {
                          label: "Processing",
                          date: "Pending",
                          active: [
                            "Processing",
                            "Shipped",
                            "Delivered",
                          ].includes(order.status),
                        },
                        {
                          label: "Shipped",
                          date: "Pending",
                          active: ["Shipped", "Delivered"].includes(
                            order.status
                          ),
                        },
                        {
                          label: "Delivered",
                          date: "Pending",
                          active: order.status === "Delivered",
                        },
                      ].map((step, i, arr) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                step.active
                                  ? "bg-stone-900 text-white shadow-lg shadow-stone-200"
                                  : "bg-stone-100 text-stone-300 border border-stone-200"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  step.active ? "bg-white" : "bg-stone-300"
                                }`}
                              />
                            </div>
                            <p
                              className={`text-[9px] uppercase tracking-widest font-black ${
                                step.active
                                  ? "text-stone-900"
                                  : "text-stone-300"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                          {i < arr.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 mb-6 ${
                                step.active && arr[i + 1].active
                                  ? "bg-stone-900"
                                  : "bg-stone-100"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
