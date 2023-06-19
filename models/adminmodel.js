const mongoose=require('mongoose')

const adminschema=new mongoose.Schema({
    adminid:{
    type:String,
    required:true
    },
     adminKey:{
     type: Number,
     required:true
     },
     is_admin:{
        type:String,
        default:0
     }
},{collection:'admin'})
module.exports=mongoose.model('admin',adminschema)