import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  resetPassword,
  resetStatus,
} from "../context/features/user/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, Key, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.user);

  const [step, setStep] = useState("forgot"); 
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    Email: "",
    OTP: "",
    newPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    Email: "",
    OTP: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
    dispatch(resetStatus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetStatus());
    setFieldErrors({ Email: "", OTP: "", newPassword: "" });

    if (step === "forgot") {
      const result = await dispatch(forgotPassword(form.Email));
      if (result.meta.requestStatus === "rejected") {
        const errorMsg = result.payload || "An error occurred";
        if (errorMsg.toLowerCase().includes("not found")) {
          setFieldErrors(prev => ({ ...prev, Email: "This email address is not registered" }));
        }
      } else if (result.meta.requestStatus === "fulfilled") {
        setStep("reset");
      }
    } else {
      const result = await dispatch(
        resetPassword({
          Email: form.Email,
          OTP: form.OTP,
          newPassword: form.newPassword,
        })
      );
      if (result.meta.requestStatus === "rejected") {
        const errorMsg = result.payload || "An error occurred";
        if (errorMsg.toLowerCase().includes("otp")) {
          setFieldErrors(prev => ({ ...prev, OTP: "Invalid or expired verification code" }));
        }
      } else if (result.meta.requestStatus === "fulfilled") {
        setForm({ Email: "", OTP: "", newPassword: "" });
        setTimeout(() => {
          navigate("/login");
          dispatch(resetStatus());
        }, 3000);
      }
    }
  };

  return (
    <div className="min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900 mb-2 sm:mb-3 italic">
            {step === "forgot" ? "Reset access" : "Set new password"}
          </h2>
          <p className="text-stone-400 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-medium">
            {step === "forgot"
              ? "Enter your email to receive an OTP"
              : "Enter the code sent to your email"}
          </p>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          {(error && !fieldErrors.Email && !fieldErrors.OTP && !fieldErrors.newPassword) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] uppercase tracking-widest mb-6 font-bold bg-red-50 p-3 rounded text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-[10px] uppercase tracking-widest mb-6 font-bold bg-green-50 p-3 rounded text-center border border-green-100"
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === "forgot" ? (
                <motion.div
                  key="forgot-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        name="Email"
                        placeholder="Email Address"
                        type="email"
                        value={form.Email}
                        onChange={handleChange}
                        required
                        className={`w-full bg-stone-50 border ${fieldErrors.Email ? 'border-red-200 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-200'} rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 font-light`}
                      />
                      <Mail
                        className={`absolute left-3.5 top-4 ${fieldErrors.Email ? 'text-red-400' : 'text-stone-300'}`}
                        size={16}
                      />
                    </div>
                    {fieldErrors.Email && (
                      <motion.p 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-2"
                      >
                        {fieldErrors.Email}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reset-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                      OTP Code
                    </label>
                    <div className="relative">
                      <input
                        name="OTP"
                        placeholder="Enter 6-digit code"
                        value={form.OTP}
                        onChange={handleChange}
                        required
                        className={`w-full bg-stone-50 border ${fieldErrors.OTP ? 'border-red-200 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-200'} rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 font-light`}
                      />
                      <Key
                        className={`absolute left-3.5 top-4 ${fieldErrors.OTP ? 'text-red-400' : 'text-stone-300'}`}
                        size={16}
                      />
                    </div>
                    {fieldErrors.OTP && (
                      <motion.p 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-2"
                      >
                        {fieldErrors.OTP}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        name="newPassword"
                        placeholder="New Password"
                        type={showPassword ? "text" : "password"}
                        value={form.newPassword}
                        onChange={handleChange}
                        required
                        className={`w-full bg-stone-50 border ${fieldErrors.newPassword ? 'border-red-200 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-200'} rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                      />
                      <Lock
                        className={`absolute left-3.5 top-4 ${fieldErrors.newPassword ? 'text-red-400' : 'text-stone-300'}`}
                        size={16}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-4 ${fieldErrors.newPassword ? 'text-red-400' : 'text-stone-300'} hover:text-stone-500 transition-colors`}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white rounded-lg px-4 py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner small white />
                  <span>Please wait...</span>
                </div>
              ) : (
                <>
                  {step === "forgot" ? "Send Reset Link" : "Reset Password"}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-8 text-center">
            <Link
              to="/login"
              onClick={() => dispatch(resetStatus())}
              className="text-stone-400 text-[10px] uppercase tracking-wider hover:text-stone-900 font-bold"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
