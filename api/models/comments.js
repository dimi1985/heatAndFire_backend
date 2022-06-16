const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    commentId: mongoose.Schema.Types.ObjectId,    
    commentContent: { type : String, required: false},      
    commentUserName: { type : String, required: false},  
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      username: {type: String},
      ref: "User"
   },
   recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      username: {type: String},
      ref: "Recipe"
   },
    commentUserImagePath: { type : String, required: false},      
    createdAt: { 
       type: String,     
   },                   
   
});

module.exports = mongoose.model('Comment', commentSchema);