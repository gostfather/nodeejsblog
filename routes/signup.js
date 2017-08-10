const fs =require("fs");
const path = require("path");
const sha1 = require("sha1");

const express = require('express');
const router = express.Router();

const UserModel  = require("../models/users");
const checkNotLogin = require("../middlewares/check").checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin,function(req, res, next) {
    res.render('signup');
});

//post /signup 用户注册
router.post("/",checkNotLogin,(req,res,next)=>{

    let name = req.fields.name;
    let gender = req.fields.gender;
    let bio = req.fields.bio;
    let avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;
    let repassword = req.fields.repassword;
    var isAdmin = false ;
// 校验参数
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('性别只能是 m、f 或 x');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (!req.files.avatar.name) {
            throw new Error('缺少头像');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    //加密密码
    password = sha1(password);
    //写入数据库
    let user = {
        name,
        password,
        gender,
        bio,
        avatar,
        isAdmin,
    };

    UserModel.create(user)
        .then((result)=>{
        //此user是插入mongodb后的值，包含_id
            user = result.ops[0];
            //存入session
            delete user.password;
            req.session.user = user;
            //写入flash
            req.flash("success","注册成功");
            res.redirect("/posts");
        })
        .catch((e)=>{
        //注册失败，异步删除上传的头像
            fs.unlink(req.files.avatar.path);
            //用户名如果被占用就跳回注册页面
            if(e.message.match("E11000 duplicate key")){
                req.flash("error","用户名被占用");
                return res.redirect("/signup");
            }
            next(e);
        });

});



module.exports = router;