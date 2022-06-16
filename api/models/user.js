const mongoose = require('mongoose');



const userSchema = mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
            username: { 
                type: String, 
                required: true, 
                unique: true, 
            },
            email: { 
                type: String, 
                required: true, 
                unique: true, 
                match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            },
            password:{type:String,required:true},
            recipies: [{ 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe"
             }],
             userType: {
                type: String,
                enum : ['user','admin'],
                default: 'user'
            },
             userImage: { type : String, required: false},
             createdAt: { 
                type: String,     
            },
            following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
            

        },);

module.exports = mongoose.model('User', userSchema);