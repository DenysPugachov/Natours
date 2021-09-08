const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

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
  const token = signToken(newUser._id)

  res.status(201).json({
    status: "success",
    token, // signup user to app
    data: {
      user: newUser,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400)) // 400 => "Bad request"
  }
  const user = await User.findOne({ email }).select("+password") // "+" = allow selected hidden field

  // user exist and password correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401)) // 401 = unauthorize
  }

  // send token to client
  const token = signToken(user.id)
  res.status(200).json({
    status: "success",
    token,
  })
})
