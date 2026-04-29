import Product from "../models/ProductModel.js";

const LIST_FIELDS =
  "name code category price salePrice images stock isCustomerFavorite isNewArrival createdAt";

export const createProduct = async (req, res) => {
  console.log("CREATE_PRODUCT: Request received", { body: req.body });
  try {
    const product = await Product.create(req.body);
    console.log("CREATE_PRODUCT: Product created successfully", product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create product" });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.newArrival === "true") {
      query.isNewArrival = true;
    }
    if (req.query.customerFav === "true") {
      query.isCustomerFavorite = true;
    }
    if (req.query.search?.trim()) {
      const search = req.query.search.trim();
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const [products, totalDocs] = await Promise.all([
      Product.find(query)
        .select(LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      page,
      pages: Math.ceil(totalDocs / limit),
      total: totalDocs,
    });
  } catch (error) {
    console.error("GET_ALL_PRODUCTS_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHomeProducts = async (req, res) => {
  try {
    const LIMIT = 4;
    const homeFields =
      "name code category price salePrice images stock isCustomerFavorite isNewArrival createdAt";

    const [NewArrivals, CustomerFav, Kohinoor, FlossieExecutive, Dastaan] =
      await Promise.all([
        Product.find({ isNewArrival: true })
          .select(homeFields)
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ isCustomerFavorite: true })
          .select(homeFields)
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ category: "Kohinoor" })
          .select(homeFields)
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ category: "FlossieExecutive" })
          .select(homeFields)
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ category: "Dastaan" })
          .select(homeFields)
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
      ]);

    res.status(200).json({
      success: true,
      data: { NewArrivals, CustomerFav, Kohinoor, FlossieExecutive, Dastaan },
    });
  } catch (error) {
    console.error("HOME_API_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch home products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("GET_PRODUCT_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
};

export const updateProduct = async (req, res) => {
  console.log("UPDATE_PRODUCT: Request received", {
    id: req.params.id,
    body: req.body,
  });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      console.warn("UPDATE_PRODUCT: Product not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    console.log("UPDATE_PRODUCT: Product updated successfully", product);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("DELETE_PRODUCT: Request received", { id: req.params.id });
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean();
    if (!product) {
      console.warn("DELETE_PRODUCT: Product not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log("DELETE_PRODUCT: Product deleted successfully", product);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};
