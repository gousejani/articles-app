const mongoose = require('mongoose');

// User schema

const commentSchema = mongoose.Schema({
    postId:{type:String, required:true},
    username:{type:String, required:true},
    body:{type:String, required:true},
    postTitle:{type:String, required:true}
});

const Comment = module.exports = mongoose.model('Comment',commentSchema);
