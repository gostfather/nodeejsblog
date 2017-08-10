const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const config = require("config-lite")(__dirname);
const routes = require('./routes');
const pkg = require('./package');

const winston = require("winston");
const expressWinston = require("express-winston");

const app = express();

//设置模板
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

//设置静态文件目录
app.use(express.static(path.join(__dirname,"public")));
//session 中间件
app.use(session({
    name:config.session.key,
    secret:config.session.secret,
    resave:true,
    saveUninitialized:false,
    cookie:{
        maxAge:config.session.maxAge//过期时间
    },
    store:new MongoStore({//将session储存到mongodb
        url:config.mongodb
    })
}));

//flash中间件。用来显示通知
app.use(flash());
//处理表单上传文件的中间件
app.use(require("express-formidable")({
    uploadDir:path.join(__dirname,"public/img"),
    keepExtensions:true,//保留后缀
}));

//设置全局常量
app.locals.blog = {
    title:pkg.name,
    description:pkg.description
};

//添加模板必须的三个变量
app.use((req,res,next)=>{
    res.locals.user = req.session.user;
    res.locals.success = req.flash("success").toString();
    res.locals.error = req.flash("error").toString();
    next();
})

//正常的日志请求
/*app.use(expressWinston.logger({
    transports:[
        new (winston.transports.Console)({
            json:true,
            colorize:true
        }),

        new  winston.transports.File({
            filename:"logs/success.log"
        })
    ]
}));*/


//路由
routes(app);

//错误的日志
/*app.use(expressWinston.errorLogger({
    transports:[
        new (winston.transports.Console)({
            json:true,
            colorize:true
        }),

        new  winston.transports.File({
            filename:"logs/error.log"
        })
    ]
}));*/

//error page
app.use(function (err,req,res,next) {
    res.render("error",{error:err});
})
// 监听端口，启动程序
app.listen(config.port,() => {
    console.log(`${pkg.name} listening on port ${config.port}`);
});

//supervisor --harmony index
