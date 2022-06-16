const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const recipesRoute = require('./api/routes/recipes');
const userRoute = require('./api/routes/users');
const categoryRoute = require('./api/routes/categories');
const commentRoute = require('./api/routes/comments');

//Connect To LocalHost MongoDB
mongoose.connect('mongodb://localhost:27017/heatandfire',
  {

    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(callback => {

}).catch(err => {
  console.log(err);
});



// mongoose.connect('mongodb+srv://root:'+ process.env.MONGO_ATLAS_PW + '@rest-recipe-api-db.cfupl.mongodb.net/<dbname>?retryWrites=true&w=majority');
mongoose.set('useFindAndModify', false);
require('mongoose').set('debug', true)
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use('/user-images',express.static('user-images'));
app.use('/category-images',express.static('category-images'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });


app.use('/recipes', recipesRoute);
app.use('/user', userRoute);
app.use('/categories', categoryRoute);
app.use('/comments', commentRoute);


app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status=404;
    next(error);
});


app.use((req, res, next)=>{
   res.status(error.status || 500);
   res.json({
       error: {
           message: error.message,
       }
   })
});

module.exports = app;