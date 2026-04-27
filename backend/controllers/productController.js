import Product from "../models/ProductModel.js";

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

    const [products, totalDocs] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(),
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
  console.log("GET_HOME_PRODUCTS: Request received");
  try {
    const LIMIT = 4;
    console.log("GET_HOME_PRODUCTS: Fetching all sections with limit", LIMIT);

    const [NewArrivals, CustomerFav, Kohinoor, FlossieExecutive, Dastaan] =
      await Promise.all([
        Product.find({ isNewArrival: true })
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ isCustomerFavorite: true }).limit(LIMIT).lean(),
        Product.find({ category: "Kohinoor" })
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ category: "FlossieExecutive" })
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
        Product.find({ category: "Dastaan" })
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .lean(),
      ]);

    console.log("GET_HOME_PRODUCTS: Sections fetched", {
      NewArrivals: NewArrivals.length,
      CustomerFav: CustomerFav.length,
      Kohinoor: Kohinoor.length,
      FlossieExecutive: FlossieExecutive.length,
      Dastaan: Dastaan.length,
    });

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
  console.log("GET_PRODUCT_BY_ID: Request received", { id: req.params.id });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.warn("GET_PRODUCT_BY_ID: Product not found", {
        id: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log("GET_PRODUCT_BY_ID: Product found", product);
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
