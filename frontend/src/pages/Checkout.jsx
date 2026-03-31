import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag, Truck, ShieldCheck, MapPin,
  CreditCard, CheckCircle2, ArrowRight, Box, AlertCircle,
} from "lucide-react";
import axios from "axios";
import { clearCart } from "../context/features/cart/cartSlice";
import { addOrder } from "../context/features/user/userSlice";
import {
  setField, prefillFromUser, resetForm,
} from "../context/features/checkout/CheckOut";
import pakistanData from "../components/data/PakistanData";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useState } from "react";

const Field = ({ label, error, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pl-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">
        {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError) =>
  `w-full bg-slate-50 border ${
    hasError ? "border-red-500" : "border-slate-200"
  } rounded-xl px-5 py-4 text-sm focus:bg-white focus:border-slate-900 outline-none transition-all placeholder:text-slate-300 font-medium`;

const selectClass = (hasError) =>
  `w-full bg-slate-50 border ${
    hasError ? "border-red-500" : "border-slate-200"
  } rounded-xl px-5 py-4 text-sm focus:bg-white focus:border-slate-900 outline-none transition-all font-medium appearance-none cursor-pointer`;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, token } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);
  const form = useSelector((state) => state.checkout.form);

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(""); // empty — user khud select kare

  // ── Payment method state ─────────────────────────────

  useEffect(() => {
    if (user) dispatch(prefillFromUser(user));
  }, [user]);

  useEffect(() => {
    if (location.state?.buyItNowItem) {
      setCheckoutItems([location.state.buyItNowItem]);
    } else {
      setCheckoutItems(cartItems);
    }
  }, [location.state, cartItems]);

  const cities = useMemo(
    () => (form.state ? pakistanData[form.state] || [] : []),
    [form.state]
  );
  const states = Object.keys(pakistanData);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [checkoutItems]
  );
  const shipping = 250;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(setField({ name, value: type === "checkbox" ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim())  errors.fullName  = "Full name is required";
    if (!form.email.trim())     errors.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email format";
    if (!form.phone.trim())     errors.phone     = "Phone number is required";
    if (!form.address.trim())   errors.address   = "Street address is required";
    if (!form.state)            errors.state     = "Province is required";
    if (!form.city)             errors.city      = "City is required";
    if (!form.zip.trim())       errors.zip       = "ZIP code is required";
    if (!form.agreeToTerms)     errors.agreeToTerms = "You must agree to Terms";
    if (!paymentMethod)         errors.paymentMethod = "Please select a payment method";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return setError("Please fill all required fields correctly.");

    setLoading(true);
    try {
      const orderData = {
        items: checkoutItems.map((item) => ({
          productId: item.productId || item._id || item.id,
          name:      item.name  || item.Name,
          price:     item.price || item.Price,
          quantity:  item.quantity,
          image:     item.image || item.Images?.[0] || "",
          size:      item.size,
          color:     item.color,
        })),
        shippingDetails: {
          fullName: form.fullName,
          email:    form.email,
          phone:    form.phone,
          address:  form.address,
          state:    form.state,
          city:     form.city,
          zip:      form.zip,
          country:  form.country,
          method:   "delivery",
        },
        totalPrice:      total,
        clearCartFromDb: !location.state?.buyItNowItem,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/orders/place`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        if (!location.state?.buyItNowItem) dispatch(clearCart());
        if (res.data.order) dispatch(addOrder(res.data.order));
        dispatch(resetForm());
        setSuccess(true);
      } else {
        setError(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ───────────────────────────────────────
  if (checkoutItems.length === 0 && !success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-light text-slate-900 mb-2 italic">Your checkout is empty</h2>
        <p className="text-slate-400 mb-8 max-w-xs">Add items to start shopping.</p>
        <Link to="/" className="px-10 py-4 bg-slate-900 text-white text-[10px] tracking-widest uppercase font-bold rounded-xl hover:bg-black transition-all">
          Back to Shop
        </Link>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-900"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Order Placed!</h1>
        <p className="text-slate-500 mb-10 max-w-sm">
          Thank you for shopping with Flossie. Your Cash on Delivery order is being processed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="px-10 py-4 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-black transition-all">
            Stay Shopping
          </Link>
          <button
            onClick={() => navigate("/order-status")}
            className="px-10 py-4 border border-slate-200 text-slate-600 text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Track Order
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2">

        {/* Left: Form */}
        <div className="p-4 sm:p-8 lg:p-20 bg-white lg:border-r border-slate-100">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Checkout</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Shipping & Payment</p>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Shipping Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <Field label="Full Name" error={fieldErrors.fullName} required>
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                    placeholder="Jane Doe" className={inputClass(fieldErrors.fullName)} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Email Address" error={fieldErrors.email} required>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="jane@example.com" className={inputClass(fieldErrors.email)} />
                </Field>
              </div>

              <Field label="Phone Number" error={fieldErrors.phone} required>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="0300 1234567" className={inputClass(fieldErrors.phone)} />
              </Field>

              <Field label="ZIP / Postal" error={fieldErrors.zip} required>
                <input type="text" name="zip" value={form.zip} onChange={handleChange}
                  placeholder="54000" className={inputClass(fieldErrors.zip)} />
              </Field>

              <div className="md:col-span-2">
                <Field label="Street Address" error={fieldErrors.address} required>
                  <input type="text" name="address" value={form.address} onChange={handleChange}
                    placeholder="Apartment, Suite, Street name" className={inputClass(fieldErrors.address)} />
                </Field>
              </div>

              {/* Country - fixed */}
              <Field label="Country">
                <input type="text" value="Pakistan" readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-400 cursor-not-allowed" />
              </Field>

              {/* Province dropdown — FIX: placeholder option hidden, sirf provinces show */}
              <Field label="Province / State" error={fieldErrors.state} required>
                <div className="relative">
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={selectClass(fieldErrors.state)}
                  >
                    {/* hidden placeholder — sirf tab dikhta hai jab kuch select nahi */}
                    <option value="" disabled hidden>Select Province</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                </div>
              </Field>

              {/* City dropdown */}
              <div className="md:col-span-2">
                <Field label="City" error={fieldErrors.city} required>
                  <div className="relative">
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      disabled={!form.state}
                      className={`${selectClass(fieldErrors.city)} ${!form.state ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="" disabled hidden>
                        {form.state ? "Select City" : "Select Province first"}
                      </option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                  </div>
                </Field>
              </div>
            </div>

            {/* Payment Method — selectable COD */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-slate-900" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Payment Method</h3>
              </div>

              <label className="p-5 rounded-2xl border-2 border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-all has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">
                    💵
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                      Cash on Delivery (COD)
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                      Pay at your doorstep
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    if (fieldErrors.paymentMethod)
                      setFieldErrors((prev) => ({ ...prev, paymentMethod: null }));
                  }}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </label>
              {fieldErrors.paymentMethod && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">
                  {fieldErrors.paymentMethod}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox" name="agreeToTerms"
                  checked={form.agreeToTerms} onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded-md border-slate-300 cursor-pointer"
                />
                <span className={`text-xs font-medium leading-relaxed transition-colors ${
                  fieldErrors.agreeToTerms ? "text-red-500" : "text-slate-500 group-hover:text-slate-900"
                }`}>
                  I agree to the Flossie <span className="font-bold underline">Terms and Conditions</span> and Privacy Policy.
                </span>
              </label>
              {fieldErrors.agreeToTerms && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-9 mt-2">
                  {fieldErrors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-4"
              >
                <div className="shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <AlertCircle size={18} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-6 text-xs uppercase tracking-[0.3em] font-black shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 group mt-10"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner small white />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <>
                  Complete Purchase
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Review */}
        <div className="p-4 sm:p-8 lg:p-20 bg-slate-50/50">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Review Order</h3>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                {checkoutItems.length} {checkoutItems.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-2">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                    <img src={item.image || item.Images?.[0] || ""} alt={item.name || item.Name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[14px] font-black text-slate-900 leading-snug line-clamp-2">{item.name || item.Name}</h4>
                      <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">{item.category || item.Category}</p>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 mt-2">
                          {item.size  && <span className="text-[8px] font-black uppercase tracking-widest bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">Size: {item.size}</span>}
                          {item.color && <span className="text-[8px] font-black uppercase tracking-widest bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">Color: {item.color}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                      <div className="text-right">
                        {item.originalPrice && item.originalPrice > (item.price || 0) ? (
                          <>
                            <p className="text-[10px] text-slate-400 line-through">Rs. {(item.originalPrice * item.quantity).toLocaleString()}</p>
                            <p className="text-sm font-black text-slate-900">Rs. {((item.price || 0) * item.quantity).toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-base font-black text-slate-900">Rs. {((item.price || 0) * item.quantity).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Shipping</span>
                <span className="text-slate-900">Rs. {shipping.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Total to Pay</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">VAT Included</p>
                  <p className="text-[9px] text-slate-900 font-black uppercase tracking-widest mt-1">Free returns within 7 days</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
              <Truck size={20} /><Box size={20} /><ShieldCheck size={20} /><CreditCard size={20} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;