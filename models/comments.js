const marked = require("marked");
const Comment = require("../lib/mongo").Comment;

//将comment的content从markdown 转换成 html
Comment.plugin("contentToHtml",{
    afterFind:function(comments){
        return comments.map(function (comment) {
            comment.content = marked(comment.content);
            return comment;
        });
    }
});
module.exports = {
    create : function create(comment) {
        return Comment.create(comment).exec();
    },
    //删除一个留言
    delCommentById: function delCommentById(commentId , author) {
        return Comment.remove({author:author , _id :commentId}).exec();
    },
    //删除改文章下所有留言
    delCommentByPostId:function delCommentByPostId(postId) {
        return Comment.remove({ postId:postId }).exec();
    },
    getComments:function getComments(postId) {
        return Comment
            .find({postId:postId})
            .populate({path:"author",model:"User"})
            .sort({_id:-1})
            .addCreateAt()
            .contentToHtml()
            .exec();
    },
    //获取到留言数
    getCommentCount:function getCommentCount(postId) {
        return Comment.count({postId:postId}).exec();
    }
}