var express = require('express');
var router = express.Router();
const usercontroller = require('../controller/usercontroller')
const middlewarecontroller=require('../controller/middlewarecontroller')
const otp=require('../controller/otp')
const paymentcontroller=require('../controller/paymentcontroller')
const userOtpLogin=require('../controller/userOtplogin');

const multer=require('multer')
const path = require('path')
const bodyparser=require('body-parser');
const { userInfo } = require('os');
const usermodel = require('../models/usermodel');
router.use(bodyparser.json())
router.use(bodyparser.urlencoded({extended:true}))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/users'),(err,success)=>{
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
router.get('/', middlewarecontroller.userSessionLogin, usercontroller.loginLoad)
router.post('/', usercontroller.loginhelper)
router.get('/signup',middlewarecontroller.userSessionLogout, middlewarecontroller.userSessionLogin, usercontroller.signupLoad)
router.post('/signup', usercontroller.confirmpassword, usercontroller.signuphelper)
router.get('/register/verify',middlewarecontroller.userSessionLogout, usercontroller.verifyMail)
router.get('/getforgot',middlewarecontroller.userSessionLogout,otp.getforgot)
router.post('/forgot',middlewarecontroller.userSessionLogout,otp.forgot)
// router.get('/verify',(req,res)=>{
//     res.render('user/otp')
// })
router.post('/verifyOtp',middlewarecontroller.userSessionLogout,otp.verifyOtp)
router.post('/resendpasswordotp',middlewarecontroller.userSessionLogout,otp.forgot)
router.post('/newPassword',middlewarecontroller.userSessionLogout,otp.newPassword)
router.get('/loginWithOTP',middlewarecontroller.userSessionLogout,userOtpLogin.loadOtppage)
// router.get('/otploginforgot',middlewarecontroller.userSessionLogout,userOtpLogin.forgot)
router.post('/otploginforgot',middlewarecontroller.userSessionLogout,userOtpLogin.forgot)

router.post('/verifyloginOtp',middlewarecontroller.userSessionLogout,userOtpLogin.verifyLoginOtp)
router.post('/resendotp',middlewarecontroller.userSessionLogout,userOtpLogin.forgot)

// router.get('/resendotp',middlewarecontroller.userSessionLogout,userOtpLogin.resendOtp)
router.post('/logout',middlewarecontroller.userLoginSession,usercontroller.logout)
router.get('/getshirtpage',middlewarecontroller.userLoginSession,usercontroller.shirtPageLoad)
router.get('/homeLoad',middlewarecontroller.userLoginSession,usercontroller.homeload)
router.get('/getJeanspage',middlewarecontroller.userLoginSession,usercontroller.jeansPageLoad)
router.get('/getShoespage',middlewarecontroller.userLoginSession,usercontroller.shoesPageLoad)
router.get('/getallproducts',middlewarecontroller.userLoginSession,usercontroller.allProductsLoad)
router.get('/loadProductview',middlewarecontroller.userLoginSession,usercontroller.productView)
router.post('/searchallproducts',middlewarecontroller.userLoginSession,usercontroller.usersearch)
router.post('/priceFilter',middlewarecontroller.userLoginSession,usercontroller.productFilter)

router.get('/userprofile',middlewarecontroller.userLoginSession,usercontroller.userprofile)
router.get('/editUser',middlewarecontroller.userLoginSession,usercontroller.geteditprofile)
router.post('/editUserSubmit',upload.single('image'),middlewarecontroller.userLoginSession,usercontroller.editdetails)
router.get('/getaddaddress',middlewarecontroller.userLoginSession,usercontroller.addAddress)
//save new address
router.post('/submitForm',middlewarecontroller.userLoginSession,usercontroller.saveNewAddress)
router.get('/deleteAddress',middlewarecontroller.userLoginSession,usercontroller.deleteAddress)

//ORDER 
router.get('/getorders',middlewarecontroller.userLoginSession,usercontroller.getOrders)
router.get('/orderinfo',middlewarecontroller.userLoginSession,usercontroller.orderInfo)
router.get('/cancelOrder',middlewarecontroller.userLoginSession,usercontroller.cancelOrder)
router.get('/returnOrder',middlewarecontroller.userLoginSession,usercontroller.returnOrder)
router.get('/getOrderDate/:id',middlewarecontroller.userLoginSession,usercontroller.getOrderDate)
// router.get('/orderinfo',middlewarecontroller.userLoginSession,usercontroller.)

router.get('/getWishlist',middlewarecontroller.userLoginSession,usercontroller.getWishlist)
router.get('/addTowishlist',middlewarecontroller.userLoginSession,usercontroller.addTowishlist)

router.get('/removeFromWishlist',middlewarecontroller.userLoginSession,usercontroller.removeFromWishlist)
//Add to cart//
router.get('/addtocart',middlewarecontroller.userLoginSession,usercontroller.getCart)
router.post('/addtocart',upload.none(),middlewarecontroller.userLoginSession,usercontroller.addTocart)
router.get('/removeFromCart',middlewarecontroller.userLoginSession,usercontroller.removeFromCart)
router.post('/cart/update', middlewarecontroller.userLoginSession, usercontroller.updateCart)


//CHECKOUT
router.get('/checkout',middlewarecontroller.userLoginSession,usercontroller.getCheckOut)
router.get('/checkoutNewAddress',middlewarecontroller.userLoginSession,usercontroller.addAddressinCheckout)
router.post('/saveNewAddress',middlewarecontroller.userLoginSession,usercontroller.saveAddressInCheckout)
router.post('/checkout',upload.none(),middlewarecontroller.userLoginSession,usercontroller.checkOutpage)
router.get('/getnewpage',middlewarecontroller.userLoginSession,usercontroller.sweetalert)

//PAYMENT
router.post('/createorder',upload.none(),middlewarecontroller.userLoginSession,paymentcontroller.razorPayy)
router.post('/paymentDone',upload.none(),middlewarecontroller.userLoginSession,paymentcontroller.paymentDone)
//wallet
router.post('/walletCheckout',upload.none(),middlewarecontroller.userLoginSession,paymentcontroller.walletCheckout)















module.exports = router;
