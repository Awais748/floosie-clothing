import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit2, Trash2, Search, X, Package } from "lucide-react";
import {
  fetchProducts,
  deleteProduct,
  clearStatus,
} from "../../context/features/product/productSlice";
import AdminProductForm from "./AdminProductForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PRODUCTS_PER_PAGE = 20;

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, listLoading, loading, message, error, page, totalPages, totalProducts } =
    useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);
  const isManager = user?.role === "manager";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!didFetchRef.current) {
      dispatch(fetchProducts({ page: currentPage, limit: PRODUCTS_PER_PAGE }));
      didFetchRef.current = true;
    }
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => dispatch(clearStatus()), 3000);
    return () => clearTimeout(t);
  }, [message, error, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    didFetchRef.current = false;
    dispatch(fetchProducts({ page: currentPage, limit: PRODUCTS_PER_PAGE }));
    didFetchRef.current = true;
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (totalPages || 1) || nextPage === currentPage) {
      return;
    }
    didFetchRef.current = false;
    setCurrentPage(nextPage);
  };

  const filteredProducts = useMemo(
    () =>
      (products || []).filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast */}
      {(message || error) && (
        <div
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-bold text-white text-center sm:text-left ${
            error ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {message || error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Product Inventory
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Manage your collections and stock levels.
          </p>
          <p className="text-stone-400 text-[11px] mt-1">
            Total Products: <span className="font-bold text-stone-700">{totalProducts || 0}</span>
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto bg-stone-900 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-stone-800 transition-all font-bold text-xs uppercase tracking-wider"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-stone-100 shadow-sm">
        <p className="text-xs text-stone-500">
          Page <span className="font-semibold text-stone-700">{page || currentPage}</span> of{" "}
          <span className="font-semibold text-stone-700">{totalPages || 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={listLoading || currentPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={listLoading || currentPage >= (totalPages || 1)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-100 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-200 outline-none"
          />
        </div>
      </div>

      {/* ── DESKTOP: Table (hidden on mobile) ── */}
      <div className="hidden md:block bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Product
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Category
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Price
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Stock
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {listLoading ? (
              <tr>
                <td colSpan="5" className="py-20">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-stone-400">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-stone-100 overflow-hidden shrink-0">
                        <img
                          src={product.images?.[0]}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {product.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-stone-900">
                      PKR {product.price?.toLocaleString()}
                    </p>
                    {product.salePrice && product.salePrice < product.price && (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Sale: {product.salePrice?.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock > 10
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      >
                        <Edit2 size={15} />
                      </button>
                      {!isManager && (
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={loading}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {listLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-100 p-10 text-center">
            <Package size={32} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400 text-sm">No products found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 flex items-start gap-3"
              >
                {/* Image */}
                <div className="w-16 h-20 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {product.code}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      {!isManager && (
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={loading}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[9px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full font-bold">
                      {product.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock > 10
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-sm font-black text-stone-900">
                      PKR {product.price?.toLocaleString()}
                    </p>
                    {product.salePrice && product.salePrice < product.price && (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Sale: {product.salePrice?.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-stone-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <AdminProductForm
                product={editingProduct}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AdminProducts);
