const mongoose=require('mongoose')


const categoryschema= new mongoose.Schema({
    category:{
        type:String,
        required:true
    }

})

module.exports=mongoose.model('category',categoryschema)