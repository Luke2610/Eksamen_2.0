var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
var UserSchema=mongoose.Schema({
    username: {type: String, unique:true}, //the username must be unique
    firstname: String,
    lastname: String,
    age: Number,
    gender:String,
    interest:Array,
    likes:Array,
    Password: String
});

UserSchema.plugin(passportlocalmongoose); //sets a username, hash and salt field in the schema

module.exports=mongoose.model("User", UserSchema); //export to app.js