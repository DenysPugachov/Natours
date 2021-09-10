const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

//Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please, tell us your name!"],
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
    select: false, // hide from output
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please, provide a password!"],
    validate: {
      //Only work on CREATE & SAVE!!! (do NOT work in UPDATE!)
      validator: function (el) {
        // return => "true"=ok || "false"=validation error
        return el === this.password // abc === abc
      },
      message: "Password are not the same!",
    },
  },
  passwordChangedAt: Date,
})

//encrypt user password (between getting data and saving it to DB)
userSchema.pre("save", async function (next) {
  //run this fn if password was modified
  if (!this.isModified("password")) return next()
  //hash(encrypt) password
  this.password = await bcrypt.hash(this.password, 12) //12 = Salt(cost) length(random string that added to the password)
  //delete confirm password field after password was encrypted
  this.passwordConfirm = undefined
  next()
})

//create static (instance) method (available in all docs in a certain collection)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPasswordHashed,
) {
  return await bcrypt.compare(candidatePassword, userPasswordHashed)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    )

    // console.log(
    //   "\nchangedTimestamp =",
    //   changedTimestamp,
    //   "\nJWTTimestamp     =",
    //   JWTTimestamp,
    //   "\nthis.passwordChangedAt =",
    //   this.passwordChangedAt,
    // )
    return JWTTimestamp < changedTimestamp // =>"true" = pass was changed (100 < 200)
  }

  return false // password was not changed
}

//create Model out of schema
const User = mongoose.model("User", userSchema)

module.exports = User
