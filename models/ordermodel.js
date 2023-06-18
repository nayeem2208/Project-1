const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: Array,
    default: [],
  },
  address: 
    {
      houseName: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
       
      },
      location: {
        type: String,
      },
      district: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pincode: {
        type: Number,
      },
    },

  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: String,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  paymentmethord: {
    type: String,
    required: true,
  },
  dateOrdered: {
    type: Date,
    default: Date.now(),
  },
  deliveryDate:{
    type:Date
  },
  cancel: {
    type: Boolean,
    default: true,
  },
  return: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.set("toJSON", {
  virtuals: true,
});
module.exports = mongoose.model("orders", orderSchema);
