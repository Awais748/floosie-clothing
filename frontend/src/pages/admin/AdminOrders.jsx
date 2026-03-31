import React, {
  useEffect,
  memo,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../context/features/user/userSlice";
import {
  Package,
  Truck,
  Clock,
  ChevronDown,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";


const STATUS_OPTIONS = ["Pending", "Shipped", "Delivered", "Cancelled"];

const STATUS_STYLES = {
  pending: "bg-amber-50   text-amber-600   border-amber-100",
  shipped: "bg-blue-50    text-blue-600    border-blue-100",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  cancelled: "bg-red-50     text-red-600     border-red-100",
};


const Toast = memo(({ message, type }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-bold transition-all animate-fade-in ${
      type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    }`}
  >
    {type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
    {message}
  </div>
));
Toast.displayName = "Toast";


const AdminOrders = () => {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingIds, setUpdatingIds] = useState({}); 

  const [toast, setToast] = useState(null);

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!didFetchRef.current) {
      dispatch(fetchAllOrders());
      didFetchRef.current = true;
    }
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    didFetchRef.current = false;
    dispatch(fetchAllOrders());
    didFetchRef.current = true;
  }, [dispatch]);

  const handleStatusChange = useCallback(
    async (userId, orderId, newStatus) => {
      setUpdatingIds((prev) => ({ ...prev, [orderId]: true }));
      try {
        const result = await dispatch(
          updateOrderStatus({ userId, orderId, status: newStatus })
        ).unwrap();

        showToast(`Status → ${newStatus}`, "success");
      } catch (err) {
        showToast("Update failed. Try again.", "error");
      } finally {
        setUpdatingIds((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [dispatch]
  );

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = useMemo(
    () =>
      STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = allOrders.filter(
          (o) => o.status?.toLowerCase() === s.toLowerCase()
        ).length;
        return acc;
      }, {}),
    [allOrders]
  );

  const filteredOrders = useMemo(
    () =>
      allOrders.filter((order) => {
        const matchStatus =
          statusFilter === "All" ||
          order.status?.toLowerCase() === statusFilter.toLowerCase();
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !q ||
          order.customerName?.toLowerCase().includes(q) ||
          order.customerEmail?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
      }),
    [allOrders, statusFilter, searchTerm]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Manage Orders
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Monitor and process all purchases.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 text-stone-500 hover:text-stone-900 border border-stone-200 bg-white rounded-lg transition-all disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="hidden sm:block px-3 py-2 bg-stone-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-stone-500">
            {allOrders.length} orders
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
            className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
              statusFilter === s
                ? "border-stone-900 bg-stone-900"
                : "bg-white border-stone-100 hover:border-stone-300"
            }`}
          >
            <p
              className={`text-xl sm:text-2xl font-black ${
                statusFilter === s ? "text-white" : "text-stone-900"
              }`}
            >
              {stats[s] || 0}
            </p>
            <p
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-0.5 sm:mt-1 ${
                statusFilter === s ? "text-white/60" : "text-stone-400"
              }`}
            >
              {s}
            </p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-100 shadow-sm space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={15}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-lg text-sm focus:ring-2 focus:ring-stone-200 outline-none"
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...STATUS_OPTIONS].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === f
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest shrink-0">
            {filteredOrders.length}/{allOrders.length}
          </span>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3 sm:space-y-0 sm:bg-white sm:rounded-2xl sm:border sm:border-stone-100 sm:shadow-sm sm:overflow-hidden">
        {loading && allOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 py-20">
            <LoadingSpinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <Package size={36} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400 text-sm italic">No orders found.</p>
          </div>
        ) : (
          <div className="sm:divide-y sm:divide-stone-50">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                isUpdating={!!updatingIds[order._id]}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Order Row (extracted to avoid full-list re-render) ───────────────────────

const OrderRow = memo(({ order, isUpdating, onStatusChange }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-none border border-stone-100 sm:border-0 shadow-sm sm:shadow-none p-4 sm:p-6 lg:p-8 hover:bg-stone-50/30 transition-all">
      {/* Top: status dropdown + date + total */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status dropdown */}
          <div className="relative flex items-center">
            <select
              value={order.status}
              onChange={(e) =>
                onStatusChange(order.userId, order._id, e.target.value)
              }
              disabled={isUpdating}
              className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all disabled:opacity-60 disabled:cursor-wait ${
                STATUS_STYLES[order.status?.toLowerCase()] ||
                "bg-stone-100 text-stone-600 border-stone-200"
              }`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {isUpdating ? (
              <Loader2
                size={9}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none animate-spin opacity-60"
              />
            ) : (
              <ChevronDown
                size={9}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
              />
            )}
          </div>

          <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
            <Clock size={10} className="text-stone-300" />
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <p className="text-sm font-black text-stone-900 shrink-0">
          Rs. {order.totalPrice?.toLocaleString()}
        </p>
      </div>

      {/* Customer */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-stone-900">
          {order.customerName}
        </h3>
        <p className="text-[11px] text-stone-400 font-medium">
          {order.customerEmail}
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest mb-0.5">
            Items
          </p>
          <p className="text-xs font-bold text-stone-900">
            {order.items?.length || 0} pcs
          </p>
        </div>
        <div>
          <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest mb-0.5">
            Payment
          </p>
          <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded uppercase">
            {order.paymentMethod}
          </span>
        </div>
        <div>
          <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest mb-0.5">
            Phone
          </p>
          <p className="text-[10px] font-bold text-stone-900">
            {order.shippingDetails?.phone}
          </p>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-stone-50 rounded-xl p-3 sm:p-4 mb-4">
        <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Truck size={11} className="text-stone-300" /> Shipping
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <p className="text-[8px] text-stone-400 font-bold uppercase mb-0.5">
              Recipient
            </p>
            <p className="text-xs font-bold text-stone-800">
              {order.shippingDetails?.fullName}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[8px] text-stone-400 font-bold uppercase mb-0.5">
              Address
            </p>
            <p className="text-[11px] text-stone-600 font-medium leading-snug">
              {order.shippingDetails?.address}, {order.shippingDetails?.city}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {order.items?.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white rounded-xl border border-stone-100 shadow-sm shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-bold text-stone-800 line-clamp-1 max-w-[100px]">
                {item.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                <span className="text-[8px] text-stone-400 font-black uppercase">
                  Qty:{item.quantity}
                </span>
                {item.size && (
                  <span className="text-[7px] bg-stone-100 px-1 rounded text-stone-500 font-bold uppercase">
                    {item.size}
                  </span>
                )}
                {item.color && (
                  <span className="text-[7px] bg-stone-100 px-1 rounded text-stone-500 font-bold uppercase">
                    {item.color}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

OrderRow.displayName = "OrderRow";

export default memo(AdminOrders);
