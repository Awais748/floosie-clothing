import Product from "../models/ProductModel.js";

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
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
    const products = await Product.find();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHomeProducts = async (req, res) => {
  try {
    const LIMIT = 4;

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

    res.status(200).json({
      success: true,
      data: {
        NewArrivals,
        CustomerFav,
        Kohinoor,
        FlossieExecutive,
        Dastaan,
      },
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
    const product = await Product.findById(req.params.id);
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
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log(product);
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
