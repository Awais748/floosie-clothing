import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  updateProduct,
} from "../../context/features/product/productSlice";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const initialFormState = {
  name: "",
  code: "",
  category: "",
  description: "",
  price: 0,
  salePrice: 0,
  stock: 0,
  images: ["", "", "", ""],
  sizes: [],
  colors: [],
  isCustomerFavorite: false,
  isNewArrival: false,
};

const AdminProductForm = ({ product, onSuccess }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const { loading } = useSelector((state) => state.product);

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState([false, false, false, false]);

  // ── Original data snapshot for change detection ──────
  const originalData = useRef(null);

  useEffect(() => {
    if (product) {
      const filled = {
        ...initialFormState,
        ...product,
        images: [...(product.images || []), "", "", "", ""].slice(0, 4),
      };
      setFormData(filled);
      originalData.current = JSON.stringify(filled); // snapshot
    } else {
      setFormData(initialFormState);
      originalData.current = null;
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploading((prev) => {
      const n = [...prev];
      n[index] = true;
      return n;
    });

    const fd = new FormData();
    fd.append("images", file);

    try {
      const res = await axios.post(`${API_URL}/api/products/upload`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success && res.data.urls?.[0]) {
        setFormData((prev) => {
          const imgs = [...prev.images];
          imgs[index] = res.data.urls[0];
          return { ...prev, images: imgs };
        });
      }
    } catch {
      alert("Image upload failed.");
    } finally {
      setUploading((prev) => {
        const n = [...prev];
        n[index] = false;
        return n;
      });
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const imgs = [...prev.images];
      imgs[index] = "";
      return { ...prev, images: imgs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Select category");
      return;
    }

    if (product && originalData.current) {
      const current = JSON.stringify(formData);
      if (current === originalData.current) {
        alert("No changes detected.");
        if (onSuccess) onSuccess();
        return;
      }
    }

    const submitData = {
      ...formData,
      images: formData.images.filter(Boolean),
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      stock: Number(formData.stock),
    };

    if (product)
      await dispatch(updateProduct({ id: product._id, data: submitData }));
    else await dispatch(createProduct(submitData));

    if (onSuccess) onSuccess();
  };

  const isSubmitting = loading || uploading.some(Boolean);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-6 p-4 bg-white rounded-xl shadow-md"
    >
      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Product Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 text-sm"
            placeholder="e.g. Royal Velvet Abaya"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Product Code
          </label>
          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 text-sm"
            placeholder="e.g. FL-2026-001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="" disabled hidden>
              -- Select --
            </option>
            <option value="Kohinoor">Kohinoor</option>
            <option value="FlossieExecutive">Flossie Executive</option>
            <option value="Safeera">Safeera</option>
            <option value="Velvet">Velvet</option>
            <option value="Dastaan">Dastaan</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Details about fabric, style, etc."
        />
      </div>

      {/* Inventory & Price */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Price (PKR)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Sale Price
          </label>
          <input
            type="number"
            min={0}
            step={100}
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Stock
          </label>
          <input
            type="number"
            min={0}
            step={1}
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isNewArrival"
            checked={formData.isNewArrival}
            onChange={handleChange}
          />
          <span className="text-xs font-bold text-gray-500">New Arrival</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isCustomerFavorite"
            checked={formData.isCustomerFavorite}
            onChange={handleChange}
          />
          <span className="text-xs font-bold text-gray-500">Favorite</span>
        </label>
      </div>

      {/* Variants */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-1">Sizes</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {["S", "M", "L", "XL"].map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => handleArrayToggle("sizes", size)}
              className={`px-3 py-1 rounded-md text-xs border ${
                formData.sizes.includes(size)
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-gray-500 mb-1">Colors</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Black",
            "White",
            "Red",
            "Navy",
            "Maroon",
            "Emerald",
            "Gold",
            "Beige",
            "Pink",
            "Lavender",
          ].map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => handleArrayToggle("colors", color)}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.colors.includes(color)
                  ? "border-gray-900"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">Images (max 4)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {formData.images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-full aspect-[3/4] border rounded-md overflow-hidden flex items-center justify-center bg-gray-50"
            >
              {img ? (
                <>
                  <img
                    src={img}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full px-1 text-red-500"
                  >
                    X
                  </button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  {uploading[idx] ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                    disabled={uploading[idx]}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white py-3 rounded-md font-bold text-sm disabled:opacity-50"
      >
        {isSubmitting
          ? "Saving..."
          : product
          ? "Update Product"
          : "Create Product"}
      </button>
    </form>
  );
};

export default AdminProductForm;
