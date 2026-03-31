import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params = {}, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/products/getallproduct`, {
        params,
      });
      console.log("API Response:", res.data); // <- check karo
      return { data: res.data, params };
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch products", err);
    }
  },
  {
    condition: (params, { getState }) => {
      const { lastQuery } = getState().product;
      if (JSON.stringify(lastQuery) === JSON.stringify(params)) return false;
    },
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch product", err);
    }
  }
);

export const createProduct = createAsyncThunk(
  "product/create",
  async (data, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().user;
      const res = await axios.post(`${API_URL}/api/products`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to create product", err);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().user;
      const res = await axios.put(`${API_URL}/api/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to update product", err);
    }
  }
);

/* ─────────────────────────────────────────────
   DELETE PRODUCT (Admin)
───────────────────────────────────────────── */
export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().user;
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id; // return deleted id to remove from state
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to delete product", err);
    }
  }
);

export const fetchHomeProducts = createAsyncThunk(
  "product/fetchHome",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/products/home`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch home products", err);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    currentProduct: null,
    page: 1,
    totalPages: 1,
    totalProducts: 0,

    homeCollections: {
      NewArrivals: [],
      CustomerFav: [],
      Kohinoor: [],
      FlossieExecutive: [],
      Safeera: [],
      Velvet: [],
      Dastaan: [],
    },

    lastQuery: null,
    loading: false,
    listLoading: false,
    error: null,
    message: null,
  },

  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ── FETCH ALL ── */
      .addCase(fetchProducts.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        const resData = action.payload.data; // { success, data: [...], total, pages, page }
        state.products = resData.data ?? resData; // actual array
        state.totalProducts = resData.total ?? resData.data?.length ?? 0;
        state.totalPages = resData.pages ?? 1;
        state.page = resData.page ?? 1;
        state.lastQuery = action.payload.params;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload); // prepend to list
        state.message = "Product created successfully";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx !== -1) state.products[idx] = action.payload;
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
        state.message = "Product updated successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.message = "Product deleted successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchHomeProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomeProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.homeCollections = action.payload;
      })
      .addCase(fetchHomeProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearStatus } = productSlice.actions;
export default productSlice.reducer;
