const mongoose = require('mongoose')

const feedbackSchema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    feedback:{
        type:String,
        required:true
    },
    isRead:{
        type:Boolean,
        default:false
    },
    timeOfsent:{
        type:Date,

    }
})

module.exports=mongoose.model('feedback',feedbackSchema)