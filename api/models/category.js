const mongoose = require('mongoose');



const categorySchema = mongoose.Schema({
    categoryId: mongoose.Schema.Types.ObjectId,
            categoryName: { type : String, required: true},
            recipeId: [{ 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe"
             }],  
             categoryImage: { type : String, required: false},
            categoryHexColor: { type : String, required: false},   
            categoryGoogleFont: { type : String, required: false},        
        },);

module.exports = mongoose.model('Catecory', categorySchema);