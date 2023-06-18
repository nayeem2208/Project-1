const mongoose=require('mongoose')

const paymentSchema=new mongoose.Schema({
    razorpay_payment_id:{
        type:String
    },
    razorpay_order_id:{
        type:String
    },
    razorpay_signature:{
        type:String
    }
})