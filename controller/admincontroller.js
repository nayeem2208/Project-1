const adminmodel = require("../models/adminmodel");
const userModel = require("../models/usermodel");
const categorymodel = require("../models/categorymodel");
const ordermodel = require("../models/ordermodel");
const coupenmodel = require("../models/coupenmodel");
const productmodel = require("../models/productmodel");
const usermodel = require("../models/usermodel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const PdfPrinter = require("pdfmake");
const Banner = require("../models/bannermodel");
const feedbackModel = require("../models/feedbackmode");

const { homeload } = require("./usercontroller");
const { ok } = require("assert");

const loginLoad = (req, res) => {
  try {
    res.render("admin/adminlogin");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const adminlogin = async (req, res) => {
  try {
    const adminlogin = await adminmodel.findOne({ adminid: req.body.adminid });

    if (adminlogin) {
      let key = req.body.adminkey;
      let adminkey1 = adminlogin.adminKey;

      if (key == adminkey1) {
        req.session.adminstatus = true;
        res.redirect("/admin");
      } else {
        res.render("admin/adminlogin", { message: "invalid password" });
      }
    } else {
      res.render("admin/adminlogin", { message: "invalid adminkey" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const adminhomeload = (req, res, next) => {
  try {
    if (req.session.adminstatus) {
      res.render("admin/adminhome");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
  // else{
  //     res.redirect('/admin')
  // }
};
const adminhomesession = (req, res) => {
  try {
    res.render("/admin");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const adminhomePage = async (req, res) => {
  try {
    const users = await userModel.find({}).lean().exec();
    const totaluser = users.length;
    const totalSales = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["return", "returned", "cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalSum: { $sum: "$total" },
        },
      },
    ]);
    const salesbymonth = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["return", "returned", "cancelled"] },
        },
      },
      {
        $group: {
          _id: { $month: "$dateOrdered" },
          totalSales: { $sum: "$total" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const salespayment = await ordermodel.aggregate([
      {
        $match: {
          paymentmethord: { $in: ["Cash", "onlinePayment", "wallet"] },
          status: { $nin: ["return", "returned", "cancelled"] },
        },
      },
      {
        $group: {
          _id: "$paymentmethord",
          totalSales: { $sum: "$total" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const totalstock = await productmodel
      .aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
          },
        },
        {
          $project: {
            _id: 0,
            totalStock: 1,
          },
        },
      ])
      .exec();

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const yearSales = await ordermodel
      .aggregate([
        // Match orders within the current year or previous year
        {
          $match: {
            status: { $nin: ["return", "returned", "cancelled"] },
            dateOrdered: {
              $gte: new Date(`${previousYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        },
        // Group orders by year and calculate total sales
        {
          $group: {
            _id: {
              $year: "$dateOrdered",
            },
            totalSales: {
              $sum: "$total",
            },
          },
        },
        // Use $facet to separate current year and previous year sales
        {
          $facet: {
            currentYearSales: [
              {
                $match: {
                  _id: currentYear,
                },
              },
              {
                $project: {
                  _id: 0,
                  year: currentYear,
                  totalSales: 1,
                },
              },
            ],
            previousYearSales: [
              {
                $match: {
                  _id: previousYear,
                },
              },
              {
                $project: {
                  _id: 0,
                  year: previousYear,
                  totalSales: 1,
                },
              },
            ],
          },
        },
        // Unwind the results from the $facet stage
        {
          $project: {
            sales: {
              $concatArrays: ["$currentYearSales", "$previousYearSales"],
            },
          },
        },
        {
          $unwind: "$sales",
        },
        {
          $replaceRoot: {
            newRoot: "$sales",
          },
        },
      ])
      .exec();

    const totalSales1 = totalSales[0].totalSum;

    res.render("admin/adminhome", {
      totaluser,
      totalSales1,
        sales: encodeURIComponent(JSON.stringify(salesbymonth)),
        payment: encodeURIComponent(JSON.stringify(salespayment)),
      totalstock: totalstock[0],
      currentyear: yearSales[0],
      previousYear: yearSales[1],
    });
    // return salesbymonth
  } catch (error) {
    console.log(error.message);
    res.send("error");
  }
};

const adminUser = async (req, res) => {
  try {
    const usertable = await userModel.find({}).lean().exec();

    res.render("admin/adminuser", { userTable: usertable });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const adminlogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const blockUser = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.query.id });

    if (user) {
      user.is_Blocked = true;
      await user.save();

      res.redirect("/admin/adminuser");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};
const unblockUser = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.query.id });
    if (user) {
      user.is_Blocked = false;
      await user.save();
      res.redirect("/admin/adminuser");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const getcategory = async (req, res) => {
  try {
    let category = await categorymodel.find({}).lean();
    const message = req.query.message;
    res.render("admin/category", { category, query: { message } });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const check = await categorymodel.findOne({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });
    if (check) {
      var message = "Category already exist!!!";
      res.redirect("/admin/getcategory?message=" + encodeURIComponent(message));
      window.location.href = redirectURL;
    } else {
      let category = new categorymodel({
        category: req.body.category,
      });
      const addsuccess = await category.save();
      if (addsuccess) {
        res.redirect("/admin/getcategory");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const removeCategory = async (req, res) => {
  try {
    const category = await categorymodel.findByIdAndRemove({
      _id: req.query.id,
    });
    res.redirect("/admin/getcategory");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const addBanner = async (req, res) => {
  try {
    let bannerData = await Banner.find({}).lean();
    res.render("admin/adminbanner", { bannerActive: true, bannerData });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const bannerImage = async (req, res) => {
  try {
    let bannerData = req.body;

    const banner = new Banner({
      name: bannerData.heading,
      image: req.file.filename,
    });
    let success = await banner.save();
    if (success) {
      console.log("Banner Added Successfully");
    }
    res.redirect("/admin/addbanners");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const activateBanner = async (req, res) => {
  try {
    let id = req.params.id;
    await Banner.updateMany({}, { $set: { activate: false } });
    let activateBanner = await Banner.findByIdAndUpdate(id, { activate: true });
    if (activateBanner) {
      console.log("Activated Succesfully");
    }
    res.redirect("/admin/addbanners");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const removeBanner = async (req, res) => {
  try {
    let id = req.params.id;
    let deleteBanner = await Banner.findByIdAndDelete(id);
    if (deleteBanner) {
      console.log("Banner Deleted");
    }
    res.redirect("/admin/addbanners");
  } catch (error) {
    console.log(error.message);
  }
};

const ordersPage = async (req, res) => {
  try {
    const order = await ordermodel
      .find({})
      .sort({ dateOrdered: -1, timeOrdered: -1 })
      .lean()
      .exec();

    const date = order.map((order) =>
      order.dateOrdered.toLocaleDateString({
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    res.render("admin/adminorders", { order });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const viewOrder = async (req, res) => {
  try {
    const orderid = req.query.id;

    const order = await ordermodel
      .findOne({ _id: orderid })
      .populate("orderItems.product");

    const orderDetails = order.orderItems.map((data) => {
      return {
        name: data.product.name,
        size: data.size,
        quantity: data.quantity,
        total: order.total,
        price: data.product.price,
        image: data.product.images[0],
      };
    });

    res.render("admin/vieworder", {
      orderDetails,
      total: order.total,
      address: order.address,
      name: order.username,
      phone: order.phone,
      email: order.email,
      time: order.dateOrdered,
      delivered: order.deliveryDate,
      order,
    });
  } catch (error) {
    console.log(error.message);

    res.render("admin/error");
  }
};

const editStatus = async (req, res) => {
  try {
    const status = req.body.statusSelect;
    if (status == "delivered") {
      const date = Date.now();
      const order = await ordermodel.updateOne(
        { _id: req.body.orderid },
        {
          status: req.body.statusSelect,
          return: true,
          cancel: false,
          deliveryDate: date,
        }
      );

      res.redirect("/admin/loadorders");
    } else if (status == "returned") {
      const order = await ordermodel.updateOne(
        { _id: req.body.orderid },
        { status: req.body.statusSelect, return: false, cancel: false }
      );
      const order1 = await ordermodel.findOne({ _id: req.body.orderid });
      const user = await usermodel.findOne({ _id: order1.userid });

      const walletbal = order1.total + user.wallet;
      await usermodel.updateOne(
        { _id: order1.userid },
        { $set: { wallet: walletbal } }
      );
      res.redirect("/admin/loadorders");
    } else if (status == "return") {
      const order = await ordermodel.updateOne(
        { _id: req.body.orderid },
        { status: req.body.statusSelect, return: false, cancel: false }
      );
      res.redirect("/admin/loadorders");
    } else if (status == "pending") {
      const order = await ordermodel.updateOne(
        { _id: req.body.orderid },
        { status: req.body.statusSelect, return: false, cancel: true }
      );
      res.redirect("/admin/loadorders");
    } else {
      const order = await ordermodel.updateOne(
        { _id: req.body.orderid },
        { status: req.body.statusSelect }
      );
      res.redirect("/admin/loadorders");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const getCoupenPage = async (req, res) => {
  try {
    const coupen = await coupenmodel.find({}).lean().exec();

    res.render("admin/admincoupen", {
      coupen,
      coupen1: encodeURIComponent(JSON.stringify(coupen)),
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const addCoupon = async (req, res) => {
  try {
    const coupons = await coupenmodel.find({});
    const newCoupon = new coupenmodel({
      name: req.body.couponName,
      discripton: req.body.description,
      discount: req.body.amount,
      dateExpiry: req.body.expiry,
    });
    const savedCoupon = await newCoupon.save();
    if (savedCoupon) {
      res.redirect("/admin/coupenPage");
    } else {
      res.send("Error while saving the coupon");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const removeCoupen = async (req, res) => {
  try {
    const remove = await coupenmodel.findByIdAndRemove({ _id: req.query.id });
    if (remove) {
      res.redirect("/admin/coupenPage");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const editCoupon = async (req, res) => {
  try {
    const coupon = await coupenmodel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.couponName,
          discripton: req.body.description,
          discount: req.body.amount,
          dateExpiry: req.body.expiry,
        },
      }
    );
    res.redirect("/admin/coupenPage");
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const salesReport = async (req, res) => {
  try {
    const totalSales = await ordermodel.aggregate([
      {
        $group: {
          _id: null,
          totalSum: { $sum: "$total" },
        },
      },
    ]);
    const doc = new PDFDocument();
    const salestotal = totalSales[0].totalSum;

    // Pipe the document output to a file or HTTP response
    doc.pipe(fs.createWriteStream("output.pdf"));

    // Customize the PDF content
    doc.fontSize(25).text("Fine Bonito", 100, 100, { align: "center" });
    doc.fontSize(15).text("sales report of year 2023", { align: "center" });
    doc.moveDown(1);
    doc
      .fontSize(11)
      .text(
        "In this sales report, we are thrilled to share the remarkable progress and achievements of Fine Bonito. It has been an exceptional year for our company, marked by significant growth and outstanding performance. We are delighted to report that Fine Bonito has experienced unprecedented success, reaching new heights in revenue and market expansion. Our unwavering commitment to excellence, combined with the dedication and expertise of our talented team, has propelled us forward. We have diligently worked towards exceeding customer expectations, delivering innovative solutions, and fostering strong partnerships. As a result we have witnessed substantial growth in our client base and an increased market share across key sectors"
      );
    doc.moveDown(2);
    doc.fontSize(13).text("Total sales:$${salestotat}");
    doc.moveDown(1);
    doc.fontSize(13).text("total stock:");
    doc.moveDown(1);
    doc.fontSize(13).text("total Users:");
    doc.moveDown(1);
    doc.fontSize(13).text("Sales of the month:");

    // doc.bulletRadius(7)
    // doc.list(salesbymonth)

    // doc.image("/public/path/to/image.png", {
    //   fit: [250, 300],
    //   align: "center",
    //   valign: "center",
    // });

    doc
      .addPage()
      .fontSize(25)
      .text("Here is some vector graphics...", 100, 100);

    doc
      .save()
      .moveTo(100, 150)
      .lineTo(100, 250)
      .lineTo(200, 250)
      .fill("#FF3300");

    doc
      .scale(0.6)
      .translate(470, -380)
      .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
      .fill("red", "even-odd")
      .restore();

    doc
      .addPage()
      .fillColor("blue")
      .text("Here is a link!", 100, 100)
      .underline(100, 100, 160, 27, { color: "#0000FF" })
      .link(100, 100, 160, 27, "http://google.com/");

    // Add your custom fields here
    doc.fontSize(14).text("Custom Field 1:", 100, 300);
    doc.fontSize(14).text("Custom Field 2:", 100, 350);

    // Finalize the PDF file
    doc.end();

    // Handle the generated sales report
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "attachment; filename=sales_report.pdf");
    doc.pipe(res);
  } catch (error) {
    // Handle any errors that occur during the sales report generation
    console.error(error);
    res.render("admin/error");
  }
};

const getSalesPage = async (req, res) => {
  try {
    const order = await ordermodel
      .find({ status: { $in: ["pending", "delivered", "shipped"] } })
      .sort({ dateOrdered: -1, timeOrdered: -1 })
      .lean()
      .exec();
    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $in: ["pending", "delivered", "shipped"] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $sort: {
          totalAmount: 1,
        },
      },
    ]);

    console.log(total);

    res.render("admin/adminSales", { order, total, showButtons: false });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const getSalesToday = async (req, res) => {
  try {
    const todaysales = new Date();
    const startOfDay = new Date(
      todaysales.getFullYear(),
      todaysales.getMonth(),
      todaysales.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      todaysales.getFullYear(),
      todaysales.getMonth(),
      todaysales.getDate(),
      23,
      59,
      59,
      999
    );

    const order = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },

          dateOrdered: {
            $gte: startOfDay, // Set the current date's start time
            $lt: endOfDay,
          },
        },
      },
    ]);

    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $in: ["pending", "delivered", "shipped"] },

          dateOrdered: {
            $gte: startOfDay, // Set the current date's start time
            $lt: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    if (order) {
      res.render("admin/adminSales", { order, total });
    } else {
      res.render("admin/adminSales", { message: "No sales registerd today" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const getWeekSales = async (req, res) => {
  try {
    console.log("haai");
    const currentDate = new Date();

    // Calculate the start and end dates of the current week
    const startOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - currentDate.getDay()
    );
    const endOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (6 - currentDate.getDay()),
      23,
      59,
      59,
      999
    );
    const order = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },
      {
        $sort: {
          dateOrdered: -1,
        },
      },
    ]);
    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);
    res.render("admin/adminSales", { order, total });

    // Perform the aggregation query
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const getMonthSales = async (req, res) => {
  try {
    const thisMonth = new Date().getMonth() + 1;
    const startofMonth = new Date(
      new Date().getFullYear(),
      thisMonth - 1,
      1,
      0,
      0,
      0,
      0
    );
    const endofMonth = new Date(
      new Date().getFullYear(),
      thisMonth,
      0,
      23,
      59,
      59,
      999
    );

    const order = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: endofMonth,
            $gte: startofMonth,
          },
        },
      },
      {
        $sort: {
          dateOrdered: -1,
        },
      },
    ]);
    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: endofMonth,
            $gte: startofMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    res.render("admin/adminSales", { order, total });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const GetYearSales = async (req, res) => {
  try {
    const today = new Date().getFullYear();
    const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
    const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);
    const order = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: endofYear,
            $gte: startofYear,
          },
        },
      },
      {
        $sort: {
          dateOrdered: -1,
        },
      },
    ]);
    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: endofYear,
            $gte: startofYear,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    res.render("admin/adminSales", { order, total });
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

const salesWithDate = async (req, res) => {
  try {
    const dtae = new Date();
    const fromDate = new Date(req.body.fromDate);
    const toDate = new Date(req.body.toDate);
    fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    toDate.setHours(23, 59, 59, 999);

    const order = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: toDate,
            $gte: fromDate,
          },
        },
      },
      {
        $sort: {
          dateOrdered: -1,
        },
      },
    ]);
    const total = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "return", "returned"] },
          dateOrdered: {
            $lt: toDate,
            $gte: fromDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);
    res.render("admin/adminSales", { order, total });
  } catch (error) {
    console.log(error.message);
    res.send("admin/error");
  }
};

const downloadSalesReport = async (req, res) => {
  try {
    let startY = 150;
    const writeStream = fs.createWriteStream("order.pdf");
    const printer = new PdfPrinter({
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    });

    const order = await ordermodel
      .find({ status: { $in: ["pending", "delivered", "shipped"] } })
      .lean()
      .exec();

    const totalAmount = await ordermodel.aggregate([
      {
        $match: {
          status: { $nin: ["return", "returned", "cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const dateOptions = { year: "numeric", month: "long", day: "numeric" };

    // Create document definition
    const docDefinition = {
      content: [
        { text: "Fine Bonito", style: "header" },
        { text: "\n" },
        { text: "Order Information", style: "header1" },
        { text: "\n" },
        { text: "\n" },
      ],
      styles: {
        header: {
          fontSize: 25,
          alignment: "center",
        },
        header1: {
          fontSize: 12,
          alignment: "center",
        },
        total: {
          fontSize: 18,
          alignment: "center",
        },
      },
    };

    // Create the table data
    const tableBody = [
      ["Index", "Date", "User", "Status", "Method", "Amount"], // Table header
    ];

    for (let i = 0; i < order.length; i++) {
      const data = order[i];
      const formattedDate = new Intl.DateTimeFormat(
        "en-US",
        dateOptions
      ).format(new Date(data.dateOrdered));
      tableBody.push([
        (i + 1).toString(), // Index value
        formattedDate,
        data.username,
        data.status,
        data.paymentmethord,
        data.total,
      ]);
    }

    const table = {
      table: {
        widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
        headerRows: 1,
        body: tableBody,
      },
    };

    // Add the table to the document definition
    docDefinition.content.push(table);
    docDefinition.content.push([
      { text: "\n" },
      { text: `Total: ${totalAmount[0]?.totalAmount || 0}`, style: "total" },
    ]);
    // Generate PDF from the document definition
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Pipe the PDF document to a write stream
    pdfDoc.pipe(writeStream);

    // Finalize the PDF and end the stream
    pdfDoc.end();

    writeStream.on("finish", () => {
      res.download("order.pdf", "order.pdf");
    });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

const getMessage = async (req, res) => {
  try {
    const messages = await feedbackModel
      .find({})
      .populate("userid")
      .sort({timeOfsent: -1})
      .lean()
      .exec();

    if (messages && messages.length > 0) {
      const userWise = messages.map((data) => {
        if (data.userid) {
          return {
            messageid:data._id,
            id: data.userid._id,
            name: data.userid.name,
            message: data.feedback,
            date: data.timeOfsent,
            isRead: data.isRead,
          };
        }
      });

      res.render("admin/messages", { userWise });
    } else {
      res.render("admin/messages");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};


const messageStatus = async (req, res) => {
  try {
    console.log(req.query.id, "id is here");
    const message = await feedbackModel.updateOne(
      { _id: req.query.id },
      { $set: { isRead: true } }
    );
  } catch (error) {
    console.log(error.message);
    res.render("admin/error");
  }
};

module.exports = {
  adminlogin,
  adminhomeload,
  adminhomePage,
  adminUser,
  loginLoad,
  adminlogout,
  blockUser,
  unblockUser,
  adminhomesession,
  getcategory,
  addCategory,
  removeCategory,
  ordersPage,
  viewOrder,
  editStatus,
  getCoupenPage,
  addCoupon,
  removeCoupen,
  salesReport,
  editCoupon,
  getSalesPage,
  getSalesToday,
  getWeekSales,
  getMonthSales,
  GetYearSales,
  salesWithDate,
  downloadSalesReport,
  addBanner,
  bannerImage,
  activateBanner,
  removeBanner,
  getMessage,

  messageStatus,
};
