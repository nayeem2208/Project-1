const usermodel1 = require("../models/usermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");
const dotenv=require('dotenv').config()

const sendresetmail = (name, email, token) => {
  try {
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
  } catch (error) {
    console.log(error.message);
    res.render('user/error')
  }
};

// const generateOtp = async (numberOfDigits) => {
//     return new Promise((resolve, reject) => {
//         crypto.randomBytes(numberOfDigits, (err, buffer) => {
//             if (err) reject(err);
//             const hexDigits = buffer.toString('hex').match(/.{2}/g);
//             const digits = hexDigits.map(x => parseInt('0x' + x, 16) % 10);
//             resolve(digits);
//         })
//     });
// };

const forgot = async (req, res) => {
  try {
    const user = await usermodel1.findOne({ email: req.body.email });
    const token1 = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 1 * 120* 1000);
    const email=req.body.email
    if (user) {
      user.token = token1;
      user.otpExpiration = otpExpiration;
      await user.save();
      sendresetmail(user.name, user.email, user.token);
      const user1 = await usermodel1
        .findOne({ email: user.email })
        .lean()
        .exec();
      res.render("user/uForgotverify", { user1,email });
    } else {
      res.render("user/uForgotemail", {
        message: "Wrong email, Please check your email",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render('user/error')
  }
};
// const getverify=async(req,res)=>{
    
// }
const verifyOtp = async (req, res) => {
 
  try {
   
    const user = await usermodel1.findOne({ email: req.body.email });
    const email=req.body.email

    const userotp = req.body.token;
    if (user.token == userotp) {
      const currentTime = new Date();
      if (currentTime <= user.otpExpiration) {
        res.render("user/uForgotreset", { email});
      } else {
        res.render("user/uForgotverify", { message: "OTP has expired" });
      }
    } else {
      res.render("user/uForgotverify", { message: "Invalid OTP please resend",email });
    }
  } catch (error) {
    console.log(error.message);
    res.render('user/error')
  }
};



const newPassword = async (req, res) => {
  try {
    
    const newP = req.body.newPassword;
    const confirmp = req.body.confirmPassword;
    if (newP == confirmp) {
      const user = await usermodel1.findOne({ email: req.body.email });

      if (user) {
        const hash1 = await bcrypt.hash(req.body.newPassword, 10);
        const success = await usermodel1.updateOne(
          { email: req.body.email },
          { $set: { password: hash1 } }
        );
        if (success) {
          res.render("user/ulogin", { message1: "Your password is updated" });
        } else {
          res.render("user/uForgotreset");
        }
      }
    } else {
      res.render("user/uForgotreset", {
        message: "Please check your confirm password",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render('user/error')
  }
};

const getforgot = (req, res) => {
  try {
    res.render("user/uForgotemail");
  } catch (error) {
    console.log(error.message);
    res.render('user/error')
  }
};

module.exports = {
  forgot,
  verifyOtp,
  newPassword,
  getforgot
  
};
