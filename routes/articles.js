const express = require('express');
const router = express.Router();
//Bring in Models
const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')





//Add Route
router.get('/add',ensureAuthenticated, (req,res)=>{
  res.render('add_article',{
      title:'Add Article'
  })
})

// Add Submit POST Route

router.post('/add',
  (req,res)=>{
      req.checkBody('title','Title is required').notEmpty();
    //   req.checkBody('author','Author is required').notEmpty();
      req.checkBody('body','Body is required').notEmpty();

      // get Errors
      const errors =req.validationErrors();
      if(errors){
          res.render('add_article',{
              title:"Add Article",
              errors:errors,
              user:req.user
          });

      }else{
        //   console.log(req.user);
          let article = new Article;
          article.title = req.body.title;
          article.author = req.user.username;
          article.body = req.body.body;
          article.totalComments = 0;
          
          User.update({username:req.user.username},{ $inc: {posts: 1}},(err)=>{
            article.save((err)=>{
                if(err){
                    console.log(err);
                }else{
                    req.flash('success','Article Added');
                    res.redirect('/');
                }
            });
          });
          
      }
      
  });

// Update Submit POST Route

router.post('/edit/:id',(req,res)=>{
  let article ={};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query={_id:req.params.id};
  Article.update(query, article, (err)=>{
      if(err){
          console.log(err);
      }else{
          req.flash('success','Article Updated!')
          res.redirect('/')
      }
  });
});
// Delete Article
router.delete('/:id',(req, res) => {
    let query = { _id: req.params.id }
    Article.findById(req.params.id,(err,article)=>{
        if(article.author!= req.user.username){
            res.status(500).send();
        }else{
            Article.remove(query,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    req.flash('danger','Article Deleted!');
                    res.send('Success');
                }
              });
        }
    })
    
});

// Get Single Article
router.get('/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    Comment.find({postId:req.params.id},(err,comments)=>{
        res.render('article',{
            comments:comments,
            article:article
        });  
    });
  });
})

// Load Edit Form Article Route
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
      if(article.author!=req.user._id){
          req.flash('danger','Not Authorised');
          res.redirect('/')
      }
      res.render('edit_article',{
          title:'Edit Article',
          article
      });
  });
})
// Access control

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger','Please Login');
        res.redirect('/users/login');
    }
}

module.exports =  router;