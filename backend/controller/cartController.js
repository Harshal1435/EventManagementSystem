import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";


// ➕ ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    console.log("Adding to cart:", { productId, quantity, productStatus: product.status });

    let cart = await Cart.findOne({ userId: req.user.id });

    // If cart not exists → create
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [
          {
            productId,
            quantity,
            price: product.price
          }
        ]
      });
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 📥 GET USER CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId", "name price");

    if (!cart) return res.json({ items: [], total: 0 });

    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    res.json({ cart, total });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ✏️ UPDATE ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });

    const item = cart.items.find(
      item => item.productId.toString() === req.params.id
    );

    if (!item) return res.status(404).json({ msg: "Item not found" });

    item.quantity = quantity;

    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ❌ REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.id
    );

    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// 🗑️ CLEAR CART
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });

    res.json({ msg: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};