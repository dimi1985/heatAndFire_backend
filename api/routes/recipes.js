const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');
const User = require('../models/user');
const Category = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


router.get('/', (req, res, next) => {

  Recipe.find()
    .select('recipeName ingredients _id recipeImage userId categoryId recipeDuration recipePreparation recipeUserName recipeCategoryname recipeUserImagePath createdAt comments categoryHexColor isLiked isApproved categoryGoogleFont likedByUserIdCount')
    .sort({ _id: -1, userId: -1 })
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        recipe: docs.map(doc => {
          console.log('Coming From Server: ' + doc._id);
          return {
            _id: doc._id,
            recipeName: doc.recipeName,
            ingredients: doc.ingredients,
            recipeImage: doc.recipeImage,
            userId: doc.userId,
            categoryId: doc.categoryId,
            recipeDuration: doc.recipeDuration,
            recipePreparation: doc.recipePreparation,
            recipeUserImagePath: doc.recipeUserImagePath,
            recipeUserName: doc.recipeUserName,
            recipeCategoryname: doc.recipeCategoryname,
            likedByUserIdCount: doc.likedByUserIdCount,
            isLiked: doc.isLiked,
            createdAt: doc.createdAt,
            recipeDifficulty: doc.recipeDifficulty,
            comments: doc.comments,
            categoryHexColor: doc.categoryHexColor,
            isApproved: doc.isApproved,
            categoryGoogleFont: doc.categoryGoogleFont,

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


router.get('/getRecipeByFollowers/:userId', async (req, res, next) => {
  var userId = req.params.userId
  await User.findById(userId)
    .select('followingUser')
    .populate('followingUser:')
    .exec()
    .then(doc => {
      if (doc) {

        const followingUser = doc.followingUser;
        Recipe.
          find({ userId: followingUser }).
          exec(function (err, recipies) {
            if (err) return handleError(err);
            res.status(200).json({
              recipies
            });
          });
      }
    })
});

router.get('/getRecipeByCategory/:categoryId', async (req, res, next) => {
  const id = req.params.categoryId;
  await Category.findById(id)
    .select('recipeId')
    .populate('recipeId')
    .exec()
    .then(doc => {
      if (doc) {
        Recipe.
          find({ "categoryId": id }).
          exec(function (err, recipies) {
            console.log(recipies);
            if (err) return handleError(err);
            res.status(200).json({
              recipies
            });
          });
      }
    });
});


router.get('/sortby', (req, res, next) => {

  Recipe.aggregate([

    {
      "$group": {
        "_id": "$userId",

        "recipe": { "$last": "$$ROOT" },

      }
    },

    {
      $project: {

        "recipeId": "$recipe._id",
        "recipeName": "$recipe.recipeName",
        "ingredients": "$recipe.ingredients",
        "recipeImage": "$recipe.recipeImage",
        "recipeDuration": "$recipe.recipeDuration",
        "recipePreparation": "$recipe.recipePreparation",
        "recipeUserImagePath": "$recipe.recipeUserImagePath",
        "recipeUserName": "$recipe.recipeUserName",
        "comments": "$recipe.comments",
        "categoryHexColor": "$recipe.categoryHexColor",
        "createdAt": "$recipe.createdAt",
        "recipeDifficulty": "$recipe.recipeDifficulty",
        "recipeCategoryname": "$recipe.recipeCategoryname",
        "isApproved": "$recipe.isApproved",
        "userId": "$recipe.userId",
        "categoryGoogleFont": "$recipe.categoryGoogleFont",
        "categoryId": "$recipe.categoryId",
        "isLiked": "$recipe.isLiked",
        "likedByUserIdCount": "$recipe.likedByUserIdCount",

      }
    },
    { "$sort": { "recipeId": -1 } },
  ]).exec()
    .then(docs => {
      const response = {
        count: docs.length,
        recipe: docs.map(doc => {
          return {
            _id: doc.recipeId,
            recipeName: doc.recipeName,
            ingredients: doc.ingredients,
            recipeImage: doc.recipeImage,
            recipeDuration: doc.recipeDuration,
            recipePreparation: doc.recipePreparation,
            recipeUserImagePath: doc.recipeUserImagePath,
            recipeUserName: doc.recipeUserName,
            likedByUserIdCount: doc.likedByUserIdCount,
            isLiked: doc.isLiked,
            comments: doc.comments,
            categoryHexColor: doc.categoryHexColor,
            createdAt: doc.createdAt,
            recipeDifficulty: doc.recipeDifficulty,
            recipeCategoryname: doc.recipeCategoryname,
            isApproved: doc.isApproved,
            userId: doc.userId,
            categoryGoogleFont: doc.categoryGoogleFont,
            categoryId: doc.categoryId,

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



router.post('/', upload.single('recipeImage'), (req, res, next) => {
  console.log(req.file);
  const recipe = new Recipe({
    _id: mongoose.Types.ObjectId(),
    recipeName: req.body.recipeName,
    ingredients: req.body.ingredients,
    recipeImage: req.file != null ? req.file.path.replace(/\\/g, '/') : "PATH",
    userId: req.body.userId,
    categoryId: req.body.categoryId,
    recipeDuration: req.body.recipeDuration,
    recipePreparation: req.body.recipePreparation,
    recipeUserImagePath: req.body.recipeUserImagePath,
    recipeUserName: req.body.recipeUserName,
    recipeCategoryname: req.body.recipeCategoryname,
    createdAt: req.body.createdAt,
    recipeDifficulty: req.body.recipeDifficulty,
    comments: req.body.comments,
    categoryHexColor: req.body.categoryHexColor,
    isApproved: req.body.isApproved,
    categoryGoogleFont: req.body.categoryGoogleFont,

  });
  recipe.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Recipe Created',
        createdRecipe: {
          id: result.id,
          recipeName: result.recipeName,
          recipeDuration: result.recipeDuration,
          ingredients: result.ingredients,
          userId: result.userId,
          categoryId: result.categoryId,
          recipeImage: result.recipeImage,
          recipePreparation: result.recipePreparation,
          recipeUserImagePath: result.recipeUserImagePath,
          recipeUserName: result.recipeUserName,
          recipeCategoryname: result.recipeCategoryname,
          likedByUserIdCount: result.likedByUserIdCount,
          isLiked: result.isLiked,
          createdAt: result.createdAt,
          recipeDifficulty: result.recipeDifficulty,
          comments: result.comments,
          categoryHexColor: result.categoryHexColor,
          isApproved: result.isApproved,
          categoryGoogleFont: result.categoryGoogleFont,

        }

      });

      return User.findOneAndUpdate({ _id: req.body.userId },
        { $push: { recipies: recipe.id } },
        { new: true } ,// forces callback to be passed a fresh object
      );
    }).then((user) => {
      console.log('updated user:', user.username);

      return Category.findOneAndUpdate({ _id: req.body.categoryId },
        { $push: { recipeId: recipe.id } },
        { new: true }
      );
    })
    .then((categories) => {
      console.log('updated categories:', categories);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



router.get("/:recipeId", (req, res, next) => {
  const id = req.params.recipeId;

  Recipe.findById(id)
    .select('recipeName ingredients recipeId _id recipeImage userId categoryId recipeDuration recipePreparation createdAt recipeDifficulty comments categoryHexColor,isApproved')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        Category.findById(doc.categoryId)
          .select('categoryId categoryName recipeId _id')
          .exec()
          .then(doc => {

            if (id != null) {
              if (doc) {
                res.status(200).json({
                  id: doc.recipeId,
                  recipeName: doc.recipeName,
                  recipeImage: doc.recipeImage,
                  userId: doc.userId,
                  categoryId: doc.categoryId,
                  ingredients: doc.ingredients,
                  recipeDuration: doc.recipeDuration,
                  recipePreparation: doc.recipePreparation,
                  categoryName: doc.categoryName,
                  likedByUserIdCount: doc.likedByUserIdCount,
                  isLiked: doc.isLiked,
                  createdAt: doc.createdAt,
                  recipeDifficulty: doc.recipeDifficulty,
                  comments: doc.comments,
                  categoryHexColor: doc.categoryHexColor,
                  isApproved: doc.isApproved,
                  categoryGoogleFont: doc.categoryGoogleFont,
                });


              }
            }
          })


      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});



router.patch("/:recipeId", (req, res, next) => {
  const id = req.params.recipeId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;

  }

  Recipe.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(updateOps);
      console.log(result);

      res.status(200).json({
        message: 'Recipe updated',

      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/approveRecipe/:recipeId/:booleanValue", async (req, res, next) => {

  const recipeId = req.params.recipeId;
  const booleanValue = req.params.booleanValue;

  await Recipe.findOneAndUpdate(
    { _id: recipeId },
    { $set: { isApproved: booleanValue } },
  ).then(doc => {
    if (doc) {
      res.json({ success: true, message: "Recipe Approved"});
    }
  });
});


router.patch("/updateRecipeCategoryId/:recipeId/:oldCategoryId/:newCategoryId", async (req, res, next) => {

  const recipeId = req.params.recipeId;
  const oldCategoryId = req.params.oldCategoryId;
  const newCategoryId = req.params.newCategoryId;


  await Category.findOneAndUpdate(
    { _id: newCategoryId },
    { $push: { recipeId: recipeId } },
    { upsert: true, new: true },
  ).then(result => {
    console.log(result);
  });

  await Category.findOneAndUpdate(
    { _id: oldCategoryId },
    { $pull: { recipeId: recipeId } },

  ).then(result => {
    console.log(result);
  });



  res.json({ success: true, message: "Category Updated" });

});

router.delete('/delete/:recipeId/:userId/:categoryId/', async (req, res, next) => {

  const recipeId = req.params.recipeId;
  const userId = req.params.userId;
  const categoryId = req.params.categoryId;
  const recipeImagePath = req.body.recipeImage;


  try {
    fs.unlinkSync(recipeImagePath)
  } catch (err) {
    console.error(err)
  }


  await User.findOneAndUpdate(
    { _id: userId },
    { $pull: { recipies: recipeId } },
  ).then(result => {
    console.log(result);
  });

  await Recipe.findOneAndRemove(
    { _id: recipeId },

  ).then(result => {
    console.log(result);
  });

  await Category.findOneAndUpdate(
    { _id: categoryId },
    { $pull: { recipeId: recipeId } },
  ).then(result => {
    console.log(result);
  });
  res.json({ success: true, message: "Recipe Deleted" });
});







router.patch("/updateImage/:recipeId", upload.single('recipeImage'), (req, res, next) => {

  Recipe.findById(req.params.recipeId, function (err, recipe) {

    const oldPath = recipe.recipeImage

    try {
      fs.unlinkSync(oldPath)
      console.log('//====>..file removed');
    }
    catch (err) {
      console.error(err)
    }

    if (err)
      throw err;
    const newPath = req.file.path
    const id = req.params.recipeId
    Recipe.updateOne({ _id: id }, { $set: { recipeImage: newPath } })
      .exec()
      .then(result => {
        res.status(200).json({
          message: 'Image updated',
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


router.patch("/likeRecipe/:recipeId/:User/:booleanValue", async (req, res, next) => {

  const recipeId = req.params.recipeId;
  const User = req.params.User;
  const booleanValue = req.params.booleanValue;

  await Recipe.findOneAndUpdate(
    { _id: recipeId },
    { $set: { isLiked: booleanValue } },


  );

  await Recipe.findOneAndUpdate(
    { _id: recipeId },
    { $push: { likedByUserIdCount: User } },
    { upsert: true, new: true },


  ).then(doc => {
    if (doc) {
      res.json({ success: true, message: "Recipe Liked", likedByUserIdCount: doc.likedByUserIdCount });
    }
  });
});




router.patch("/dislikeRecipe/:recipeId/:User/", async (req, res, next) => {

  const recipeId = req.params.recipeId;
  const User = req.params.User;



  await Recipe.findOneAndUpdate(
    { _id: recipeId },
    { $pull: { likedByUserIdCount: User } },
    { upsert: true, new: true },

  ).then(doc => {
    if (doc) {

      res.json({ success: true, message: "Recipe DisLiked", likedByUserIdCount: doc.likedByUserIdCount, });

    }

  });
});

router.get("/searchQuery/:searchString", async (req, res, next) => {

  const searchString = req.params.searchString;

  if (searchString.length != 0) {


    Recipe.aggregate(
      [
        // Match first to reduce documents to those where the array contains the match
        {
          "$match": {
            "recipeName": { "$regex": searchString, "$options": "i" }
          }
        },

        // Unwind to "de-normalize" the document per array element
        { "$unwind": "$recipeName" },

        // Now filter those document for the elements that match
        {
          "$match": {
            "recipeName": { "$regex": searchString, "$options": "i" }
          }
        },

        // Group back as an array with only the matching elements
        // { "$group": {
        //     "_id": "$_id",           
        //     "recipeNameResult": { "$push": "$recipeName" },
        //     "recipeImageResult": { "$push": "$recipeImage" },

        // }},

      ])

      .exec(function (err, results) {
        if (results) {
          console.log(results)
          res.json({ results, });
        }
        else {
          return res.status(500).json({
            error: err
          });
        }
      })

  }
});

// Recipe.aggregate(
//   [
//       // Match first to reduce documents to those where the array contains the match
//       { "$match": {
//           "recipeName": { "$regex": searchString, "$options": "i" }
//       }},

//       // Unwind to "de-normalize" the document per array element
//       { "$unwind": "$recipeName" },

//       // Now filter those document for the elements that match
//       { "$match": {
//           "recipeName": { "$regex": searchString, "$options": "i" }
//       }},

//       // Group back as an array with only the matching elements
//       { "$group": {
//           "_id": "$_id",           
//           "recipeName": { "$push": "$recipeName" },
//           "ingredients": { "$push": "$ingredients" },
//           "recipeImage": { "$push": "$recipeImage" },

//       }},

//   ]).exec()
//   .then(docs => {
//     const response = {

//       results: docs.map(doc => {
//         return {
//           _id: doc._id,
//           recipeName: doc.recipeName,
//           ingredients: doc.ingredients,
//           recipeImage: doc.recipeImage,
//           recipeDuration: doc.recipeDuration,
//           recipePreparation: doc.recipePreparation,
//           recipeUserImagePath: doc.recipeUserImagePath,
//           recipeUserName: doc.recipeUserName,
//           likedByUserIdCount: doc.likedByUserIdCount,
//           isLiked: doc.isLiked,
//           comments: doc.comments,
//           categoryHexColor: doc.categoryHexColor,
//         };
//       })
//     };
//       console.log(response);
//     res.status(200).json(response);


//   })
//   .catch(err => {
//     console.log(err);
//     res.status(500).json({
//       error: err
//     });
//   })

// }

module.exports = router;