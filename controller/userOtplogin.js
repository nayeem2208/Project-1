const usermodel1 = require("../models/usermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");
const dotenv=require('dotenv').config()

const sendresetmail = (name, email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.ETHERIALHOST,
    port: process.env.ETHERIALPORT,
    auth: {
        user: process.env.ETHERILAUSERID,
        pass: process.env.ETHERIALPASSWORD
    }
});

  const mailoption = {
    from: process.env.FROMMAIL,
    to: "nayeem670@gmail.com",
    // to: 'rttaehcct@bugfoo.com',

    subject: "Reset your password",
    text: "hello",
    html: "<p>hi " + name + ",this is your<b>" + token + "</b></p>  ",
  };
  transporter.sendMail(mailoption, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email has been verified", info.response);
    }
  });
};
const forgot = async (req, res) => {
  try {
    const email=req.body.email
    const user = await usermodel1.findOne({ email: req.body.email });
    const token1 = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 1 * 120 * 1000);
    if (user) {
      user.token = token1;
      user.otpExpiration = otpExpiration;
      await user.save();
      sendresetmail(user.name, user.email, user.token);
      const user1 = await usermodel1
        .findOne({ email: user.email })
        .lean()
        .exec();
      res.render("user/uOtpLoginverify", {email,user1 });
    } else {
      res.render("user/uOtploginemail", {
        message: "Wrong email,Please check your email",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const user = await usermodel1.findOne({ email: req.body.email });
    const email=req.body.email
    
    if (user) {
      if (user.token == req.body.token) {
        const currentTime = new Date();
        if (currentTime <= user.otpExpiration) {
          res.render("user/home1");
          req.session.status = true;
        } else {
          res.render("user/uOtpLoginverify", { message: "OTP has expired" });
          // res.redirect(``)
        }
      } else {
        res.render("user/uOtpLoginverify", { message: "invalid otp .Please try resend" ,email});
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};




const loadOtppage = (req, res) => {
  
  try {
    res.render("user/uOtploginemail");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadOtppage,
  forgot,
  verifyLoginOtp,
 
};
