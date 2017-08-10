const express = require("express");
const router = express.Router();
const sha1 = require("sha1");

const UserModel = require("../models/users");
var checkNotLogin = require("../middlewares/check").checkNotLogin;

//get  /signin 登录页
router.get("/",checkNotLogin,(req,res,next)=>{
    res.render("signin");
});
//post  /signin  用户登录
router.post("/",checkNotLogin,(req,res,next)=>{
    let name = req.fields.name;
    let password = req.fields.password;

    UserModel.getUserByName(name)
        .then((user)=>{
            if(!user){
                req.flash("error","用户名不存在");
                return res.redirect("back");
            }
        //检查密码
            if(sha1(password) !== user.password){
                req.flash("error","用户名或者密码错误");
                return res.redirect("back");
            }
            req.flash("success","登陆成功");
            delete user.password;
            req.session.user = user;
            console.log(req.session.user);
            res.redirect("/posts");
        })
        .catch(next);
});

module.exports = router;