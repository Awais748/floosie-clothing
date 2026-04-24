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
    setField: (state, { payload: { name, value } }) => {
      state.form[name] = value;
      if (name === "state") state.form.city = "";
    },

    prefillFromUser: (state, { payload: user }) => {
      if (!user) {
        console.warn("CHECKOUT: prefillFromUser called with no user");
        return;
      }
      state.form.fullName = `${user.FirstName || ""} ${
        user.LastName || ""
      }`.trim();
      state.form.email = user.Email || "";
      console.log("CHECKOUT: Form prefilled from user", {
        fullName: state.form.fullName,
        email: state.form.email,
      });
    },

    resetForm: (state) => {
      state.form = defaultForm;
      console.log("CHECKOUT: Form reset after order");
    },
  },
});

export const { setField, prefillFromUser, resetForm } = checkoutSlice.actions;
export default checkoutSlice.reducer;
