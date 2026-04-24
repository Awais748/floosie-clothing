import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;
const CART_KEY = "cart_items";

const loadLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};
const saveLocal = (items) =>
  localStorage.setItem(CART_KEY, JSON.stringify(items));
const clearLocal = () => localStorage.removeItem(CART_KEY);

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const findIdx = (items, { productId, size, color }) =>
  items.findIndex(
    (i) =>
      String(i.productId) === String(productId) &&
      (i.size || null) === (size || null) &&
      (i.color || null) === (color || null)
  );

export const fetchCart = createAsyncThunk("cart/fetch", async (_, api) => {
  const token = api.getState().user.token;
  if (!token) {
    console.warn("FETCH_CART: No token — skipping");
    return [];
  }
  try {
    const res = await axios.get(`${API}/api/cart/`, authHeader(token));
    console.log("FETCH_CART: Success", { count: res.data.items?.length });
    return res.data.items || [];
  } catch (err) {
    console.error("FETCH_CART: Failed", err.message);
    throw err;
  }
});

export const syncCartDb = createAsyncThunk(
  "cart/sync",
  async (localItems, api) => {
    const token = api.getState().user.token;
    if (!token) {
      console.warn("SYNC_CART: No token — skipping");
      return [];
    }
    try {
      const res = await axios.post(
        `${API}/api/cart/sync`,
        { localItems },
        authHeader(token)
      );
      console.log("SYNC_CART: Success", { count: res.data.items?.length });
      return res.data.items || [];
    } catch (err) {
      console.error("SYNC_CART: Failed", err.message);
      throw err;
    }
  }
);

const bgSync = async (fn) => {
  try {
    await fn();
  } catch (err) {
    console.warn("CART: DB sync failed (non-critical)", err.message);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadLocal(),
    isOpen: false,
    loading: false,
    error: null,
  },

  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    addToCart: (state, { payload }) => {
      const idx = findIdx(state.items, payload);
      if (idx > -1) {
        state.items[idx].quantity += payload.quantity || 1;
        console.log("ADD_TO_CART: Quantity updated", {
          productId: payload.productId,
          quantity: state.items[idx].quantity,
        });
      } else {
        state.items.push({ ...payload, quantity: payload.quantity || 1 });
        console.log("ADD_TO_CART: New item added", {
          productId: payload.productId,
          size: payload.size,
          color: payload.color,
        });
      }
      saveLocal(state.items);
      state.isOpen = true;
    },

    removeFromCart: (state, { payload }) => {
      const { productId, size, color } = payload;
      state.items = state.items.filter(
        (i) =>
          !(
            String(i.productId) === String(productId) &&
            (i.size || null) === (size || null) &&
            (i.color || null) === (color || null)
          )
      );
      saveLocal(state.items);
      console.log("REMOVE_FROM_CART: Item removed", { productId, size, color });
    },

    updateQuantity: (state, { payload }) => {
      const { productId, size, color, quantity } = payload;
      const idx = findIdx(state.items, { productId, size, color });
      if (idx === -1) return;

      if (quantity <= 0) {
        state.items.splice(idx, 1);
        console.log("UPDATE_QUANTITY: Item removed (qty 0)", { productId });
      } else {
        state.items[idx].quantity = quantity;
        console.log("UPDATE_QUANTITY: Updated", { productId, quantity });
      }
      saveLocal(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.isOpen = false;
      clearLocal();
      console.log("CLEAR_CART: Cart cleared");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
        saveLocal(payload);
      })
      .addCase(fetchCart.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
        console.error("FETCH_CART: State error set", error.message);
      })
      .addCase(syncCartDb.fulfilled, (state, { payload }) => {
        state.items = payload;
        saveLocal(payload);
      })
      .addCase("user/logout", (state) => {
        state.items = [];
        state.isOpen = false;
        clearLocal();
        console.log("CART: Cleared on logout");
      });
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  resetCart,
} = cartSlice.actions;

export const addToCartAction = (item) => (dispatch, getState) => {
  dispatch(addToCart(item));
  const token = getState().user.token;
  if (token) {
    bgSync(() => axios.post(`${API}/api/cart/add`, item, authHeader(token)));
  }
};

export const removeFromCartAction =
  ({ productId, size, color }) =>
  (dispatch, getState) => {
    dispatch(removeFromCart({ productId, size, color }));
    const token = getState().user.token;
    if (token) {
      bgSync(() =>
        axios.delete(`${API}/api/cart/remove/${productId}`, {
          params: { size: size || null, color: color || null },
          ...authHeader(token),
        })
      );
    }
  };

export const updateQuantityAction =
  ({ productId, size, color, quantity }) =>
  (dispatch, getState) => {
    dispatch(updateQuantity({ productId, size, color, quantity }));
    const token = getState().user.token;
    if (token) {
      bgSync(() =>
        axios.put(
          `${API}/api/cart/update`,
          { productId, size, color, quantity },
          authHeader(token)
        )
      );
    }
  };

export const clearCartAction = () => (dispatch, getState) => {
  dispatch(clearCart());
  const token = getState().user.token;
  if (token) {
    bgSync(() => axios.delete(`${API}/api/cart/clear`, authHeader(token)));
  }
};

export default cartSlice.reducer;
