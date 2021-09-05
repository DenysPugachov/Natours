const mongoose = require("mongoose")
const validator = require("validator")

//Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please, tell us your name!"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please, provide your email!"],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Please, provide a valid email!"],
  },
  photo: String,
  password: {
    type: String,
    trim: true,
    required: [true, "Please, provide a password!"],
    minlength: [8, "Password must have min 8 chars. "],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please, provide a password!"],
    //TODO: password === passwordConfirm
  },
})

//create Model out of schema
const User = mongoose.model("User", userSchema)

module.exports = User
