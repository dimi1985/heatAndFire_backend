const mongoose = require('mongoose');



const recipeSchema = mongoose.Schema({
            recipeId: mongoose.Schema.Types.ObjectId,
            recipeName: { type : String, required: false},
            ingredients: { type : Array, required: false},
            recipeImage: { type : String, required: false},   
            recipePreparation: { type : String, required: false},       
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                username: {type: String},
                ref: "User"
             },
             categoryId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
             },
             categoryHexColor: { type : String, required: false},
             categoryGoogleFont: { type : String, required: false},  
             recipeDuration: { type : Number, required: false},
             recipeDifficulty: { type : String, required: false},
             
             recipeUserImagePath: { type : String, required: false},     
             recipeUserName: { type : String, required: false},
             recipeCategoryname: { type : String, required: false}, 
             isLiked: {  type: Boolean, default: false}, 
             likedByUserIdCount: [{ 
               type: mongoose.Schema.Types.ObjectId,
               ref: "User"
            }], 
            comments: [{ 
               type: mongoose.Schema.Types.ObjectId,
               ref: "Comment"
            }], 
            createdAt: { 
               type: String,     
           }, 
           isApproved: { type: Boolean, default: false},                  
           
        });
        recipeSchema.index({$recipeName: 'text'});

module.exports = mongoose.model('Recipe', recipeSchema);