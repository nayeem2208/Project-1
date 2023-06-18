const usermodel = require("../models/usermodel");
const productmodel = require("../models/productmodel");


const userSessionLogin = (req, res, next) => {
    // const otp = await generateOtp(6);
  
    try {
      if (req.session.status) {
        res.render("user/home1");
      } else {
        next();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const userSessionLogout = (req, res, next) => {
    try {
      if (!req.session.status) {
        next();
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const userLoginSession= (req, res, next) => {
    try {
      if (req.session.status) {
        next();
      } else {
        res.render("user/ulogin",{message:'please Login to enter!!!!!!'});
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const adminsession = (req, res, next) => {
    try {
      if (req.session.adminstatus) {
        next();
      } else {
        res.redirect("/admin/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const adminhomeload = (req, res, next) => {
    try {
      if (req.session.adminstatus) {
        res.redirect("/admin")
      } else {
        next();
      }
    } catch (error) {
      console.log(error.message);
    }
    // else{
    //     res.redirect('/admin')
    // }
  };

  const userhomeload=(req,res,next)=>{
    if(req.session.status){
      next()
    }
    else{
      res.render('users/ulogin')
    }
  }
module.exports={
    userSessionLogin,
    userSessionLogout,
    userLoginSession,
    adminsession,
    adminhomeload,
    userhomeload
}