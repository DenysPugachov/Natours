const crypto = require("crypto")
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
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
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
      validator: function (confirmedPassword) {
        // return => "true"=ok || "false"=validation error
        return confirmedPassword === this.password // abc === abc
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
})

//encrypt user password (between getting data and saving it to DB)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  //hash(encrypt) password
  this.password = await bcrypt.hash(this.password, 12) //12 = Salt(cost) length(random string that added to the password)
  //delete confirm password field after password was encrypted
  this.passwordConfirm = undefined
  next()
})

//middleware for updating field when password was modified
userSchema.pre("save", function (next) {
  // if password was NOT modified || the document is new => exit
  if (!this.isModified("password") || this.isNew) return next()

  // set timestamp to now
  this.passwordChangedAt = Date.now() - 1000 // minus 1 sec. to be sure that token was created (in DB) after password was changed (DB need time to write )
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
    return JWTTimestamp < changedTimestamp // =>"true" = pass was changed (100 < 200)
  }

  return false // "false" means password was not changed
}

userSchema.methods.createPasswordResetToken = function () {
  //create random string in Hex format
  const resetToken = crypto.randomBytes(32).toString("hex")
  // encrypt token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // + add 10min to user for resetting the password

  return resetToken
}

//create Model out of schema
const User = mongoose.model("User", userSchema)

module.exports = User
