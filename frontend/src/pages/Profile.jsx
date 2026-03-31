import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  logout,
  resetStatus,
} from "../context/features/user/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Mail,
  ShieldCheck,
  Settings,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Package,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, message } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [viewingImage, setViewingImage] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [form, setForm] = useState({
    FirstName: user?.FirstName || "",
    LastName: user?.LastName || "",
    Gender: user?.Gender || "Male",
    Avatar: user?.Avatar || "",
    Password: "",
    ConfirmPassword: "",
  });

  const [tempAvatar, setTempAvatar] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setForm({
        FirstName: user.FirstName || "",
        LastName: user.LastName || "",
        Gender: user.Gender || "Male",
        Avatar: user.Avatar || "",
        Password: "",
        ConfirmPassword: "",
      });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
        setCropMode(true);
        setImageZoom(1);
        setImageRotation(0);
        setImagePosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = useCallback(() => {
    if (!tempAvatar || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.scale(imageZoom, imageZoom);
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(
        img,
        -w / 2 + imagePosition.x,
        -h / 2 + imagePosition.y,
        w,
        h
      );
      ctx.restore();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setForm((prev) => {
        const updated = { ...prev, Avatar: dataUrl };
        // Auto-save avatar to backend immediately
        dispatch(updateProfile(updated));
        return updated;
      });
      setCropMode(false);
      setTempAvatar(null);
    };
    img.src = tempAvatar;
  }, [tempAvatar, imageZoom, imageRotation, imagePosition, dispatch]);

  const [fieldErrors, setFieldErrors] = useState({
    Password: "",
    ConfirmPassword: "",
  });

  const hasChanges =
    form.FirstName !== (user?.FirstName || "") ||
    form.LastName !== (user?.LastName || "") ||
    form.Gender !== (user?.Gender || "Male") ||
    form.Avatar !== (user?.Avatar || "") ||
    form.Password !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setFieldErrors({ Password: "", ConfirmPassword: "" });

    if (form.Password) {
      if (form.Password.length < 6) {
        setFieldErrors((prev) => ({
          ...prev,
          Password: "Password must be at least 6 characters",
        }));
        return;
      }
      if (form.Password !== form.ConfirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          ConfirmPassword: "Passwords do not match",
        }));
        return;
      }
    }

    const updateData = { ...form };
    if (!form.Password) {
      delete updateData.Password;
    }
    delete updateData.ConfirmPassword;

    dispatch(updateProfile(updateData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setForm((prev) => ({ ...prev, Password: "", ConfirmPassword: "" }));
      })
      .catch(() => {
        // Error handling is managed by Redux state 'error'
      });
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(resetStatus());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - imagePosition.x,
      y: clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setImagePosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (loading && !user) return <LoadingSpinner fullPage />;
  if (!user) return null;

  const initials = `${user.FirstName?.charAt(0) || ""}${
    user.LastName?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <div className="min-h-[calc(100dvh-80px)] bg-stone-50/30">
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (form.Avatar || user.Avatar) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setViewingImage(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingImage(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={form.Avatar || user.Avatar}
                alt="Profile"
                className="w-full rounded-2xl shadow-2xl"
              />
              <p className="text-center text-white/50 text-[10px] uppercase tracking-widest mt-4">
                {user.FirstName} {user.LastName}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      <AnimatePresence>
        {cropMode && tempAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
          >
            <p className="text-white/60 text-[10px] uppercase tracking-widest mb-6">
              Drag to reposition · Use controls to adjust
            </p>
            <div
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-white/20 cursor-grab active:cursor-grabbing relative select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={tempAvatar}
                alt="Crop preview"
                className="w-full h-full object-cover pointer-events-none"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                }}
                draggable={false}
              />
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.1))}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <div className="w-32 h-1 bg-white/10 rounded-full relative">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${((imageZoom - 0.5) / 2.5) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setImageZoom((z) => Math.min(3, z + 0.1))}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setImageRotation((r) => r + 90)}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setCropMode(false);
                  setTempAvatar(null);
                }}
                className="px-8 py-3 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="px-8 py-3 bg-white text-stone-900 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-stone-100 transition-all flex items-center gap-2"
              >
                <Check size={14} /> Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-5 sm:p-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl font-light tracking-tight text-stone-900">
                      Edit Profile
                    </h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                      Update your information
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-100 transition-colors"
                  >
                    <X size={18} className="text-stone-500" />
                  </button>
                </div>

                {/* Avatar section in edit */}
                <div className="flex justify-center mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                      {form.Avatar ? (
                        <img
                          src={form.Avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-light text-stone-400">
                          {initials}
                        </span>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[8px] uppercase tracking-wider rounded-full">
                        <Camera size={18} className="mb-0.5" />
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && !error.toLowerCase().includes("password") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-[10px] bg-red-50 p-3 rounded-lg text-center uppercase tracking-wider font-bold border border-red-100"
                    >
                      {error}
                    </motion.div>
                  )}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-green-600 text-[10px] bg-green-50 p-3 rounded-lg text-center uppercase tracking-wider font-bold border border-green-100"
                    >
                      {message}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                        First Name
                      </label>
                      <input
                        name="FirstName"
                        value={form.FirstName}
                        onChange={handleChange}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all outline-none font-light"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                        Last Name
                      </label>
                      <input
                        name="LastName"
                        value={form.LastName}
                        onChange={handleChange}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all outline-none font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="Gender"
                        value={form.Gender}
                        onChange={handleChange}
                        className={`w-full bg-stone-50 border border-stone-100 rounded-lg px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-stone-200 transition-all outline-none appearance-none pr-10 font-light ${
                          !form.Gender ? "text-stone-400" : "text-stone-900"
                        }`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown
                        className="absolute right-3.5 top-3.5 text-stone-300 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                      Email
                    </label>
                    <input
                      value={user.Email}
                      disabled
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-lg px-4 py-3 text-sm text-stone-400 outline-none cursor-not-allowed font-light"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-50">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                      Security & Password
                    </p>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="Password"
                          value={form.Password}
                          onChange={(e) => {
                            handleChange(e);
                            setFieldErrors((prev) => ({
                              ...prev,
                              Password: "",
                            }));
                          }}
                          placeholder="Leave blank to keep current"
                          className={`w-full bg-stone-50 border ${
                            fieldErrors.Password
                              ? "border-red-200 focus:ring-red-100"
                              : "border-stone-100 focus:ring-stone-200"
                          } rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                        />
                        <Lock
                          className={`absolute left-3.5 top-4 ${
                            fieldErrors.Password
                              ? "text-red-400"
                              : "text-stone-300"
                          }`}
                          size={16}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-4 text-stone-300 hover:text-stone-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
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

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 pl-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="ConfirmPassword"
                          value={form.ConfirmPassword}
                          onChange={(e) => {
                            handleChange(e);
                            setFieldErrors((prev) => ({
                              ...prev,
                              ConfirmPassword: "",
                            }));
                          }}
                          placeholder="Confirm new password"
                          className={`w-full bg-stone-50 border ${
                            fieldErrors.ConfirmPassword ||
                            (error && error.toLowerCase().includes("password"))
                              ? "border-red-200 focus:ring-red-100"
                              : "border-stone-100 focus:ring-stone-200"
                          } rounded-lg px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-1 transition-all pl-10 pr-10 font-light`}
                        />
                        <Lock
                          className={`absolute left-3.5 top-4 ${
                            fieldErrors.ConfirmPassword ||
                            (error && error.toLowerCase().includes("password"))
                              ? "text-red-400"
                              : "text-stone-300"
                          }`}
                          size={16}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-4 text-stone-300 hover:text-stone-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {(fieldErrors.ConfirmPassword ||
                        (error &&
                          error.toLowerCase().includes("password"))) && (
                        <motion.p
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-2"
                        >
                          {fieldErrors.ConfirmPassword || error}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !hasChanges}
                      className={`w-full rounded-lg px-4 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-all shadow-lg disabled:opacity-50 ${
                        hasChanges
                          ? "bg-stone-900 text-white hover:bg-black hover:shadow-xl"
                          : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {loading
                        ? "Saving..."
                        : hasChanges
                        ? "Save Changes"
                        : "No Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Profile View */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden"
        >
          {/* Header banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-br from-stone-100 via-stone-50 to-white relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
          </div>

          {/* Avatar overlap */}
          <div className="flex flex-col items-center -mt-16 sm:-mt-20 px-6 pb-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                if (form.Avatar || user.Avatar) setViewingImage(true);
              }}
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-xl ring-1 ring-stone-100">
                {form.Avatar || user.Avatar ? (
                  <img
                    src={form.Avatar || user.Avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-light text-stone-400">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {(form.Avatar || user.Avatar) && (
                <div className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="cursor-pointer flex items-center justify-center w-full h-full">
                  <Camera size={12} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl font-light tracking-tight text-stone-900 mt-4 sm:mt-5 text-center">
              {user.FirstName} {user.LastName}
            </h1>

            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 text-stone-400 text-[13px] sm:text-sm">
              <Mail size={13} />
              <span className="lowercase">{user.Email}</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-600 rounded-full text-[9px] uppercase tracking-widest font-medium border border-stone-100">
                <ShieldCheck size={11} />{" "}
                {user.role === "admin" ? "Admin Access" : "Verified Member"}
              </span>
            </div>

            {/* Status messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-green-600 text-[10px] uppercase tracking-widest font-bold bg-green-50 px-6 py-3 rounded-lg text-center border border-green-100 w-full max-w-xs"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xs">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-6 py-3 bg-stone-900 text-white text-[10px] uppercase tracking-widest cursor-pointer font-bold hover:bg-black transition-all rounded-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Settings size={12} /> Edit Profile
              </button>
              <Link
                to="/order-status"
                className="w-full px-6 py-3 bg-white border border-stone-200 text-stone-900 text-[10px] uppercase tracking-widest cursor-pointer font-bold hover:bg-stone-50 transition-all rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Package size={12} /> Track Orders
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Order History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest">
              Order History
            </h2>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
              Recent Activity
            </span>
          </div>

          <div className="space-y-4">
            {user.orders && user.orders.length > 0 ? (
              [...user.orders].reverse().map((order, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-900">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-stone-900">
                          Order #{order._id?.slice(-8) || idx + 1000}
                        </p>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-stone-900">
                        Rs. {order.totalPrice?.toLocaleString()}
                      </p>
                      <span
                        className={`text-[8px] uppercase tracking-[0.2em] font-black px-2 py-0.5 rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-50 text-green-600"
                            : order.status === "Pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-stone-50 text-stone-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex -space-x-2 overflow-hidden">
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-sm relative group/item"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">
                            {item.quantity}x
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-stone-100 p-10 text-center">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-stone-200" />
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  No orders found yet
                </p>
                <Link
                  to="/shop-all"
                  className="inline-block mt-4 text-[10px] text-stone-900 font-black uppercase tracking-widest border-b border-stone-900 cursor-pointer hover:opacity-70 transition-opacity"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
