const express = require("express");
const router = express.Router();


const PostModel = require('../models/posts');
const CommentModel = require("../models/comments")

var checkLogin = require("../middlewares/check").checkLogin;




//get/posts 所有用户的文章页；
//get  /posts?auther = xxx;
router.get("/",(req,res,next)=>{
    let page = req.query.page ? req.query.page : 0 ; //查看第几页
    let everPage = 2;
    page = everPage * page ;
    let author = req.query.author;
    let count ;
    PostModel.getPostsCount(author).then((posts)=>{
        count = Math.ceil(posts.length/everPage);
    });
    //得到一共有几个博客计算总页数-----然后计算
    PostModel.getPosts(author,page,everPage)
        .then(function (posts) {
            for( let v in posts){
                delete  posts[v].content ;
            }
            res.render("posts",{posts,count});//传总数出去！！！
        })
        .catch(next);
});

//get  /posts 发表一篇文章
router.post("/",checkLogin,(req,res,next)=>{
    let author = req.session.user._id;
    let title = req.fields.title;
    let content = req.fields.content;
    try {
        if(!title.length){
            throw new Error("请填写标题");
        }
        if(!content.length){
            throw new Error("请填写内容");
        }
    } catch (e){
        req.flash("error",e.message);
        return res.redirect("back");
    }
    var post = {
        author,
        title,
        content,
        pv:0
    };
    PostModel.create(post)
        .then((results)=>{
            post = results.ops[0];
            req.flash("success","发表成功");
            res.redirect(`/posts`);
        })
        .catch(next);
});

//get  /posts/create 发表文章页

router.get("/create",checkLogin,(req,res,next)=>{

    res.render("create");
});
//get /posts/:postId单独一篇的文章页
router.get("/:postId",function (req,res,next) {
    let postId = req.params.postId;
    // console.log("单独一篇")
    Promise.all([
        PostModel.getPostById(postId),
        CommentModel.getComments(postId),
        PostModel.incPv(postId)
    ])
        .then(function (result) {
            let post =result[0];
            let comments = result[1];
            if(!post){
                throw new Error("改文章不存在");
            }

            res.render("post",{
                post:post,
                comments:comments
            });
        })
        .catch(next);
});
//更新文章
router.get("/:postId/edit",checkLogin,function (req,res,next) {
    let postId = req.params.postId;
    let author = req.session.user._id;
    // console.log("更新");
    PostModel.getRawPostById(postId)
        .then((post)=>{
            if(!post){
                throw new Error("该文章不存在");
            }
            if (author.toString() !== post.author._id.toString()){
                throw new Error("权限不足");
            }
            res.render("edit",{post});
        })
        .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
    let postId = req.params.postId;
    let author = req.session.user._id;
    let title = req.fields.title;
    let content = req.fields.content;

    PostModel.updatePostById(postId, author, { title: title, content: content })
        .then(function () {
            req.flash('success', '编辑文章成功');
            // 编辑成功后跳转到上一页
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
});


//删除一篇文章
router.get("/:postId/remove",checkLogin,function (req,res,next) {
    let postId = req.params.postId;
    let author = req.session.user._id;
    // console.log("删除");
    PostModel.delPostById(postId,author)
        .then(()=>{
            req.flash("success","删除成功");
            res.redirect("/posts");
        })
        .catch(next);
})

//post /post/:postId/comment创建一条留言
router.post("/:postId/comment",checkLogin,function (req,res,next) {

    let author = req.session.user._id;
    let postId = req.params.postId;
    let content = req.fields.content;
    let comment = {
        author,
        postId,
        content
    };

    CommentModel.create(comment)
        .then(()=>{
            req.flash("success","留言成功");

            res.redirect("back");
        })
        .catch(next);
});

//get /post/:postId/comment/:commentId/remove 删除一条留言
router.get("/:postId/comment/:commentId/remove",checkLogin,function (req,res,next) {
    let commentId = req.params.commentId;
    let author = req.session.user._id;
    CommentModel.delCommentById(commentId,author)
        .then(()=>{
            req.flash("success","留言删除成功");
            res.redirect("back");
        })
        .catch(next);
})




module.exports = router;