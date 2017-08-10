const Post = require("../lib/mongo").Post;
const marked = require("marked");
const CommentModel =require("./comments");

//转换博客语法
Post.plugin("contentToHtml",{
    afterFind:function(posts){
        return posts.map(function (post) {
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function (post) {
        if(post){
            post.content = marked(post.content);
        }
        return post;
    }
})
//给post 添加留言数
Post.plugin("addCommentsCount",{
    afterFind:function(posts){
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentCount(post._id).then(function (commentsCount) {
               post.commentsCount = commentsCount;
               return post;
            });
        }));
    },
    afterFindOne: function (post) {
        if(post){
            return CommentModel.getCommentCount(post._id).then(function (count) {
                post.commentsCount = count;
                return post;
            });
        }
        return post;
    }
})

module.exports = {
    //创建一篇文章
    create : function create(post) {
        return Post.create(post).exec();
    },
    //通过文章id获取一篇文章
    getPostById : function getPostById(postId) {
        return Post
            .findOne({_id:postId})
            .populate({path:"author",model:"User"})
            .addCreateAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },
    getPosts:function getPosts(author,page,everyPage) {
        var query = {};
        if(author){
            query.author = author;
        }
        //everyPage每页几条
        //page从第几页 也就是第几个开始
        //从第个开始查到第几个
        return Post
            .find(query)
            .populate({path:"author",model:"User"})
            .sort({_id:-1})
            .skip(page)
            .limit(everyPage)
            .addCreateAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },
    getPostsCount:function getPostsCount(author) {
        var query = {};
        if(author){
            query.author = author;
        }
        return Post
            .find(query)
            .populate({path:"author",model:"User"})
            .exec();
    },
    incPv:function incPv(postId) {
        return Post
            .update({_id:postId}, { $inc:{pv:1} } )
            .exec()
    },
    //通过文章id获取文章  编辑
    getRawPostById:function getRawPostById(postId) {
        return Post
            .findOne({_id:postId})
            .populate({path:"author",model:"User"})
            .exec();
    },
    //通过用户id和文章id更新一篇文章
    updatePostById: function updatePostById(postId, author, data) {
        return Post.update({ author: author, _id: postId }, { $set: data }).exec();
    },
    delPostById:function delPostById(postId,author) {
        return Post.remove({ author:author , _id:postId }).exec()
            .then(function (res) {
                if(res.result.ok && res.result.n> 0 ){
                    return CommentModel.delCommentByPostId(postId);
                }
            });
    },

};
