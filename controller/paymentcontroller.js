const Razorpay = require("razorpay");
const cartmodel = require("../models/cart");
const usermodel = require("../models/usermodel");
const productmodel = require("../models/productmodel");

const ordermodel = require("../models/ordermodel");
const dotenv = require("dotenv").config();
const { RAZORPAY_SECRET } = process.env;
const RAZORPAY_KEY = process.env.RAZORPAY_KEY;

const razorPayInstance = new Razorpay({
  key_id: RAZORPAY_KEY,
  key_secret: RAZORPAY_SECRET,
});

const razorPayy = async (req, res) => {
  try {
    const amount = parseInt(req.body.total) * 100;
    console.log(req.body);
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "nayeem670@gmail.com",
    };

    razorPayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order created",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_KEY,
          product_name: req.body.name,
          contact: "9656895403",
          name: "nayeem ce ",
          email: "nayeem670@gmail.com",
        });
      } else {
        console.log(err);
        res.status(400).send({ success: false, msg: "Something went wrong" });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const paymentDone = async (req, res) => {
  try {
    const cart = await cartmodel
      .findOne({ userid: req.session.userid })
      .populate("product.productid")
      .lean()
      .exec();

    const productIds = cart.product.map((item) => ({
      product: item.productid._id,
      quantity: item.quantity,
      size: item.size,
    }));

    const user = await usermodel.findOne({ _id: req.session.userid });
    const address = {
      houseName: req.body.houseName,
      landmark: req.body.landMark,
      location: req.body.location,
      district: req.body.district,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.zip,
    };

    const newOrder = new ordermodel({
      userid: req.session.userid,
      username: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      landPhone: req.body.landline,
      address: {
        houseName: req.body.houseName,
        landmark: req.body.landMark,
        location: req.body.location,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.zip,
      },
      total: req.body.total,
      paymentmethord: req.body.typeofpayment,
      orderItems: productIds,
      message: req.body.message,
      dateOrdered: Date.now(),
    });

    const savedOrder = await newOrder.save();

    if (savedOrder) {
      let cart = await cartmodel.findOne({ userid: req.session.userid });
      // Update the stock count of products
      cart.product.forEach(async (product) => {
        const productId = product.productid;
        const quantity = product.quantity;

        // Find the product by ID
        const foundProduct = await productmodel.findById(productId);

        // Calculate the new stock count
        const newStock = parseInt(foundProduct.stock) - parseInt(quantity);

        // Update the stock count in the database
        await productmodel.findByIdAndUpdate(productId, { stock: newStock });
      });
      await cartmodel.findOneAndDelete({ userid: req.session.userid });

      res.send({ isOk: true, message: "" });
      await cartmodel.findOneAndRemove({ userid: req.session.userid });
    } else {
      res.send({ isOk: false, message: "Error while placing the order" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const walletCheckout = async (req, res) => {
  try {
    const cart = await cartmodel
      .findOne({ userid: req.session.userid })
      .populate("product.productid")
      .lean()
      .exec();

    const productIds = cart.product.map((item) => ({
      product: item.productid._id,
      quantity: item.quantity,
      size: item.size,
    }));

    const user = await usermodel.findOne({ _id: req.session.userid });
    const walletbalance = user.wallet - req.body.total;
    const address = {
      houseName: req.body.houseName,
      landmark: req.body.landMark,
      location: req.body.location,
      district: req.body.district,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.zip,
    };

    const newOrder = new ordermodel({
      userid: req.session.userid,
      username: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      landPhone: req.body.landline,
      address: {
        houseName: req.body.houseName,
        landmark: req.body.landMark,
        location: req.body.location,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.zip,
      },
      total: req.body.total,
      paymentmethord: req.body.typeofpayment,
      orderItems: productIds,
      message: req.body.message,
      dateOrdered: Date.now(),
    });

    const savedOrder = await newOrder.save();
    if (savedOrder) {
      cart.product.forEach(async (product) => {
        const productId = product.productid;
        const quantity = product.quantity;

        // Find the product by ID
        const foundProduct = await productmodel.findById(productId);

        // Calculate the new stock count
        const newStock = parseInt(foundProduct.stock) - parseInt(quantity);

        // Update the stock count in the database
        await productmodel.findByIdAndUpdate(productId, { stock: newStock });
      });
    }

    await usermodel.updateOne(
      { _id: req.session.userid },
      { $set: { wallet: walletbalance } }
    );

    if (savedOrder) {
      // res.render('user/sweetalert')
      res.send({ isOk: true, message: "" });
      await cartmodel.findOneAndRemove({ userid: req.session.userid });
    } else {
      res.send({ isOk: false, message: "Error while placing the order" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

module.exports = {
  razorPayy,
  paymentDone,
  walletCheckout,
};
