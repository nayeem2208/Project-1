const path = require("path");
const multer = require("multer");
const productmodel = require("../models/productmodel");
const categorymodel = require("../models/categorymodel");

const add_product = async (req, res) => {
  try {
    var arrayimage = [];
    for (let i = 0; i < req.files.length; i++) {
      arrayimage[i] = req.files[i].filename;
    }

    const productsdata = new productmodel({
      name: req.body.name,

      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      images: arrayimage,
      stock: req.body.stock,
    });
    const productimage = await productsdata.save();
    if (productimage) {
      
      res.redirect("/admin/loadProducts");
    } else {
      console.log("data not stored");
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const productsLoad = async (req, res) => {
  try {
    const products = await productmodel.find({}).lean().exec();
    res.render("admin/adminproducts", { products: products });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const loadAddProducts = async (req, res) => {
  try {
    const category = await categorymodel.find({}).lean().exec();
    res.render("admin/addproducts", { category });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const loadEditProducts = async (req, res) => {
  try {
    const category = await categorymodel.find({}).lean().exec();
    const products = await productmodel
      .findOne({ _id: req.query.id })
      .lean()
      .exec();
    res.render("admin/admineditproducts", { products, category });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
const editproducts = async (req, res) => {
  try {
    const product = await productmodel.findById({ _id: req.query.id });

    let updatedProductData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      images: product.images,
      stock: req.body.stock,
    };

    if (req.files && req.files.length > 0) {
      updatedProductData.images.push(...req.files.map((file) => file.filename))
    }

    const product1 = await productmodel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: updatedProductData }
    );

    res.redirect("/admin/loadProducts");
  } catch (error) {
    console.error("Error updating product:", error);
    res.render("user/error");
  }
};

const deleteImage = async (req, res) => {
  try {
    
    const index = req.body.index;
    const product = await productmodel.findOne({ _id: req.body.productId });
    if (product) {
      product.images.splice(index, 1);
      
      await product.save();
      return res.status(200).json({ message: "Image deleted successfully" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const removeProducts = async (req, res) => {
  try {
    await productmodel.updateOne({ _id: req.query.id },{$set:{isListed:1}});

    res.redirect("/admin/loadProducts");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const getProductsBack=async(req,res)=>{
  try {
    await productmodel.updateOne({ _id: req.query.id },{$set:{isListed:0}});

    res.redirect("/admin/loadProducts");
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
}

// const addimage=async(req,res)=>{
//     const
// }

module.exports = {
  add_product,
  productsLoad,
  loadAddProducts,
  removeProducts,
  loadEditProducts,
  editproducts,
  deleteImage,
  getProductsBack
};
