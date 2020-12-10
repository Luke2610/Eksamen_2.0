var express = require("express"), //all the required middleware
    bodyParser = require("body-parser"), 
    mongoose = require("mongoose"), 
    passport = require("passport"), 
    LocalStrategy = require("passport-local"), 
    passportLocalMongoose = require("passport-local-mongoose"), 
    User = require("./models/user.js"),
    path = require('path');

var app = express(); 
app.set("view engine", "ejs"); //set the view engine to EJS
app.use(bodyParser.urlencoded({ extended: true })); //get input from HTML with req.body
app.use(express.static(path.join(__dirname, '/public'))); //access to the static files (CSS)
 
mongoose.set('useNewUrlParser', true); 
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 
mongoose.connect('mongodb+srv://Luke2610:Jegharmegetsej@eksamen2020.zubyd.mongodb.net/<dbname>?retryWrites=true&w=majority',{useUnifiedTopology: true}); 
  
app.use(require("express-session")({ 
    secret: "NodeJS er svært", 
    saveUninitialized: false,
    resave: false
})); 
  
app.use(passport.initialize()); 
app.use(passport.session()); 

//guide from https://github.com/saintedlama/passport-local-mongoose#api-documentation
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 
  
//----------
// HTTP requests
//----------
  
//show the home page when directed to / 
app.get("/", function (req, res) { 
    res.render("home"); 
}); 
  
// Showing the main page when logged in. Also returns all the users of a specified gender.
app.get("/secret", isLoggedIn, async function (req, res) { 
  console.log(username + " has gained access to /secret")
  const loggedInUser = await User.find({username:username})
  //If the loggedInUser is a male, return all females. If female, return male.
  var user = await User.find({gender:'female'})
  if (loggedInUser[0].gender == 'female') {user = await User.find({gender:'male'})}

  console.log(loggedInUser[0]) //log the logged in user
  res.render("secret", {user,loggedInUser}); //render secret page
}); 
  
// Show register form when directed to /register
app.get("/register", function (req, res) { 
    console.log("A user has connected to /register")
    res.render("register"); 
}); 
  
// Handling user signup 
app.post("/register", function (req, res) { 
    console.log("A user has attempted to register a new user")
    var password = req.body.password
    //creates a new user object and exports it to my MongoDB
    User.register(new User({ username: req.body.username, firstname: req.body.firstname, lastname:req.body.lastname, age:req.body.age, gender:req.body.gender, interest:req.body.interest }), 
            password, function (err, user) { 
        if (err) { //if an error occures, return to register page
            console.log(err); //log the error (would often be user already exists)
            return res.render("register")
        } 
  
        passport.authenticate("local")( 
            req, res, function () { 
            res.redirect("/login"); //render login
            console.log(user); //console.logging the created user
            console.log("A new user has been created and stored in the database!");
        }); 
    }); 
}); 

//Delete the logged in user
app.post("/secret", isLoggedIn, function (req, res) {
    User.deleteOne({username: username},function(err){ //finds the document with the logged in username and deletes it
        if(err) console.log(err);
        console.log("Successful deletion of: " + username) //
        res.render('home')
    })
});

//Update the userprofile
app.post("/update", isLoggedIn, function (req,res){
    User.updateOne({username: username},
        {firstname:req.body.firstname,
        lastname:req.body.lastname,
        age: req.body.age},function(err){
            if(err) console.log(err);
        console.log("Successful update of: " + username)
        res.redirect('secret')       
    })
})
  
//Showing the login form when directed to /login
app.get("/login", function (req, res) { 
    console.log("A user has connected to /login")
    res.render("login"); //render login.ejs
}); 
  
//Handling of user login. If username and password doesn't match anything, redirect back to /login 
app.post("/login", passport.authenticate("local", {failureRedirect: "/login"
}), function (req, res) { 
    res.redirect('/secret') //if username and password is found, redirect to secret
    username = req.body.username //set username to the logged in user.
    console.log(username + " has logged in.")
}); 
  
//Handling of user logout
app.get("/logout", function (req, res) {
    console.log(username + " has logged out of the system") 
    req.logout(); 
    res.redirect("/"); //redirect to / when logged out
}); 

app.post("/dislike", async function (req,res){
    User.updateOne({username: username}, //removes the user from the likes.
        {$pull:{likes:req.body.dislikes}}, function(err){
            if(err) console.log(err);
        console.log("Succesful dislike!")
        res.redirect('secret')
    })
})
app.post("/like", async function (req,res) {
    User.updateOne({username: username}, //adds a user to the likes array
        {$addToSet: {likes:req.body.likes}},function(err){
            if(err) console.log(err);
        console.log("Succesful like!")
        res.redirect('secret')
    })
    
    //----
    //Matching system
    //----

    /*const loggedInUser = await User.find({username:username})
    for (i=0; i<loggedInUser[0].likes.length; i++){
        var e1 = await User.find({username:loggedInUser[0].likes[i]})
        for(j=0;j=e1[0].likes.length;j++){
        if (e1[0].likes[j] == username){
            console.log(e1[j].username)
        }}
    }*/
});

//function with authentication
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) return next(); 
    res.redirect("/login"); 
} 

//server listen
var port = process.env.PORT || 4000; 
app.listen(port, function () { 
    console.log("The server is up at port 4000!"); 
}); 