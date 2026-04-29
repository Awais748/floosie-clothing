import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const HOME_CACHE_TTL_MS = 5 * 60 * 1000;

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params = {}, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/products/getallproduct`, {
        params,
      });
      console.log("FETCH_PRODUCTS: Success", { total: res.data?.data?.length });
      return { data: res.data, params };
    } catch (err) {
      console.error(
        "FETCH_PRODUCTS: Failed",
        err.response?.data || err.message
      );
      return thunkAPI.rejectWithValue("Failed to fetch products");
    }
  },
  {
    condition: (params, { getState }) => {
      const { lastQuery } = getState().product;
      if (JSON.stringify(lastQuery) === JSON.stringify(params)) {
        console.log("FETCH_PRODUCTS: Skipped — same query already loaded");
        return false;
      }
    },
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id, thunkAPI) => {
    try {
      const cached = thunkAPI.getState().product.productById[id];
      if (cached) return cached;
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      console.log("FETCH_PRODUCT_BY_ID: Success", { id });
      return res.data.data;
    } catch (err) {
      console.error("FETCH_PRODUCT_BY_ID: Failed", {
        id,
        error: err.response?.data || err.message,
      });
      return thunkAPI.rejectWithValue("Failed to fetch product");
    }
  },
  {
    condition: (id, { getState }) => {
      const { productById, currentProduct } = getState().product;
      if (productById[id] || currentProduct?._id === id) {
        return false;
      }
      return true;
    },
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
      console.log("CREATE_PRODUCT: Success", { id: res.data.data?._id });
      return res.data.data;
    } catch (err) {
      console.error(
        "CREATE_PRODUCT: Failed",
        err.response?.data || err.message
      );
      return thunkAPI.rejectWithValue("Failed to create product");
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
      console.log("UPDATE_PRODUCT: Success", { id });
      return res.data.data;
    } catch (err) {
      console.error("UPDATE_PRODUCT: Failed", {
        id,
        error: err.response?.data || err.message,
      });
      return thunkAPI.rejectWithValue("Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().user;
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("DELETE_PRODUCT: Success", { id });
      return id;
    } catch (err) {
      console.error("DELETE_PRODUCT: Failed", {
        id,
        error: err.response?.data || err.message,
      });
      return thunkAPI.rejectWithValue("Failed to delete product");
    }
  }
);

export const fetchHomeProducts = createAsyncThunk(
  "product/fetchHome",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/products/home`);
      console.log("FETCH_HOME_PRODUCTS: Success");
      return res.data.data;
    } catch (err) {
      console.error(
        "FETCH_HOME_PRODUCTS: Failed",
        err.response?.data || err.message
      );
      return thunkAPI.rejectWithValue("Failed to fetch home products");
    }
  },
  {
    condition: (_, { getState }) => {
      const { homeFetchedAt } = getState().product;
      if (!homeFetchedAt) return true;
      return Date.now() - homeFetchedAt > HOME_CACHE_TTL_MS;
    },
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    currentProduct: null,
    productById: {},
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
    homeFetchedAt: null,
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
      .addCase(fetchProducts.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        const resData = action.payload.data;
        state.products = resData.data ?? resData;
        state.totalProducts = resData.total ?? resData.data?.length ?? 0;
        state.totalPages = resData.pages ?? 1;
        state.page = resData.page ?? 1;
        state.lastQuery = action.payload.params;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
        console.error("FETCH_PRODUCTS: State error set", action.payload);
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        if (action.payload?._id) {
          state.productById[action.payload._id] = action.payload;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("FETCH_PRODUCT_BY_ID: State error set", action.payload);
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        if (action.payload?._id) {
          state.productById[action.payload._id] = action.payload;
        }
        state.message = "Product created successfully";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("CREATE_PRODUCT: State error set", action.payload);
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
        state.productById[action.payload._id] = action.payload;
        state.message = "Product updated successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("UPDATE_PRODUCT: State error set", action.payload);
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        delete state.productById[action.payload];
        state.message = "Product deleted successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("DELETE_PRODUCT: State error set", action.payload);
      })

      .addCase(fetchHomeProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomeProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.homeCollections = action.payload;
        state.homeFetchedAt = Date.now();
      })
      .addCase(fetchHomeProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("FETCH_HOME_PRODUCTS: State error set", action.payload);
      });
  },
});

export const { clearCurrentProduct, clearStatus } = productSlice.actions;
export default productSlice.reducer;
