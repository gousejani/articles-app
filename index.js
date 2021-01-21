const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv').config();
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


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

// Express Session Middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
// Express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator 
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
  
      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  }));


// Passport config
require('./config/passport')(passport);
// Passport Middleware

app.use(passport.initialize());
app.use(passport.session());

// Global user object
app.get('*',(req,res,next)=>{
    res.locals.user = req.user||null;
    next();
});

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

// Routes Files

// Articles
let articles = require('./routes/articles');
app.use('/articles',articles);
// Users
let users = require('./routes/users');
app.use('/users',users);
// Comments
let comments = require('./routes/comments');
app.use('/comments',comments);


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server started on PORT: ${PORT}`))


