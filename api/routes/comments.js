const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/comments');
const User = require('../models/user');
const Recipe = require('../models/recipe');

router.post('/', (req,res,next)=>{
   
    const comment = new Comment({
        _id: mongoose.Types.ObjectId(),
        commentContent: req.body.commentContent,
        commentUserName: req.body.commentUserName, 
        commentUserImagePath: req.body.commentUserImagePath,
        likedByUserIdCount: req.body.likedByUserIdCount,   
        userId: req.body.userId,   
        recipeId: req.body.recipeId,   
        createdAt: req.body.createdAt,  
      });
      comment.save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message: 'Comment uploaded',
            createdCategory: {
                id: result.id,
                commentContent: result.commentContent,
                commentUserName: result.commentUserName, 
                commentUserImagePath: result.commentUserImagePath,
                likedByUserIdCount: result.likedByUserIdCount,   
                userId: result.userId,  
                recipeId: result.recipeId,  
                createdAt: result.createdAt,  
                 
               
            }
        });
        return User.findOneAndUpdate({ _id: req.body.userId },
            { $push: { comments: comment.id } },
            { new: true } ,// forces callback to be passed a fresh object
          );
        }).then((user) => {
          console.log('updated user:', user.username);
      
          return Recipe.findOneAndUpdate({ _id: req.body.recipeId },
            { $push: { comments: comment.id } },
            { new: true } ,// forces callback to be passed a fresh object
          );
        }).then((doc) => {
         res.json({ success: true, message: doc.comments });

}).catch(err => {
    console.log(err);
    res.status(500).json({
        error: err
    });
});
});

router.get('/getCommentByRecipe/:recipeId', async (req, res, next) => {
    const id = req.params.recipeId;
    await Recipe.findById(id)
      .select('comments')
      .populate('comments')
      .exec()
      .then(doc => {
        if (doc) {
          Comment.
            find({ "recipeId": id }).
            exec(function (err, comments) {
              console.log(comments);
              if (err) return handleError(err);
              res.status(200).json({
                comments
              });
            });
        }
      });
  });

  
router.get('/', (req, res, next) => {

    Comment.find({})
      .select('_id commentContent commentUserName commentUserImagePath createdAt')
      .sort({ _id: -1, userId: -1 })
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          comments: docs.map(doc => {
            return {
              _id: doc._id,
              commentContent: doc.commentContent,
              commentUserName: doc.commentUserName,
              commentUserImagePath: doc.commentUserImagePath,
              createdAt: doc.createdAt,
            };
          })
        };
  
        res.status(200).json(response);
  
  
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });


router.patch("/updateComment/:commentId",(req, res, next) => {
    const id = req.params.commentId
    Comment.findById(id, function (err, commentResult) {
    
                  
                     const newContent = req.body.commentContent
                     Comment.updateOne({ _id: id }, { $set: {commentContent:newContent} })
                      .exec()
                      .then(result => {
                        res.status(200).json({
                            message: 'Comment updated',
                        });
                      })
                      .catch(err => {
                        console.log(err);
                        res.status(500).json({
                          error: err
                        });
                      });
  
  
    });
  });

  router.delete('/delete/:commentId', async(req, res, next)  => {

    await Comment.findByIdAndRemove(req.params.commentId, function (err, comment) {
     
        if (err)
      throw err;
  
            User.findOneAndUpdate({ id: req.params.userId }, { $pull: { comments: { $in: req.params.commentId } } }, function (err) {
           console.log('deleting comments references');
           if (err)
             throw err;
          
              Recipe.findOneAndUpdate({ id: req.params.recipeId }, { $pull: { comments: { $in: req.params.commentId } } }, function (err) {
               console.log('deleting category references');
               if (err)
                 throw err;
   
               res.json({ success: true, message: "Deleted" });
             });
           });
         
        });
       });
   
   



module.exports = router;