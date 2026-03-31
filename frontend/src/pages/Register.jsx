import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, resetStatus } from "../context/features/user/userSlice";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.user);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    Email: "",
  });
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    Gender: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    if (name === "Password" || name === "ConfirmPassword") {
      setPasswordMismatch(false);
    }
    if (name === "Email") {
      setFieldErrors({ ...fieldErrors, Email: "" });
    }
    dispatch(resetStatus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.Password !== form.ConfirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setFieldErrors({ Email: "" });
    dispatch(resetStatus());

    const result = await dispatch(register(form));

    if (result.meta.requestStatus === "rejected") {
      const errorMsg = result.payload || "An error occurred";
      if (errorMsg.toLowerCase().includes("already registered")) {
        setFieldErrors({ Email: "This email is already registered" });
      }
    } else if (result.meta.requestStatus === "fulfilled") {
      setShowSuccess(true);
      setForm({
        FirstName: "",
        LastName: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        Gender: "",
        role: "user",
      });
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/login");
        dispatch(resetStatus());
      }, 5000);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100dvh-80px)] flex justify-center items-center px-4 sm:px-6 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md text-center border border-stone-100"
        >
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light tracking-tight text-stone-900 mb-4">
            Registration Successful!
          </h2>
          <p className="text-stone-500 text-sm mb-8 leading-relaxed">
            An activation link has been sent to your{" "}
            <span className="font-bold text-stone-900 underline underline-offset-4 decoration-stone-200">
              Email
            </span>
            . Please check your inbox.
          </p>
          <div className="w-full bg-stone-100 h-1 overflow-hidden rounded-full mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="bg-stone-900 h-full"
            />
          </div>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">
            Redirecting to Sign In...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 sm:px-6 py-4 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-4 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900 mb-2 sm:mb-3 italic">
            Create an account
          </h2>
          <p className="text-stone-400 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-medium">
            Premium clothing experience
          </p>
        </div>

        <div className="bg-white p-4 sm:p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          {error && !fieldErrors.Email && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] uppercase tracking-widest mb-6 font-bold bg-red-50 p-3 rounded text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
          {message && (
            <div className="text-green-600 text-[10px] uppercase tracking-widest mb-6 font-bold bg-green-50 p-3 rounded text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                  First Name
                </label>
                <div className="relative">
                  <input
                    name="FirstName"
                    placeholder="First"
                    value={form.FirstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all font-light"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    name="LastName"
                    placeholder="Last"
                    value={form.LastName}
                    onChange={handleChange}
                    required
                    className="w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                Gender
              </label>
              <div className="relative">
                <select
                  name="Gender"
                  value={form.Gender}
                  onChange={handleChange}
                  required
                  className={`w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all appearance-none pr-10 font-light ${
                    !form.Gender ? "text-stone-400" : "text-stone-900"
                  }`}
                >
                  <option value="" disabled hidden>
                    Select Gender
                  </option>
                  <option value="Male" className="text-stone-900">
                    Male
                  </option>
                  <option value="Female" className="text-stone-900">
                    Female
                  </option>
                  <option value="Other" className="text-stone-900">
                    Other
                  </option>
                </select>
                <ChevronDown
                  className="absolute right-3.5 top-4 text-stone-300 pointer-events-none"
                  size={16}
                />
              </div>
            </div>

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
                  className={`w-full bg-stone-50 border ${
                    fieldErrors.Email
                      ? "border-red-200 focus:ring-red-100"
                      : "border-stone-100 focus:ring-stone-200"
                  } rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 font-light`}
                />
                <Mail
                  className={`absolute left-3.5 top-4 ${
                    fieldErrors.Email ? "text-red-400" : "text-stone-300"
                  }`}
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

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="Password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.Password}
                  onChange={handleChange}
                  required
                  className={`w-full bg-stone-50 border ${
                    passwordMismatch
                      ? "border-red-200 focus:ring-red-100"
                      : "border-stone-100 focus:ring-stone-200"
                  } rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                />
                <Lock
                  className={`absolute left-3.5 top-4 ${
                    passwordMismatch ? "text-red-300" : "text-stone-300"
                  }`}
                  size={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-stone-300 hover:text-stone-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="ConfirmPassword"
                  placeholder="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={form.ConfirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full bg-stone-50 border ${
                    passwordMismatch
                      ? "border-red-200 focus:ring-red-100"
                      : "border-stone-100 focus:ring-stone-200"
                  } rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                />
                <Lock
                  className={`absolute left-3.5 top-4 ${
                    passwordMismatch ? "text-red-300" : "text-stone-300"
                  }`}
                  size={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-stone-300 hover:text-stone-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordMismatch && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-2"
                >
                  Passwords do not match
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                Account Type
              </label>

              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className={`w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all appearance-none pr-10 font-light ${
                    !form.role ? "text-stone-400" : "text-stone-900"
                  }`}
                >
                  <option value="" disabled hidden>
                    Select Account Type
                  </option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                <ChevronDown
                  className="absolute right-3.5 top-4 text-stone-300 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white rounded-lg px-4 py-3 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner small white />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-stone-400 text-[10px] uppercase tracking-wider">
              Already have access?{" "}
              <Link
                to="/login"
                onClick={() => dispatch(resetStatus())}
                className="text-stone-900 font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
