import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// ─── Local Storage helpers ─────────────────────────────────────────────────────
const GUEST_KEY = "guest_favorites";

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
};

const writeGuest = (ids) => {
  localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
};

const clearGuest = () => {
  localStorage.removeItem(GUEST_KEY);
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

/** Fetch favorites for a logged-in user */
export const fetchFavorites = createAsyncThunk(
  "wishlist/fetchFavorites",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.favorites.map((p) => (typeof p === "object" ? p._id : p));
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch"
      );
    }
  }
);

/** Add a product to favorites (logged-in user) */
export const addFavoriteAPI = createAsyncThunk(
  "wishlist/addFavorite",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.post(
        `${API_URL}/api/wishlist/add`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.favorites;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to add"
      );
    }
  }
);

/** Remove a product from favorites (logged-in user) */
export const removeFavoriteAPI = createAsyncThunk(
  "wishlist/removeFavorite",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const res = await axios.delete(
        `${API_URL}/api/wishlist/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.favorites;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to remove"
      );
    }
  }
);

/** Sync guest localStorage favorites to MongoDB after login */
export const syncGuestFavorites = createAsyncThunk(
  "wishlist/syncGuest",
  async (_, thunkAPI) => {
    try {
      const guestFavorites = readGuest();

      // ✅ FIX: Guest mein kuch nahi — sirf DB se fetch karo, guest inject mat karo
      if (guestFavorites.length === 0) {
        clearGuest(); // ensure clean slate
        return null; // signal: no sync needed
      }

      const token = thunkAPI.getState().user.token;
      const res = await axios.post(
        `${API_URL}/api/wishlist/sync`,
        { guestFavorites },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearGuest(); // ✅ localStorage clear after successful sync
      return res.data.favorites; // merged array of ID strings
    } catch (err) {
      clearGuest(); // ✅ Error pe bhi clear karo — stale guest data nahi rehna chahiye
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Sync failed"
      );
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    // ✅ FIX: initialState mein user logged-in hai ya nahi check karo
    // Agar token localStorage mein hai → user logged-in → guest data load mat karo
    // Agar token nahi → guest → localStorage se load karo
    favorites: (() => {
      const token = localStorage.getItem("token");
      return token ? [] : readGuest(); // logged-in user ke liye empty, fetchFavorites fill karega
    })(),
    loading: false,
    error: null,
  },
  reducers: {
    /** Toggle favorite for GUEST users (no token) */
    toggleGuestFavorite: (state, action) => {
      const id = action.payload;
      const idx = state.favorites.indexOf(id);
      if (idx === -1) {
        state.favorites.push(id);
      } else {
        state.favorites.splice(idx, 1);
      }
      writeGuest(state.favorites);
    },

    /** ✅ FIX: Logout pe Redux state clear karo AUR guest data load karo */
    clearWishlist: (state) => {
      state.favorites = readGuest(); // logout pe guest state restore karo
      state.error = null;
    },

    /** Load fresh guest state (e.g. after logout) */
    loadGuestFavorites: (state) => {
      state.favorites = readGuest();
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchFavorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload; // ✅ Sirf DB data — no guest contamination
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── addFavoriteAPI
      .addCase(addFavoriteAPI.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })

      // ── removeFavoriteAPI
      .addCase(removeFavoriteAPI.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })

      // ── syncGuestFavorites
      .addCase(syncGuestFavorites.fulfilled, (state, action) => {
        // ✅ FIX: null return tha matlab no guest items — state mat chhedo, fetchFavorites karega
        if (action.payload !== null) {
          state.favorites = action.payload;
        }
      })
      .addCase(syncGuestFavorites.rejected, (state) => {
        // Sync fail bhi hua toh state empty rakho — fetchFavorites DB se load karega
        state.favorites = [];
      });
  },
});

export const { toggleGuestFavorite, clearWishlist, loadGuestFavorites } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
