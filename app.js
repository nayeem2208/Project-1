var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const nocache = require("nocache");
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv=require('dotenv').config()
const Razorpay=require('razorpay')
const bodyparser=require('body-parser')


const expresshbs = require("express-handlebars");



var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");


const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://nayeem670:56PmusurFfD4QcpR@cluster0.ihvan4j.mongodb.net/?retryWrites=true&w=majority');
var app = express();



const helpers = {};


helpers.inc = (value) =>{
  return parseInt(value) + 1;
}

helpers.eq=(a,b)=>{
  return a===b
}
helpers.or=(a,b,c)=>{
  return a||b||c
}
helpers.formatDate = function(date) {
  var options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

helpers.truncateMessage=function(message, maxLength) {
  const words = message.split(' ');

  if (words.length <= maxLength) {
    return message;
  }

  const truncatedWords = words.slice(0, maxLength);
  return truncatedWords.join(' ') + '....';
};


app.engine(
  "handlebars",
  expresshbs.engine({
    // extname: "hbs",
    defaultLayout: false,
    // defaultLayout: "layout",
    // layoutsDir: __dirname + "/views/layouts",
    // layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: helpers,
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// hbs.registerPartials(path.join(__dirname, "views", "partials"), function (err) {});


// hbs.registerHelper("inc",(value) =>{
//   return parseInt(value) + 1;
// })



app.use(nocache());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    // store,
  })
);


// expresshbs.registerHelper("inc",(value) =>{
//   return parseInt(value) + 1;
// })

app.use("/", usersRouter);
app.use("/admin", adminRouter);
// app.use('/products',productsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
