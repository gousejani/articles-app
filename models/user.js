const mongoose = require('mongoose');

// User schema

const userSchema = mongoose.Schema({
    email:{type:String, required:true},
    username:{type:String, required:true},
    password:{type:String, required:true},
    posts:{type:Number, required:true},
    comments:{type:Number, required:true}
})

const User = module.exports = mongoose.model('User',userSchema);