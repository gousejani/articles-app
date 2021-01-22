const express = require('express');
const router = express.Router();
//Bring in Models
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');

const bcrypt = require('bcryptjs');
const passport = require('passport');
// Register Form

router.get('/register',(req,res)=>{
    res.render('register');
})
// Register Process
router.post('/register',(req,res)=>{
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    const posts = 0;
    const comments = 0;

    req.checkBody('email','Email is not valid').isEmail();
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors){
        res.render('register',{errors});
    }else{
        let newUser = new User({
            email,
            username,
            password,
            posts,
            comments
        });
        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash(newUser.password,salt,(err,hash )=>{
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save((err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        req.flash('success','You\'re now registered. Login now!');
                        res.redirect('/users/login')
                    }
                });
            });
        });
        
    }
});



// Login Form
router.get('/login',(req,res)=>{
    res.render('login');
});

// Login Process
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

// Logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"You're Logged Out");
    res.redirect('/users/login')
})

// My Profile
router.get('/myprofile',(req,res)=>{
    Article.find({author:req.user.username},(err,articles)=>{
        Comment.find({username:req.user.username},(err,comments)=>{
            res.render('my_profile',{
                user: req.user,
                articles:articles,
                comments
            });
        });
    });
});

// User Profile
router.get('/:username',(req,res)=>{
    Article.find({author:req.params.username},(err,articles)=>{
        Comment.find({username:req.params.username},(err,comments)=>{
            User.find({username:req.params.username},(err,profile)=>{
                res.render('user_profile',{
                    profile:profile,
                    articles,
                    comments
                });
            });
        });
    });
});

module.exports =  router;