
const mongoose=require('mongoose')


const imageschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },  
    category:{
        type:String,
        required:true
    },
    images:{
        type:Array,
        required:true
    },
    size:{
        type:String,
        required:false
    },
    quantity:{
        type:Number,
        
    },
    stock:{
        type:Number,
        default:1
    },
    isListed:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('products',imageschema)