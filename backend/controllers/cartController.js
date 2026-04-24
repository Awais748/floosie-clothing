import User from "../models/UserModel.js";
import mongoose from "mongoose";

const toObjId = (id) => {
  console.log("Converting to ObjectId:", id);
  return new mongoose.Types.ObjectId(id);
};

const isValidId = (id) => {
  const valid = id && mongoose.Types.ObjectId.isValid(id);
  console.log("Checking ID valid:", id, "=>", valid);
  return valid;
};

export const getCart = async (req, res) => {
  console.log("GET CART API CALLED");

  try {
    console.log("User ID:", req.user._id);

    const user = await User.findById(req.user._id).select("cart").lean();
    console.log("User Cart Data:", user);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, items: user.cart || [] });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  console.log("ADD TO CART API CALLED");
  console.log("Request Body:", req.body);

  const {
    productId,
    quantity = 1,
    name,
    price,
    originalPrice,
    image,
    category,
    size,
    color,
  } = req.body;

  if (!isValidId(productId))
    return res
      .status(400)
      .json({ success: false, message: "Valid Product ID required" });

  const pid = toObjId(productId);
  const qty = Math.max(1, Number(quantity) || 1);
  const sizeVal = size || null;
  const colorVal = color || null;

  console.log("Processed Values:", { pid, qty, sizeVal, colorVal });

  try {
    console.log("Trying to update existing item...");

    const updated = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "cart.productId": pid,
        "cart.size": sizeVal,
        "cart.color": colorVal,
      },
      { $inc: { "cart.$.quantity": qty } },
      { new: false, lean: true, projection: { _id: 1 } }
    );

    console.log("Update Result:", updated);

    if (!updated) {
      console.log("Item not found → pushing new item");

      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            cart: {
              productId: pid,
              quantity: qty,
              name: name || "",
              price: Number(price) || 0,
              originalPrice: Number(originalPrice || price) || 0,
              image: image || "",
              category: category || "",
              size: sizeVal,
              color: colorVal,
            },
          },
        },
        { lean: true, projection: { _id: 1 } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE QUANTITY
export const updateQuantity = async (req, res) => {
  console.log("UPDATE QUANTITY API CALLED");
  console.log("Request Body:", req.body);

  const { productId, size, color, quantity } = req.body;

  if (!isValidId(productId))
    return res
      .status(400)
      .json({ success: false, message: "Valid Product ID required" });

  const pid = toObjId(productId);
  const sizeVal = size || null;
  const colorVal = color || null;

  try {
    if (Number(quantity) <= 0) {
      console.log("Quantity <= 0 → removing item");

      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { cart: { productId: pid, size: sizeVal, color: colorVal } } },
        { lean: true, projection: { _id: 1 } }
      );
    } else {
      console.log("Updating quantity to:", quantity);

      await User.findOneAndUpdate(
        {
          _id: req.user._id,
          "cart.productId": pid,
          "cart.size": sizeVal,
          "cart.color": colorVal,
        },
        { $set: { "cart.$.quantity": Number(quantity) } },
        { lean: true, projection: { _id: 1 } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  console.log("REMOVE FROM CART API CALLED");
  console.log("Params:", req.params);
  console.log("Query:", req.query);

  const { productId } = req.params;
  const { size, color } = req.query;

  if (!isValidId(productId))
    return res
      .status(400)
      .json({ success: false, message: "Valid Product ID required" });

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          cart: {
            productId: toObjId(productId),
            size: size || null,
            color: color || null,
          },
        },
      },
      { lean: true, projection: { _id: 1 } }
    );

    console.log("Item removed");

    res.json({ success: true });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  console.log("CLEAR CART API CALLED");

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } },
      { lean: true, projection: { _id: 1 } }
    );

    console.log("Cart cleared");

    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// SYNC CART
export const syncCart = async (req, res) => {
  console.log("SYNC CART API CALLED");
  console.log("Local Items:", req.body.localItems);

  const { localItems } = req.body;

  if (!Array.isArray(localItems) || localItems.length === 0) {
    console.log("No local items → returning DB cart");

    const user = await User.findById(req.user._id).select("cart").lean();
    return res.json({ success: true, items: user?.cart || [] });
  }

  try {
    console.log("Merging local cart with DB...");

    const bulkOps = localItems
      .filter((item) => isValidId(item.productId || item._id))
      .flatMap((item) => {
        console.log("Processing item:", item);

        const pid = toObjId(item.productId || item._id);
        const qty = Number(item.quantity) || 1;
        const sizeVal = item.size || null;
        const colorVal = item.color || null;

        const cartItem = {
          productId: pid,
          quantity: qty,
          name: item.name || "",
          price: Number(item.price) || 0,
          originalPrice: Number(item.originalPrice || item.price) || 0,
          image: item.image || "",
          category: item.category || "",
          size: sizeVal,
          color: colorVal,
        };

        return [
          {
            updateOne: {
              filter: {
                _id: req.user._id,
                "cart.productId": pid,
                "cart.size": sizeVal,
                "cart.color": colorVal,
              },
              update: { $inc: { "cart.$.quantity": qty } },
            },
          },
          {
            updateOne: {
              filter: {
                _id: req.user._id,
                cart: {
                  $not: {
                    $elemMatch: {
                      productId: pid,
                      size: sizeVal,
                      color: colorVal,
                    },
                  },
                },
              },
              update: { $push: { cart: cartItem } },
            },
          },
        ];
      });

    console.log("Bulk Operations:", bulkOps);

    await User.bulkWrite(bulkOps, { ordered: false });

    const user = await User.findById(req.user._id).select("cart").lean();

    console.log("Final Cart:", user?.cart);

    res.json({ success: true, items: user?.cart || [] });
  } catch (err) {
    console.error("Error in syncCart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
