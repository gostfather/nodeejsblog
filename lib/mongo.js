const config = require("config-lite")(__dirname);
const Mongolass = require("mongolass");
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

//用户模型
exports.User =mongolass.model("User",{
    name:{type:"string"},
    password:{type:"string"},
    avatar:{type:"string"},//头像
    gender:{type:"string",enum:["m","f","x"]},
    bio:{type:"string"},
    isAdmin:{type:"boolean",default:false}
});
exports.User.index({name:1},{unique:true}).exec();//更具用户名找到全局唯一

const moment = require("moment");
const objectIdToTimestamp = require("objectid-to-timestamp");

//根据id生成创建时间-------自定义方法
 mongolass.plugin("addCreateAt",{
     afterFind:function (results) {
         results.forEach(function (item) {
             item.created_at = moment(objectIdToTimestamp(item._id)).format("YYYY-MM-DD HH:mm");
         });
         return results;
     },
     afterFindOnen:function (results) {
         if(results){
             results.created_at = moment(objectIdToTimestamp(results._id)).format("YYYY-MM-DD HH:mm");
         }
         return results;
     }
 });
 //文章模型
exports.Post = mongolass.model("Post",{
    author:{type:Mongolass.Types.ObjectId},
    title:{type:"string"},
    content:{type:"string"},
    pv:{type:"number"}//浏览量

});
exports.Post.index({ author:1,_id:-1}).exec();//按创建时间降序查询文章
//留言模型
// 按创建时间降序查看用户的文章列表
exports.Comment = mongolass.model('Comment', {
    author: { type: Mongolass.Types.ObjectId },
    content: { type: 'string' },
    postId: { type: Mongolass.Types.ObjectId }
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言