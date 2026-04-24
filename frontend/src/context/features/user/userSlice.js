import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const register = createAsyncThunk(
  "user/register",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/register`, data);
      console.log("REGISTER: Success", { Email: data.Email });
      return res.data;
    } catch (err) {
      console.error("REGISTER: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const login = createAsyncThunk("user/login", async (data, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/api/users/login`, data);
    console.log("LOGIN: Success", {
      Email: data.Email,
      role: res.data.user?.role,
    });
    return res.data;
  } catch (err) {
    console.error("LOGIN: Failed", err.response?.data?.message);
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

export const forgotPassword = createAsyncThunk(
  "user/forgot",
  async (email, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/forgot-password`, {
        Email: email,
      });
      console.log("FORGOT_PASSWORD: OTP sent", { email });
      return res.data;
    } catch (err) {
      console.error("FORGOT_PASSWORD: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/reset",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/reset-password`, data);
      console.log("RESET_PASSWORD: Success", { Email: data.Email });
      return res.data;
    } catch (err) {
      console.error("RESET_PASSWORD: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.put(`${API_URL}/api/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("UPDATE_PROFILE: Success");
      return res.data;
    } catch (err) {
      console.error("UPDATE_PROFILE: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  "user/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.get(`${API_URL}/api/users/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("FETCH_USER_ORDERS: Success", { count: res.data?.length });
      return res.data;
    } catch (err) {
      console.error("FETCH_USER_ORDERS: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  "user/fetchAllOrders",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.get(`${API_URL}/api/users/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("FETCH_ALL_ORDERS: Success", {
        count: res.data.orders?.length,
      });
      return res.data.orders;
    } catch (err) {
      console.error("FETCH_ALL_ORDERS: Failed", err.response?.data?.message);
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "user/updateOrderStatus",
  async ({ userId, orderId, status }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.put(
        `${API_URL}/api/users/order-status`,
        { userId, orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data.success) {
        return thunkAPI.rejectWithValue(res.data.message || "Update failed");
      }
      console.log("UPDATE_ORDER_STATUS: Success", {
        orderId,
        status: res.data.updatedOrder.status,
      });
      return { orderId, status: res.data.updatedOrder.status };
    } catch (err) {
      console.error(
        "UPDATE_ORDER_STATUS: Failed",
        err.response?.data?.message || "Network error"
      );
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Network error"
      );
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  allOrders: [],
  userOrders: [],
  loading: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    resetStatus: (state) => {
      state.message = null;
      state.error = null;
    },
    addOrder: (state, action) => {
      if (state.user) {
        if (!state.user.orders) state.user.orders = [];
        state.user.orders.push(action.payload);
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.message = "Registration successful. Please activate via email.";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        state.message = "Profile updated successfully";
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.allOrders = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        const order = state.allOrders.find((o) => o._id === orderId);
        if (order) order.status = status;
      });
  },
});

export const { logout, resetStatus, addOrder } = userSlice.actions;
export default userSlice.reducer;
