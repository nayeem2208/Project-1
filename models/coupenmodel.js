const mongoose=require('mongoose')

const coupenSchema=new mongoose.Schema({
    name:{
        type:String
    },
    discount:{
        type:Number
    },
    discripton:{
        type:String
    },
    dateReleased:{
        type:Date,
        default:Date.now()
    },
    dateExpiry:{
        type:Date
    }

})

module.exports=mongoose.model('coupon',coupenSchema)