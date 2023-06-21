const usermodel = require("../models/usermodel");
const productmodel = require("../models/productmodel");
const cartmodel = require("../models/cart");
const ordermodel = require("../models/ordermodel");
const coupenmodel = require("../models/coupenmodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const wishlist = require("../models/whishlistmodel");
const path = require("path");
const moment = require("moment");
const { log } = require("console");
const { encode } = require("punycode");
const whishlistmodel = require("../models/whishlistmodel");
const dotenv = require("dotenv").config();
const Banner = require("../models/bannermodel");
const feedbackmodel=require('../models/feedbackmode')

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Japan",
  "China",
  "Brazil",
  "Mexico",
  "Russia",
  "South Africa",
  "Egypt",
  "Argentina",
  "Netherlands",
  "Switzerland",
  "Sweden",
];

const loginLoad = (req, res) => {
  // res.render(path.join(globalThis.viewsDir, 'index'))
  // res.render(`${globalThis.viewsDir}/user/login`)
  // res.render('index')
  try {
    res.render("user/ulogin");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const signupLoad = (req, res) => {
  // res.send("hi")

  // res.render(path.join(__dirname, '..', 'views', 'user', 'signup'))
  try {
    res.render("user/usignup");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const loadverify = async (req, res) => {
  try {
    const banner = await Banner.findOne({ activate: true });
    res.render("user/home1");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const sendverifymail = (name, email, user_id) => {
  const transporter = nodemailer.createTransport({
    host: process.env.ETHERIALHOST,
    port: process.env.ETHERIALPORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.ETHERILAUSERID,
      pass: process.env.ETHERIALPASSWORD,
    },
  });

  const mailoption = {
    from: process.env.FROMMAIL,
    to: email,
    // to: 'rttaehcct@bugfoo.com',

    subject: "verify your mail",
    text: "hello",
    html:
      "<p>hi " +
      name +
      ',please click here to <a href="http://finebonito.shop/register/verify?id=' +
      user_id +
      '">verify</a> your mail</p>  ',
  };
  transporter.sendMail(mailoption, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email has been verified", info.response);
    }
  });
};
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await usermodel.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    if (updateInfo) {
      res.redirect("/");
      console.log("verification completed");
    } else {
      console.log("verification failed");
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const signuphelper = async (req, res) => {
  try {
    let usermail = await usermodel.findOne({ email: req.body.email });
    if (usermail) {
      res.render("user/usignup", { message: "email already registered" });
    } else {
      const hashpassword = await bcrypt.hash(req.body.password, 10);

      const userdata = new usermodel({
        name: req.body.username,
        email: req.body.email,
        phone: req.body.phonenum,
        password: hashpassword,
        is_verified: false,
      });
      const userdatasave = await userdata.save();

      if (userdatasave) {
        sendverifymail(req.body.username, req.body.email, userdata._id);
        res.render("user/ulogin");
      } else {
        res.redirect("/signup");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const confirmpassword = (req, res, next) => {
  try {
    const pass = req.body.password;
    const conf = req.body.confirmpassword;
    if (pass == conf) {
      next();
    } else {
      res.render("user/usignup", { message: "password not matched" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const loginhelper = async (req, res) => {
  try {
    const loginemail = await usermodel.findOne({ email: req.body.email });

    if (loginemail) {
      const password = req.body.password;
      const loginpass = await bcrypt.compare(password, loginemail.password);

      if (loginpass) {
        if (loginemail.is_verified === "false") {
          res.render("user/ulogin", { message: "please verify your mail" });
        } else {
          if (loginemail.is_Blocked) {
            res.render("user/ulogin", { message: "Your account is blocked" });
          } else {
            req.session.status = true;
            req.session.userid = loginemail._id;
            const id = req.session.userid;
            username = req.session.name;
            const products = await productmodel.find({}).lean().exec();
            const banner = await Banner.findOne({ activate: true });

            res.render("user/home1", {
              products,
              username,
              id,
              banners: banner.image,
            });
          }
        }
      } else {
        res.render("user/ulogin", { message: "wrong password" });
      }
    } else {
      res.render("user/ulogin", { message: "Email does not exist" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.render("user/ulogin");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const homeload = async (req, res) => {
  try {
    const id = req.session.userid;
    
    const banner = await Banner.findOne({ activate: true });
    res.render("user/home1", {   id, banners: banner.image });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const shirtPageLoad = async (req, res) => {
  try {
    const products = await productmodel
      .find({ category: "shirts", isListed: { $ne: 1 } })
      .lean()
      .exec();

    if (products) {
      res.render("user/uProducts", { products });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const jeansPageLoad = async (req, res) => {
  try {
    const products = await productmodel
      .find({ category: "jeans", isListed: { $ne: 1 } })
      .lean()
      .exec();
    if (products) {
      res.render("user/uProducts", { products });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const shoesPageLoad = async (req, res) => {
  try {
    const products = await productmodel
      .find({ category: "shoes", isListed: { $ne: 1 } })
      .lean()
      .exec();
    if (products) {
      res.render("user/uProducts", { products });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const allProductsLoad = async (req, res) => {
  try {
    const products = await productmodel
      .find({ isListed: { $ne: 1 } })
      .lean()
      .exec();
    if (products) {
      res.render("user/uProducts", { products });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const productView = async (req, res) => {
  try {
    const product1 = req.query.id;
    const product = await productmodel.findById(product1);

    res.render("user/productview", {
      product,
      product_id: product1,
      initial: product.images[0],
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const usersearch = async (req, res) => {
  try {
    const search = req.body.search;

    const searchregex = new RegExp(search, "i");
    const result = await productmodel
      .find({ name: { $regex: searchregex }, category: req.body.category })
      .lean()
      .exec();
    if (result) {
      res.render("user/uProducts", { products: result });
    } else {
      res.render("user/uProducts", { message: "No results found" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const productFilter = async (req, res) => {
  try {
    let category = req.body.category;
    let priceFrom = Number(req.body.priceFrom);
    let priceTo = Number(req.body.priceTo);

    const products = await productmodel.aggregate([
      {
        $match: {
          category: category,
          price: {
            $lt: priceTo,
            $gt: priceFrom,
          },
        },
      },
    ]);
    if (products.length > 0) {
      res.render("user/uProducts", { products: products });
    } else {
      res.render("user/uProducts", { message: "No result found!!!!" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const userprofile = async (req, res) => {
  try {
    const user = await usermodel
      .findOne({ _id: req.session.userid })
      .lean()
      .exec();
    let addressDetails = user.address.map((data) => {
      return {
        type: data.type,
        housename: data.houseName,
        landmark: data.landmark,
        location: data.location,
        pincode: data.pincode,
        state: data.state,
        countries: data.countries,
        district: data.district,
        id: data._id,
      };
    });

    res.render("user/userProfile", { user, addressDetails });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const geteditprofile = async (req, res) => {
  try {
    const user = await usermodel
      .findOne({ _id: req.session.userid })
      .lean()
      .exec();
    if (user) {
      res.render("user/edituserdetails", { user });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

// const editdetails = async (req, res) => {
//   try {
//     const user1 = await usermodel.findOne({ _id: req.session.userid });
//     console.log(user1);
//     console.log("haaaai");
//     console.log(req.body, "images");
//     if(req.files){
//       if (user1) {
//         // res.send('haaai')
//         const user = await usermodel.updateOne(
//           { _id: user1.id },
//           {
//             $set: {
//               name: req.body.uname,
//               firstname: req.body.fname,
//               secondname: req.body.sname,
//               phone: req.body.phone,
//               landPhone: req.body.landPhone,
//               image: req.file.filename,
//             },
//           }
//         );
//         if (user) {
//           // console.log("adichu moneeee");
//           res.redirect("/userprofile");
//           // res.render('user/userProfile',{user})
//         }
//       }
//     }else{
//       if (user1) {
//         // res.send('haaai')
//         const user = await usermodel.updateOne(
//           { _id: user1.id },
//           {
//             $set: {
//               name: req.body.uname,
//               firstname: req.body.fname,
//               secondname: req.body.sname,
//               phone: req.body.phone,
//               landPhone: req.body.landPhone,

//             },
//           }
//         );
//         if (user) {
//           // console.log("adichu moneeee");
//           res.redirect("/userprofile");
//           // res.render('user/userProfile',{user})
//         }
//       }
//     }

//   } catch (error) {
//     console.log(error.message);
//     res.render("user/error");
//   }
// };

const editdetails = async (req, res) => {
  try {
    const userId = req.session.userid;
    const user = await usermodel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    let imagePath = user.image; // Current image path

    if (req.file) {
      // If a new image is uploaded
      const imageFile = req.file;
      const imageFileName = imageFile.filename;

      // Save the image file to a specific location
      imagePath = `users/${imageFileName}`; // New image path
    }

    user.firstname = req.body.fname;
    user.secondname = req.body.sname;
    user.phone = req.body.phone;
    user.landPhone = req.body.landPhone;
    user.image = imagePath; // Update the image path

    await user.save();

    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const addAddress = (req, res) => {
  try {
    res.render("user/address", { states: states, countries: countries });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const saveNewAddress = async (req, res) => {
  try {
    const addressData = req.body;
    const id = req.session.userid;
    const user = await usermodel.findOne({ _id: req.session.userid });

    user.address.push(addressData);
    user.save();
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const deleteAddress = async (req, res) => {
  try {
    // Find the user's profile
    const user = await usermodel.findOne({ _id: req.session.userid });

    const addressid = req.query.id;

    // Find the index of the address in the user's address array
    const addressDetails = await usermodel.updateOne(
      { _id: req.session.userid },
      { $pull: { address: { _id: addressid } } },
      { safe: true }
    );

    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
  // res.redirect('/userprofile')
};

const getOrders = async (req, res) => {
  try {
    let order = await ordermodel.findOne({ userid: req.session.userid });
    if (order) {
      let orders = await ordermodel
        .find({ userid: req.session.userid })
        .sort({ dateOrdered: -1, timeOrdered: -1 })
        .populate("orderItems.product")
        .exec();
      if (orders) {
        let orderDetails = orders.map((data) => {
          return {
            id: data._id,
            total: data.total,
            products: data.orderItems.map((details) => {
              return {
                name: details.product.name,
                price: details.product.price,
                quantity: details.quantity,
                size: details.size,
                image: details.product.images[0],
              };
            }),
            status: data.status,
            payment: data.paymentmethord,
            cancel: data.cancel,
            return: data.return,
            date: data.dateOrdered.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          };
        });

        res.render("user/order1", { orderDetails });
      }
    } else {
      res.render("user/order1", {
        message: "You dont have any Orders!!!",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const orderInfo = async (req, res) => {
  try {
    let orderId = req.query.id;

    let orders = await ordermodel
      .findOne({ _id: orderId })
      .populate("orderItems.product");
    const dateoforder1 = orders.dateOrdered.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (orders.deliveryDate) {
      var deliveryDate = orders.deliveryDate.toLocaleDateString("en-Us", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    const basic = await ordermodel.findOne({ _id: req.query.id });
    const basic1 = basic.status;

    let orderDetails = orders.orderItems.map((data) => {
      return {
        id: data.product._id,
        image: data.product.images[0],
        name: data.product.name,
        quantity: data.quantity,
        size: data.size,
        price: data.product.price,
      };
    });

    let total = orders.total;

    res.render("user/orderview", {
      orderDetails,
      total,
      dateoforder1,
      address: orders.address,
      basic1,
      basic: encodeURIComponent(JSON.stringify(basic)),
      dateoforder: encodeURIComponent(JSON.stringify(dateoforder1)),
      deliveryDate: encodeURIComponent(JSON.stringify(deliveryDate)),
      orderDetails1: encodeURIComponent(JSON.stringify(orderDetails)),
      totalforinvoice: encodeURIComponent(JSON.stringify(total)),
      addressinvoice: encodeURIComponent(JSON.stringify(orders.address)),
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await ordermodel.updateOne(
      { _id: req.query.id },
      { cancel: false, return: false, status: "cancelled" }
    );
    const order1 = await ordermodel.findOne({ _id: req.query.id });

    let user = await usermodel.findOne({ _id: req.session.userid });

    if (order1.paymentmethord == "onlinePayment") {
      let walletbal = user.wallet + order1.total;
      await usermodel.updateOne(
        { _id: req.session.userid },
        { $set: { wallet: walletbal } }
      );
    } else if (order1.paymentmethord == "wallet") {
      let user = await usermodel.findOne({ _id: req.session.userid });
      let walletbal = user.wallet + order1.total;
      await usermodel.updateOne(
        { _id: req.session.userid },
        { $set: { wallet: walletbal } }
      );
    }

    if (order) {
      res.redirect("/getorders");
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const returnOrder = async (req, res) => {
  try {
    const order = await ordermodel.updateOne(
      { _id: req.query.id },
      { cancel: false, return: false, status: "return" }
    );

    console.log(order);
    res.redirect("/getorders");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const getOrderDate = async (req, res) => {
  try {
    const orderId = decodeURIComponent(req.params.id);

    // Retrieve the order from the database
    const order = await ordermodel.findOne({ _id: orderId });
    console.log(order.dateOrdered);
    if (!order) {
      // Handle case where order is not found
      return res.status(404).json({ error: "Order not found" });
    }

    // Return the order date
    return res.status(200).json({ deliveryDate: order.deliveryDate });
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    res.render("user/error");
  }
};

const addMessage=async(req,res)=>{
  try{
   const feedbacknew=new feedbackmodel({
      userid:req.session.userid,
      feedback:req.body.feedback,
      timeOfsent:Date.now()
   })
   await feedbacknew.save()
   res.redirect('/getorders')
  }catch(error){
    console.log(error.message)
    res.render('user/error')
  }
}

//cart

const getCart = async (req, res) => {
  // req.session.userid = '6461e3224ab9eed5f2ef9aaf';

  try {
    const check = await cartmodel.findOne({ userid: req.session.userid });
    if (check) {
      const cart = await cartmodel
        .findOne({ userid: req.session.userid })
        .populate("product.productid")
        .lean()
        .exec();
      const products = cart.product.map((product) => {
        const total =
          Number(product.quantity) * Number(product.productid.price);
        return {
          _id: product.productid._id.toString(),
          name: product.productid.name,
          price: product.productid.price,
          description: product.productid.description,
          category: product.productid.category,
          image: product.productid.images[0],
          quantity: product.quantity,
          size: product.size,
          total,
        };
      });

      const total = products.reduce(
        (sum, product) => sum + Number(product.total),
        0
      );

      const finalAmount = total + 90;

      res.render("user/ucart", {
        products,
        total,
        subtotal: total,
        shipping: 90,
        finalAmount,
      });
      // res.send('H ')
    } else {
      res.render("user/ucart", { message: "Your cart is empty" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const addTocart = async (req, res) => {
  try {
    let proid = req.body.proid;
    let prosize = req.body.size;

    let cart = await cartmodel.findOne({ userid: req.session.userid });

    if (!cart) {
      let newCart = new cartmodel({ userid: req.session.userid, product: [] });
      await newCart.save();
      cart = newCart;
    }

    const existingproductindex = cart?.product.findIndex(
      (product) => product.productid == proid && product.size == prosize
    );

    if (existingproductindex == -1) {
      cart.product.push({ productid: proid, quantity: 1, size: prosize });
    } else {
      cart.product[existingproductindex].quantity += 1;
      cart.product.size = req.body.size;
    }

    await cart.save();

    // res.redirect("/loadProductview" + "?id=" + proid);
    res.send({ ok: true });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await whishlistmodel
      .findOne({ userid: req.session.userid })
      .populate("product.productid")
      .lean()
      .exec();
    if (wishlist) {
      const products = wishlist.product.map((data) => {
        return {
          id: data.productid._id,
          pname: data.productid.name,
          price: data.productid.price,
          description: data.productid.description,
          image: data.productid.images[0],
        };
      });
      res.render("user/uwishlist", { products });
    } else {
      res.render("user/uwishlist");
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const addTowishlist = async (req, res) => {
  try {
    const wishlist = await whishlistmodel.findOne({
      userid: req.session.userid,
    });
    if (!wishlist) {
      const newWishlist = new whishlistmodel({
        userid: req.session.userid,
        product: [],
      });
      await newWishlist.save();
      wishlist = newWishlist;
    }

    const productexist = wishlist.product.some((data) => {
      return data.productid._id == req.query.id;
    });

    if (!productexist) {
      wishlist.product.push({ productid: req.query.id });
      await wishlist.save();
    }
    const product = req.query.id;
    console.log(product, "Id aan tta");
    res.redirect("/loadProductview?id=" + product);
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const remove = await whishlistmodel.updateOne(
      { userid: req.session.userid },
      { $pull: { product: { productid: req.query.id } } }
    );
    if (remove) {
      res.redirect("/getWishlist");
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await cartmodel.findOne({ userid: req.session.userid });
    if (cart.product.length > 1) {
      const proid = req.query.id;
      const prosize = req.query.size;

      const remove = await cartmodel.findOneAndUpdate(
        // { userid: req.session.userid ,'product.productid':proid},
        // { $pull: { product: { size: prosize} } },
        // { new: true }
        { userid: req.session.userid },
        { $pull: { product: { productid: proid, size: prosize } } },
        { new: true }
      );

      if (remove) {
        res.redirect("/addtocart");
        // res.send('morning...')
      } else {
        res.send("remove not wrking");
      }
    } else {
      const drop = await cartmodel.deleteOne({ userid: req.session.userid });
      res.redirect("/addtocart" + "?userid=" + req.session.userid);
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const updateCart = async (req, res) => {
  try {
    const updatevalues = req.body.products;

    for (let data of updatevalues) {
      const { productid, quantity, size, finalAmount } = data;
      let change = await cartmodel.updateOne(
        {
          $and: [
            { userid: req.session.userid },
            { "product.productid": productid },
            { "product.size": size },
          ],
        },
        {
          $set: {
            "product.$[elem].quantity": quantity,
            "product.$[elem].total": finalAmount,
          },
        },
        {
          arrayFilters: [{ "elem.productid": productid }],
          multi: true,
        }
      );
    }
    // res.redirect('/addtocart'+'id='+req.session.userid)
    // res.redirect('/addtocart'+'?userid='+req.session.userid)
    res.send("haaai");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const getCheckOut = async (req, res) => {
  try {
    const coupen = await coupenmodel.find({}).lean().exec();

    const user = await usermodel
      .findOne({ _id: req.session.userid })
      .lean()
      .exec();
    const cart = await cartmodel
      .findOne({ userid: req.session.userid })
      .populate("product.productid")
      .lean()
      .exec();

    const total = cart.product.map((data) => {
      return Number(data.quantity) * Number(data.productid.price);
    });
    const useraddress = user.address.map((address) => {
      return {
        type: address.type,
        housename: address.houseName,
        location: address.location,
        landmark: address.landmark,
        pincode: address.pincode,
        state: address.state,
        country: address.countries,
        district: address.district,
        phone: user.phone,
      };
    });

    let totalamount1 = total.reduce((a, b) => a + b);

    const key = process.env.RAZORPAYKEY;
    let shipp = 90;
    let totalamount = totalamount1 + 90;
    let address = user.address.map((address) => {
      return {
        type: address.type,
      };
    });
    // let address=useraddress.type
    const wallet = user.wallet;

    res.render("user/ucheckout", {
      user,
      useraddress: encodeURIComponent(JSON.stringify(useraddress)),
      total: cart.product[0].total,
      address,
      totalamount,
      totalamount1,
      shipp,
      key,
      coupen: encodeURIComponent(JSON.stringify(coupen)),
      wallet: encodeURIComponent(JSON.stringify(wallet)),
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const addAddressinCheckout = (req, res) => {
  try {
    res.render("user/addresscheckout", {
      states: states,
      countries: countries,
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const saveAddressInCheckout = async (req, res) => {
  try {
    const addressData = req.body;
    const id = req.session.userid;
    const user = await usermodel.findOne({ _id: req.session.userid });

    user.address.push(addressData);
    user.save();
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const razorPay = async (req, res) => {
  try {
    var options = {
      amount: req.body.total, // amount in the smallest currency unit
      currency: "INR",
      receipt: "rcp1",
    };
    instance.orders.create(options, function (err, order) {
      res.send({ orderId: order.id });
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    let body =
      req.body.response.razorpay_order_id +
      "|" +
      req.body.response.razorpay_payment_id;

    var crypto = require("crypto");
    var expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAYKEY)
      .update(body.toString())
      .digest("hex");
    console.log("sig received ", req.body.response.razorpay_signature);
    console.log("sig generated ", expectedSignature);
    var response = { signatureIsValid: "false" };
    if (expectedSignature === req.body.response.razorpay_signature)
      response = { signatureIsValid: "true" };
    res.send(response);
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const sweetalert = (req, res) => {
  try {
    res.render("user/sweetalert");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const checkOutpage = async (req, res) => {
  try {
    const cart = await cartmodel
      .findOne({ userid: req.session.userid })
      .populate("product.productid")
      .lean()
      .exec();

    if (!cart) {
      return res.send("Cart is empty");
    }

    const productIds = cart.product.map((item) => ({
      product: item.productid._id,
      quantity: item.quantity,
      size: item.size,
    }));

    const user = await usermodel.findOne({ _id: req.session.userid });
    // const address = user.address[req.body.addressSelect];
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
    console.log(newOrder, "newOrder");
    console.log(savedOrder, "savedorder");
    for (let i = 0; i < savedOrder.orderItems.length; i++) {}

    if (savedOrder) {
      // setTimeout(() => {
      //   res.redirect("/getorders");
      // }, 2000);
      // res.json({success:true})
      res.render("user/sweetalert");

      await cartmodel.findOneAndRemove({ userid: req.session.userid });
    } else {
      res.send("Error while placing the order");
    }
  } catch (error) {
    console.log(error.message);

    res.render("user/error");
  }
  // console.log(success);
  // res.send('ghaaaa')
};

module.exports = {
  loginLoad,
  signupLoad,
  signuphelper,
  confirmpassword,
  loginhelper,

  logout,
  verifyMail,
  loadverify,

  shirtPageLoad,
  homeload,
  jeansPageLoad,
  shoesPageLoad,
  allProductsLoad,
  productView,

  usersearch,
  userprofile,
  geteditprofile,
  editdetails,

  getCart,
  addTocart,
  removeFromCart,
  updateCart,

  getCheckOut,
  checkOutpage,
  addAddress,
  saveNewAddress,
  deleteAddress,
  addAddressinCheckout,
  saveAddressInCheckout,

  getOrders,
  orderInfo,
  cancelOrder,
  returnOrder,
  getOrderDate,
  addMessage,
  razorPay,
  verifyRazorpay,
  sweetalert,
  getWishlist,
  addTowishlist,
  removeFromWishlist,
  productFilter,
};
