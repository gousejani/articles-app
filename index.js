const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv').config();
// mongoose.connect('mongodb://localhost/nodekb');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

let db = mongoose.connection;


// Check for DB Errors
db.on('error',(err)=>console.log(err))


// check connection
db.once('open',()=>console.log('Connected to MongoDB'))

// Init app
const app = express();

// Body Parser middleware - parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Set static public folder
app.use(express.static(path.join(__dirname,'public')));

//Bring in Models
const Article = require('./models/article')

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug')

// Home route
app.get('/',(req,res)=>{
    Article.find({},(err,articles)=>{
        if(err){
            console.log(err);
        }else{
            res.render('index',{
                title:"Articles",
                articles:articles
            });
        }
        
    });
});
// Get Single Article Route
app.get('/article/:id',(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        res.render('article',{
            article
        });
    });
})

// Load Edit Form Article Route
app.get('/article/edit/:id',(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        res.render('edit_article',{
            title:'Edit Article',
            article
        });
    });
})


//Add Route
app.get('/articles/add',(req,res)=>{
    res.render('add_article',{
        title:'Add Article'
    })
})

// Add Submit POST Route

app.post('/articles/add',(req,res)=>{
    let article = new Article;
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/')
        }
    })
})

// Update Submit POST Route

app.post('/articles/edit/:id',(req,res)=>{
    let article ={};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query={_id:req.params.id};
    Article.update(query, article, (err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/')
        }
    });
})

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server started on PORT: ${PORT}`))


