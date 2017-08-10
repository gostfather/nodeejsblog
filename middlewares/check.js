const UserModel = require("../models/users");

module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/signin');
        }
        if ( req.session.user.isAdmin === false ){
            // console.log(req.session.user.isAdmin)
            req.flash('error', '权限不足');
            return res.redirect('/posts');
        }
        next();
    },

    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            return res.redirect('back');//返回之前的页面
        }
        next();
    }
};