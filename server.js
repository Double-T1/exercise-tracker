const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Setup a two layer Schema
//first setup up the lower layer of exercise
const exercisesSchema = new mongoose.Schema({
  description: {type: String},
  duration: {type: Number},
  date: {type:　String}
})

const Exercises = mongoose.model("ExercisesDB", exercisesSchema)

//then build the user schema on top of that
const userSchema = new mongoose.Schema({
  username: {type: String},
  log: [exercisesSchema]
})

const User = mongoose.model("UserDB", userSchema)

//POST to /api/users with form data username to create a new user. 
//The returned response will be an object with username and _id properties.
app.post("/api/users", bodyParser.urlencoded({ extended: false }),(req, res) =>{
    let newUser = new User({
      username: req.body.username
    })
    
    newUser.save((error, savedData)=> {
      if (error) {
        res.send("error while logging newUser")
      } else {
        let x = {
          username: savedData.username,
          _id: savedData._id
        }
        res.json(x)
      }
    })
})

//make a GET request to /api/users to get an array of all users. 
//Each element in the array is an object containing a user's username and _id.
app.get("/api/users",(req,res)=> {
  User.find({})
    .select(["username","_id"])
    .exec((error, allData) => {
            if (error) {
              res.send("there is an error while extracting all users.");
            } else {
              res.send(allData)
            }
          })
})


//POST to /api/users/:_id/exercises with form data description, duration, and optionally date. 
//If no date is supplied, the current date will be used. 
//The response returned will be the user object with the exercise fields added.

app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false }),(req,res) => {
  let id = req.params._id;
  let duration = parseInt(req.body.duration,10);
  let description = req.body.description;
  let date;
  
  //assign the current date if the date is not specified
  if (!req.body.date) {
    date = new Date();
    date = date.toDateString();
  } else {
    date = new Date(req.body.date).toDateString();
  }
  
  let update = {
      description: description,
      duration: duration,
      date: date
  }
      
  User.findById({_id: id})
    .exec((error, foundUserData) => {
    if (error) {
      res.send("The ID doesn't exist.")
      return
    }
    
    let exercisesModel = new Exercises(update);
    foundUserData.log.push(exercisesModel);
    
    foundUserData.save((err, loggedData) => {
      if (err) {
        res.send("There's an error while uploading exercises to the log")
      } else {
        
        let toBeSent = {
          username: loggedData.username,
          _id: loggedData._id,
          description: update.description,
          duration:update.duration,
          date: update.date
        }
        res.json(toBeSent)
      }
    })
  })
})

   
//GET request to /api/users/:_id/logs to retrieve a full exercise log of any user. 
//The returned response will be the user object with a log array of all the exercises added. 
//Each log item has the description, duration, and date properties.

app.get("/api/users/:_id/logs", (req, res)=> {
  //add from, to and limit parameters to a /api/users/:_id/logs request to retrieve part of the log of any user. 
  //from and to are dates in yyyy-mm-dd format. 
  //limit is an integer of how many logs to send back.
  let id = req.params._id;

  User.findById(id, (error, foundUser) => {
    //there must be a better way, perhaps to construct a different way to log in exercises?
    //to get rid of the id for each logged exercise
    if (error) {
      res.send("Something wrong with the ID you sent.")
    } else {
      let newLog = [];
      for (let i=0; i<foundUser.log.length; i++) {
        let newExercise = {
          description: foundUser.log[i].description,
          duration: foundUser.log[i].duration,
          date: foundUser.log[i].date
        }
      newLog.push(newExercise);
      }

      let from = req.query.from;
      let to = req.query.to;
      let limit = req.query.limit;

      //check with the date 
      if (from || to) {

        let fromDate = new Date(0);
        let toDate = new Date();
        
        if(from) {
          fromDate = new Date(from)
        }

        if (to) {
          toDate = new Date(to)
        }
      
        //convert the date object into unix timestamp for comparison
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        
        newLog = newLog.filter(x=> {
          let acquiredDate = new Date(x.date).getTime()
          
          return acquiredDate >= fromDate && acquiredDate <= toDate
        })
        
      }
        
      //check with the limit
      if (limit) {
        newLog = newLog.slice(0,limit); 
      }
      
      //prepare the Json to be returned to the client side
      let toBeSent = {
        _id: foundUser._id,
        username: foundUser.username,
        count: newLog.length,
        log:newLog
      }
      res.json(toBeSent)     
    }
  })
}) 






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
