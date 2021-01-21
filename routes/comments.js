const express = require('express');
const router = express.Router();
//Bring in Models
const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')



// Post Comment 
router.post('/add',
  (req,res)=>{
    //   console.log(req.body);
      req.checkBody('body','Body is required').notEmpty();
      // get Errors
      const errors = req.validationErrors();
      if(errors){
        Article.findById(req.body.postId,(err,article)=>{
                Comment.find({postId:req.body.postId},(err,comments)=>{
                    req.flash('danger',"Comment shouldn't be empty")
                    res.render('article',{
                        comments:comments,
                        article:article
                    });  
                });    
          });
      }else{
          let comment = new Comment;
          comment.body = req.body.body;
          comment.username = req.user.username;
          comment.postId = req.body.postId;

          comment.save((err)=>{
              if(err){
                  console.log(err);
              }else{
                  Article.findById(req.body.postId,(err,article)=>{
                        Comment.find({postId:req.body.postId},(err,comments)=>{
                            req.flash('success','Comment Added');
                            res.render('article',{
                                comments:comments,
                                article:article
                            });  
                        });    
                    });
              }
          });
      }
      
  });

module.exports =  router;