const router = require('express').Router();
const passport = require('passport')

router.get("/login/failed" ,(req,res) =>{
    res.status(401).json({
        success: false ,
        message: "Failed to login" ,
    })
})

router.get("/sucess" ,(req,res) =>{
    console.log("Im in success and ready to redirect" , req.user);
    const token1 =req.user;
    res.cookie("JWT", token1, { sameSite: 'strict', path: '/', expires: new Date(new Date().getTime() + 24 * 3600000), httpOnly: true })
    res.redirect("http://localhost:3000")
})

router.get("/google" , passport.authenticate("google" ,{scope: ["profile" , "email"]}))
router.get("/google/callback" , passport.authenticate("google" , {
    successRedirect: "/auth/sucess" ,
    failureRedirect: "/login/failed"
}))

router.get("/github" , passport.authenticate("github" ,{scope: [ 'user:email' ]}))
router.get("/github/callback" , passport.authenticate("github" , {
    successRedirect: "/auth/sucess" ,
    failureRedirect: "/login/failed"
}))

module.exports = router;