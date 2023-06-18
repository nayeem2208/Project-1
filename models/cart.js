const mongoose = require("mongoose");

const cartschema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        required: true,
      },
      size:{
        type:String,
        required:true
      },
      total:{
        type:String,
        default:0
      }
    },
  ],
});

module.exports = mongoose.model("cart", cartschema);


// const mongoose = require("mongoose");

// const cartschema = new mongoose.Schema({
//   userid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   product: [
//     {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "products",
//     },
//   ],
// });

// module.exports = mongoose.model("cart", cartschema);
