const express = require('express');
const router = express.Router();
//Bring in Models
const User = require('../models/user');
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
            password
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
    req.flash('success',"You're Logged In");
});

// Logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"You're Logged Out");
    res.redirect('/users/login')
})

module.exports =  router;