const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './category-images/');
  },
  filename: function(req, file, cb) {
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


router.post('/',upload.single('categoryImage'), (req,res,next)=>{
   
    const category = new Category({
      _id: mongoose.Types.ObjectId(),
      categoryName: req.body.categoryName,
      categoryImage: req.file.path,
      recipeId: req.body.recipeId,
      categoryHexColor: req.body.categoryHexColor,
      categoryGoogleFont: req.body.categoryGoogleFont,
    });
    category.save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message: 'Category Created',
            createdCategory: {
                id: result.id,
                categoryName: result.categoryName,
                recipeId: result.recipeId,
                categoryImage: req.file.path,
                categoryHexColor: result.categoryHexColor,
                categoryGoogleFont: result.categoryGoogleFont,
              
            }
        });
     
}).catch(err => {
  console.log(err);
  res.status(500).json({
      error: err
  });
}); 
});



router.get('/',(req,res,next)=>{

    Category.find()
.select('categoryId categoryName recipeId _id categoryImage categoryHexColor categoryGoogleFont')
.exec()
.then(docs => {
    const response = {
        count: docs.length,
        category: docs.map(doc =>{
         
            return{
              categoryId:doc._id,
                categoryName:doc.categoryName,
                recipeId:doc.recipeId,
                categoryImage: req.protocol + "://" + req.get('host') + "/"+ doc.categoryImage.replace(/\\/g,'/'),
                categoryHexColor:doc.categoryHexColor,
                categoryGoogleFont:doc.categoryGoogleFont,
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

router.get("/:categoryId", (req, res, next) => {
  const id = req.params.categoryId;
  Category.findById(id)
  .select('categoryId categoryName recipeId _id categoryHexColor categoryGoogleFont')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          categoryId:doc._id,
          categoryName:doc.categoryName,
          recipeId:doc.recipeId,
          categoryHexColor:doc.categoryHexColor,
          categoryGoogleFont:doc.categoryGoogleFont,
         
        });
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


router.patch("/:categoryId", (req, res, next) => {
  const id = req.params.categoryId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;

  }

  Category.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(updateOps);
      console.log(result);

      res.status(200).json({
        message: 'Category updated',
    
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });

    
});


router.patch("/updateRecipeCategoryId/:categoryId",(req, res, next) => {

    Category.findById(req.params.categoryId, function (err, recipe) {
    
                     const id = req.params.categoryId
                     const newCategoryName = req.body.categoryName
                     const newCategoryHexColor = req.body.categoryHexColor
                     const newcategoryGoogleFont = req.body.categoryGoogleFont
                     Category.updateOne({ _id: id }, { $set: {categoryName:newCategoryName,categoryHexColor:newCategoryHexColor,categoryGoogleFont:newcategoryGoogleFont} })
                      .exec()
                      .then(result => {
                        res.status(200).json({
                            message: 'Category updated',
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

  router.patch("/updateCategoryImage/:categoryId", upload.single('categoryImage'), (req, res, next) => {

    Category.findById(req.params.categoryId, function (err, category) {
  
      const oldPath = category.categoryImage
  
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
      const id = req.params.categoryId
      Category.updateOne({ _id: id }, { $set: { categoryImage: newPath } })
        .exec()
        .then(result => {
          res.status(200).json({
            message: 'Category Image updated',
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

module.exports = router;