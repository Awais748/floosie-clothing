import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  resetStatus,
} from "../context/features/user/userSlice";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { fetchCart, syncCartDb } from "../context/features/cart/cartSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, user } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    Email: "",
    Password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    Email: "",
    Password: "",
  });

  useEffect(() => {
    if (user) {
      console.log("Current User:", user);
      console.log("User Role:", user.role);
      
      if (user.role === "admin") {
        console.log("Redirecting to Dashboard...");
        navigate("/dashboard");
      } else {
        console.log("Redirecting to Home...");
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear errors when typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
    dispatch(resetStatus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetStatus());
    setFieldErrors({ Email: "", Password: "" });
    
    const result = await dispatch(login({ Email: form.Email, Password: form.Password }));
    
    if (result.meta.requestStatus === "rejected") {
      const errorMsg = result.payload || "An error occurred";
      if (errorMsg.toLowerCase().includes("user not found")) {
        setFieldErrors(prev => ({ ...prev, Email: "Email address not recognized" }));
      } else if (errorMsg.toLowerCase().includes("credentials") || errorMsg.toLowerCase().includes("incorrect")) {
        setFieldErrors(prev => ({ ...prev, Password: "The email or password you entered is incorrect" }));
      }
    } else if (result.meta.requestStatus === "fulfilled") {
      setForm({ Email: "", Password: "" });
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
            Welcome back
          </h2>
          <p className="text-stone-400 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-medium">
            Enter your details to sign in
          </p>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          {(error && !fieldErrors.Email && !fieldErrors.Password) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] uppercase tracking-widest mb-6 font-bold bg-red-50 p-3 rounded text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
          {message && <div className="text-green-600 text-[10px] uppercase tracking-widest mb-6 font-bold bg-green-50 p-3 rounded text-center">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">Email Address</label>
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
                <Mail className={`absolute left-3.5 top-4 ${fieldErrors.Email ? 'text-red-400' : 'text-stone-300'}`} size={16} />
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
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">Password</label>
              <div className="relative">
                <input
                  name="Password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.Password}
                  onChange={handleChange}
                  required
                  className={`w-full bg-stone-50 border ${fieldErrors.Password ? 'border-red-200 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-200'} rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                />
                <Lock className={`absolute left-3.5 top-4 ${fieldErrors.Password ? 'text-red-300' : 'text-stone-300'}`} size={16} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-4 ${fieldErrors.Password ? 'text-red-300' : 'text-stone-300'} hover:text-stone-500 transition-colors`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.Password && (
                <motion.p 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-2"
                >
                  {fieldErrors.Password}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white rounded-lg px-4 py-3.5 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 mt-2 sm:mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner small white />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-8 text-center space-y-2 sm:space-y-3">
             <p className="text-stone-400 text-[10px] uppercase tracking-wider">
               New to Flossie? <Link to="/register" onClick={() => dispatch(resetStatus())} className="text-stone-900 font-bold hover:underline">Create account</Link>
             </p>
             <p className="text-stone-300 text-[10px] uppercase tracking-wider cursor-pointer hover:text-stone-900">
               <Link to="/forgot-password" onClick={() => dispatch(resetStatus())}>Forgot your password?</Link>
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
