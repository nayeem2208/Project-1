// const express = require('express')
// const router = express.Router()
// const multer=require('multer')
// const productscontroller = require('../controller/productsController')


// const path = require('path')

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../public/images/products'),(err,success)=>{
//             if(err){
//                 throw err
//             }
             
//         });
//     },
//     filename: function (req, file, cb) {
//         const name = Date.now() + '-' + file.originalname
//         cb(null, name,(req,res)=>{
//             if(err){
//                 throw err
//             }

//         })
//     }
// });

// const upload = multer({ storage: storage });

// // const auth=require('../middleware/auth')




// router.get('/loadProducts',productscontroller.productsLoad)
// router.post('/imageadd',upload.array('image'))
// router.post('/loadProductsAdd',productscontroller.loadAddProducts)

// module.exports = router

