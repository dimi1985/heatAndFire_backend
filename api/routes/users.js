const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const fs = require('fs');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './user-images/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname);
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


router.post("/register", upload.single('userImage'), (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      }
      // todo make it valid stucks here !!

      // else if (!user.match){
      //   return res.status(410).json({
      //     message: "Please Input a valid Email"
      //   });
      // }
      else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          }
          else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              email: req.body.email,
              password: hash,
              userImage: req.body.userImage,
              userType: req.body.userType,
              recipies: req.body.recipies,
              createdAt: req.body.createdAt,
              following: req.body.following,
      

            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'User created',
                  id: result._id
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});


router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(404).json({
          message: "No user found"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(401).json({
            message: "Wrong Credentials"

          });
        }
        else if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            id: user[0]._id,
            username: user[0].username,
            email: user[0].email,
            userImage: user[0].userImage,


            //token: token
          });
        }
        else {
          res.status(401).json({
            message: "Auth failed"
          });
        }

      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/getUserId", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not Found"
        });
      }


      if (user) {

        return res.status(200).json({
          message: "Found successful",
          id: user[0]._id,
          id: user[0]._id,
          username: user[0].username,
          email: user[0].email,
          userImage: user[0].userImage,
          userType: user[0].userType,
          recipies: user[0].recipies,
          followers: user[0].followers,
          blockedBy: user[0].blockedBy,
          createdAt: user[0].createdAt,
          following: user[0].following,


        });
      }
      res.status(401).json({
        message: "Failed To Find ID"
      });
    });
})


router.patch("/username/:userId/:username", (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;

  }
  User.find({ username: req.params.username })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Username exists"
        });
      } else {

        User.updateOne({ _id: id }, { $set: updateOps })
          .exec()
          .then(result => {
            console.log(updateOps);
            console.log(result);

            res.status(200).json({
              message: 'Username updated',

            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }
    });
});

router.patch("/email/:userId/:email", (req, res, next) => {
  const id = req.params.userId;
  const email = req.params.email;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;

  }
  User.find({ email: email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        console.log("Email exists");
        return res.status(409).json({
          message: "Email exists"
        });
      } else {

        User.updateOne({ _id: id }, { $set: updateOps })
          .exec()
          .then(result => {
            console.log(updateOps);
            console.log(result);

            res.status(200).json({
              message: 'Email updated',

            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }
    });
});


router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


router.get("/:userById", (req, res) => {
  const id = req.params.userById;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {


    User.findById(id)
      .select('_id username email userImage password userType recipies createdAt following')
      .exec()
      .then(doc => {
        console.log("From database", doc);
        if (doc != null) {
          if (doc) {
            res.status(200).json({
              id: doc.id,
              username: doc.username,
              email: doc.email,
              userImage: doc.userImage,
              password: doc.password,
              userType: doc.userType,
              recipies: doc.recipies,
              createdAt: doc.createdAt,
              following: doc.following,


            });
          }


        }
        else {
          console.log('get user 404 error');
          res
            .status(404)
            .json({ message: "No valid entry found for provided ID" });
        }
      })
      .catch(err => {
        console.log('get user with id: user error:' + err);
        res.status(500).json({ error: err });
      });
  }
});


router.get("/recipes/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const result = await User.findById(userId)
      .select('recipeId recipeName ingredients recipeImage userId categoryId')
      .populate("recipeId recipeName recipies ingredients recipeImage userId categoryId");

    if (result) {
      console.log("From database", result);
      res.status(200).json({
        recipeId: result.id,
        recipeName: result.recipeName,
        recipies: result.recipies,
        ingredients: result.ingredients,
        recipeImage: result.recipeImage,
        userId: result.userId,
        categoryId: result.categoryId,
        recipeCategoryname: result.recipeCategoryname,
        recipeDuration: result.recipeDuration,
        recipeUserName: result.recipeUserName,
        recipeUserImagePath: result.recipeUserImagePath,

      });
    }


  } catch (err) {
    console.log('recipe of user error:' + err);
    res.status(500).send("Something went wrong, check logs");
  }
});

// todo fix
router.patch("/updateImage/:userId", upload.single('userImage'), (req, res, next) => {

  User.findById(req.params.userId, function (err, user) {

    const dummyPath = "user-images\\dummy-image\\dummy-image.jpg";
    const oldPath = user.userImage
    const newPath = req.file.path
    /// TODO maybe it will not work
    //====> original (oldPath != dummyPath)
    if (oldPath != dummyPath && oldPath != newPath) {

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
      const id = req.params.userId
      User.updateOne({ _id: id }, { $set: { userImage: newPath } })
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

    }
    else {

      if (err)
        throw err;
      const newPath = req.file.path
      const id = req.params.userId
      User.updateOne({ _id: id }, { $set: { userImage: newPath } })
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



    }




  });
});

router.get("/", async (req, res) => {

  User.find()
    .select('id username email userImage userType recipies createdAt following')
    .sort({ id: -1 })
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        users: docs.map(doc => {
          return {
            id: doc.id,
            username: doc.username,
            userImage: doc.userImage,
            userType: doc.userType,
            recipies: doc.recipies,
            createdAt: doc.createdAt,
            following: doc.following,

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

router.patch("/userFollow/:UserA/:UserB", async (req, res, next) => {

  const UserA = req.params.UserA;
  const UserB = req.params.UserB;


  await User.findOneAndUpdate(
    { _id: UserA },
    { $push: { following: UserB } },
    { upsert: true, new: true }
  );

 
  res.json({ success: true, message: 'Following User' });

});


router.patch("/userUnfollow/:UserA/:UserB", async (req, res, next) => {

  const UserA = req.params.UserA;
  const UserB = req.params.UserB;


  await User.findOneAndUpdate(
    { _id: UserA },
    { $pull: { following: UserB } },
  );


  res.json({ success: true, message: 'Unfollow Success' });

});


module.exports = router;
