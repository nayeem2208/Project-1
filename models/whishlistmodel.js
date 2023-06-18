const mongoose = require("mongoose");

const wishlistschema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      }
    }
  ],
});

module.exports = mongoose.model("wishlist", wishlistschema);
