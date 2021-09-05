const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body)// NOT secure approach (use req.body)

  //this approach only allow data that putted here (add admins only with Compass)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })

  // user logging info
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  res.status(201).json({
    status: "success",
    token, // signup user to app
    data: {
      user: newUser,
    },
  })
})
