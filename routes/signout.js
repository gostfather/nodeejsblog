const express = require("express");
const router = express.Router();

const checkLogin = require("../middlewares/check").checkLogin;

//get /signout 登出
router.get("/",(req,res,next)=>{
    //清空 session 中的用户信息
    req.session.user = null ;
    req.flash("success","登出成功");
    //跳回主页
    res.redirect("/posts");
});

module.exports = router ;