var express = require('express');
var router = express.Router();
const admincontroller=require('../controller/admincontroller')
const multer=require('multer')
const productscontroller = require('../controller/productsController')
const middlewarecontroller=require('../controller/middlewarecontroller')
const path = require('path')
const bodyparser=require('body-parser')
router.use(bodyparser.json())
router.use(bodyparser.urlencoded({extended:true}))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/products'),(err,success)=>{
            if(err){
                throw err
            }  
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name,(req,res)=>{
            if(err){
                throw err
            }
        })
    }
});
const upload = multer({ storage: storage });



/* GET users listing. */
router.get('/',middlewarecontroller.adminsession,admincontroller.adminhomePage)
router.get('/login',middlewarecontroller.adminhomeload,admincontroller.loginLoad)
router.post('/login',middlewarecontroller.adminhomeload,admincontroller.adminlogin)
router.get('/adminuser',middlewarecontroller.adminsession,admincontroller.adminUser)
router.post('/adminlogout',middlewarecontroller.adminsession,admincontroller.adminlogout)

router.get('/adminhome',middlewarecontroller.adminsession,admincontroller.adminhomePage)
// router.get('/salesReport',middlewarecontroller.adminsession,admincontroller.salesReport)

router.get('/loadProducts',middlewarecontroller.adminsession,productscontroller.productsLoad)
router.post('/productsadd',upload.array('images'),productscontroller.add_product)
router.get('/loadProductsAdd',middlewarecontroller.adminsession,productscontroller.loadAddProducts)
router.get('/userBlock',middlewarecontroller.adminsession,admincontroller.blockUser)
router.get('/userUnblock',middlewarecontroller.adminsession,admincontroller.unblockUser)
router.get('/loadEditProducts',middlewarecontroller.adminsession,productscontroller.loadEditProducts)
router.post('/loadEditProducts',upload.array('images'),productscontroller.editproducts)
router.delete('/deleteImage',middlewarecontroller.adminsession,productscontroller.deleteImage)

router.get('/getcategory',middlewarecontroller.adminsession,admincontroller.getcategory)
// router.get('/addCategory',admincontroller.addCategory)
router.post('/addCategory',middlewarecontroller.adminsession,admincontroller.addCategory)
router.get('/removeCategory',middlewarecontroller.adminsession,admincontroller.removeCategory)
router.get('/removeProducts',middlewarecontroller.adminsession,productscontroller.removeProducts)
router.get('/addBack',middlewarecontroller.adminsession,productscontroller.getProductsBack)
router.get('/loadorders',middlewarecontroller.adminsession,admincontroller.ordersPage)
router.get('/viewOrder',middlewarecontroller.adminsession,admincontroller.viewOrder)
router.post('/editStatus',middlewarecontroller.adminsession,admincontroller.editStatus)


router.get('/coupenPage',middlewarecontroller.adminsession,admincontroller.getCoupenPage)
router.post('/addCoupon',middlewarecontroller.adminsession,admincontroller.addCoupon)
router.get('/removeCoupen',middlewarecontroller.adminsession,admincontroller.removeCoupen)
router.post('/editCoupon',middlewarecontroller.adminsession,admincontroller.editCoupon)

router.get('/salesPage',middlewarecontroller.adminsession,admincontroller.getSalesPage)
router.get('/getTodaySales',middlewarecontroller.adminsession,admincontroller.getSalesToday)
router.get('/getWeekSales',middlewarecontroller.adminsession,admincontroller.getWeekSales)
router.get('/getMonthSales',middlewarecontroller.adminsession,admincontroller.getMonthSales)
router.get('/getYearSales',middlewarecontroller.adminsession,admincontroller.GetYearSales)
router.post('/saleswithDate',middlewarecontroller.adminsession,admincontroller.salesWithDate)
router.get('/salesReport',middlewarecontroller.adminsession,admincontroller.downloadSalesReport)







module.exports=router