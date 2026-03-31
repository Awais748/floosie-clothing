import User from "../models/UserModel.js";
import mongoose from "mongoose";

const toObjId = (id) => new mongoose.Types.ObjectId(id);
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);

// GET /api/cart/
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("cart").lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, items: user.cart || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/cart/add
export const addToCart = async (req, res) => {
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

  try {
    // If item already in cart → increment quantity
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

    // Else → push new item
    if (!updated) {
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/cart/update
export const updateQuantity = async (req, res) => {
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
      // Remove item if quantity hits 0
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { cart: { productId: pid, size: sizeVal, color: colorVal } } },
        { lean: true, projection: { _id: 1 } }
      );
    } else {
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } },
      { lean: true, projection: { _id: 1 } }
    );
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/cart/sync  (login pe guest cart → DB merge)
export const syncCart = async (req, res) => {
  const { localItems } = req.body;

  // No local items → just return DB cart
  if (!Array.isArray(localItems) || localItems.length === 0) {
    const user = await User.findById(req.user._id).select("cart").lean();
    return res.json({ success: true, items: user?.cart || [] });
  }

  try {
    const bulkOps = localItems
      .filter((item) => isValidId(item.productId || item._id))
      .flatMap((item) => {
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
          // If item exists → increment qty
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
          // If item doesn't exist → push
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

    await User.bulkWrite(bulkOps, { ordered: false });

    const user = await User.findById(req.user._id).select("cart").lean();
    res.json({ success: true, items: user?.cart || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
