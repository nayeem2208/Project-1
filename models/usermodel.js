const { text } = require("body-parser");
const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: false,
  },
  secondname:{
    type:String
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  landPhone:{
    type:String,
    
  },
  address: [
    {
      type: {
        type: String,
      },
      houseName:{
        type:String
      },
      landmark:{
        type:String
      },
      location:{
        type:String
      },
      pincode:{
        type:Number,
      },
      district:{
        type:String
      },
      state:{
        type:String
      },
      countries:{
        type:String
      }
    }
  ],
  password: {
    type: String,
    required: true,
  },
  is_verified: {
    type: String,
    required: true,
  },
  password_reset_otp: {
    type: String,
  },
  token: {
    type: String,
    default: "",
  },
  is_admin: {
    type: String,
    default: 0,
  },
  is_Blocked: {
    type: Boolean,
    default: false,
  },
  otpExpiration: {
    type: Date,
  },
  wallet:{
    type:Number,
    default:0
  },
  image:{
    type:String
  }
});

module.exports = mongoose.model("User", userschema);
