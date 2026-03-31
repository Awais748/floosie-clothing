import { createSlice } from "@reduxjs/toolkit";

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  country: "Pakistan",
  state: "",
  city: "",
  zip: "",
  agreeToTerms: false,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    form: defaultForm,
  },

  reducers: {
    // Update a single field
    setField: (state, { payload: { name, value } }) => {
      state.form[name] = value;
      // Reset city when state changes
      if (name === "state") state.form.city = "";
    },

    // Pre-fill form from logged-in user data
    prefillFromUser: (state, { payload: user }) => {
      if (!user) return;
      state.form.fullName = `${user.FirstName || ""} ${
        user.LastName || ""
      }`.trim();
      state.form.email = user.Email || "";
    },

    // Clear form after order is placed
    resetForm: (state) => {
      state.form = defaultForm;
    },
  },
});

export const { setField, prefillFromUser, resetForm } = checkoutSlice.actions;
export default checkoutSlice.reducer;
