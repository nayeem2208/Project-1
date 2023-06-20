const mongoose = require('mongoose')

const bannerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    activate:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('Banner',bannerSchema)